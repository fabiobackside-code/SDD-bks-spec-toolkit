# Design: Login / Autenticação — .NET

**Fase 2 | Stack:** .NET 8+, PostgreSQL 15+, Dapper, JWT (System.IdentityModel.Tokens.Jwt)

---

## Modelo de Domínio

**Nota:** Autenticação é **Supporting Domain** — não é Core Domain. O domínio da Wallet não conhece JWT. A geração e validação de token ocorre no Adapter, não no Aggregate.

**Aggregate:** `Wallet` (via Port `IWalletRepository`)  
**Value Objects envolvidos:** `Email`, `PasswordHash`

**Regra de domínio:**
- `PasswordHash.Verify(plain, hash)` — comparação de tempo constante; retorna bool
- Wallet não sabe nada de JWT, tokens ou sessões

---

## Estrutura de Pastas

```
Application/UseCases/Authenticate/
├── AuthenticateUseCase.cs
├── AuthenticateTransaction.cs    ← record: Email, PasswordRaw
├── AuthenticateResponse.cs       ← record: AccessToken, RefreshToken, ExpiresIn
└── Steps/
    └── AuthenticateProcessingStep.cs   ← [30] busca wallet, verifica hash, gera JWT

Adapters/Inbound/Http/
└── AuthEndpoints.cs              ← POST /api/v1/auth/login

Domain/Ports/Outbound/
└── IJwtService.cs                ← Port: IssueToken(WalletId, Email) → string
                                     (JWT gerado na Infrastructure, nunca no Domain)

Infrastructure/
└── Jwt/
    └── JwtService.cs             ← Implementa IJwtService com System.IdentityModel
```

---

## Code Examples

```csharp
// Domain/Ports/Outbound/IJwtService.cs
// Domain define o contrato — Infrastructure implementa
public interface IJwtService
{
    string IssueAccessToken(WalletId walletId, Email email);
    string IssueRefreshToken(WalletId walletId);
}

// Application/UseCases/Authenticate/Steps/AuthenticateProcessingStep.cs
protected override async Task<PipelineResult<AuthenticateResponse>> ExecuteInternalAsync(
    AuthenticateTransaction transaction, CancellationToken ct)
{
    var email = new Email(transaction.Email);
    var wallet = await _walletRepo.GetByEmailAsync(email, ct);

    // Mesmo erro para email inexistente e senha errada (CA-006: não revelar)
    if (wallet is null || !wallet.PasswordHash.Verify(transaction.PasswordRaw))
        return PipelineResult<AuthenticateResponse>.Unauthorized("INVALID_CREDENTIALS");

    var accessToken = _jwtService.IssueAccessToken(wallet.Id, wallet.Email);
    var refreshToken = _jwtService.IssueRefreshToken(wallet.Id);

    return PipelineResult<AuthenticateResponse>.Success(
        new AuthenticateResponse(accessToken, refreshToken, ExpiresIn: 3600));
}
```

---

## Rastreabilidade

| RF | CA | Componente | Port |
|----|-----|-----------|------|
| RF-010 | CA-005 | `AuthenticateProcessingStep` | `IWalletRepository`, `IJwtService` |
| RF-011 | CA-005 | `IJwtService.IssueAccessToken` | `IJwtService` |
| RF-012 | CA-005 | `IJwtService.IssueRefreshToken` | `IJwtService` |
| RF-013 | CA-006 | `PasswordHash.Verify` — mesmo retorno para ambos os casos | — |
| RF-014 | CA-005 | `JwtService` inclui `sub`, `email`, `iat`, `exp` | `IJwtService` |
