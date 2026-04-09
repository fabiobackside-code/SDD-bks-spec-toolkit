# O que é BKS Spec Toolkit

> **Diferença crítica:** SDD é uma *metodologia* (como pensar). BKS Spec Toolkit é a *operacionalização* dessa metodologia (como fazer).

---

## A Realização

Você estudou SDD: como estruturar requisitos, desenhar com padrões, decompor em tarefas, testar antes de código. Tudo lógico e coerente.

Mas quando você senta na frente de um **novo projeto**, você se pergunta:

- **"Por onde começo?"** → Qual arquivo crio primeiro?
- **"Qual é a estrutura de pastas?"** → Como organizo requirements, designs, tasks?
- **"Que templates uso?"** → Posso copiar do projeto anterior?
- **"Como configuro o CLI?"** → Que ferramentas preciso?

**BKS Spec Toolkit responde tudo isso.**

---

## O Toolkit é Três Coisas

### 1. 📚 **Documentação Corporativa**
```
docs/
├── CLAUDE.md                    ← O que é SDD (para novos no time)
├── CLAUDE-PROJECT.md            ← Stack: .NET 8, PostgreSQL, etc
├── CLAUDE-ARCHITECT.md          ← Padrões agnósticos
├── CLAUDE-ARCHITECT-NET.md      ← Padrões específicos .NET
├── CLAUDE-TDD.md                ← Estratégia de testes 70/20/10
├── PLAN.md                      ← Workflow em 5 fases
└── VERSIONING.md                ← Roadmap e evolução
```

**Para quê?** Quando um dev novo chega, ele lê esses 7 docs e **entende toda a abordagem**. Não é "faça como você acha melhor", é "faça assim".

---

### 2. 🎯 **Templates Prontos**
```
templates/
├── spec-requirements.md         ← Template de requisitos
├── spec-design.md               ← Template de design
├── spec-tasks.md                ← Template de tasks
├── spec-tests.md                ← Template de testes
├── .NET/requirements.net.md     ← Com exemplos C#
├── .NET/design.net.md
└── .NET/tasks.net.md
```

**Para quê?** Você não pensa "como estruturo um requirements?" — **copia o template, preenche, pronto**.

---

### 3. 🛠️ **CLI para Scaffolding**
```bash
$ bks-spec-toolkit create
? Nome do projeto: wallet
? Stack: .NET + PostgreSQL
? Features: abertura, login, saldo, extrato, transferencia

✅ Projeto criado em /projects/wallet/
   ├── CLAUDE.md
   ├── spec/
   ├── src/
   └── tests/
```

**Para quê?** Um dev novo cria seu primeiro projeto em 2 minutos, não em 2 dias estruturando pastas.

---

## Quando Usar

### ✅ Use BKS Spec Toolkit se:
- [ ] Está iniciando um **novo projeto**
- [ ] Quer **onboarding rápido** de novos devs
- [ ] Precisa de **consistência** entre projetos
- [ ] Quer migrar um **projeto legado** para SDD

### ⚠️ Não é obrigatório se:
- [ ] Você já tem uma estrutura que funciona
- [ ] Seu time está 100% alinhado sem toolkit
- [ ] Você só quer os **docs** (pode copiar `docs/` apenas)

---

## Exemplo Prático: Projeto Wallet

O Wallet é **um projeto exemplo completo** criado com BKS Spec Toolkit:

```
examples/wallet/
├── CLAUDE.md
├── memory-bank/
│   ├── product.md       ← O que é um wallet
│   ├── structure.md     ← Arquitetura do projeto
│   └── tech.md          ← Stack e tecnologias
│
├── spec/features/
│   ├── abertura/
│   │   ├── requirements.md
│   │   ├── design.md
│   │   └── tasks.md
│   ├── login/
│   ├── saldo/
│   ├── extrato/
│   └── transferencia/
│
└── src/
    ├── Core/           ← Domínio (agnóstico)
    ├── Infrastructure/ ← PostgreSQL, APIs
    └── Application/    ← Casos de uso
```

**Por que 5 features?** Porque mostra:
1. **Simples** (saldo = ler DB)
2. **Médio** (login = autenticação)
3. **Complexo** (transferência = saga distribuída)

---

## Arquitetura do Toolkit

```
bks-spec-toolkit/
├── docs/                    ← 7 documentos corporativos
├── cli/                     ← TypeScript CLI
│   ├── src/
│   └── dist/                ← Build compilado, pronto para npm
├── templates/               ← 7 templates
├── examples/wallet/         ← Projeto exemplo
├── projects/                ← CLI gera projetos aqui
└── README.md
```

**Cada peça tem um propósito:**
- Docs → **Entendimento**
- Templates → **Reutilização**
- CLI → **Automação**
- Wallet → **Aprendizado**

---

## Como Começar

### Passo 1: Entender o Toolkit
```bash
cd bks-spec-toolkit-novo/
cat README.md
cat docs/CLAUDE.md          # Leia primeiro
cat docs/CLAUDE-ARCHITECT.md  # Depois os padrões
```

### Passo 2: Estudar o Exemplo
```bash
cat examples/wallet/CLAUDE.md
cat examples/wallet/spec/features/abertura/requirements.md
```

### Passo 3: Usar o CLI
```bash
cd cli
npm install && npm run build
node dist/index.js create  # Cria seu primeiro projeto
```

### Passo 4: Customizar
Copie os templates para seu projeto e adapte conforme sua stack.

---

## Próximo Passo

→ Leia [02-arquitetura-do-toolkit.md](./02-arquitetura-do-toolkit.md)

