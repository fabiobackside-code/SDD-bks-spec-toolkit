# Tasks: Login / Autenticação

**Feature:** Login  
**Deps compartilhadas:** T-003 (Email), T-A01 (PasswordHash), T-A02 (IPasswordHasher)

---

### T-L01 — Criar Port `IJwtService`
```
Path:  src/Wallet.Api/Domain/Ports/Outbound/IJwtService.cs
Deps:  T-002 (WalletId), T-003 (Email)
RF:    RF-011, RF-012
DoD:   ✅ IssueAccessToken(WalletId, Email) → string
       ✅ IssueRefreshToken(WalletId) → string
       ✅ ZERO dependência de System.IdentityModel no contrato
Tempo: 20min
```

### T-L02 — Criar `AuthenticateTransaction` + `AuthenticateResponse`
```
Path:  src/Wallet.Api/Application/UseCases/Authenticate/AuthenticateTransaction.cs
Deps:  Nenhuma
RF:    RF-010
DoD:   ✅ record AuthenticateTransaction(CorrelationId, Email, PasswordRaw)
       ✅ record AuthenticateResponse(AccessToken, RefreshToken, ExpiresIn)
Tempo: 15min
```

### T-L03 — Criar `AuthenticateProcessingStep`
```
Path:  src/Wallet.Api/Application/UseCases/Authenticate/Steps/AuthenticateProcessingStep.cs
Deps:  T-L01, T-L02, T-A02 (IPasswordHasher)
RF:    RF-010, RF-011, RF-012, RF-013, RF-014
DoD:   ✅ Order = 30
       ✅ GetByEmailAsync → mesmo erro para email inexistente e senha errada (CA-006)
       ✅ IPasswordHasher.Verify() — tempo constante
       ✅ IJwtService.IssueAccessToken + IssueRefreshToken
Tempo: 2h
```

### T-L04 — Criar `AuthEndpoints`
```
Path:  src/Wallet.Api/Adapters/Inbound/Http/AuthEndpoints.cs
Deps:  T-L02
RF:    RF-010
DoD:   ✅ POST /api/v1/auth/login (sem autenticação)
       ✅ 401 com INVALID_CREDENTIALS (mesmo para email inexistente e senha errada)
Tempo: 30min
```

### T-L05 — Criar `JwtService` (Infrastructure)
```
Path:  src/Wallet.Api/Infrastructure/Jwt/JwtService.cs
Deps:  T-L01
RF:    RF-011, RF-012, RF-014
DoD:   ✅ Implementa IJwtService
       ✅ RS256 ou HS256 (configurável)
       ✅ AccessToken: sub, email, iat, exp (1h)
       ✅ RefreshToken: sub, iat, exp (7d)
Tempo: 2h
```
