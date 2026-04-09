# Guia de Instalação — bks-spec-toolkit CLI

**Versão:** 1.0.0 | **Runtime:** Node.js 18+

---

## 📋 Pré-requisitos

| Requisito | Versão | Verificar |
|-----------|--------|-----------|
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **bks-spec-toolkit** | 1.1+ | Deve estar em `../bks-spec-toolkit` |

---

## 📁 Estrutura Esperada

A CLI **depende** do bks-spec-toolkit estar na pasta irmã:

```
SDD/
├── bks-spec-toolkit/         ← Deve existir aqui
│   ├── CLAUDE.md
│   ├── PLAN.md
│   └── templates/
│
└── toolkit-app/              ← CLI (esta pasta)
    ├── src/
    ├── dist/
    └── package.json
```

---

## 🚀 Instalação

### Opção A: Uso Local (Recomendado)

```bash
# 1. Entre na pasta toolkit-app
cd toolkit-app

# 2. Instale as dependências
npm install

# 3. Compile
npm run build

# 4. Execute diretamente
node dist/index.js
```

### Opção B: Comando Global (npm link)

```bash
# 1. Entre na pasta toolkit-app
cd toolkit-app

# 2. Instale as dependências e compile
npm install && npm run build

# 3. Instale globalmente
npm link

# 4. Agora disponível em qualquer lugar
bks-create
```

### Verificar Instalação

```bash
node dist/index.js --version
# Esperado: 1.0.0

node dist/index.js --help
# Esperado: Usage: bks-create [options] [command]
```

---

## 💻 Uso

### Criar Novo Projeto

```bash
# Usando diretamente
node dist/index.js

# Usando npm link (global)
bks-create
```

**A CLI irá perguntar:**
```
? Nome do projeto: meu-projeto
? Descrição do projeto (opcional): Sistema de pagamentos
? Tech Stack: .NET 8+ (C#)
? Onde criar o projeto? ./meu-projeto
? Confirma a criação? (Y/n)
```

**Output esperado:**
```
✅ Projeto criado com sucesso!

📁 Local:    /caminho/para/meu-projeto
📦 Projeto:  meu-projeto
🛠️  Stack:    NET
📄 Arquivos: 24 criados

📚 Próximos Passos:
  1. cd /caminho/para/meu-projeto
  2. cat CONTINUIDADE.md   ← Leia primeiro!
  3. cat specs/CLAUDE.md   ← Princípios SDD
  4. cat specs/PLAN.md     ← As 5 fases
  5. mkdir specs/features/[nome-feature]
  6. Preencha requirements.md da feature
```

---

## 📁 Projeto Gerado

A CLI cria a seguinte estrutura:

```
meu-projeto/
├── .bks-config.json              ← Metadados do projeto
├── .gitignore                    ← Exclusões do git
├── CONTINUIDADE.md               ← Guia de próximos passos
├── specs/
│   ├── CLAUDE.md                 ← Princípios globais SDD
│   ├── CLAUDE-PROJECT.md         ← Regras do projeto (personalizar!)
│   ├── CLAUDE-TDD.md             ← Estratégia de testes
│   ├── CLAUDE-ARCHITECT.md       ← Padrões agnósticos
│   ├── CLAUDE-ARCHITECT-NET.md   ← Padrões .NET (se .NET escolhido)
│   ├── PLAN.md                   ← As 5 fases SDD
│   ├── README.md                 ← Guia do toolkit
│   ├── VERSIONING.md             ← Histórico
│   ├── templates/
│   │   ├── requirements-template.md
│   │   ├── design-template.md
│   │   ├── tasks-template.md
│   │   ├── tests-template.md
│   │   └── net/                  ← (se .NET)
│   │       ├── design-template-net.md
│   │       ├── tasks-template-net.md
│   │       └── tests-template-net.md
│   └── features/                 ← Suas specs aqui!
│       └── (vazio)
├── src/                          ← Seu código aqui
└── tests/                        ← Seus testes aqui
```

---

## 🔄 Atualizar CLI

```bash
# Atualizar dependências
npm update

# Recompilar
npm run build
```

---

## 🐛 Troubleshooting

### Erro: "bks-spec-toolkit não encontrado"

**Causa:** CLI espera bks-spec-toolkit em `../bks-spec-toolkit`

**Solução:**
```bash
# Verificar estrutura
ls ../bks-spec-toolkit/CLAUDE.md  # Deve existir
```

### Erro: "O diretório já existe"

**Causa:** Pasta do projeto já existe no caminho informado

**Solução:** Escolha um nome/caminho diferente

### Erro de compilação TypeScript

```bash
# Limpar e recompilar
npm run clean && npm run build
```

---

## ✅ Verificação Completa

```bash
# 1. Versão OK?
node dist/index.js --version   # → 1.0.0

# 2. Toolkit encontrado?
node -e "const p=require('./dist/utils/pathUtils.js');console.log(p.resolveToolkitPath())"

# 3. Teste de geração?
node -e "
const {generateProject}=require('./dist/generators/projectGenerator.js');
generateProject({
  projectName:'test',techStack:'net',
  outputPath:'/tmp/test-gen',description:'',
  toolkitPath:'../bks-spec-toolkit',
  createdAt:'2026-04-08',version:'1.0.0'
}).then(r=>console.log('OK:',r.success,r.filesCreated.length,'files'))
"
```

---

**Versão:** 1.0.0 | **Node.js:** 18+ | **npm:** 9+
