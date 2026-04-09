# Coupling Analysis Report — wallet-novo

**Skill aplicada:** `/coupling-analysis`  
**Data:** 2026-04-09  
**Projeto:** wallet-novo (case prático SDD)  
**Status do código:** specs completas, `src/` a implementar

---

## Como reproduzir este relatório

Quando `src/` estiver implementado (Fase 5 real), execute:

```
/coupling-analysis
```

O Claude Code vai varrer `src/` e produzir um relatório como o abaixo.

---

## Relatório Esperado (contratos definidos nas specs)

### BLOCKER — impediriam o merge

Nenhum esperado se as tasks forem seguidas conforme o design.md:

- `Wallet.cs` (Domain) não importa `Dapper`, `Npgsql`, `IDbConnection` ✅
- `IWalletRepository.cs` (Domain/Ports) não expõe `SqlConnection` ou `IDbTransaction` ✅
- `TransferProcessingStep.cs` (Application) não referencia `PostgreSqlWalletRepository` diretamente ✅
- Nenhum `using Wallet.Api.Adapters.*` em `Wallet.Api.Domain.*` ✅

### WARNING — violações conhecidas a resolver antes do merge

**W-001:** `TransferProcessingStep` recebe `IDbTransaction` como parâmetro
```
Arquivo: Application/UseCases/Transfer/Steps/TransferProcessingStep.cs
Problema: IDbTransaction pertence a System.Data — tecnologia de infra num Step de Application
Remediação: Criar abstração IUnitOfWork no Domain/Ports/Outbound/
            PostgreSqlUnitOfWork implementa na camada de Adapter
Severidade: WARNING (System.Data é parte do BCL, aceitável em alguns casos — decidir no ADR-002)
```

### INFO — melhorias recomendadas

**I-001:** `WalletMapper` (estático) pode ficar em `Adapters/Outbound/Persistence/`
```
Observação: Mapper não deve vazar tipos de domínio para objetos de infraestrutura.
Recomendação: Criar WalletPersistenceModel (DTO de persistência) separado do Aggregate.
```

---

## Resumo

| Categoria | Quantidade |
|-----------|-----------|
| BLOCKER | 0 |
| WARNING | 1 (IDbTransaction — ver ADR-002) |
| INFO | 1 |
| **Status** | **CONDICIONAL — resolver W-001 antes do merge** |

---

## Verificação Manual (pré-implementação)

Os contratos foram definidos para garantir zero BLOCKERs. Checklist do design.md:

- [x] `Wallet.cs` — ZERO imports além de `System.*` e próprio Domain
- [x] `IWalletRepository.cs` — sem `IDbConnection`, `Dapper`, `SqlConnection`
- [x] `IIdempotencyRepository.cs` — tipos primitivos no contrato
- [x] `TransferProcessingStep.cs` — injeta apenas Ports (interfaces), não Adapters
- [x] `TransferEndpoints.cs` — não referencia `PostgreSqlWalletRepository` diretamente
- [ ] `IDbTransaction` no ProcessingStep — **pendente decisão ADR-002**

---

## Testes ArchUnit que validam os mesmos contratos

Ver `specs/features/transferencia/tests.md` — seção Architecture Tests:

- `Domain_ShouldNot_HaveDependencyOn_Adapters`
- `Domain_ShouldNot_HaveDependencyOn_Infrastructure`
- `Domain_ShouldNot_Reference_OrmLibraries`
- `Ports_ShouldBe_Interfaces_And_ResideIn_Domain`
- `Application_ShouldNot_HaveDependencyOn_Adapters`

O ArchUnit deve detectar os mesmos BLOCKERs que este relatório — se os testes passarem, o relatório de coupling deve ter 0 BLOCKERs.
