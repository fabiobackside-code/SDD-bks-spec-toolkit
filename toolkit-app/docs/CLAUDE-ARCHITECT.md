# CLAUDE-ARCHITECT: Padrões Stack-Agnóstico

**Válido para:** .NET, Python, Java (qualquer linguagem)

---

## 🏗️ Hexagonal Architecture (Ports & Adapters)

Todo projeto deve ter:

```
Domain (Core)
  ├─ Aggregates          (Entidades raiz: Account, Order)
  ├─ Entities            (Entidades do domínio)
  ├─ ValueObjects        (Money, Email, sem identidade)
  └─ Ports (Interfaces)
     ├─ Outbound         (Contrato com BD, APIs externas)
     └─ Inbound          (DTOs, Requests)

Adapters
  ├─ Inbound
  │  └─ Controllers/Endpoints   (REST, gRPC, etc)
  │
  └─ Outbound
     ├─ Persistence             (Repositories, SQL)
     ├─ Cache                   (Redis, In-Memory)
     ├─ External APIs           (Third-party services)
     └─ MessageQueues           (Kafka, RabbitMQ)

Infrastructure
  └─ DependencyInjection, Configuration
```

**Regra:** Domain **nunca** importa Adapters. Adapters importam Domain.

---

## 🎯 Domain-Driven Design (DDD)

### 1. **Aggregate Root**

```
Account (Aggregate Root)
  ├─ Id: UUID (identidade)
  ├─ Email: ValueObject (imutável)
  ├─ FullName: string
  ├─ Balance: Money (ValueObject)
  └─ Transactions: List<Transaction> (entidades filhas)

Rules:
- Factory method: Account.Create(email, fullName)
- Validações no construtor
- Métodos como: Transfer(), Deposit(), Withdraw()
```

### 2. **Entities**

Têm identidade única (ID), podem mudar de estado.

```
Transaction (dentro de Account)
  ├─ Id: UUID
  ├─ Amount: Money
  ├─ Type: TransactionType (DEPOSIT, WITHDRAWAL, TRANSFER)
  └─ CreatedAt: DateTime
```

### 3. **Value Objects**

Sem identidade, imutáveis, comparados por valor.

```
Email
  ├─ value: string
  └─ IsValid(): bool

Money
  ├─ amount: decimal
  ├─ currency: Currency
  └─ Add(), Subtract(): Money
```

### 4. **Repositories**

Abstração para persistência.

```
interface IAccountRepository
  GetByIdAsync(id: UUID): Account
  GetByEmailAsync(email: Email): Account
  AddAsync(account: Account): void
  UpdateAsync(account: Account): void
```

---

## 🔄 Pipeline Pattern

Orquestração de steps sequenciais com erros tratados.

```
Pipeline
  .AddStep(new ValidateEmailStep())
  .AddStep(new CheckDuplicateStep())
  .AddStep(new CreateAccountStep())
  .AddStep(new HashPasswordStep())
  .ExecuteAsync(request)
  → Result<Account>
```

**Benefícios:**
- Cada step isolado e testável
- Ordem explícita
- Fallback em erro no step N não executa N+1
- Fácil remover/adicionar steps

---

## 🔐 Segurança

### Autenticação
- JWT (nunca sessões)
- Access token (curta vida: 15min)
- Refresh token (longa vida: 7 dias)

### Senhas
- Hash com bcrypt (salt ≥ 10)
- Nunca em logs
- Nunca em URLs

### Autorização
- Verificar JWT em toda requisição autenticada
- Validar permissões (RBAC)
- Isolamento multi-tenant (usuário não vê dados de outro)

---

## 📊 Specification Pattern

Encapsula queries complexas.

```
class AccountByEmailSpec : Specification<Account>
{
    public AccountByEmailSpec(Email email)
    {
        Query.Where(a => a.Email == email);
    }
}

// Uso
var spec = new AccountByEmailSpec(email);
var account = await repository.FirstOrDefaultAsync(spec);
```

---

## ⚡ Performance

### Caching
- Cache de leitura: GET /balance (TTL 60s)
- Invalidar em escrita: POST /transfer
- Usar IMemoryCache ou Redis

### Queries
- Índices em campos frequentemente consultados
- Paginação em listas (ex: 20 transações/página)
- Projeções (select * vs select apenas campos necessários)

### Async/Await
- Tudo async (nunca bloqueante)
- Parallel para I/O múltiplos (cuidado com race conditions)

---

## 🧪 Testing

### Unit Tests (70%)
- Isolar domain logic
- Mock repositories, services
- Sem banco de dados

### Integration Tests (20%)
- Com banco de dados real (Testcontainers)
- Fluxos completos (criar → ler → atualizar)
- Validar constraints BD

### Architecture Tests (10%)
- ArchUnit: sem cyclic dependencies
- Validar padrões (Domain não importa Adapters)
- Coverage analysis

---

## 🚫 Antipadrões a Evitar

🚫 **Anemic Domain Models**
- ❌ Classe só com getters/setters
- ✅ Classe com lógica de negócio

🚫 **God Objects**
- ❌ Uma classe com 1000 linhas
- ✅ Classes pequenas, coesas (~100 linhas)

🚫 **Cyclic Dependencies**
- ❌ A → B → A
- ✅ Acíclico, DAG

🚫 **Tightly Coupled**
- ❌ new Repository() dentro de Service
- ✅ Injetar via DI

🚫 **Mixed Concerns**
- ❌ Repository com lógica de negócio
- ✅ Repository = persistência, Service = lógica

---

## 📋 Checklist Novo Projeto

- [ ] Domain separado de Adapters
- [ ] Aggregate Root identificado
- [ ] Ports (interfaces) definidas
- [ ] Pipeline para orquestração
- [ ] Repositories com abstração
- [ ] Value Objects criados
- [ ] Testes 70/20/10
- [ ] ArchUnit passando

