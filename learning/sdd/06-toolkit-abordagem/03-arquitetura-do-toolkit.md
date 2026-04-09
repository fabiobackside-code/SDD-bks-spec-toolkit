# Arquitetura do BKS Spec Toolkit

## Estrutura Completa

```
bks-spec-toolkit-novo/
├── docs/              ← 7 documentos corporativos
├── cli/               ← TypeScript CLI
├── templates/         ← 7 templates prontos
├── examples/wallet/   ← Projeto exemplo completo
├── projects/          ← Saída do CLI
└── README.md
```

## 1. Documentação (docs/)

7 arquivos que definem como desenvolver:

- CLAUDE.md — Introdução ao SDD
- CLAUDE-PROJECT.md — Stack e infraestrutura
- CLAUDE-ARCHITECT.md — Padrões agnósticos
- CLAUDE-ARCHITECT-NET.md — Padrões .NET
- CLAUDE-TDD.md — Estratégia de testes
- PLAN.md — Workflow em 5 fases
- VERSIONING.md — Roadmap de evolução

## 2. CLI (cli/)

Automatiza criação de projetos:

```bash
npm run build
node dist/index.js create
→ Projeto pronto em 2 minutos
```

## 3. Templates (templates/)

4 templates agnósticos + 3 .NET:

- spec-requirements.md
- spec-design.md
- spec-tasks.md
- spec-tests.md
- .NET/* (versões com exemplos C#)

## 4. Wallet (examples/wallet/)

Projeto exemplo com 5 features mostrando progressão.

## Como Começar

1. Leia docs/CLAUDE.md
2. Estude examples/wallet/
3. Rode CLI create
4. Comece specs em seu projeto
