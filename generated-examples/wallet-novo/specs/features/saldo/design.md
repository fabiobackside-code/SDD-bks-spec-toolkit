# Design: Consulta de Saldo — .NET

**Fase 2 | Stack:** .NET 8+, PostgreSQL 15+, Dapper

---

## Modelo de Domínio

**Query simples** — sem modificação do Aggregate. Padrão CQRS light: leitura direta via Port de query, sem passar pelo Aggregate completo.

**Port:** `IWalletReadRepository` (separado do `IWalletRepository` de escrita)  
**Retorno:** `WalletBalanceDto` (record sem comportamento de domínio)

---

## Estrutura de Pastas

```
Application/UseCases/GetBalance/
├── GetBalanceUseCase.cs
├── GetBalanceTransaction.cs     ← record: WalletId, RequestingUserId
├── GetBalanceResponse.cs        ← record: WalletId, Balance, Currency

Domain/Ports/Outbound/
└── IWalletReadRepository.cs     ← GetBalanceAsync(WalletId) → WalletBalanceDto?

Adapters/Inbound/Http/
└── BalanceEndpoints.cs          ← GET /api/v1/accounts/{id}/balance (RequireAuthorization)

Adapters/Outbound/Persistence/
└── PostgreSqlWalletReadRepository.cs
```

---

## Code Examples

```csharp
// Application/UseCases/GetBalance/Steps/GetBalanceProcessingStep.cs
protected override async Task<PipelineResult<GetBalanceResponse>> ExecuteInternalAsync(
    GetBalanceTransaction transaction, CancellationToken ct)
{
    // Autorização: só pode ver o próprio saldo (RF-017)
    if (transaction.WalletId.Value.ToString() != transaction.RequestingUserId)
        return PipelineResult<GetBalanceResponse>.Forbidden("ACCESS_DENIED");

    var balance = await _readRepo.GetBalanceAsync(transaction.WalletId, ct);
    if (balance is null)
        return PipelineResult<GetBalanceResponse>.NotFound(
            "ACCOUNT_NOT_FOUND", transaction.WalletId.ToString());

    return PipelineResult<GetBalanceResponse>.Success(
        new GetBalanceResponse(transaction.WalletId.Value, balance.Amount, balance.Currency));
}
```

---

## Rastreabilidade

| RF | CA | Componente | Port |
|----|-----|-----------|------|
| RF-015 | CA-008 | `GetBalanceProcessingStep` | `IWalletReadRepository` |
| RF-016 | CA-008 | Query direta no banco (sem cache) | `IWalletReadRepository` |
| RF-017 | CA-009 | `RequestingUserId == WalletId` check | — |
