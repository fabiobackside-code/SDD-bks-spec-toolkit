# Ferramentas e Ecossistema SDD

> Módulo 00 · Aula 3 · Tempo estimado: 20min

---

## Panorama do Ecossistema

O SDD não depende de uma ferramenta específica. É uma **metodologia** que pode ser aplicada com diferentes ferramentas. Porém, algumas ferramentas são construídas especificamente para SDD.

```
┌─────────────────────────────────────────────────────────┐
│                   Ecossistema SDD                       │
│                                                         │
│  ┌──────────────┐  ┌───────────┐  ┌─────────────────┐   │
│  │  Claude Code │  │   Kiro    │  │   Tessl / Spec  │   │
│  │  (principal) │  │ (AWS IDE) │  │   Kit (GitHub)  │   │
│  └──────────────┘  └───────────┘  └─────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Formato Central: Markdown Estruturado    │   │
│  │   requirements.md · design.md · tasks.md         │   │
│  │   CLAUDE.md · memory-bank/                       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Claude Code (Nossa Ferramenta Principal)

### O que é

Claude Code é o agente de codificação da Anthropic — disponível como CLI, extensão VS Code, JetBrains e aplicativo desktop. É o motor de execução das nossas specs.

### Por que é ideal para SDD

1. **Lê arquivos do projeto automaticamente** — o Claude Code lê o CLAUDE.md e toda a estrutura de pastas antes de agir
2. **Executa tarefas multi-step** — pode seguir um task list complexo sem perder contexto
3. **Tem permissões granulares** — você controla o que ele pode editar, executar e criar
4. **Suporta MCP** — integrações com ferramentas externas via Model Context Protocol

### Comandos fundamentais para SDD

```bash
# Iniciar sessão apontando para a spec
claude "Execute as tasks em spec/tasks.md, seguindo os requisitos em spec/requirements.md"

# Com contexto adicional
claude --add-dir ./memory-bank "Implemente RF-001 conforme requirements.md"

# Modo interativo (para discussão da spec)
claude
> Revisar o design em spec/design.md e identificar pontos ambíguos
```

### O arquivo CLAUDE.md

O `CLAUDE.md` é o **Memory Bank raiz** do projeto. Claude Code o lê automaticamente em toda sessão. É onde você coloca:

```markdown
# CLAUDE.md

## Sobre o Projeto
API de gerenciamento de pedidos — Node.js + TypeScript + PostgreSQL

## Regras Absolutas
- NUNCA alterar arquivos de migração existentes
- SEMPRE usar o padrão Result<T, E> para retornos de use cases
- Testes são obrigatórios para toda feature (jest + supertest)

## Convenções de Código
- Injeção de dependência via Inversify
- Repositórios são interfaces, implementações ficam em /infra
- DTOs usam class-validator, nunca validação manual

## Onde Está o Quê
- Specs das features: /spec/
- Memory bank: /memory-bank/
- Domínio: /src/domain/
- Casos de uso: /src/application/use-cases/
```

---

## Kiro (IDE da AWS)

### O que é

IDE da Amazon com SDD embutido. Menos relevante para nós (não usaremos em produção), mas útil para entender o padrão de workflow.

### Workflow do Kiro

```
Requisitos → Design → Tarefas
    ↓            ↓        ↓
 Histórias    Arquitetura  Checklist
 de Usuário   C4/Fluxo    de Impl.
```

**Formato de Requisitos (EARS — Easy Approach to Requirements Syntax):**
```
QUANDO [condição] O sistema DEVE [ação]
DADO [contexto] QUANDO [evento] ENTÃO [resultado]
```

### Lição aprendida do Kiro

O Kiro usa um formato de "steering" (product.md, structure.md, tech.md) que adotaremos no nosso Memory Bank.

---

## Spec-Kit

### O que é

CLI open source que implementa o workflow SDD via slash commands. Pode ser integrado ao Claude Code e outras ferramentas.

### Workflow do Spec-Kit

```
/spec-constitution → Define princípios globais do projeto
/spec-specify       → Cria a spec para uma feature
/spec-plan          → Quebra a spec em tasks
/spec-tasks         → Lista e rastreia as tasks
```

### O conceito de Constituição

Spec-Kit introduz o conceito de **Constituição** — um arquivo de princípios imutáveis que se aplicam a **todas** as features:

```markdown
# CONSTITUTION.md (exemplo)

## Princípios Arquiteturais Imutáveis
1. Clean Architecture: domain nunca depende de infra
2. Toda feature tem testes antes de ir para produção
3. Nenhum segredo no código — apenas variáveis de ambiente
4. APIs públicas são versionadas (/v1/, /v2/)
```

---

## Tessl

### O que é

Ferramenta mais avançada, aspirando ao nível Spec-as-Source. O código é gerado **a partir da spec** e marcado como não-editável.

### Diferencial

```javascript
// @generate UserService
// @spec user-registration.md
// GENERATED FROM SPEC - DO NOT EDIT
export class UserService {
  // ... código gerado automaticamente
}
```

**Por que não usaremos ainda:** ainda em beta, alto risco para produção. Mas é o futuro do SDD.

---

## Nossa Stack SDD

Para este treinamento, usaremos:

```
┌─────────────────────────────────────────┐
│            Nossa Stack SDD              │
│                                         │
│  CLAUDE.md          ← Contexto global   │
│  memory-bank/       ← Contexto do proj. │
│  spec/              ← Specs das features│
│    ├── requirements.md                  │
│    ├── design.md                        │
│    └── tasks.md                         │
│                                         │
│  Claude Code CLI    ← Motor de execução │
│  VS Code / JetBrains← IDE               │
│  Git                ← Versionamento das │
│                        specs + código   │
└─────────────────────────────────────────┘
```

**Tecnologias do projeto:**
- Node.js + TypeScript (Express / NestJS)
- Spring Boot (para exemplos Java)
- .NET 8 + ASP.NET Core (para exemplos C#)

> **Dica .NET:** no `CLAUDE.md` do seu projeto C#, inclua convenções específicas:
> ```
> - SEMPRE usar record types para DTOs imutáveis
> - SEMPRE usar FluentValidation — nunca DataAnnotations inline
> - Padrão de retorno: OneOf<T, Error> ou FluentResults.Result<T>
> - Migrations: apenas via `dotnet ef migrations add` — nunca editar Migrations/*.cs
> - Testes: xUnit + Testcontainers + WebApplicationFactory (não mocks de DbContext)
> ```
>
> As configurações de permissão do `.claude/settings.json` para .NET estão em
> [01-fundamentos/04-claude-code-setup.md →](../01-fundamentos/04-claude-code-setup.md)

---

## Model Context Protocol (MCP)

O MCP é um protocolo que permite ao Claude Code se conectar a ferramentas externas:

```
Claude Code ←→ MCP ←→ [banco de dados, APIs, ferramentas, filesystem]
```

Para SDD, o MCP pode ser usado para:
- Ler estrutura de banco de dados e gerar specs de modelos
- Consultar código legado para gerar documentação
- Executar testes e reportar resultados de volta à spec

---

## Resumo do Ecossistema

| Ferramenta | Nível SDD | Uso |
|------------|-----------|-----|
| Claude Code | Todos | Motor de execução de specs |
| CLAUDE.md | Spec-Anchored | Memory Bank global |
| Spec-Kit | Spec-First | CLI para criar specs |
| Kiro | Spec-First | IDE com SDD embutido (AWS) |
| Tessl | Spec-as-Source | Geração de código a partir de specs |

---

[Próximo Módulo: Fundamentos →](../01-fundamentos/01-anatomia-de-uma-spec.md)
