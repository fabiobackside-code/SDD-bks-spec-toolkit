# Como Usar o BKS Spec Toolkit

---

## Cenário 1: Novo Projeto do Zero

### Seu contexto:
- Você vai iniciar um **projeto novo**
- Quer começar com SDD desde o dia 1
- Precisa estruturar documentação, specs e templates

### Passo a passo:

**1. Use o CLI para gerar scaffolding**
```bash
cd bks-spec-toolkit-novo/cli
npm install && npm run build
node dist/index.js create

# Responda as perguntas:
# ? Nome do projeto: meu-app
# ? Stack: .NET + PostgreSQL
# ? Features: auth, api, worker
```

**2. Copie os docs**
```bash
cp -r bks-spec-toolkit-novo/docs/* seu-projeto/docs/
# Customize:
# - CLAUDE-PROJECT.md (ajuste para sua stack real)
# - VERSIONING.md (defina suas versões)
```

**3. Copie e customize templates**
```bash
cp bks-spec-toolkit-novo/templates/spec-*.md seu-projeto/templates/
cp bks-spec-toolkit-novo/templates/.NET/* seu-projeto/templates/.net/
# Ajuste para sua convenção de nomes
```

**4. Crie seu memory-bank/**
```bash
mkdir seu-projeto/memory-bank/
# Copie do example Wallet se precisar de inspiração
cp bks-spec-toolkit-novo/examples/wallet/memory-bank/* seu-projeto/memory-bank/
```

**5. Comece as primeiras features**
```bash
mkdir seu-projeto/spec/features/auth
cp seu-projeto/templates/spec-requirements.md seu-projeto/spec/features/auth/requirements.md
# Preencha segundo o template
```

---

## Cenário 2: Projeto Existente (Migração)

### Seu contexto:
- Você tem um projeto **legado**
- Quer **migrar para SDD** progressivamente
- Não quer reescrever tudo de uma vez

### Estratégia:

**1. Copie apenas os docs** (não é tudo-ou-nada)
```bash
cp bks-spec-toolkit-novo/docs/* seu-projeto-legado/
# Customize CLAUDE.md mencionando que é migração progressiva
```

**2. Escolha 1-2 features para começar**
```bash
# Em vez de especificar TODO o projeto, escolha:
# - 1 feature NOVA que precisa ser implementada
# - 1 feature existente que será refatorada

mkdir seu-projeto-legado/spec/features/nova-feature-x
# Inicie specs aqui
```

**3. Mantenha o código legado intacto**
```bash
src/
├── legacy/          ← Código antigo (não muda por enquanto)
├── new-feature-x/   ← Novo código via SDD
└── ...
```

**4. Gradualmente migre outros módulos**
```bash
# Mês 1: Nova feature
# Mês 2: Refatora módulo A com SDD
# Mês 3: Refatora módulo B com SDD
```

---

## Cenário 3: Equipe (Onboarding + Padronização)

### Seu contexto:
- Você tem uma **equipe nova**
- Quer que **todos usem a mesma abordagem**
- Precisa de padrões **não-negociáveis**

### Passo a passo:

**1. Compartilhe o learning/** (este material)
```bash
# Todos leem em ordem:
# - learning/00-introducao/   (1h)
# - learning/01-fundamentos/  (2h)
# - learning/06-toolkit-abordagem/ (30min - NOVO!)
```

**2. Use o CLI para **todos os projetos**
```bash
# Regra: Ninguém cria projeto manualmente
# Todos usam:
bks-spec-toolkit create
```

**3. Customize CLAUDE.md uma vez, replique**
```bash
# Você customiza:
bks-spec-toolkit-novo/docs/CLAUDE.md

# Todos copiam:
novo-projeto-1/docs/CLAUDE.md
novo-projeto-2/docs/CLAUDE.md
novo-projeto-3/docs/CLAUDE.md
```

**4. Templates corporativos no docusaurus/wiki**
```bash
# Centralize templates em:
# https://seu-wiki.com/templates/
# Todos usam como referência
```

---

## Integração com seu Workflow

```
Seu Projeto Atual
    ↓
├── CLAUDE.md (leia primeiro)
├── memory-bank/
│   ├── product.md
│   ├── structure.md
│   └── tech.md
├── spec/
│   ├── features/
│   │   └── nova-feature-x/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── tasks.md
│   └── non-functional/
│       ├── performance.md
│       └── security.md
├── src/
│   └── ...
└── tests/
    └── ...
```

**Fluxo para cada feature:**

1. Crie pasta em `spec/features/`
2. Preencha `requirements.md` (do template)
3. Preencha `design.md` (com padrões)
4. Preencha `tasks.md` (decomposição)
5. Crie testes (antes do código!)
6. Implemente (com Claude Code)
7. Commit specs + código juntos

---

## Checklist de Implementação

- [ ] Instalei `bks-spec-toolkit-novo`
- [ ] Li `docs/CLAUDE.md`
- [ ] Estudei exemplo em `examples/wallet/`
- [ ] Rodei CLI: `npm run build && node dist/index.js create`
- [ ] Criei pasta para novo projeto
- [ ] Copiei templates
- [ ] Criei `memory-bank/`
- [ ] Primeira feature especificada
- [ ] Testes escritos
- [ ] Código implementado
- [ ] Commit com specs + código

---

## Próximo Passo

→ Leia [03-quando-usar-toolkit.md](./03-quando-usar-toolkit.md)

