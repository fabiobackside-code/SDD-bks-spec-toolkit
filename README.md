# 🎯 SDD Ecosystem — Spec-Driven Development

**Framework profissional para construir projetos com 100% rastreabilidade**

---

## 📁 Estrutura Organizada

```
SDD/
│
├─ toolkit-app/               ⭐ FRAMEWORK + FERRAMENTA
│  ├─ docs/                   📚 Documentação de referência
│  │  ├─ CLAUDE.md            (6 Princípios)
│  │  ├─ CLAUDE-PROJECT.md    (Stack .NET)
│  │  ├─ CLAUDE-ARCHITECT.md  (Padrões agnósticos)
│  │  ├─ CLAUDE-ARCHITECT-NET.md (C# específico)
│  │  ├─ CLAUDE-TDD.md        (Testes 70/20/10)
│  │  ├─ PLAN.md              (5 Fases workflow)
│  │  └─ VERSIONING.md        (Roadmap v1.0→v2.0)
│  │
│  ├─ src/                    🚀 TypeScript source code e CLI
│  ├─ dist/                   (Build compilado)
│  ├─ package.json
│  │
│  ├─ examples/wallet/        💡 Exemplo completo
│  │  ├─ specs/features/      (5 features: abertura, login, saldo, extrato, transferencia)
│  │  ├─ src/
│  │  ├─ tests/
│  │  └─ CONTINUIDADE.md
│  │
│  └─ README.md
│
├─ learning/                  🎓 EDUCAÇÃO CONSOLIDADA
│  ├─ 00-introducao/          (O que é SDD, Vibe Coding vs SDD, Ecossistema)
│  │  ├─ 01-o-que-e-sdd.md
│  │  ├─ 02-vibe-coding-vs-sdd.md
│  │  └─ 03-ferramentas-ecossistema.md
│  │
│  ├─ 01-fundamentos/         (Padrões e conceitos)
│  │  ├─ 01-anatomia-de-uma-spec.md
│  │  ├─ 02-memory-bank.md
│  │  ├─ 03-workflow-sdd.md
│  │  ├─ 04-claude-code-setup.md
│  │  ├─ 05-6-principios.md
│  │  └─ 06-hexagonal.md
│  │
│  ├─ 02-pratica-progressiva/ (Exemplos simples → complexos)
│  │  ├─ 01-exemplo-simples.md
│  │  ├─ 02-exemplo-medio.md
│  │  └─ 03-exemplo-complexo.md
│  │
│  ├─ 03-cases-praticos/      (Exemplos reais com spec completa)
│  │  ├─ case-1-gerador-agentes/
│  │  └─ case-2-analisador-legado/
│  │
│  ├─ 04-templates/           (Templates prontos para uso)
│  │  ├─ CLAUDE.md
│  │  ├─ spec-requirements.md
│  │  ├─ spec-design.md
│  │  ├─ spec-tasks.md
│  │  └─ memory-bank-produto.md
│  │
│  ├─ 05-referencias/         (Links, vídeos, leituras adicionais)
│  │  └─ recursos.md
│  │
│  ├─ 06-toolkit-abordagem/   ⭐ Como usar o BKS Spec Toolkit
│  │  ├─ 01-o-que-e-bks-spec-toolkit.md
│  │  ├─ 02-como-usar-o-toolkit.md
│  │  └─ 03-arquitetura-do-toolkit.md
│  │
│  └─ README.md               (🎓 Roteiro completo — 10-12h)
│
├─ TOOLKIT-CONSTRUCTION-GUIDE.md  📐 Guia de construção do toolkit
│
└─ README.md                  ← Você está aqui
```

---

## 🚀 Como Começar (Escolha um Caminho)

### 📖 **Caminho 1: Aprender SDD (Iniciante)**
```bash
cd learning/
cat README.md                              # Leia o roteiro
cd 00-introducao
cat 01-o-que-e-sdd.md                      # Entenda o conceito
# Continue em 01-fundamentos, 02-pratica-progressiva, etc.
```

**Tempo:** ~10-12 horas para ficar expert

---

### 🛠️ **Caminho 2: Criar Novo Projeto Agora**
```bash
cd toolkit-app
npm install && npm run build
node dist/index.js create                  # Siga os prompts

# Estrutura gerada
cd ./seu-projeto
cat CONTINUIDADE.md
```

**Tempo:** 2 minutos de setup

---

### 💡 **Caminho 3: Estudar Exemplo Completo**
```bash
cd toolkit-app/examples/wallet
cat CONTINUIDADE.md
cat specs/features/abertura/requirements.md    # Primeira feature
# Compare com src/Domain/, tests/
```

**Tempo:** 1 hora para entender o padrão

---

## 📚 Componentes Principais

### **toolkit-app/** (Framework Profissional)

**Para:** Criar novos projetos, consultar referência

**Contém:**
- 7 documentos de referência (CLAUDE*.md)
- CLI TypeScript funcional
- Exemplo Wallet com 5 features
- Templates reutilizáveis (agnóstic + .NET)

**Como usar:**
```bash
cd toolkit-app/
cat docs/CLAUDE.md                         # Referência de princípios
node dist/index.js create                  # Gerar novo projeto
cp -r examples/wallet meu-wallet           # Copiar exemplo
```

---

### **learning/** (Caminho Educacional)

**Para:** Aprender SDD passo-a-passo

**Estrutura:**
- 7 módulos (00-introducao até 06-toolkit-abordagem)
- ~10-12 horas de conteúdo
- 2 cases práticos completos
- Templates prontos para uso

**Como usar:**
```bash
cd learning/
cat README.md                              # Veja a sequência
# Siga 00 → 01 → 02 → 03 → 04 → 05 → 06
```

**Roadmap recomendado:**

| Nível | Caminho | Tempo |
|-------|---------|-------|
| **Iniciante** | 00 → 01 → 02 | 5h30 |
| **Intermediário** | + 03 → 04 | +4h30 |
| **Avançado** | + 05 → 06 + Próprio projeto | +2h |
| **Expert** | Contribuir, ensinar | Contínuo |

---

### **TOOLKIT-CONSTRUCTION-GUIDE.md** (Guia de Construção)

Documentação sobre como o toolkit foi construído, decisões de arquitetura e como estendê-lo.

---

## 🔗 Navegação Rápida

| Preciso... | Vou para... |
|-----------|-----------|
| Entender SDD | `learning/00-introducao/` |
| Aprender padrões e princípios | `learning/01-fundamentos/` |
| Praticar com exemplos | `learning/02-pratica-progressiva/` |
| Ver cases reais | `learning/03-cases-praticos/` |
| Pegar templates prontos | `learning/04-templates/` |
| Entender o toolkit | `learning/06-toolkit-abordagem/` |
| Ver exemplo completo (Wallet) | `toolkit-app/examples/wallet/` |
| Criar novo projeto | `toolkit-app/` |
| Referência completa | `toolkit-app/docs/` |
| Guia de construção | `TOOLKIT-CONSTRUCTION-GUIDE.md` |

---

## ✅ Status Atual

- ✅ Framework completo (toolkit-app)
- ✅ Educação consolidada (learning — 7 módulos)
- ✅ Exemplo completo (Wallet com 5 features)
- ✅ CLI operacional
- ✅ Documentação de referência
- ⏳ Próximo: Git + CI/CD

---

## 🎯 Próximo Passo

### Escolha:

1. **Quer aprender SDD?**
   ```bash
   cd learning/
   cat README.md
   cat 00-introducao/01-o-que-e-sdd.md
   ```

2. **Quer criar projeto agora?**
   ```bash
   cd toolkit-app
   npm install && npm run build
   node dist/index.js create
   ```

3. **Quer estudar exemplo?**
   ```bash
   cd toolkit-app/examples/wallet
   cat CONTINUIDADE.md
   ```

---

**Versão:** 1.1 | **Data:** 2026-04-08
**Status:** ✅ Completo, organizado e pronto para usar

**Bem-vindo ao SDD!** 🎉
