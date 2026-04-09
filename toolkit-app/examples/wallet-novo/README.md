# wallet-novo — Case Prático SDD com Skills

**Exemplo de uso completo do bks-spec-toolkit v1.0.1**  
**Domínio:** Carteira Digital (API REST .NET 8+)  
**Comparativo:** veja `../wallet/` para o esqueleto mínimo gerado pela CLI

---

## O que este exemplo demonstra

Cada arquivo aqui é o resultado de uma das 5 fases SDD, produzido com as skills do toolkit:

| Fase | Artefato | Skill usada |
|------|----------|-------------|
| 0 — Scaffolding | Estrutura completa (`specs/`, `src/`, `tests/`) | CLI (`node dist/index.js`) |
| 1 — Requirements | `specs/features/*/requirements.md` | Manual (validação com Claude) |
| 2a — Domain Analysis | `design.md` — seção Modelo de Domínio | `/domain-analysis` |
| 2b — Technical Design | `design.md` — seção Arquitetura .NET | `/technical-design-doc-creator` |
| 3 — Tasks | `specs/features/*/tasks.md` | Manual (derivado do design.md) |
| 4 — Tests | `specs/features/*/tests.md` | Manual (derivado dos CAs) |
| 5 — Coupling Check | `COUPLING-REPORT.md` | `/coupling-analysis` |

---

## Estrutura

```
wallet-novo/
├── PLANO.md                    ← Guia passo a passo de todo o case (leia primeiro)
├── COUPLING-REPORT.md          ← Relatório da skill /coupling-analysis
├── CONTINUIDADE.md             ← Gerado pelo CLI (próximos passos)
├── .bks-config.json
├── specs/
│   ├── CLAUDE.md               ← 6 princípios SDD
│   ├── CLAUDE-ARCHITECT.md     ← Hexagonal + DDD (agnóstico)
│   ├── CLAUDE-ARCHITECT-NET.md ← Implementações .NET com C#
│   ├── CLAUDE-TDD.md           ← Pirâmide 70/20/10
│   ├── PLAN.md                 ← 5 fases com skills referenciadas
│   ├── guidelines/             ← Guias aprofundados
│   ├── templates/              ← Templates reutilizáveis
│   └── features/
│       ├── abertura/           ← RF-001 a RF-006
│       │   ├── requirements.md ← RFs + RNFs + RC + CAs Gherkin
│       │   ├── design.md       ← Wallet.Open(), PasswordHash VO, fluxo
│       │   ├── tasks.md        ← T-A01 a T-A07 (path + deps + DoD)
│       │   └── tests.md        ← Unit + Integration com cenários reais
│       ├── login/              ← RF-010 a RF-014
│       ├── saldo/              ← RF-015 a RF-017
│       ├── extrato/            ← RF-030 a RF-034
│       └── transferencia/      ← RF-020 a RF-026 (feature principal)
│           ├── requirements.md ← 7 RFs + 4 RNFs + 2 RCs + 6 CAs Gherkin
│           ├── design.md       ← Domain model + C# code examples + rastreabilidade
│           ├── tasks.md        ← 14 tasks (path, deps, DoD, RF, tempo)
│           └── tests.md        ← Unit + Integration + Architecture (ArchUnit)
└── src/                        ← Implementação .NET (próximo passo)
```

---

## Comparativo: wallet vs wallet-novo

| Dimensão | `examples/wallet` | `examples/wallet-novo` |
|----------|------------------|------------------------|
| requirements.md | 5 RFs + 2 CAs simplistas | 7 RFs + 4 RNFs + 2 RCs + 6 CAs Gherkin |
| design.md | 4 linhas genéricas | Domain model DDD + C# code examples + rastreabilidade completa |
| tasks.md | 7 tasks sem path/DoD | 14 tasks com path, deps, DoD, RF, tempo |
| tests.md | Menciona estratégia | Cenários concretos por CA (xUnit + Testcontainers + ArchUnit) |
| Skills usadas | Nenhuma | `/domain-analysis`, `/technical-design-doc-creator`, `/coupling-analysis` |

---

## Como estudar este case

1. **Leia [PLANO.md](PLANO.md)** — explica cada fase com o prompt exato usado
2. **Compare `../wallet/specs/features/transferencia/` com `specs/features/transferencia/`** — veja a diferença concreta
3. **Siga as fases em ordem** para o seu próprio projeto:
   ```
   Fase 0: CLI → node dist/index.js
   Fase 1: requirements.md rico (use como modelo o de transferencia/)
   Fase 2: /domain-analysis → /technical-design-doc-creator
   Fase 3: tasks.md a partir do design.md
   Fase 4: tests.md a partir dos CAs
   Fase 5: /coupling-analysis antes do PR
   ```

---

## Próximo Passo: Implementar `src/`

Com todos os artefatos de spec prontos, o próximo passo é executar as tasks do [tasks.md de transferencia](specs/features/transferencia/tasks.md) em ordem:

```
T-001 → T-002 → T-003 → T-004 → T-005
  → T-006 → T-007 → T-008
    → T-009 → T-010 → T-011 → T-012 → T-013 → T-014
```

Cada task tem o `Path` exato do arquivo a criar, as `Deps`, o `DoD` e o `RF` que implementa.  
Quando `src/` estiver pronto, execute `/coupling-analysis` para validar antes de abrir o PR.

---

**bks-spec-toolkit v1.0.1** | Case criado em 2026-04-09
