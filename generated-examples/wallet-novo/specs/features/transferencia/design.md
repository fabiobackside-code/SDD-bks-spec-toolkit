# Design: Transferência — Modelo de Domínio + Arquitetura .NET

**Fase 2a (Domain Analysis) + Fase 2b (Technical Design)**  
**Skill aplicada:** `/domain-analysis` → `/technical-design-doc-creator`  
**Stack:** .NET 8+, PostgreSQL 15+, Dapper  
**Data:** 2026-04-09

---

## Parte A — Modelo de Domínio (domain-analysis)

### Event Storming Lightweight

**Domain Events identificados (passado):**
- `AccountOpened` — conta criada com saldo zero
- `MoneyDebited` — saldo debitado da conta de origem
- `MoneyCredited` — saldo creditado na conta de destino
- `TransferInitiated` — operação de transferência iniciada (Application layer)

**Commands identificados (imperativo):**
- `OpenAccount` → `AccountOpened`
- `DebitMoney` → `MoneyDebited`
- `CreditMoney` → `MoneyCredited`
- `TransferMoney` → `MoneyDebited` + `MoneyCredited`

**Aggregates identificados:**
- `Wallet` — processa `DebitMoney` e `CreditMoney`
- (sem entidades filhas — Wallet é autocontido)

---

### Bounded Context: Wallet

**Aggregate Root:** `Wallet`

| Elemento | Tipo | Descrição |
|----------|------|-----------|
| `WalletId` | Value Object | UUID v7, imutável, gerado no Domain |
| `Money` | Value Object | `decimal Amount` + `string Currency`; invariante: Amount ≥ 0 |
| `Email` | Value Object | string normalizada lowercase; valida formato RFC 5322 |
| `PasswordHash` | Value Object | string bcrypt; não expõe o valor raw |
| `Balance` | propriedade de `Wallet` | tipo `Money`, atualizado via `Debit`/`Credit` |

**Invariantes do Aggregate:**
1. `Balance.Amount` nunca negativo após `Debit` — lança `InsufficientFundsException` se violado
2. Origem ≠ Destino em transferência — lança `SelfTransferException` se violado
3. `Amount` da operação sempre > 0 — lança `InvalidAmountException` se violado

**Domain Events emitidos por `Wallet`:**

| Evento | Produzido por | Dados |
|--------|--------------|-------|
| `MoneyDebited` | `Wallet.Debit(Money amount)` | `WalletId`, `Money amount`, `Money balanceAfter` |
| `MoneyCredited` | `Wallet.Credit(Money amount)` | `WalletId`, `Money amount`, `Money balanceAfter` |

**Domain Events emitidos pelo Use Case (Application):**

| Evento | Produzido por | Dados |
|--------|--------------|-------|
| `TransferInitiated` | `ProcessingStep` | `originId`, `targetId`, `amount`, `correlationId` |

---

### Context Map

```
┌─────────────────────────────────────┐
│         Bounded Context: Wallet      │
│                                     │
│  Core Domain — autocontido          │
│  Wallet, Money, WalletId, Email     │
│  IWalletRepository (Port)           │
│  IStatementRepository (Port)        │
└──────────────┬──────────────────────┘
               │ Domain Events (futura integração)
               │ Padrão: Published Language (eventos Kafka/RabbitMQ)
               ▼
┌─────────────────────────────────────┐
│    Bounded Context: Notification    │
│    (planejado v1.1)                 │
│    ACL: traduz MoneyDebited →       │
│    SendTransferNotification         │
└─────────────────────────────────────┘
```

**Classificação do subdomínio:**
- Wallet = **Core Domain** (diferencial de negócio, implementação proprietária)
- Autenticação = **Supporting Domain** (necessária, mas não diferencial)
- Notificação = **Generic Subdomain** (futuro — usar serviço externo)

---

## Parte B — Arquitetura Técnica .NET (technical-design-doc-creator)

### Estrutura de Pastas e Namespaces

```
src/Wallet.Api/
│
├── Domain/
│   ├── Core/
│   │   ├── Aggregates/
│   │   │   └── Wallet.cs                         ← Aggregate Root
│   │   └── ValueObjects/
│   │       ├── Money.cs
│   │       ├── WalletId.cs
│   │       ├── Email.cs
│   │       └── PasswordHash.cs
│   ├── Events/
│   │   ├── MoneyDebited.cs                       ← Domain Events (records)
│   │   └── MoneyCredited.cs
│   └── Ports/
│       └── Outbound/
│           ├── IWalletRepository.cs              ← Port de persistência
│           └── IIdempotencyRepository.cs         ← Port de idempotência
│
├── Application/
│   └── UseCases/
│       └── Transfer/
│           ├── TransferUseCase.cs                ← Implementa ITransferUseCase
│           ├── TransferTransaction.cs            ← record imutável
│           ├── TransferResponse.cs               ← record de resposta
│           └── Steps/
│               ├── TransferValidationStep.cs     ← [10] valida regras de negócio
│               └── TransferProcessingStep.cs     ← [30] executa débito + crédito
│
├── Adapters/
│   ├── Inbound/
│   │   └── Http/
│   │       └── TransferEndpoints.cs              ← Minimal API
│   └── Outbound/
│       └── Persistence/
│           ├── PostgreSqlWalletRepository.cs     ← Implementa IWalletRepository
│           └── PostgreSqlIdempotencyRepository.cs
│
└── Infrastructure/
    └── DependencyInjection/
        └── ServiceCollectionExtensions.cs
```

---

### Code Examples — Domain

```csharp
// Domain/Core/Aggregates/Wallet.cs
// Namespace: Wallet.Api.Domain.Core.Aggregates
// Dependências permitidas: APENAS System.* + próprio Domain
public class Wallet : AggregateRoot
{
    public WalletId Id { get; private set; }
    public Email Email { get; private set; }
    public Money Balance { get; private set; }
    public PasswordHash PasswordHash { get; private set; }
    private readonly List<IDomainEvent> _events = new();

    private Wallet() { } // EF/Dapper

    public static Wallet Open(Email email, PasswordHash hash)
    {
        var wallet = new Wallet
        {
            Id = WalletId.New(),
            Email = email,
            Balance = Money.Zero("BRL"),
            PasswordHash = hash,
        };
        wallet._events.Add(new AccountOpened(wallet.Id, wallet.Email));
        return wallet;
    }

    public void Debit(Money amount)
    {
        if (amount.Amount <= 0) throw new InvalidAmountException(amount);
        if (Balance.Amount < amount.Amount) throw new InsufficientFundsException(Balance, amount);
        Balance = Balance.Subtract(amount);
        _events.Add(new MoneyDebited(Id, amount, Balance));
    }

    public void Credit(Money amount)
    {
        if (amount.Amount <= 0) throw new InvalidAmountException(amount);
        Balance = Balance.Add(amount);
        _events.Add(new MoneyCredited(Id, amount, Balance));
    }

    public IReadOnlyList<IDomainEvent> DomainEvents => _events.AsReadOnly();
    public void ClearEvents() => _events.Clear();
}
```

```csharp
// Domain/Core/ValueObjects/Money.cs
// Namespace: Wallet.Api.Domain.Core.ValueObjects
public record Money(decimal Amount, string Currency)
{
    public static Money Zero(string currency) => new(0m, currency);

    public Money Add(Money other)
    {
        if (Currency != other.Currency) throw new CurrencyMismatchException(Currency, other.Currency);
        return this with { Amount = Amount + other.Amount };
    }

    public Money Subtract(Money other)
    {
        if (Currency != other.Currency) throw new CurrencyMismatchException(Currency, other.Currency);
        return this with { Amount = Amount - other.Amount };
    }
}
```

```csharp
// Domain/Core/ValueObjects/WalletId.cs
public record WalletId(Guid Value)
{
    public static WalletId New() => new(Uuid7.NewUuid7()); // ou Guid.CreateVersion7() no .NET 9
    public static WalletId From(Guid value) => new(value);
    public override string ToString() => Value.ToString();
}
```

```csharp
// Domain/Ports/Outbound/IWalletRepository.cs
// Namespace: Wallet.Api.Domain.Ports.Outbound
// NUNCA: IDbConnection, IDbTransaction, SqlConnection, Dapper — apenas tipos do Domain
public interface IWalletRepository
{
    Task<Wallet?> GetByIdAsync(WalletId id, CancellationToken ct = default);
    Task<Wallet?> GetByEmailAsync(Email email, CancellationToken ct = default);
    Task SaveAsync(Wallet wallet, CancellationToken ct = default);

    // Para operação atômica de transferência — retorna ambas as contas com lock
    Task<(Wallet? origin, Wallet? target)> GetPairForUpdateAsync(
        WalletId originId, WalletId targetId, CancellationToken ct = default);
}
```

---

### Code Examples — Application

```csharp
// Application/UseCases/Transfer/TransferTransaction.cs
public record TransferTransaction(
    string CorrelationId,
    string UserId,           // accountId do JWT (autorização)
    WalletId OriginId,
    WalletId TargetId,
    Money Amount,
    string? IdempotencyKey
) : BaseTransaction<TransferResponse>;

// Application/UseCases/Transfer/TransferResponse.cs
public record TransferResponse(
    Guid TransactionId,
    decimal OriginBalance,
    decimal TargetBalance,
    string Currency
);
```

```csharp
// Application/UseCases/Transfer/Steps/TransferValidationStep.cs
// Step [10] — pré-condições de negócio
public class TransferValidationStep : BaseStep<TransferTransaction, TransferResponse>
{
    public override int Order => 10;

    protected override async Task<PipelineResult<TransferResponse>> ExecuteInternalAsync(
        TransferTransaction transaction, CancellationToken ct)
    {
        // Regra: não transferir para própria conta
        if (transaction.OriginId == transaction.TargetId)
            return PipelineResult<TransferResponse>.Failure(
                "SELF_TRANSFER_NOT_ALLOWED", "Origin and target accounts must be different.");

        // Regra: amount > 0
        if (transaction.Amount.Amount <= 0)
            return PipelineResult<TransferResponse>.Failure(
                "INVALID_AMOUNT", "Transfer amount must be greater than zero.");

        return PipelineResult<TransferResponse>.Next();
    }
}
```

```csharp
// Application/UseCases/Transfer/Steps/TransferProcessingStep.cs
// Step [30] — executa a operação com atomicidade
public class TransferProcessingStep : BaseStep<TransferTransaction, TransferResponse>
{
    private readonly IWalletRepository _walletRepo;
    private readonly IIdempotencyRepository _idempotencyRepo;

    public override int Order => 30;

    protected override async Task<PipelineResult<TransferResponse>> ExecuteInternalAsync(
        TransferTransaction transaction, CancellationToken ct)
    {
        // Verificar idempotência
        if (transaction.IdempotencyKey is not null)
        {
            var cached = await _idempotencyRepo.GetAsync(transaction.IdempotencyKey, ct);
            if (cached is not null) return PipelineResult<TransferResponse>.Success(cached);
        }

        // Buscar par de contas com lock (SELECT FOR UPDATE)
        var (origin, target) = await _walletRepo.GetPairForUpdateAsync(
            transaction.OriginId, transaction.TargetId, ct);

        if (origin is null) return PipelineResult<TransferResponse>.NotFound(
            "ACCOUNT_NOT_FOUND", transaction.OriginId.ToString());
        if (target is null) return PipelineResult<TransferResponse>.NotFound(
            "ACCOUNT_NOT_FOUND", transaction.TargetId.ToString());

        // Aplicar regras de domínio (lança DomainException se inválido)
        origin.Debit(transaction.Amount);   // InsufficientFundsException aqui
        target.Credit(transaction.Amount);

        // Persistir ambas na mesma transação de banco
        await _walletRepo.SaveAsync(origin, ct);
        await _walletRepo.SaveAsync(target, ct);

        var response = new TransferResponse(
            Guid.NewGuid(), origin.Balance.Amount, target.Balance.Amount, transaction.Amount.Currency);

        // Salvar idempotência
        if (transaction.IdempotencyKey is not null)
            await _idempotencyRepo.SaveAsync(transaction.IdempotencyKey, response, ct);

        return PipelineResult<TransferResponse>.Success(response);
    }
}
```

---

### Code Examples — Adapter Inbound

```csharp
// Adapters/Inbound/Http/TransferEndpoints.cs
public static class TransferEndpoints
{
    public static void Map(WebApplication app)
    {
        app.MapPost("/api/v1/accounts/{originId}/transfer", async (
            Guid originId,
            TransferRequest body,
            HttpContext ctx,
            ITransferUseCase useCase,
            CancellationToken ct) =>
        {
            var transaction = new TransferTransaction(
                CorrelationId: ctx.TraceIdentifier,
                UserId: ctx.User.FindFirst("sub")!.Value,
                OriginId: WalletId.From(originId),
                TargetId: WalletId.From(body.TargetAccountId),
                Amount: new Money(body.Amount, "BRL"),
                IdempotencyKey: ctx.Request.Headers["Idempotency-Key"].FirstOrDefault()
            );

            var result = await useCase.ExecuteAsync(transaction, ct);

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : result.ToHttpResult(); // extensão que mapeia código de erro → status HTTP
        })
        .RequireAuthorization()
        .WithName("TransferMoney");
    }
}
```

---

### Code Examples — Adapter Outbound (Dapper)

```csharp
// Adapters/Outbound/Persistence/PostgreSqlWalletRepository.cs
// Namespace: Wallet.Api.Adapters.Outbound.Persistence
// Implementa IWalletRepository (Port do Domain) — Domain NUNCA conhece esta classe
public class PostgreSqlWalletRepository : IWalletRepository
{
    private readonly IDbConnection _connection;

    public async Task<(Wallet? origin, Wallet? target)> GetPairForUpdateAsync(
        WalletId originId, WalletId targetId, CancellationToken ct)
    {
        // SELECT FOR UPDATE garante serialização de acesso concorrente
        const string sql = """
            SELECT id, email, balance_amount, balance_currency, password_hash
            FROM wallets
            WHERE id = ANY(@Ids)
            FOR UPDATE
            """;

        var rows = await _connection.QueryAsync(sql, new { Ids = new[] { originId.Value, targetId.Value } });
        var map = rows.ToDictionary(r => (Guid)r.id, r => MapToWallet(r));

        return (
            map.GetValueOrDefault(originId.Value),
            map.GetValueOrDefault(targetId.Value)
        );
    }

    // GetByIdAsync, GetByEmailAsync, SaveAsync...

    private static Wallet MapToWallet(dynamic row) =>
        WalletMapper.FromRow(row); // mapper estático sem lógica de domínio
}
```

---

### Fluxo da Operação de Transferência

```
HTTP POST /api/v1/accounts/{originId}/transfer
  │
  ├── TransferEndpoints (Adapter Inbound)
  │     ├── extrai JWT sub → UserId
  │     ├── lê Idempotency-Key do header
  │     └── cria TransferTransaction (record imutável)
  │
  ├── TransferUseCase.ExecuteAsync(transaction)
  │
  ├── PipelineOrchestrator
  │   ├── [10] TransferValidationStep
  │   │     ├── OriginId == TargetId? → 422 SELF_TRANSFER_NOT_ALLOWED
  │   │     └── Amount <= 0? → 422 INVALID_AMOUNT
  │   │
  │   └── [30] TransferProcessingStep
  │         ├── Idempotency-Key já processado? → 200 (cache hit)
  │         ├── GetPairForUpdateAsync (SELECT FOR UPDATE)
  │         ├── origin == null? → 404 ACCOUNT_NOT_FOUND
  │         ├── target == null? → 404 ACCOUNT_NOT_FOUND
  │         ├── origin.Debit(amount) — DomainException se saldo insuficiente
  │         ├── target.Credit(amount)
  │         ├── SaveAsync origin + target (mesma IDbTransaction)
  │         └── SaveAsync idempotência
  │
  └── PipelineResult<TransferResponse>
        ├── IsSuccess → HTTP 200 + body
        ├── DomainException (InsufficientFunds) → HTTP 400
        ├── NotFound → HTTP 404
        └── ValidationFailure → HTTP 422
```

---

### Rastreabilidade Completa

| RF | CA | Aggregate/Método | Port | Adapter | Step |
|----|-----|-----------------|------|---------|------|
| RF-020 | CA-010 | `Wallet.Debit()` + `Wallet.Credit()` | `IWalletRepository` | `PostgreSqlWalletRepository` | `ProcessingStep` |
| RF-021 | CA-011 | `Wallet.Debit()` → `InsufficientFundsException` | — | — | `ProcessingStep` |
| RF-022 | CA-015 | `GetPairForUpdateAsync` + `IDbTransaction` | `IWalletRepository` | `PostgreSqlWalletRepository` | `ProcessingStep` |
| RF-023 | CA-010 | `MoneyDebited` + `MoneyCredited` Domain Events | `IStatementRepository` | `PostgreSqlStatementRepository` | `ProcessingStep` |
| RF-024 | CA-012 | — | — | — | `ValidationStep` |
| RF-025 | CA-014 | — | `IIdempotencyRepository` | `PostgreSqlIdempotencyRepository` | `ProcessingStep` |
| RF-026 | CA-010 | `Wallet.DomainEvents` | — | — | `ProcessingStep` |

---

### Decisões de Design (ADR inline)

**ADR-001: Dapper em vez de EF Core para Transferência**
- **Decisão:** Usar Dapper com SQL explícito
- **Razão:** `SELECT FOR UPDATE` requer controle explícito de lock — EF Core abstrai isso e torna difícil garantir a ordem de lock sem deadlock
- **Alternativa rejeitada:** EF Core com `FromSqlRaw` + `ExecutionStrategy` — mais complexo para o mesmo resultado

**ADR-002: Atomicidade via IDbTransaction explícita**
- **Decisão:** `PostgreSqlWalletRepository.SavePairAsync` recebe `IDbTransaction` externa
- **Razão:** RC-002 proíbe distributed transactions — toda a operação deve estar em uma `IDbTransaction` aberta pelo Processing Step
- **Consequência:** O Port `IWalletRepository` pode precisar de método `SavePairAsync(origin, target, transaction)` para garantir o agrupamento

**ADR-003: Domain Exceptions vs Result Pattern**
- **Decisão:** Domain lança `DomainException` (subclasses tipadas); Application converte para `PipelineResult`
- **Razão:** Domain não deve conhecer `PipelineResult` (infra de Application). A conversão ocorre no `BaseStep` via try/catch de `DomainException`
