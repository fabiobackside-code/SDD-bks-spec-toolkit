# Tasks: Consulta de Saldo

**Feature:** Saldo  
**Deps compartilhadas:** T-002 (WalletId)

---

### T-S01 — Criar Port `IWalletReadRepository`
```
Path:  src/Wallet.Api/Domain/Ports/Outbound/IWalletReadRepository.cs
Deps:  T-002 (WalletId)
RF:    RF-015
DoD:   ✅ GetBalanceAsync(WalletId) → WalletBalanceDto? (record com Amount, Currency)
       ✅ ZERO Dapper no contrato
Tempo: 20min
```

### T-S02 — Criar `GetBalanceTransaction` + `GetBalanceResponse`
```
Path:  src/Wallet.Api/Application/UseCases/GetBalance/GetBalanceTransaction.cs
Deps:  T-002
RF:    RF-015
DoD:   ✅ record GetBalanceTransaction(CorrelationId, WalletId, RequestingUserId)
       ✅ record GetBalanceResponse(WalletId, decimal Balance, string Currency)
Tempo: 15min
```

### T-S03 — Criar `GetBalanceProcessingStep`
```
Path:  src/Wallet.Api/Application/UseCases/GetBalance/Steps/GetBalanceProcessingStep.cs
Deps:  T-S01, T-S02
RF:    RF-015, RF-016, RF-017
DoD:   ✅ Order = 30
       ✅ WalletId != RequestingUserId → 403 ACCESS_DENIED
       ✅ null → 404 ACCOUNT_NOT_FOUND
Tempo: 1h
```

### T-S04 — Criar `BalanceEndpoints`
```
Path:  src/Wallet.Api/Adapters/Inbound/Http/BalanceEndpoints.cs
Deps:  T-S02
RF:    RF-015
DoD:   ✅ GET /api/v1/accounts/{id}/balance
       ✅ RequireAuthorization()
       ✅ Extrai RequestingUserId do JWT sub claim
Tempo: 30min
```

### T-S05 — Criar `PostgreSqlWalletReadRepository`
```
Path:  src/Wallet.Api/Adapters/Outbound/Persistence/PostgreSqlWalletReadRepository.cs
Deps:  T-S01
RF:    RF-016
DoD:   ✅ Query: SELECT balance_amount, balance_currency FROM wallets WHERE id = @Id
       ✅ Sem SELECT FOR UPDATE (leitura simples)
Tempo: 30min
```
