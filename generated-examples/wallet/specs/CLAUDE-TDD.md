# CLAUDE-TDD: Estratégia de Testes

**Objetivo:** 100% cobertura de código gerado, ≥80% código novo

---

## 📊 Test Pyramid: 70/20/10

```
        /\           Architecture (10%)
       /  \          - ArchUnit: cyclic deps
      /    \         - Pattern validation
     /______\
    /        \       Integration (20%)
   /          \      - Testcontainers
  /____________\     - DB + API calls
 /              \    Unit (70%)
/________________\   - Domain logic
                     - Isolated tests
```

---

## 🧪 Unit Tests (70%)

**O quê testar:** Domain logic, isolado

**Como:** Mock dependencies, sem BD

**Stack:** xUnit + Moq

### Exemplo

```csharp
public class AccountAggregateTests
{
    [Theory]
    [InlineData("user@example.com", "John Doe", true)]
    [InlineData("", "John Doe", false)]
    [InlineData("invalid-email", "John Doe", false)]
    public void Create_WithVariousInputs(string email, string name, bool shouldSucceed)
    {
        if (shouldSucceed)
        {
            var account = Account.Create(Email.Create(email), name, "hash");
            Assert.NotNull(account);
        }
        else
        {
            Assert.Throws<DomainException>(() =>
                Account.Create(Email.Create(email), name, "hash"));
        }
    }
}
```

**Métricas:**
- ✅ Cada Aggregate testado
- ✅ Cada Value Object testado
- ✅ Happy path + error cases
- ✅ Edge cases (vazios, nulos, limites)

---

## 🔗 Integration Tests (20%)

**O quê testar:** Fluxo completo com BD real

**Como:** Testcontainers + Dapper

**Stack:** xUnit + Testcontainers + PostgreSQL

### Exemplo

```csharp
public class CreateAccountIntegrationTests : IAsyncLifetime
{
    private PostgreSqlContainer _container;
    private IAccountRepository _repository;
    private Pipeline _pipeline;

    public async Task InitializeAsync()
    {
        _container = new PostgreSqlBuilder().Build();
        await _container.StartAsync();
        
        _repository = new PostgreSqlAccountRepository(
            new NpgsqlConnection(_container.GetConnectionString())
        );
        
        _pipeline = new Pipeline(new ServiceCollection()
            .AddScoped<IAccountRepository>(_ => _repository)
            .BuildServiceProvider()
        );
    }

    [Fact]
    public async Task CreateAccountFlow_WithValidInput_PersistsAndRetrieves()
    {
        // Arrange
        var request = new CreateAccountRequest
        {
            Email = "user@example.com",
            FullName = "John Doe",
            Password = "SecurePass123!"
        };

        // Act
        var result = await _pipeline
            .AddStep<ValidateEmailStep>()
            .AddStep<CheckDuplicateStep>()
            .AddStep<CreateAccountStep>()
            .AddStep<HashPasswordStep>()
            .ExecuteAsync<Account>(request);

        // Assert
        Assert.True(result.Success);
        
        var persisted = await _repository.GetByEmailAsync(
            Email.Create("user@example.com")
        );
        Assert.NotNull(persisted);
        Assert.Equal("John Doe", persisted.FullName);
    }

    public async Task DisposeAsync()
    {
        if (_container != null)
            await _container.StopAsync();
    }
}
```

**Métricas:**
- ✅ CAs validadas com fluxo real
- ✅ Banco de dados funcional
- ✅ Endpoints testados

---

## 🏛️ Architecture Tests (10%)

**O quê testar:** Padrões arquiteturais

**Como:** ArchUnit

**Stack:** xUnit + ArchUnit

### Exemplo

```csharp
public class ArchitectureTests
{
    [Fact]
    public void DomainShouldNotDependOnAdapters()
    {
        var domainAssembly = typeof(Account).Assembly;
        var adapterAssemblies = typeof(PostgreSqlAccountRepository).Assembly;

        var classes = Classes
            .That()
            .ResideInNamespace("*.Domain.*")
            .Should()
            .NotDependOnAny("*.Adapters.*")
            .GetResult();

        Assert.True(classes.IsSuccessful);
    }

    [Fact]
    public void NoCyclicDependencies()
    {
        var allAssemblies = new[] {
            typeof(Account).Assembly,
            typeof(PostgreSqlAccountRepository).Assembly
        };

        var classes = Classes
            .That()
            .AreInAnyAssembly(allAssemblies)
            .Should()
            .NotHaveCyclicDependencies()
            .GetResult();

        Assert.True(classes.IsSuccessful);
    }
}
```

**Métricas:**
- ✅ Domain isolado
- ✅ Sem cyclic deps
- ✅ Estrutura respeitada

---

## 📈 Coverage Metrics

### Cobertura Esperada por Arquivo

| Tipo | Meta |
|------|------|
| Aggregates | 100% |
| Value Objects | 100% |
| Entities | 100% |
| Repositories | ≥80% |
| Endpoints | ≥80% |
| Services | ≥80% |
| **Total** | **≥85%** |

### Como Medir (OpenCover)

```bash
dotnet add package OpenCover --version 4.7.1221
opencover -register:user -target:"dotnet" -targetargs:"test" -output:"coverage.xml"
reportgenerator -reports:"coverage.xml" -targetdir:"CoverageReport"
open CoverageReport/index.html
```

---

## ✅ Test Checklist

### Por Feature

- [ ] **Unit Tests**
  - [ ] Aggregate Root: 100% coverage
  - [ ] Value Objects: 100% coverage
  - [ ] Entities: 100% coverage
  - [ ] Error cases testadas

- [ ] **Integration Tests**
  - [ ] CAs mapeados para testes
  - [ ] Fluxo completo testado
  - [ ] BD funcional

- [ ] **Architecture Tests**
  - [ ] ArchUnit passando
  - [ ] Sem cyclic dependencies
  - [ ] Padrões respeitados

- [ ] **Performance**
  - [ ] Suite completa < 5 minutos
  - [ ] Queries otimizadas
  - [ ] Sem N+1 problems

---

## 🚫 Antipadrões em Testes

🚫 **Testes que dependem de ordem**
- ❌ Test A deve rodar antes de Test B
- ✅ Cada teste independente

🚫 **Mocks demais**
- ❌ Mock de tudo (until database)
- ✅ Unit testa lógica, Integration testa fluxo

🚫 **Testes lentos**
- ❌ Suite com 30 minutos
- ✅ Suite com < 5 minutos

🚫 **Assertions genéricos**
- ❌ Assert.NotNull(result)
- ✅ Assert.Equal(expected, actual) + mensagem clara

---

## 📋 Workflow para Novo Teste

1. **Identifique o caso** (RF, CA específico)
2. **Escolha tipo** (Unit/Integration/Architecture)
3. **Arrange** dados de teste
4. **Act** execute a ação
5. **Assert** valide resultado
6. **Refatore** se necessário
7. **Roda suite** e valida cobertura

---

## 🧬 Exemplo Completo: Feature Login

```csharp
// UNIT TEST - Validar senha
[Fact]
public void ValidatePassword_WithCorrectPassword_ReturnsTrue()
{
    var hash = BCrypt.HashPassword("password123");
    var result = BCrypt.Verify("password123", hash);
    Assert.True(result);
}

// INTEGRATION TEST - Login flow
[Fact]
public async Task LoginFlow_WithValidCredentials_ReturnsJWT()
{
    var account = Account.Create(...);
    await _repository.AddAsync(account);
    
    var result = await _authService.AuthenticateAsync("user@example.com", "password");
    
    Assert.NotNull(result.AccessToken);
}

// ARCHITECTURE TEST - Security
[Fact]
public void PasswordsNeverInLogs()
{
    var classes = Classes
        .That()
        .ResideInNamespace("*.Adapters.Outbound.*")
        .Should()
        .NotCallMethodWhere(m => m.Name == "Log" && m.ParameterTypes.Any(p => p.Name == "password"))
        .GetResult();
    
    Assert.True(classes.IsSuccessful);
}
```

