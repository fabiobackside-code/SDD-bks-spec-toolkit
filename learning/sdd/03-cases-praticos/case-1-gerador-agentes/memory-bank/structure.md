# structure.md — Estrutura do Projeto

## Estrutura de Pastas

```
agent-generator/
├── src/
│   ├── cli/
│   │   └── index.ts              ← Entry point CLI (Commander.js)
│   │
│   ├── builder/
│   │   ├── agent-builder.ts      ← Gera AgentConfig a partir de AgentInput
│   │   ├── prompt-generator.ts   ← Gera system prompt via Claude API
│   │   └── tool-generator.ts     ← Gera definições de ferramentas
│   │
│   ├── runner/
│   │   ├── agent-runner.ts       ← Executa o agente (loop de mensagens)
│   │   ├── tool-executor.ts      ← Executa as ferramentas do agente
│   │   └── conversation.ts       ← Gerencia histórico de conversa
│   │
│   ├── tools/                    ← Ferramentas built-in disponíveis
│   │   ├── web-search.tool.ts
│   │   ├── calculator.tool.ts
│   │   └── text-formatter.tool.ts
│   │
│   ├── config/
│   │   └── env.ts                ← Validação e carregamento de .env via Zod
│   │
│   └── types/
│       └── index.ts              ← Tipos compartilhados (AgentConfig, AgentInput, etc.)
│
├── test/
│   ├── unit/
│   │   ├── builder/
│   │   │   └── agent-builder.spec.ts
│   │   └── runner/
│   │       └── agent-runner.spec.ts
│   └── fixtures/
│       ├── agent-input.fixture.ts
│       └── agent-config.fixture.ts
│
├── spec/                         ← Specs SDD
├── memory-bank/                  ← Memory bank do projeto
├── CLAUDE.md
├── package.json
├── tsconfig.json
└── .env.example
```

## Responsabilidades por Camada

### CLI (src/cli/)
- Parseia argumentos do terminal
- Valida entrada com Zod
- Exibe feedback visual (spinner, cores)
- Delega para Builder

### Builder (src/builder/)
- Recebe AgentInput (contexto, tarefas, restrições, formato)
- Chama Claude API para gerar system prompt otimizado
- Seleciona e configura ferramentas adequadas
- Retorna AgentConfig pronto para uso

### Runner (src/runner/)
- Recebe AgentConfig
- Gerencia loop de conversa com o usuário
- Executa ferramentas quando o agente as solicita
- Mantém histórico de conversa

### Tools (src/tools/)
- Ferramentas built-in disponíveis para agentes
- Cada tool: nome, descrição, schema de input, handler async

## Fluxo Principal

```
CLI args → validate (Zod) → AgentInput
  → AgentBuilder.build(input)
    → PromptGenerator.generate(input) → system prompt (via Claude sonnet)
    → ToolGenerator.select(input.tasks) → AgentTool[]
    → return AgentConfig
  → AgentRunner.run(config)
    → loop: User input → Claude (haiku) → [tool calls] → response
```
