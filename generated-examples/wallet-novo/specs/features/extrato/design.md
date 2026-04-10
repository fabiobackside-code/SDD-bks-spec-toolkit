# Design: Extrato de Transações — .NET

**Fase 2 | Stack:** .NET 8+, PostgreSQL 15+, Dapper

---

## Modelo de Domínio

**Query paginada por cursor** — sem Aggregate envolvido. Leitura de tabela `wallet_statements` gerada pelos Domain Events `MoneyDebited`/`MoneyCredited`.

**Separação de responsabilidades:**
- Escrita na tabela `wallet_statements` → responsabilidade do `TransferProcessingStep` ao consumir Domain Events
- Leitura → `IStatementReadRepository` (Port separado)

---

## Estrutura de Pastas

```
Application/UseCases/GetStatement/
├── GetStatementUseCase.cs
├── GetStatementTransaction.cs   ← record: WalletId, RequestingUserId, Cursor?, From?, To?, PageSize
├── GetStatementResponse.cs      ← record: Items[], NextCursor?, HasMore

Domain/Ports/Outbound/
└── IStatementReadRepository.cs  ← GetPageAsync(WalletId, cursor, from, to, pageSize)

Adapters/Inbound/Http/
└── StatementEndpoints.cs        ← GET /api/v1/accounts/{id}/statement

Adapters/Outbound/Persistence/
└── PostgreSqlStatementReadRepository.cs
    └── SQL: WHERE account_id = @Id AND id < @Cursor ORDER BY id DESC LIMIT @Size
```

---

## Code Examples

```csharp
// Domain/Ports/Outbound/IStatementReadRepository.cs
public interface IStatementReadRepository
{
    Task<StatementPage> GetPageAsync(
        WalletId accountId,
        Guid? cursor,
        DateOnly? from,
        DateOnly? to,
        int pageSize,
        CancellationToken ct = default);
}

// SQL no Adapter (nunca no Port)
// WHERE account_id = @AccountId
//   AND (@Cursor IS NULL OR id < @Cursor)
//   AND (@From IS NULL OR DATE(occurred_at) >= @From)
//   AND (@To IS NULL OR DATE(occurred_at) <= @To)
// ORDER BY id DESC
// LIMIT @PageSize + 1   ← +1 para detectar hasMore sem COUNT(*)
```

---

## Rastreabilidade

| RF | CA | Componente | Port |
|----|-----|-----------|------|
| RF-030 | CA-016 | `GetStatementProcessingStep` | `IStatementReadRepository` |
| RF-031 | CA-016 | `StatementItemDto` fields | `IStatementReadRepository` |
| RF-032 | CA-016 | Cursor-based pagination | `IStatementReadRepository.GetPageAsync` |
| RF-033 | CA-019 | `from`/`to` params | `IStatementReadRepository.GetPageAsync` |
| RF-034 | CA-018 | `RequestingUserId == WalletId` check | — |
