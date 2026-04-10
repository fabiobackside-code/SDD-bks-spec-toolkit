# CLAUDE-TDD: Estratégia de Testes

**Objetivo:** 100% cobertura de código gerado, ≥80% código novo

---

## 📊 Test Pyramid: 70/20/10

```
        /\           Architecture (10%)
       /  \          - Cyclic deps
      /    \         - Pattern validation
     /______\
    /        \       Integration (20%)
   /          \      - Containers (Testcontainers ou equivalente)
  /____________\     - DB + API calls
 /              \    Unit (70%)
/________________\   - Domain logic
                     - Isolated tests
```

---

## 🧪 Unit Tests (70%)

**O quê testar:** Domain logic, isolado

**Como:** Mock de dependências, sem BD

**Stack:** framework de testes unitários + biblioteca de mocks da stack

### Exemplo (pseudocódigo agnóstico)

```
TEST SUITE: AccountAggregateTests

  TEST: "Create_WithValidEmail_Succeeds"
    ARRANGE: email = "user@example.com", name = "John Doe"
    ACT:     account = Account.Create(Email.Create(email), name, "hash")
    ASSERT:  account is not null
             account.Email == email

  TEST: "Create_WithInvalidEmail_ThrowsDomainException"
    ARRANGE: email = ""
    ACT:     Account.Create(Email.Create(email), "John Doe", "hash")
    ASSERT:  throws DomainException

  TEST: "Create_WithMultipleInputs" [parameterized]
    DATA:
      | email                | valid? |
      | "user@example.com"   | true   |
      | ""                   | false  |
      | "invalid-email"      | false  |
    ASSERT: success when valid, DomainException when invalid
```

**Métricas:**
- ✅ Cada Aggregate testado
- ✅ Cada Value Object testado
- ✅ Happy path + error cases
- ✅ Edge cases (vazios, nulos, limites)

---

## 🔗 Integration Tests (20%)

**O quê testar:** Fluxo completo com BD real

**Como:** Testcontainers (ou equivalente) com banco real em container

**Stack:** framework de testes + Testcontainers + banco da stack

### Exemplo (pseudocódigo agnóstico)

```
TEST SUITE: CreateAccountIntegrationTests
  SETUP:
    container = start database container (PostgreSQL/MySQL/etc)
    repository = new DatabaseRepository(container.connectionString)
    pipeline   = build pipeline with real dependencies

  TEARDOWN:
    stop container

  TEST: "CreateAccountFlow_WithValidInput_PersistsAndRetrieves"
    ARRANGE:
      request = {
        email:    "user@example.com",
        fullName: "John Doe",
        password: "SecurePass123!"
      }

    ACT:
      result = pipeline
        .addStep(ValidateEmailStep)
        .addStep(CheckDuplicateStep)
        .addStep(CreateAccountStep)
        .addStep(HashPasswordStep)
        .execute(request)

    ASSERT:
      result.success == true
      persisted = repository.getByEmail("user@example.com")
      persisted is not null
      persisted.fullName == "John Doe"
```

**Métricas:**
- ✅ CAs validadas com fluxo real
- ✅ Banco de dados funcional
- ✅ Endpoints testados

---

## 🏛️ Architecture Tests (10%)

**O quê testar:** Padrões arquiteturais e fronteiras de dependência

**Como:** Ferramenta de análise de dependências da stack (ArchUnit, NetArchTest, Deptrac, etc.)

**Stack:** framework de testes + biblioteca de architecture testing da stack

### Exemplo (pseudocódigo agnóstico)

```
TEST SUITE: ArchitectureTests

  TEST: "DomainShouldNotDependOnAdapters"
    ASSERT: classes in namespace "*.Domain.*"
            must NOT depend on "*.Adapters.*"

  TEST: "NoCyclicDependencies"
    ASSERT: all assemblies/packages
            must NOT have cyclic dependencies

  TEST: "PortsMustBeInDomainOrApplication"
    ASSERT: interfaces matching "I*Repository" or "I*Service"
            must reside in "*.Domain.*" or "*.Application.*"
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

### Como Medir

Use a ferramenta de cobertura nativa ou mais adotada da stack:

| Stack | Ferramenta |
|-------|-----------|
| .NET | `dotnet test --collect:"XPlat Code Coverage"` + ReportGenerator |
| Java | JaCoCo (`mvn test jacoco:report`) |
| Python | `pytest --cov` + coverage.py |
| Node.js | `jest --coverage` ou `c8` |
| Go | `go test -cover ./...` |

**Resultado esperado:** relatório HTML com cobertura por namespace/módulo, sem linha vermelha em código de domínio.

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
  - [ ] Sem cyclic dependencies
  - [ ] Domain não depende de Adapters
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
- ❌ Mock de tudo (até o banco)
- ✅ Unit testa lógica, Integration testa fluxo

🚫 **Testes lentos**
- ❌ Suite com 30 minutos
- ✅ Suite com < 5 minutos

🚫 **Assertions genéricos**
- ❌ assert result is not null
- ✅ assert result.id == expectedId (mensagem clara)

---

## 📋 Workflow para Novo Teste

1. **Identifique o caso** (RF, CA específico)
2. **Escolha tipo** (Unit/Integration/Architecture)
3. **Arrange** dados de teste
4. **Act** execute a ação
5. **Assert** valide resultado
6. **Refatore** se necessário
7. **Rode a suite** e valide cobertura

---

## 🧬 Exemplo Completo: Feature Login

```
// UNIT TEST — Validar senha
TEST: "ValidatePassword_WithCorrectPassword_ReturnsTrue"
  ARRANGE: hash = hashFunction("password123")
  ACT:     result = verify("password123", hash)
  ASSERT:  result == true

// INTEGRATION TEST — Login flow
TEST: "LoginFlow_WithValidCredentials_ReturnsToken"
  ARRANGE:
    account = Account.Create(...)
    repository.add(account)
  ACT:
    result = authService.authenticate("user@example.com", "password")
  ASSERT:
    result.accessToken is not null

// ARCHITECTURE TEST — Segurança
TEST: "PasswordsNeverPassedToLogger"
  ASSERT: no class in "*.Adapters.Outbound.*"
          calls log methods with parameter named "password"
```
