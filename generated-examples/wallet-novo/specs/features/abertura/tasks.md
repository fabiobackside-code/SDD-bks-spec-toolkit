# Tasks: Abertura de Conta

**Feature:** Abertura de Conta  
**Deps compartilhadas:** T-001 a T-004 de Transferência (Money, WalletId, Email, Wallet já criados)

---

### T-A01 — Criar Value Object `PasswordHash`
```
Path:  src/Wallet.Api/Domain/Core/ValueObjects/PasswordHash.cs
Deps:  Nenhuma
RF:    RF-004
DoD:   ✅ record imutável com string Hash
       ✅ Create(plain) — bcrypt fator 12 (via BCrypt.Net na Infrastructure — Port abstrai)
       ✅ Verify(plain) → bool — tempo constante
       ✅ Nunca expõe o valor raw via ToString()
Tempo: 1h
```

### T-A02 — Criar Port `IPasswordHasher`
```
Path:  src/Wallet.Api/Domain/Ports/Outbound/IPasswordHasher.cs
Deps:  Nenhuma
RF:    RF-004
DoD:   ✅ Hash(plain) → PasswordHash
       ✅ Verify(plain, hash) → bool
       ✅ ZERO dependência de BCrypt.Net no contrato
Tempo: 15min
```

### T-A03 — Criar `OpenAccountTransaction` + `OpenAccountResponse`
```
Path:  src/Wallet.Api/Application/UseCases/OpenAccount/OpenAccountTransaction.cs
Deps:  Nenhuma
RF:    RF-001
DoD:   ✅ record OpenAccountTransaction(CorrelationId, Email, PasswordRaw, Name)
       ✅ record OpenAccountResponse(WalletId, Email, Name, decimal Balance)
Tempo: 20min
```

### T-A04 — Criar `OpenAccountValidationStep`
```
Path:  src/Wallet.Api/Application/UseCases/OpenAccount/Steps/OpenAccountValidationStep.cs
Deps:  T-A03
RF:    RF-001
DoD:   ✅ Order = 10
       ✅ Email formato válido (FluentValidation ou inline)
       ✅ Password ≥ 8 caracteres
       ✅ Name não vazio
Tempo: 1h
```

### T-A05 — Criar `OpenAccountProcessingStep`
```
Path:  src/Wallet.Api/Application/UseCases/OpenAccount/Steps/OpenAccountProcessingStep.cs
Deps:  T-A01, T-A02, T-A03, T-004 (Wallet)
RF:    RF-001, RF-002, RF-003, RF-004, RF-005
DoD:   ✅ Order = 30
       ✅ GetByEmailAsync → 409 se duplicado
       ✅ IPasswordHasher.Hash(plain) → PasswordHash (nunca bcrypt direto no Step)
       ✅ Wallet.Open(email, hash, name) → WalletId.New() interno
       ✅ SaveAsync
Tempo: 2h
```

### T-A06 — Criar `AccountEndpoints`
```
Path:  src/Wallet.Api/Adapters/Inbound/Http/AccountEndpoints.cs
Deps:  T-A03
RF:    RF-001, RF-002
DoD:   ✅ POST /api/v1/accounts (sem autenticação)
       ✅ 201 Created + Location header
       ✅ Mapeia 409 Conflict para EMAIL_ALREADY_EXISTS
Tempo: 1h
```

### T-A07 — Criar `BcryptPasswordHasher` (Infrastructure)
```
Path:  src/Wallet.Api/Infrastructure/Security/BcryptPasswordHasher.cs
Deps:  T-A02
RF:    RF-004
DoD:   ✅ Implementa IPasswordHasher com BCrypt.Net
       ✅ WorkFactor = 12 configurável via appsettings
Tempo: 30min
```
