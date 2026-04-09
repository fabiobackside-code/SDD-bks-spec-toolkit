# Tasks: Extrato de Transações

**Feature:** Extrato  
**Deps compartilhadas:** T-002 (WalletId)

---

### T-E01 — Criar Port `IStatementReadRepository`
```
Path:  src/Wallet.Api/Domain/Ports/Outbound/IStatementReadRepository.cs
Deps:  T-002
RF:    RF-030, RF-031
DoD:   ✅ GetPageAsync(WalletId, cursor?, from?, to?, pageSize) → StatementPage
       ✅ StatementPage: IReadOnlyList<StatementItemDto>, Guid? NextCursor, bool HasMore
       ✅ ZERO Dapper no contrato
Tempo: 30min
```

### T-E02 — Criar `GetStatementTransaction` + `GetStatementResponse`
```
Path:  src/Wallet.Api/Application/UseCases/GetStatement/GetStatementTransaction.cs
Deps:  T-002
RF:    RF-030
DoD:   ✅ record: WalletId, RequestingUserId, Cursor?, From?, To?, PageSize (default 20, max 100)
       ✅ record response: Items[], NextCursor?, HasMore
Tempo: 20min
```

### T-E03 — Criar `GetStatementProcessingStep`
```
Path:  src/Wallet.Api/Application/UseCases/GetStatement/Steps/GetStatementProcessingStep.cs
Deps:  T-E01, T-E02
RF:    RF-030, RF-031, RF-032, RF-033, RF-034
DoD:   ✅ Order = 30
       ✅ WalletId != RequestingUserId → 403
       ✅ from > to → 422 INVALID_DATE_RANGE
       ✅ PageSize > 100 → normalizar para 100
       ✅ Cursor inválido → 422
Tempo: 2h
```

### T-E04 — Criar `StatementEndpoints`
```
Path:  src/Wallet.Api/Adapters/Inbound/Http/StatementEndpoints.cs
Deps:  T-E02
RF:    RF-030
DoD:   ✅ GET /api/v1/accounts/{id}/statement?cursor=&from=&to=&pageSize=
       ✅ RequireAuthorization()
Tempo: 30min
```

### T-E05 — Criar `PostgreSqlStatementReadRepository`
```
Path:  src/Wallet.Api/Adapters/Outbound/Persistence/PostgreSqlStatementReadRepository.cs
Deps:  T-E01
RF:    RF-030, RF-032, RF-033
DoD:   ✅ Cursor-based: WHERE id < @Cursor ORDER BY id DESC LIMIT @PageSize + 1
       ✅ Filtro por from/to com DATE(occurred_at)
       ✅ hasMore detectado pelo item extra (+1)
       ✅ Índice: wallet_statements(account_id, id DESC)
Tempo: 2h
```
