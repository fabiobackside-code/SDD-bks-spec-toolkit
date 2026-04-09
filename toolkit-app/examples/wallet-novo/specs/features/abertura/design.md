# Design: Abertura de Conta — .NET

**Fase 2 | Stack:** .NET 8+, PostgreSQL 15+, Dapper  
**Skill aplicada:** `/domain-analysis` → `/technical-design-doc-creator`

---

## Modelo de Domínio

**Aggregate Root:** `Wallet` (compartilhado com feature Transferência)

**Value Objects envolvidos:**
- `WalletId` — UUID v7 gerado no Domain via `WalletId.New()`
- `Email` — normalizado lowercase, validado formato RFC 5322
- `Money` — `Amount = 0m`, `Currency = "BRL"` na abertura
- `PasswordHash` — encapsula o hash bcrypt; nunca expõe o plain text

**Domain Events:**
- `AccountOpened(WalletId, Email, DateTime)` — emitido por `Wallet.Open()`

**Invariantes:**
- Email não pode ser nulo ou vazio
- Senha nunca armazenada em plain text — sempre `PasswordHash`
- Saldo inicial obrigatoriamente `Money.Zero("BRL")`

---

## Estrutura de Pastas (componentes específicos desta feature)

```
Application/UseCases/OpenAccount/
├── OpenAccountUseCase.cs
├── OpenAccountTransaction.cs    ← record: Email, PasswordRaw, Name, CorrelationId
├── OpenAccountResponse.cs       ← record: WalletId, Email, Name, Balance
└── Steps/
    ├── OpenAccountValidationStep.cs    ← [10] valida email format, password strength
    └── OpenAccountProcessingStep.cs    ← [30] checa duplicidade, cria Wallet, persiste

Adapters/Inbound/Http/
└── AccountEndpoints.cs          ← POST /api/v1/accounts
```

---

## Code Examples

```csharp
// Application/UseCases/OpenAccount/OpenAccountTransaction.cs
public record OpenAccountTransaction(
    string CorrelationId,
    string Email,
    string PasswordRaw,   // nunca sai deste record — convertido para PasswordHash no Processing
    string Name
) : BaseTransaction<OpenAccountResponse>;

// Application/UseCases/OpenAccount/Steps/OpenAccountProcessingStep.cs
protected override async Task<PipelineResult<OpenAccountResponse>> ExecuteInternalAsync(
    OpenAccountTransaction transaction, CancellationToken ct)
{
    // Verificar unicidade de email
    var email = new Email(transaction.Email);
    var existing = await _walletRepo.GetByEmailAsync(email, ct);
    if (existing is not null)
        return PipelineResult<OpenAccountResponse>.Conflict(
            "EMAIL_ALREADY_EXISTS", transaction.Email);

    // Criar Aggregate (Domain gera WalletId.New() internamente)
    var hash = PasswordHash.Create(transaction.PasswordRaw); // bcrypt fator 12
    var wallet = Wallet.Open(email, hash, transaction.Name);

    await _walletRepo.SaveAsync(wallet, ct);

    return PipelineResult<OpenAccountResponse>.Success(
        new OpenAccountResponse(wallet.Id.Value, wallet.Email.Value,
                                wallet.Name, wallet.Balance.Amount));
}
```

---

## Fluxo

```
POST /api/v1/accounts
  → AccountEndpoints
  → OpenAccountTransaction (Email, PasswordRaw, Name)
  → [10] ValidationStep: email válido? senha ≥ 8 chars?
  → [30] ProcessingStep: email único? → Wallet.Open() → SaveAsync
  → 201 Created + body + header Location
```

---

## Rastreabilidade

| RF | CA | Método | Port | Step |
|----|-----|--------|------|------|
| RF-001 | CA-001 | `Wallet.Open()` | `IWalletRepository.SaveAsync` | ProcessingStep |
| RF-002 | CA-002 | — | `IWalletRepository.GetByEmailAsync` | ProcessingStep |
| RF-003 | CA-001 | `Money.Zero("BRL")` via `Wallet.Open()` | — | ProcessingStep |
| RF-004 | CA-001 | `PasswordHash.Create(raw)` | — | ProcessingStep |
| RF-005 | CA-001 | `WalletId.New()` via `Wallet.Open()` | — | ProcessingStep |
| RF-006 | CA-001 | `AccountOpened` Domain Event | — | ProcessingStep |
