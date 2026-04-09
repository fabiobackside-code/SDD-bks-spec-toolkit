# Tasks: Transferência

**Feature:** Transferência entre Contas  
**Fase 3 | Derivado de:** design.md  
**Total tasks:** 14

---

## Dependências

```
T-001 (Money) ──────────────────────────┐
T-002 (WalletId) ──────────────────────┤
T-003 (Email) ─────────────────────────┤
                                        ▼
T-004 (Wallet Aggregate) ──────────────┤
T-005 (Domain Events) ─────────────────┤
                                        ▼
T-006 (IWalletRepository) ─────────────┤
T-007 (IIdempotencyRepository) ────────┤
                                        ▼
T-008 (TransferTransaction) ───────────┤
T-009 (ValidationStep) ────────────────┤
T-010 (ProcessingStep) ────────────────┤
                                        ▼
T-011 (PostgreSqlWalletRepository) ────┤
T-012 (PostgreSqlIdempotencyRepository)┤
                                        ▼
T-013 (TransferEndpoints) ─────────────┤
                                        ▼
T-014 (Testes)
```

---

## Tasks

### T-001 — Criar Value Object `Money`
```
Path:  src/Wallet.Api/Domain/Core/ValueObjects/Money.cs
Deps:  Nenhuma
RF:    RF-020, RF-021
DoD:   ✅ record imutável, Amount + Currency
       ✅ Add(), Subtract() com validação de Currency
       ✅ Zero(currency) factory method
       ✅ Nunca Amount < 0 após Subtract (DomainException)
       ✅ Sem referência a System.Data, Dapper ou AspNetCore
Tempo: 1h
```

### T-002 — Criar Value Object `WalletId`
```
Path:  src/Wallet.Api/Domain/Core/ValueObjects/WalletId.cs
Deps:  Nenhuma
RF:    RF-005
DoD:   ✅ record imutável com Guid Value
       ✅ New() gera UUID v7 (Guid.CreateVersion7() no .NET 9 ou lib Uuid7)
       ✅ From(Guid) factory para reconstrução
Tempo: 30min
```

### T-003 — Criar Value Object `Email`
```
Path:  src/Wallet.Api/Domain/Core/ValueObjects/Email.cs
Deps:  Nenhuma
RF:    RF-001
DoD:   ✅ record imutável com string Value normalizado lowercase
       ✅ Valida formato no construtor (DomainException se inválido)
Tempo: 30min
```

### T-004 — Criar Aggregate Root `Wallet`
```
Path:  src/Wallet.Api/Domain/Core/Aggregates/Wallet.cs
Deps:  T-001, T-002, T-003
RF:    RF-020, RF-021, RF-022, RF-024
DoD:   ✅ Open() factory method (WalletId.New() interno)
       ✅ Debit(Money) — lança InsufficientFundsException se saldo insuficiente
       ✅ Credit(Money) — sempre incrementa
       ✅ DomainEvents collection + ClearEvents()
       ✅ ZERO referências a Dapper, EF, AspNetCore, IDbConnection
Tempo: 2h
```

### T-005 — Criar Domain Events
```
Path:  src/Wallet.Api/Domain/Events/MoneyDebited.cs
       src/Wallet.Api/Domain/Events/MoneyCredited.cs
       src/Wallet.Api/Domain/Events/AccountOpened.cs
Deps:  T-001, T-002, T-003
RF:    RF-026
DoD:   ✅ records imutáveis implementando IDomainEvent
       ✅ MoneyDebited(WalletId, Money amount, Money balanceAfter)
       ✅ MoneyCredited(WalletId, Money amount, Money balanceAfter)
Tempo: 30min
```

### T-006 — Criar Port `IWalletRepository`
```
Path:  src/Wallet.Api/Domain/Ports/Outbound/IWalletRepository.cs
Deps:  T-001, T-002, T-003, T-004
RF:    RF-020, RF-022
DoD:   ✅ GetByIdAsync, GetByEmailAsync, SaveAsync
       ✅ GetPairForUpdateAsync(originId, targetId) para atomicidade
       ✅ ZERO tecnologia no contrato (sem IDbConnection, sem SqlConnection)
Tempo: 30min
```

### T-007 — Criar Port `IIdempotencyRepository`
```
Path:  src/Wallet.Api/Domain/Ports/Outbound/IIdempotencyRepository.cs
Deps:  Nenhuma (tipos primitivos)
RF:    RF-025
DoD:   ✅ GetAsync(key) → TransferResponse?
       ✅ SaveAsync(key, response, ttl)
Tempo: 20min
```

### T-008 — Criar `TransferTransaction` + `TransferResponse`
```
Path:  src/Wallet.Api/Application/UseCases/Transfer/TransferTransaction.cs
       src/Wallet.Api/Application/UseCases/Transfer/TransferResponse.cs
Deps:  T-001, T-002
RF:    RF-020
DoD:   ✅ records imutáveis
       ✅ TransferTransaction herda BaseTransaction<TransferResponse>
       ✅ IdempotencyKey nullable
Tempo: 20min
```

### T-009 — Criar `TransferValidationStep`
```
Path:  src/Wallet.Api/Application/UseCases/Transfer/Steps/TransferValidationStep.cs
Deps:  T-008
RF:    RF-024
DoD:   ✅ Order = 10
       ✅ Rejeita OriginId == TargetId → SELF_TRANSFER_NOT_ALLOWED
       ✅ Rejeita Amount <= 0 → INVALID_AMOUNT
       ✅ Retorna PipelineResult.Next() se válido
Tempo: 1h
```

### T-010 — Criar `TransferProcessingStep`
```
Path:  src/Wallet.Api/Application/UseCases/Transfer/Steps/TransferProcessingStep.cs
Deps:  T-004, T-006, T-007, T-008
RF:    RF-020, RF-021, RF-022, RF-023, RF-025
DoD:   ✅ Order = 30
       ✅ Verifica idempotência antes de qualquer operação
       ✅ GetPairForUpdateAsync + verifica null (404 por conta)
       ✅ origin.Debit() + target.Credit() na mesma IDbTransaction
       ✅ Salva idempotência após sucesso
       ✅ DomainException (InsufficientFunds) → PipelineResult.Failure
Tempo: 3h
```

### T-011 — Criar `PostgreSqlWalletRepository`
```
Path:  src/Wallet.Api/Adapters/Outbound/Persistence/PostgreSqlWalletRepository.cs
Deps:  T-004, T-006
RF:    RF-022
DoD:   ✅ Implementa IWalletRepository
       ✅ GetPairForUpdateAsync usa SELECT FOR UPDATE
       ✅ SaveAsync dentro de IDbTransaction externa (injetada)
       ✅ Dapper apenas nesta classe — nunca no Domain ou Application
Tempo: 3h
```

### T-012 — Criar `PostgreSqlIdempotencyRepository`
```
Path:  src/Wallet.Api/Adapters/Outbound/Persistence/PostgreSqlIdempotencyRepository.cs
Deps:  T-007
RF:    RF-025
DoD:   ✅ Implementa IIdempotencyRepository
       ✅ TTL de 24h via coluna expires_at
       ✅ GetAsync retorna null se expirado ou inexistente
Tempo: 1h
```

### T-013 — Criar `TransferEndpoints` (Minimal API)
```
Path:  src/Wallet.Api/Adapters/Inbound/Http/TransferEndpoints.cs
Deps:  T-008, T-010
RF:    RF-020, RF-025
DoD:   ✅ POST /api/v1/accounts/{originId}/transfer
       ✅ RequireAuthorization()
       ✅ Lê Idempotency-Key do header
       ✅ Constrói TransferTransaction com CorrelationId = TraceIdentifier
       ✅ Mapeia PipelineResult → HTTP status correto
Tempo: 1h
```

### T-014 — Criar Migration PostgreSQL
```
Path:  src/Wallet.Api/Infrastructure/Migrations/20260409_AddIdempotencyKeys.sql
Deps:  T-011, T-012
RF:    RF-022, RF-025
DoD:   ✅ Tabela wallets (id, email, balance_amount, balance_currency, password_hash, created_at)
       ✅ Tabela wallet_statements (id, account_id, type, amount, balance_after, occurred_at, correlation_id)
       ✅ Tabela idempotency_keys (key, response_json, expires_at)
       ✅ Índices: wallets(email), wallet_statements(account_id, occurred_at DESC)
Tempo: 1h
```

---

## Resumo

| Task | Camada | RF | Tempo |
|------|--------|----|-------|
| T-001 Money | Domain/VO | RF-020,021 | 1h |
| T-002 WalletId | Domain/VO | RF-005 | 30min |
| T-003 Email | Domain/VO | RF-001 | 30min |
| T-004 Wallet | Domain/Aggregate | RF-020,021,022,024 | 2h |
| T-005 Events | Domain/Events | RF-026 | 30min |
| T-006 IWalletRepository | Domain/Port | RF-020,022 | 30min |
| T-007 IIdempotencyRepository | Domain/Port | RF-025 | 20min |
| T-008 Transaction+Response | Application | RF-020 | 20min |
| T-009 ValidationStep | Application | RF-024 | 1h |
| T-010 ProcessingStep | Application | RF-020,021,022,023,025 | 3h |
| T-011 PostgreSqlWalletRepo | Adapter | RF-022 | 3h |
| T-012 PostgreSqlIdempotencyRepo | Adapter | RF-025 | 1h |
| T-013 TransferEndpoints | Adapter | RF-020,025 | 1h |
| T-014 Migrations | Infrastructure | RF-022,025 | 1h |
| **Total** | | | **~15h** |
