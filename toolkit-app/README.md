# bks-spec-toolkit CLI v1.0.1

CLI para criação de projetos **Spec-Driven Development (SDD)** com estrutura completa e pronta para uso.

**Versão:** 1.0.1 | **Status:** Funcional | **Stack suportada:** .NET 8+

---

## Quick Start

```bash
# 1. Instalar dependências e compilar
npm install && npm run build

# 2. Executar
node dist/index.js

# 3. Responder as perguntas interativas
? Nome do projeto: meu-projeto
? Descrição: API de gerenciamento de pedidos
? Tech Stack: .NET 8+ (C#)
? Onde criar?: ./meu-projeto
? Confirma?: Y

# Projeto gerado em ./meu-projeto/ com 28+ arquivos
```

---

## Estrutura do Repositório

```
toolkit-app/
├── src/                        Código-fonte TypeScript
│   ├── index.ts                Entry point (Commander CLI)
│   ├── cli.ts                  Orquestração principal
│   ├── prompts.ts              Perguntas interativas (inquirer)
│   ├── types/project.ts        Interfaces TypeScript
│   ├── generators/
│   │   ├── projectGenerator.ts Orquestrador da geração
│   │   ├── fileGenerator.ts    Cópia de docs/ e templates/
│   │   └── configGenerator.ts  Gera .bks-config.json
│   ├── utils/
│   │   ├── pathUtils.ts        Resolução de caminhos (aponta para docs/)
│   │   ├── fileUtils.ts        Operações de arquivo (fs-extra)
│   │   └── validation.ts       Validação de inputs e paths
│   └── templates/
│       └── continuity.ejs      Template EJS para CONTINUIDADE.md
├── docs/                       Fonte dos arquivos copiados para projetos gerados
│   ├── CLAUDE.md               6 Princípios SDD
│   ├── CLAUDE-PROJECT.md       Stack .NET 8+: libs, padrões, checklist
│   ├── CLAUDE-TDD.md           Estratégia de testes 70/20/10
│   ├── CLAUDE-ARCHITECT.md     Arquitetura Hexagonal + DDD (agnóstico)
│   ├── CLAUDE-ARCHITECT-NET.md Implementações .NET com exemplos C#
│   ├── PLAN.md                 Workflow SDD em 5 fases
│   ├── VERSIONING.md           Roadmap e changelog
│   ├── guidelines/             Guias aprofundados de aplicação
│   │   ├── Aplicando-DDD-GUIDELINES.md
│   │   ├── Arquitetura-Hexagonal-GUIDELINES.md
│   │   ├── Boas-Praticas-PerformanceDotNet-GUIDELINES.md
│   │   └── Identificando-Contextos-Delimitados-GUIDELINES.md
│   └── templates/              Templates de especificação reutilizáveis
│       ├── agnostic/           Templates agnósticos de stack
│       │   ├── requirements-template.md
│       │   ├── design-template.md
│       │   ├── tasks-template.md
│       │   └── tests-template.md
│       └── net/                Templates específicos .NET
│           ├── design-template-net.md
│           ├── tasks-template-net.md
│           └── tests-template-net.md
├── dist/                       JavaScript compilado (gerado por npm run build)
├── examples/                   Exemplos inteiros estruturados com SDD (ex: Wallet)
├── skills/                     Skills para automações interativas no cursor/claude
├── .claude/                    Configurações locais para os skills e agentes
├── README.md                   Este arquivo
├── INSTALLATION-GUIDE.md       Guia detalhado de instalação
├── package.json
└── tsconfig.json
```

---

## O que a CLI Gera

Ao criar um projeto `.NET 8+`, a CLI produz:

```
meu-projeto/
├── .bks-config.json            Metadados: nome, stack, versão do toolkit
├── .gitignore                  Padrão para .NET + Node.js
├── CONTINUIDADE.md             Guia de próximos passos gerado via EJS
├── specs/
│   ├── CLAUDE.md               6 Princípios SDD
│   ├── CLAUDE-PROJECT.md       Stack .NET 8+
│   ├── CLAUDE-TDD.md           Estratégia de testes
│   ├── CLAUDE-ARCHITECT.md     Arquitetura Hexagonal + DDD (agnóstico)
│   ├── CLAUDE-ARCHITECT-NET.md Implementações .NET com exemplos C#
│   ├── PLAN.md                 Workflow das 5 fases
│   ├── VERSIONING.md           Roadmap
│   ├── guidelines/             4 guias de aplicação (ver seção abaixo)
│   │   ├── Aplicando-DDD-GUIDELINES.md
│   │   ├── Arquitetura-Hexagonal-GUIDELINES.md
│   │   ├── Boas-Praticas-PerformanceDotNet-GUIDELINES.md
│   │   └── Identificando-Contextos-Delimitados-GUIDELINES.md
│   ├── templates/              Templates para especificação de features
│   │   ├── requirements-template.md
│   │   ├── design-template.md
│   │   ├── tasks-template.md
│   │   ├── tests-template.md
│   │   └── net/
│   │       ├── design-template-net.md
│   │       ├── tasks-template-net.md
│   │       └── tests-template-net.md
│   └── features/               Features do projeto (uma pasta por feature)
│       └── .gitkeep
├── src/
│   └── .gitkeep                Código-fonte do projeto
└── tests/
    └── .gitkeep                Testes do projeto
```

---

## Documentação em docs/

### Arquivos de Constituição (CLAUDE*)

| Arquivo | Propósito | Quando usar |
|---------|-----------|-------------|
| [docs/CLAUDE.md](docs/CLAUDE.md) | 6 princípios SDD: especificação precisa, rastreabilidade, testes como contrato, padrões obrigatórios, DoD, stack-agnostic | Referência constante — são as regras inegociáveis do projeto |
| [docs/CLAUDE-PROJECT.md](docs/CLAUDE-PROJECT.md) | Stack .NET 8+: libs mandatórias (Dapper, xUnit, Testcontainers, ArchUnit), padrões, checklist de novo projeto | Ao configurar um novo projeto .NET ou integrar bibliotecas |
| [docs/CLAUDE-TDD.md](docs/CLAUDE-TDD.md) | Estratégia de testes 70/20/10: unit (xUnit+Moq), integration (Testcontainers), architecture (ArchUnit) | Ao definir a suite de testes de uma feature |
| [docs/CLAUDE-ARCHITECT.md](docs/CLAUDE-ARCHITECT.md) | Arquitetura Hexagonal + DDD agnóstica: Ports & Adapters, Aggregates, Value Objects, Pipeline, Repository | Ao fazer design de uma feature independente de stack |
| [docs/CLAUDE-ARCHITECT-NET.md](docs/CLAUDE-ARCHITECT-NET.md) | Implementações .NET: exemplos C# de Aggregate Root, Port, Adapter PostgreSQL, Pipeline, DI | Ao implementar os padrões em código .NET |

### Workflow

| Arquivo | Propósito |
|---------|-----------|
| [docs/PLAN.md](docs/PLAN.md) | Workflow SDD em 5 fases (Requirements → Design → Tasks → Tests → Integration) com DoD por fase |
| [docs/VERSIONING.md](docs/VERSIONING.md) | Roadmap, changelog, semver, matriz de compatibilidade |

---

## Guidelines — Como e Onde Aplicar

Os guidelines em [docs/guidelines/](docs/guidelines/) são manuais táticos aprofundados. Cada um complementa os arquivos CLAUDE* com exemplos, checklists e anti-padrões detalhados. No projeto gerado, ficam em `specs/guidelines/`.

### [Aplicando-DDD-GUIDELINES.md](docs/guidelines/Aplicando-DDD-GUIDELINES.md)

**O que cobre:** Os 8 blocos táticos DDD — Entities, Value Objects, Aggregates, Domain Events, Domain Services, Repositories, Factories, Application Services. Para cada bloco: definição, regras, padrão de implementação e anti-padrões.

**Onde aplicar no projeto:**
- **Fase Design** (`specs/features/<feature>/design.md`): Identificar quais Aggregates, Entities e Value Objects compõem a feature
- **Fase Tasks** (`specs/features/<feature>/tasks.md`): Criar tasks específicas por bloco (ex: T-001 Aggregate Root, T-002 Value Objects)
- **Código** (`src/Domain/`): Referência durante implementação para não criar modelos anêmicos

**Quando consultar:** Ao projetar o modelo de domínio de uma nova feature ou revisar se o domínio está rico (não anêmico).

---

### [Arquitetura-Hexagonal-GUIDELINES.md](docs/guidelines/Arquitetura-Hexagonal-GUIDELINES.md)

**O que cobre:** Modelo original de Alistair Cockburn — não a versão genérica. Distinção entre Portas Primárias/Secundárias e Adaptadores Primários/Secundários. Regras de dependência, estrutura de pastas, integração com CLAUDE-ARCHITECT.md.

**Onde aplicar no projeto:**
- **Fase Design**: Mapear quais Ports (interfaces) e Adapters (implementações) a feature precisa
- **Estrutura de pastas** (`src/`): `src/Domain/Ports/` (contratos), `src/Adapters/` (implementações)
- **Revisão de PR**: Verificar se Domain nunca referencia Adapters (checklist do guideline)

**Quando consultar:** Ao criar uma nova feature que interage com banco de dados, mensageria ou serviços externos — para definir os Ports corretos.

---

### [Boas-Praticas-PerformanceDotNet-GUIDELINES.md](docs/guidelines/Boas-Praticas-PerformanceDotNet-GUIDELINES.md)

**O que cobre:** 9 seções de otimização .NET com exemplos ✅/❌: `Span<T>`/`Memory<T>`, `ArrayPool`/`ObjectPool`, Struct vs Class, String handling, Collections/LINQ, Async/ValueTask, evitar alocações, ferramentas de medição (BenchmarkDotNet, dotnet-counters), padrões ASP.NET Core.

**Onde aplicar no projeto:**
- **Fase Tasks**: Adicionar task de benchmark/profiling se a feature tiver requisito de performance (RNF)
- **Fase Tests**: Incluir benchmark nos testes de arquitetura para RNFs críticos
- **Code Review**: Usar o checklist de performance do guideline como critério de PR

**Quando consultar:** Em RNFs que especificam latência ou throughput, e durante otimização de hotpaths identificados via profiling.

---

### [Identificando-Contextos-Delimitados-GUIDELINES.md](docs/guidelines/Identificando-Contextos-Delimitados-GUIDELINES.md)

**O que cobre:** 5 fases para descoberta de Bounded Contexts — Event Storming, critérios de identificação, nomenclatura, Context Map, comunicação entre contextos. Inclui os 6 padrões de relacionamento (Shared Kernel, ACL, Open Host Service, etc.) e classificação de subdomínios (Core/Supporting/Generic).

**Onde aplicar no projeto:**
- **Antes da Fase Requirements**: Event Storming para mapear o domínio antes de escrever os primeiros RFs
- **Fase Design**: Context Map para visualizar as fronteiras e integrações entre bounded contexts
- **Arquitetura de múltiplos serviços**: Decidir se duas features devem ser serviços separados ou um monolito

**Quando consultar:** No início de um projeto novo ou ao adicionar uma capacidade que pode ser um novo bounded context.

---

## Skills — Automações do Workflow SDD

Skills Claude Code que automatizam etapas do workflow SDD. Cada skill é ancorada nos guidelines e fases do [docs/PLAN.md](docs/PLAN.md). O mapa completo está em [docs/SKILLS.md](docs/SKILLS.md).

| Skill | Fase | Quando usar |
|-------|------|-------------|
| [`domain-analysis`](skills/domain-analysis/SKILL.md) | 1 (Requirements) + 2 (Design) | Identificar Aggregates, Value Objects e Bounded Contexts a partir de `requirements.md` |
| [`technical-design-doc-creator`](skills/technical-design-doc-creator/SKILL.md) | 2 (Design) | Gerar `design.md` completo usando os templates .NET |
| [`coupling-analysis`](skills/coupling-analysis/SKILL.md) | 5 (Integration) | Detectar violações de Hexagonal Architecture antes do PR |
| [`gh-address-comments`](skills/gh-address-comments/SKILL.md) | 5 (Integration) | Resolver comentários de review respeitando o DoD SDD |

### Fluxo de Uso

```
Fase 1 → /domain-analysis              # identifica modelo de domínio
Fase 2 → /technical-design-doc-creator  # gera design.md
Fase 5 → /coupling-analysis             # valida arquitetura antes do PR
Fase 5 → /gh-address-comments           # resolve review comments
```

### Instalação

```bash
# Copiar cada skill para o diretório do Claude Code
mkdir -p ~/.claude/skills/coupling-analysis
cp skills/coupling-analysis/SKILL.md ~/.claude/skills/coupling-analysis/
# Repetir para domain-analysis, technical-design-doc-creator, gh-address-comments
```

Consulte [docs/SKILLS.md](docs/SKILLS.md) para detalhes de alinhamento com guidelines e exemplos de uso.

---

## Templates — Como Usar

Os templates em [docs/templates/](docs/templates/) são a base para especificar cada feature. No projeto gerado, ficam em `specs/templates/`.

### Fluxo por Feature

```
specs/features/
└── minha-feature/
    ├── requirements.md   ← Copie de specs/templates/requirements-template.md
    ├── design.md         ← Copie de specs/templates/net/design-template-net.md
    ├── tasks.md          ← Copie de specs/templates/net/tasks-template-net.md
    └── tests.md          ← Copie de specs/templates/net/tests-template-net.md
```

### Templates Agnósticos ([docs/templates/agnostic/](docs/templates/agnostic/))

| Template | Conteúdo | Quando usar |
|----------|----------|-------------|
| [requirements-template.md](docs/templates/agnostic/requirements-template.md) | RF, RNF, RC, CA em formato Gherkin | Toda nova feature — é o ponto de partida obrigatório |
| [design-template.md](docs/templates/agnostic/design-template.md) | Aggregates, Value Objects, Ports, Adapters, fluxo | Fase Design de qualquer stack |
| [tasks-template.md](docs/templates/agnostic/tasks-template.md) | Tasks atômicas T-001..N com dependências e DoD | Fase Tasks de qualquer stack |
| [tests-template.md](docs/templates/agnostic/tests-template.md) | Cenários de teste por nível (unit/integration/arch) | Fase Tests de qualquer stack |

### Templates .NET ([docs/templates/net/](docs/templates/net/))

| Template | Conteúdo adicional ao agnóstico |
|----------|--------------------------------|
| [design-template-net.md](docs/templates/net/design-template-net.md) | Namespaces C#, hierarquia de classes, exemplos de Aggregate em C# |
| [tasks-template-net.md](docs/templates/net/tasks-template-net.md) | Tasks com referências a xUnit, Dapper, EF Core, Testcontainers |
| [tests-template-net.md](docs/templates/net/tests-template-net.md) | Exemplos xUnit + Moq + Testcontainers + ArchUnit prontos para preencher |

**Regra:** Use sempre o template `.net/` sobre o agnóstico em projetos .NET — ele já inclui as especificidades de C# e economiza tempo.

---

## Scripts

```bash
npm run build         # Compilar TypeScript → dist/ + copiar .ejs
npm run dev           # Executar com ts-node (sem compilar)
npm run clean         # Remover dist/
npm run copy-assets   # Copiar arquivos .ejs para dist/templates/
npm start             # Executar versão compilada
```

---

## Troubleshooting

**"Pasta docs/ não encontrada"**
→ O CLI busca `docs/` dentro do próprio `toolkit-app/`. Verifique:
```bash
ls docs/CLAUDE.md docs/PLAN.md
```

**"Arquivo obrigatório não encontrado: CLAUDE.md"**
→ A pasta `docs/` existe mas está incompleta. Os arquivos `CLAUDE.md` e `PLAN.md` são obrigatórios.

**"O diretório já existe"**
→ O CLI não sobrescreve projetos existentes. Escolha um nome ou caminho diferente.

**Erro de compilação TypeScript**
→ Verifique `node --version` (requer 18+) e `npm run clean && npm run build`.

---

## Dependências

| Lib | Versão | Uso |
|-----|--------|-----|
| commander | ^12.1.0 | Parsing de argumentos CLI |
| inquirer | ^10.1.0 | Prompts interativos |
| chalk | ^5.3.0 | Cores no terminal |
| fs-extra | ^11.2.0 | Operações de arquivo avançadas |
| ejs | ^3.1.10 | Renderização de CONTINUIDADE.md |
| typescript | ^5.5.0 | Compilador |

---

**Versão:** 1.0.1 | **Mantido por:** Fabio | **Instalação detalhada:** [INSTALLATION-GUIDE.md](INSTALLATION-GUIDE.md)
