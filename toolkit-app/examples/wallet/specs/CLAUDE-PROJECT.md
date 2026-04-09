# CLAUDE-PROJECT: Configuração de Projeto .NET

**Stack:** .NET 8+ | **Banco:** PostgreSQL 15+ | **ORM:** Dapper | **Testes:** xUnit + Moq

---

## 🏗️ Arquitetura Mandatória

```
src/
  ├─ Domain/
  │  ├─ Core/
  │  │  ├─ Aggregates/        ← Account, Order, etc (Root Entities)
  │  │  ├─ Entities/          ← Entidades do domínio
  │  │  ├─ ValueObjects/      ← Money, Email, etc
  │  │  └─ Ports/
  │  │     ├─ Outbound/       ← IRepository, IService
  │  │     └─ Inbound/        ← DTOs de entrada
  │  └─ UseCases/             ← Application logic (optional)
  │
  ├─ Adapters/
  │  ├─ Inbound/
  │  │  └─ Presentation/
  │  │     └─ Endpoints/      ← Minimal APIs
  │  │        └─ Handlers/
  │  │
  │  └─ Outbound/
  │     ├─ Persistence/       ← Dapper repositories
  │     ├─ Cache/             ← Redis, in-memory
  │     └─ External/          ← APIs externas
  │
  └─ Infrastructure/
     ├─ DependencyInjection/
     ├─ Configuration/
     └─ Migrations/           ← SQL migrations

tests/
  ├─ Unit/
  ├─ Integration/             ← Testcontainers PostgreSQL
  └─ Architecture/            ← ArchUnit
```

---

## 🔧 Stack Requirements

| Componente | Versão | Uso |
|-----------|--------|-----|
| .NET | 8+ | Framework |
| PostgreSQL | 15+ | Banco dados |
| Dapper | Latest | Queries manuais (não EF Core) |
| xUnit | Latest | Unit tests |
| Moq | Latest | Mocks |
| Testcontainers | Latest | Integration tests |
| ArchUnit | Latest | Architecture tests |

---

## 🎯 Padrões Obrigatórios

### 1. **Hexagonal Architecture**
```csharp
// Port (interface abstrata)
public interface IAccountRepository
{
    Task<Account> GetByIdAsync(Guid id);
    Task AddAsync(Account account);
}

// Adapter (implementação concreta)
public class PostgreSqlAccountRepository : IAccountRepository
{
    public async Task<Account> GetByIdAsync(Guid id) { ... }
    public async Task AddAsync(Account account) { ... }
}
```

### 2. **DDD: Aggregates**
```csharp
public class Account : AggregateRoot
{
    public Guid Id { get; private set; }
    public Email Email { get; private set; }
    public string FullName { get; private set; }
    
    // Factory method
    public static Account Create(Email email, string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            throw new DomainException("FullName required");
        
        return new Account { Id = Guid.NewGuid(), Email = email, FullName = fullName };
    }
}
```

### 3. **Pipeline Pattern**
```csharp
var result = await pipeline
    .AddStep(new ValidateEmailStep())
    .AddStep(new CreateAccountStep(repository))
    .AddStep(new HashPasswordStep())
    .ExecuteAsync(request);
```

### 4. **Repository Abstraction**
- Use `IRepository<T>` genérico ou específico
- Dapper para queries manuais (performance)
- Queries em SQL files separados ou métodos com SQL strings

---

## 📋 DI Configuration

```csharp
// Program.cs
builder.Services
    .AddScoped<IAccountRepository, PostgreSqlAccountRepository>()
    .AddScoped<IAuthService, JwtAuthService>()
    .AddTransient<ValidationStep>()
    .AddTransient<CreateAccountStep>()
    .AddTransient<Pipeline>();
```

---

## 🧪 Testes - Stack

- **Unit:** xUnit + Moq (70%)
- **Integration:** xUnit + Testcontainers (PostgreSQL) (20%)
- **Architecture:** xUnit + ArchUnit (10%)

---

## 📐 Checklist Novo Projeto

- [ ] .NET 8+ CLI criado
- [ ] PostgreSQL rodando
- [ ] Dapper instalado
- [ ] xUnit + Moq + Testcontainers configurados
- [ ] Pastas src/Domain, src/Adapters, tests/ criadas
- [ ] Program.cs com DI setup
- [ ] Primeira Aggregate criada
- [ ] Primeiro teste unitário passando

