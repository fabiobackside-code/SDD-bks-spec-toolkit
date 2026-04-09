# CONTINUIDADE — wallet-novo

**Gerado por:** bks-spec-toolkit CLI v1.0.1  
**Data de Criação:** 2026-04-09  
**Tech Stack:** .NET 8+ (C#)  
**Descrição:** API de carteira digital — case prático SDD com skills

---

## Setup Completo

O projeto **wallet-novo** foi criado com a seguinte estrutura:

```
wallet-novo/
├── .bks-config.json
├── .gitignore
├── CONTINUIDADE.md           ← Este arquivo
├── PLANO.md                  ← Guia passo a passo do case (leia primeiro!)
├── specs/
│   ├── CLAUDE.md             ← Princípios globais SDD
│   ├── CLAUDE-PROJECT.md     ← Regras deste projeto
│   ├── CLAUDE-TDD.md         ← Estratégia de testes 70/20/10
│   ├── CLAUDE-ARCHITECT.md   ← Padrões agnósticos
│   ├── CLAUDE-ARCHITECT-NET.md ← Padrões .NET específicos
│   ├── PLAN.md               ← Orquestração das 5 fases
│   ├── VERSIONING.md
│   ├── guidelines/           ← Guias aprofundados (DDD, Hexagonal, Performance)
│   ├── templates/            ← Templates reutilizáveis por feature
│   │   ├── requirements-template.md
│   │   ├── design-template.md
│   │   ├── tasks-template.md
│   │   ├── tests-template.md
│   │   └── net/
│   │       ├── design-template-net.md
│   │       ├── tasks-template-net.md
│   │       └── tests-template-net.md
│   └── features/             ← Specs de cada feature (geradas nas próximas fases)
│       ├── abertura/
│       ├── login/
│       ├── saldo/
│       ├── extrato/
│       └── transferencia/
├── src/                      ← Código .NET (gerado nas Tasks)
└── tests/                    ← Testes (gerados na Fase 4)
```

---

## Como prosseguir

**Leia [PLANO.md](PLANO.md) antes de qualquer coisa.** Ele documenta cada fase com prompt exato, resultado esperado e diferença vs `examples/wallet`.

### Ordem das fases

```
Fase 0 ✅  Scaffolding via CLI (este arquivo foi gerado agora)
Fase 1     Requirements ricos — specs/features/<feature>/requirements.md
Fase 2a    /domain-analysis — modelo DDD em design.md
Fase 2b    /technical-design-doc-creator — design.md técnico completo
Fase 3     tasks.md atômicas (derivadas do design.md)
Fase 4     tests.md com cenários concretos por CA
Fase 5     src/ + /coupling-analysis
```

### Checklist de início

- [ ] Leu `PLANO.md`
- [ ] Leu `specs/CLAUDE.md`
- [ ] Leu `specs/PLAN.md`
- [ ] Leu `specs/CLAUDE-ARCHITECT-NET.md`
- [ ] Pronto para Fase 1: requirements de `transferencia`

---

**Bom desenvolvimento! Siga a spec, escreva testes, rastreie tudo.**
