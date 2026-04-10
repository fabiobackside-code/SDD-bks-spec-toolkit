# PLANO: wallet-novo — Case Prático do SDD Toolkit

**Objetivo:** Demonstrar o uso completo do bks-spec-toolkit com todas as skills, aplicado ao domínio de carteira digital.

**Referência comparativa:** `examples/wallet` mostra o esqueleto mínimo gerado pela CLI. Este exemplo (`wallet-novo`) mostra o resultado quando as skills são usadas em cada fase.

---

## Como usar este plano

Leia fase a fase. Para cada fase:
1. Veja o **Prompt** — o que você digita no Claude Code
2. Veja o **Resultado esperado** — o que deve ser gerado
3. Veja a **Diferença vs wallet** — o que muda com o uso das skills

---

## Fase 0 — Scaffolding via CLI

**Comando:**
```bash
cd d:/Fabio/BackSide/SDD/toolkit-app
node dist/index.js
```

**Responda:**
```
? Nome do projeto: wallet-novo
? Descrição: API de carteira digital — case prático SDD com skills
? Tech Stack: .NET 8+ (C#)
? Onde criar?: ./examples/wallet-novo
? Confirma?: Y
```

**Resultado:** Estrutura completa gerada com todos os arquivos CLAUDE*, PLAN.md, templates, guidelines e features/.

**Diferença vs wallet:** Nenhuma — ponto de partida idêntico. A qualidade começa na Fase 1.

---

## Fase 1 — Requirements ricos

**Quando usar:** Antes de qualquer código ou design técnico.

**Por feature:**

### transferencia (feature principal do case)

**Prompt:**
> "Revise specs/features/transferencia/requirements.md. Identifique ambiguidades, casos de borda e adicione RNFs mensuráveis, RC explícitas e CAs em Gherkin."

**O que deve conter:**
- RF-020 a RF-025 (adicionar: idempotência, auditoria)
- RNF-001: Latência p99 < 500ms para a operação de transferência
- RNF-002: Atomicidade ACID — débito e crédito na mesma transação de banco
- RNF-003: Idempotência via `Idempotency-Key` header
- RC-001: .NET 8+, PostgreSQL 15+, Dapper (sem EF Core  no fluxo principal)
- RC-002: Sem distributed transactions — contas no mesmo banco
- CAs em Gherkin para: saldo suficiente, saldo insuficiente, mesma conta, conta inexistente, segunda chamada idempotente

**Diferença vs wallet:** De 5 RFs rasos + 3 CAs simplistas para spec completa com RNFs mensuráveis e CAs testáveis.

### abertura

**O que deve conter:**
- RNF: UUID v7 gerado no Domain (não pelo banco)
- RNF: Latência < 300ms p99
- RC: Senha com bcrypt, fator 12
- CA: Email duplicado → 409 Conflict (não 400)

### saldo, extrato, login

- RNFs de latência por operação
- RC de autenticação (JWT, expiração)
- CAs cobrindo casos de borda (conta inexistente, token expirado)

---

## Fase 2a — Domain Analysis

**Skill:** `/domain-analysis`

**Quando usar:** Após requirements.md validado. Antes de qualquer decisão técnica.

**Prompt para transferencia:**
> "Execute /domain-analysis na feature transferencia usando specs/features/transferencia/requirements.md"

**O que a skill produz em `design.md`:**

```
Bounded Context: Wallet

Aggregate Root: Wallet
  Value Objects: Money, WalletId, Email
  Invariantes:
    - Saldo nunca negativo após débito
    - Transferência para própria conta lança DomainException
    - Débito e crédito são atômicos

Domain Events:
  MoneyDebited     → produzido por Wallet.Debit()
  MoneyCredited    → produzido por Wallet.Credit()
  TransferInitiated → produzido por TransferUseCase (Application)

Context Map:
  Wallet = Core Domain (autocontido)
  Futura integração com Notification BC via ACL
```

**Diferença vs wallet:** De "Aggregate: Domain entity principal" para modelo DDD real com invariantes, VOs e Domain Events rastreáveis.

---

## Fase 2b — Technical Design Doc Creator

**Skill:** `/technical-design-doc-creator`

**Quando usar:** Após domain-analysis. Transforma modelo de domínio em design técnico .NET.

**Prompt:**
> "Execute /technical-design-doc-creator na feature transferencia"

**O que a skill produz em `design.md`:**

```
Folder Structure com namespaces reais:
  Domain/Core/Aggregates/Wallet.cs
  Domain/Core/ValueObjects/Money.cs, WalletId.cs, Email.cs
  Domain/Ports/Outbound/IWalletRepository.cs
  Application/UseCases/Transfer/TransferUseCase.cs
  Application/UseCases/Transfer/TransferTransaction.cs
  Application/UseCases/Transfer/Steps/ValidationStep.cs
  Application/UseCases/Transfer/Steps/ProcessingStep.cs
  Adapters/Inbound/Http/WalletEndpoints.cs
  Adapters/Outbound/Persistence/PostgreSqlWalletRepository.cs
  Infrastructure/DependencyInjection/ServiceCollectionExtensions.cs

Code Examples:
  - Aggregate Root Wallet em C#
  - Port IWalletRepository (sem Dapper no contrato)
  - record TransferTransaction (imutável)
  - Pipeline com ValidationStep [10] + ProcessingStep [30]

Rastreabilidade: RF-020 → Wallet.Debit()+Credit() → IWalletRepository → CA-010
```

**Diferença vs wallet:** De "Ports: Interfaces para Repository, Service" para design.md com C# real e rastreabilidade completa.

---

## Fase 3 — Tasks atômicas

**Quando usar:** Após design.md completo. Cada componente do design vira task.

**Padrão obrigatório por task:**
```
T-XXX: <descrição>
  Path: src/<namespace>/<arquivo>.cs
  Deps: T-YYY (se houver)
  DoD: ✅ <critério concreto>
  RF: RF-XXX
  Tempo: Xh
```

**Tasks para transferencia (derivadas do design.md):**
```
T-001: Criar Value Object Money
T-002: Criar Value Object WalletId
T-003: Criar Value Object Email
T-004: Criar Aggregate Root Wallet (Debit, Credit, métodos de domínio)
T-005: Criar Port IWalletRepository
T-006: Criar record TransferTransaction
T-007: Criar ValidationStep (saldo, mesma conta, contas existem)
T-008: Criar ProcessingStep (GetPairForUpdate + Debit + Credit + Save)
T-009: Criar PostgreSqlWalletRepository (SELECT FOR UPDATE + transação)
T-010: Criar WalletEndpoints (Minimal API, Idempotency-Key header)
T-011: Unit tests — Money, WalletId, Wallet
T-012: Integration tests — TransferUseCase com Testcontainers
T-013: Architecture tests — ArchUnit (Domain não referencia Adapters)
```

**Diferença vs wallet:** De "T-001: Criar Aggregate/Entity" para tasks com path, deps, DoD e rastreabilidade ao RF.

---

## Fase 4 — Tests com cenários concretos

**Quando usar:** Durante/após tasks, guiado pelo tests.md.

**Estratégia 70/20/10:**

### Unit (70%) — xUnit + Moq
```csharp
// Money
[Fact] Debit_WithInsufficientFunds_ThrowsDomainException()
[Fact] Debit_ExactBalance_SetsBalanceToZero()
[Fact] Credit_ValidAmount_IncreasesBalance()

// Wallet
[Fact] Transfer_ToSameWallet_ThrowsDomainException()
[Fact] Transfer_InsufficientFunds_ThrowsDomainException()
[Fact] Transfer_Valid_RaisesDomainEvents()
```

### Integration (20%) — Testcontainers (PostgreSQL real)
```csharp
[Fact] Transfer_ValidAccounts_DebitedAndCredited_Persisted()
[Fact] Transfer_InsufficientBalance_Returns400_BalanceUnchanged()
[Fact] Transfer_Idempotent_SecondCallReturns200_NoDuplicate()
[Fact] Transfer_ConcurrentSameAccounts_OnlyOneSucceeds()
```

### Architecture (10%) — ArchUnit
```csharp
[Fact] Domain_ShouldNot_Reference_Adapters()
[Fact] Domain_ShouldNot_Reference_Infrastructure()
[Fact] Domain_ShouldNot_Reference_EntityFramework()
[Fact] Ports_ShouldBe_Interfaces_In_Domain()
```

**Diferença vs wallet:** De "Unit (70%): xUnit + Moq" para cenários concretos rastreáveis ao CA.

---

## Fase 5 — Integration (Coupling Analysis)

**Skill:** `/coupling-analysis`

**Quando usar:** Antes de abrir o PR. Após src/ implementado.

**Prompt:**
> "Execute /coupling-analysis no projeto src/"

**O que a skill verifica:**
1. `Wallet.cs` não importa `Dapper`, `Npgsql` ou `Microsoft.AspNetCore.*`
2. `IWalletRepository` está em `Domain/Ports/Outbound/`, não em `Adapters/`
3. `PostgreSqlWalletRepository` implementa o Port sem referência cruzada com outros Adapters
4. Sem dependências cíclicas entre namespaces

**Resultado esperado:**
```
## Coupling Analysis Report
Blockers: 0
Warnings: 0
Info: 0
Status: ✅ APROVADO
```

---

## Resultado Final: wallet × wallet-novo

| Dimensão | `examples/wallet` | `examples/wallet-novo` |
|----------|------------------|------------------------|
| requirements.md | RFs rasos, CAs simplistas | RFs + RNFs mensuráveis + RC + CAs Gherkin |
| design.md | 4 linhas genéricas | Modelo DDD + C# + rastreabilidade completa |
| tasks.md | 7 tasks sem path/DoD | 13+ tasks com path, deps, DoD, RF rastreável |
| tests.md | Menciona estratégia | Cenários concretos por CA |
| src/ | .gitkeep | Código .NET funcional (Fase 5) |
| Skills usadas | Nenhuma | domain-analysis + technical-design-doc-creator + coupling-analysis |

---

## Skills Reference Card

| Comando | Fase | Trigger |
|---------|------|---------|
| `/domain-analysis` | Fase 2a | "analisar domínio", "event storming", "aggregates" |
| `/technical-design-doc-creator` | Fase 2b | "criar design", "gerar design.md" |
| `/coupling-analysis` | Fase 5 | "analisar acoplamento", "violação hexagonal" |
| `/gh-address-comments` | Fase 5 | "address PR comments", "resolver review" |

---

**Versão do toolkit:** bks-spec-toolkit v1.0.1  
**Criado em:** 2026-04-09  
**Atualizar em:** cada iteração do projeto
