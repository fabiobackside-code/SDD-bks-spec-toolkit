# CLAUDE-ARCHITECT-NET: Implementação .NET 8+

**Stack:** .NET 8+, PostgreSQL, Dapper, xUnit, Moq, Testcontainers

---

## 📁 Estrutura de Pastas

```
src/
├─ Domain/
│  ├─ Core/
│  │  ├─ Aggregates/
│  │  │  └─ Account.cs              ← Root entity com factory
│  │  ├─ Entities/
│  │  │  └─ Transaction.cs
│  │  ├─ ValueObjects/
│  │  │  ├─ Email.cs
│  │  │  ├─ Money.cs
│  │  │  └─ Currency.cs
│  │  └─ Ports/
│  │     ├─ Outbound/
│  │     │  ├─ IAccountRepository.cs
│  │     │  ├─ ICurrencyExchangeService.cs
│  │     │  └─ IAuthService.cs
│  │     └─ Inbound/
│  │        ├─ CreateAccountRequest.cs
│  │        └─ LoginRequest.cs
│  │
│  └─ Shared/
│     ├─ AggregateRoot.cs           ← Base class para aggregates
│     ├─ Entity.cs                  ← Base class para entidades
│     └─ DomainException.cs
│
├─ Adapters/
│  ├─ Inbound/
│  │  └─ Presentation/
│  │     ├─ Endpoints/
│  │     │  ├─ AccountEndpoints.cs
│  │     │  ├─ AuthEndpoints.cs
│  │     │  └─ BalanceEndpoints.cs
│  │     └─ Handlers/
│  │        └─ GlobalExceptionHandler.cs
│  │
│  └─ Outbound/
│     ├─ Persistence/
│     │  ├─ PostgreSQL/
│     │  │  ├─ PostgreSqlAccountRepository.cs
│     │  │  ├─ PostgreSqlTransactionRepository.cs
│     │  │  └─ Sql/
│     │  │     ├─ Accounts.sql
│     │  │     └─ Transactions.sql
│     │  └─ UnitOfWork.cs
│     │
│     ├─ Cache/
│     │  └─ MemoryCacheService.cs   ← Abstração para cache
│     │
│     └─ External/
│        └─ ExchangeRateService.cs  ← APIs externas
│
├─ Infrastructure/
│  ├─ DependencyInjection/
│  │  └─ ServiceCollectionExtensions.cs
│  ├─ Configuration/
│  │  └─ DatabaseOptions.cs
│  └─ Migrations/
│     └─ 001_CreateAccountsTable.sql
│
└─ Program.cs                        ← Entry point

tests/
├─ Unit/
│  └─ Domain/
│     ├─ AccountAggregateTests.cs
│     ├─ EmailValueObjectTests.cs
│     └─ MoneyValueObjectTests.cs
│
├─ Integration/
│  └─ Persistence/
│     ├─ PostgreSqlAccountRepositoryTests.cs
│     └─ PostgreSqlTransactionRepositoryTests.cs
│
└─ Architecture/
   └─ ArchitectureTests.cs
```

---

## 💻 Código Exemplo: Aggregate Root

```csharp
public class Account : AggregateRoot
{
    public Guid Id { get; private set; }
    public Email Email { get; private set; }
    public string FullName { get; private set; }
    public string PasswordHash { get; private set; }
    public Money Balance { get; private set; }
    public List<Transaction> Transactions { get; private set; }

    private Account() { }  // EF Core

    public static Account Create(Email email, string fullName, string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            throw new DomainException("FullName é obrigatório");

        return new Account
        {
            Id = Guid.NewGuid(),
            Email = email,
            FullName = fullName,
            PasswordHash = passwordHash,
            Balance = Money.Zero(),
            Transactions = new List<Transaction>()
        };
    }

    public void Deposit(Money amount)
    {
        if (amount.Amount <= 0)
            throw new DomainException("Amount deve ser positivo");

        Balance = Balance.Add(amount);
        Transactions.Add(Transaction.Create(this.Id, amount, TransactionType.Deposit));
    }

    public void Transfer(Account recipient, Money amount)
    {
        if (recipient.Id == this.Id)
            throw new DomainException("Não pode transferir para própria conta");

        if (this.Balance.Amount < amount.Amount)
            throw new DomainException("Saldo insuficiente");

        this.Balance = this.Balance.Subtract(amount);
        recipient.Balance = recipient.Balance.Add(amount);

        this.Transactions.Add(Transaction.Create(this.Id, amount, TransactionType.TransferOut));
        recipient.Transactions.Add(Transaction.Create(recipient.Id, amount, TransactionType.TransferIn));
    }
}
```

---

## 🔌 Port (Interface) Example

```csharp
public interface IAccountRepository
{
    Task<Account> GetByIdAsync(Guid id);
    Task<Account> GetByEmailAsync(Email email);
    Task AddAsync(Account account);
    Task UpdateAsync(Account account);
    Task<bool> ExistsAsync(Email email);
}
```

---

## 🏗️ Adapter (Dapper Implementation)

```csharp
public class PostgreSqlAccountRepository : IAccountRepository
{
    private readonly IDbConnection _connection;

    public PostgreSqlAccountRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<Account> GetByIdAsync(Guid id)
    {
        const string sql = "SELECT * FROM accounts WHERE id = @id";
        var row = await _connection.QuerySingleOrDefaultAsync(sql, new { id });
        
        if (row is null) return null;

        return MapToAccount(row);
    }

    public async Task AddAsync(Account account)
    {
        const string sql = @"
            INSERT INTO accounts (id, email, full_name, password_hash, balance)
            VALUES (@id, @email, @fullName, @passwordHash, @balance)";

        await _connection.ExecuteAsync(sql, new
        {
            account.Id,
            email = account.Email.Value,
            fullName = account.FullName,
            passwordHash = account.PasswordHash,
            balance = account.Balance.Amount
        });
    }

    private Account MapToAccount(dynamic row)
    {
        return Account.Create(
            Email.Create(row.email),
            row.full_name,
            row.password_hash
        );
    }
}
```

---

## ⚙️ Pipeline Implementation

```csharp
public class Pipeline
{
    private readonly List<IStep> _steps = new();
    private readonly IServiceProvider _serviceProvider;

    public Pipeline(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public Pipeline AddStep<T>() where T : IStep
    {
        var step = _serviceProvider.GetRequiredService<T>();
        _steps.Add(step);
        return this;
    }

    public async Task<Result<T>> ExecuteAsync<T>(object request)
    {
        foreach (var step in _steps)
        {
            var result = await step.ExecuteAsync(request);
            if (!result.Success)
                return Result<T>.Failure(result.Error);
        }

        return Result<T>.Success(request as T);
    }
}

public interface IStep
{
    Task<Result> ExecuteAsync(object request);
}

public class ValidateEmailStep : IStep
{
    public async Task<Result> ExecuteAsync(object request)
    {
        var req = request as CreateAccountRequest;
        if (req?.Email is null || !req.Email.Contains("@"))
            return Result.Failure("Email inválido");

        return Result.Success();
    }
}
```

---

## 🔧 Dependency Injection (Program.cs)

```csharp
var builder = WebApplicationBuilder.CreateBuilder(args);

// Add services
builder.Services
    .AddScoped<IAccountRepository, PostgreSqlAccountRepository>()
    .AddScoped<IAuthService, JwtAuthService>()
    .AddScoped<ICurrencyExchangeService, ExchangeRateService>()
    .AddTransient<Pipeline>()
    .AddTransient<ValidateEmailStep>()
    .AddTransient<CreateAccountStep>()
    .AddTransient<HashPasswordStep>();

// Add DbConnection
builder.Services.AddScoped<IDbConnection>(sp =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    return new NpgsqlConnection(connectionString);
});

// Add caching
builder.Services.AddMemoryCache();

var app = builder.Build();

// Map endpoints
app.MapPost("/api/v1/accounts", CreateAccountEndpoint);
app.MapPost("/api/v1/auth/login", LoginEndpoint);
app.MapGet("/api/v1/accounts/{id}/balance", GetBalanceEndpoint);

app.Run();
```

---

## 🧪 Unit Test Example (xUnit + Moq)

```csharp
public class AccountAggregateTests
{
    [Fact]
    public void Create_WithValidData_ReturnsAccount()
    {
        // Arrange
        var email = Email.Create("user@example.com");
        var fullName = "John Doe";
        var passwordHash = "hashed_password";

        // Act
        var account = Account.Create(email, fullName, passwordHash);

        // Assert
        Assert.NotNull(account);
        Assert.Equal(email, account.Email);
        Assert.Equal(fullName, account.FullName);
        Assert.Equal(0, account.Balance.Amount);
    }

    [Fact]
    public void Transfer_WithInsufficientBalance_ThrowsException()
    {
        // Arrange
        var sender = Account.Create(Email.Create("a@test.com"), "A", "hash");
        var recipient = Account.Create(Email.Create("b@test.com"), "B", "hash");
        var amount = Money.Create(100, Currency.USD);

        // Act & Assert
        Assert.Throws<DomainException>(() => sender.Transfer(recipient, amount));
    }
}
```

---

## 🧪 Integration Test Example (Testcontainers)

```csharp
public class PostgreSqlAccountRepositoryTests : IAsyncLifetime
{
    private PostgreSqlContainer _container;
    private IDbConnection _connection;
    private IAccountRepository _repository;

    public async Task InitializeAsync()
    {
        _container = new PostgreSqlBuilder()
            .WithImage("postgres:15-alpine")
            .Build();

        await _container.StartAsync();

        _connection = new NpgsqlConnection(_container.GetConnectionString());
        await _connection.OpenAsync();

        // Run migrations
        await RunMigrationsAsync();

        _repository = new PostgreSqlAccountRepository(_connection);
    }

    [Fact]
    public async Task AddAsync_WithValidAccount_PersistsToDatabase()
    {
        // Arrange
        var account = Account.Create(
            Email.Create("test@example.com"),
            "Test User",
            "hashed_password"
        );

        // Act
        await _repository.AddAsync(account);

        // Assert
        var retrieved = await _repository.GetByIdAsync(account.Id);
        Assert.NotNull(retrieved);
        Assert.Equal(account.Email, retrieved.Email);
    }

    public async Task DisposeAsync()
    {
        if (_connection != null)
            await _connection.CloseAsync();
        
        if (_container != null)
            await _container.StopAsync();
    }
}
```

---

## ✅ .NET Checklist

- [ ] `.csproj` com versão .NET 8+
- [ ] NuGet packages: Dapper, PostgreSQL.Data, xUnit, Moq, Testcontainers
- [ ] Domain classes: Aggregates, Entities, ValueObjects
- [ ] Port interfaces definidas
- [ ] PostgreSql repositories implementadas
- [ ] Minimal API endpoints criadas
- [ ] DI configured in Program.cs
- [ ] Unit tests passando
- [ ] Integration tests com Testcontainers
- [ ] ArchUnit validando estrutura

