# Design: Gerador de Agentes de IA

## Arquitetura Geral

```
┌──────────────────────────────────────────────────────────────┐
│                        CLI Layer                              │
│  agent-gen create [opts]        agent-gen run <config.json>   │
└──────────────────┬───────────────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │    AgentBuilder     │  ← usa Claude sonnet (geração)
        │  PromptGenerator    │
        │  ToolSelector       │
        └──────────┬──────────┘
                   │ AgentConfig
        ┌──────────▼──────────┐
        │    AgentRunner      │  ← usa Claude haiku (execução)
        │  ConversationMgr    │
        │  ToolExecutor       │
        │  RateLimiter        │
        │  SessionLogger      │
        └─────────────────────┘
```

---

## Componentes

### src/cli/index.ts — Entry Point CLI

```typescript
// Commander.js program
// Subcommands:
//   create: parseia opts → valida com Zod → chama AgentBuilder → salva JSON → inicia AgentRunner
//   run: lê JSON → valida AgentConfig → inicia AgentRunner
```

### src/builder/agent-builder.ts — Construtor de Agentes

```typescript
class AgentBuilder {
  async build(input: AgentInput): Promise<Result<AgentConfig, BuildError>>;
  // 1. Valida input (Zod schema)
  // 2. Chama PromptGenerator para gerar system prompt
  // 3. Chama ToolSelector para selecionar ferramentas
  // 4. Monta e retorna AgentConfig
}
```

### src/builder/prompt-generator.ts — Gerador de System Prompt

```typescript
class PromptGenerator {
  async generate(input: AgentInput): Promise<Result<string, PromptGenerationError>>;
  // Chama Claude sonnet com meta-prompt:
  // "Gere um system prompt para um agente com as seguintes características:
  //  Contexto: {input.context}
  //  Tarefas: {input.tasks.join(', ')}
  //  Restrições: {input.restrictions.join(', ')}
  //  Formato de saída: {input.outputFormat}
  //
  //  O system prompt deve ser claro, sem ambiguidades, e incluir todas as restrições
  //  como instruções negativas explícitas."
}
```

### src/builder/tool-selector.ts — Seletor de Ferramentas

```typescript
class ToolSelector {
  select(tasks: string[]): AgentTool[];
  // Lógica de seleção baseada em palavras-chave nas tasks:
  // "calcular", "preço", "total" → calculator
  // "formatar", "tabela", "relatório" → text-formatter
  // "buscar", "pesquisar", "consultar" → web-search (simulada)
  // "protocolo", "número", "ticket" → protocol-generator
  // Sempre incluir: protocol-generator (padrão)
}
```

### src/runner/agent-runner.ts — Executor do Agente

```typescript
class AgentRunner {
  async run(config: AgentConfig): Promise<SessionReport>;
  // Loop:
  // 1. Lê input do usuário (readline)
  // 2. Adiciona ao histórico (ConversationManager)
  // 3. Chama Claude haiku com system prompt + histórico
  // 4. Se resposta tem tool_use → ToolExecutor.execute() → adiciona resultado ao histórico
  // 5. Retorna texto final ao usuário
  // 6. Repete até maxTurns ou usuário digitar "exit"
}
```

### src/runner/tool-executor.ts — Executor de Ferramentas

```typescript
class ToolExecutor {
  async execute(toolName: string, input: unknown): Promise<ToolResult>;
  // Mapeia toolName → handler registrado
  // Exibe "[usando ferramenta: {toolName}]..." no terminal
  // Trata erros da ferramenta e retorna ToolResult com error se necessário
}
```

### src/runner/session-logger.ts — Logger de Sessão

```typescript
class SessionLogger {
  log(event: SessionEvent): void;
  generateReport(): SessionReport;
  saveToFile(sessionId: string): Promise<void>;
  // Salva em logs/session-{timestamp}.json
}
```

---

## Tipos Completos

```typescript
// Input do usuário
interface AgentInput {
  context: string;
  tasks: string[];
  restrictions: string[];
  outputFormat: string;
}

// Configuração gerada
interface AgentConfig {
  name: string;           // derivado do context
  systemPrompt: string;   // gerado via Claude
  tools: AgentTool[];     // selecionadas automaticamente
  model: string;          // claude-haiku-4-5-20251001
  maxTokens: number;      // 1024
  maxTurns: number;       // 20
  generatedAt: string;    // ISO timestamp
  version: string;        // "1.0"
}

// Ferramenta disponível para o agente
interface AgentTool {
  name: string;
  description: string;
  inputSchema: {           // JSON Schema compatível com Anthropic Tool Use
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
  handler: (input: unknown) => Promise<string>; // não serializado no JSON
}

// Resultado de uma ferramenta
interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
}

// Relatório de sessão
interface SessionReport {
  sessionId: string;
  agentName: string;
  startedAt: string;
  endedAt: string;
  totalTurns: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUSD: number;
  toolsUsed: Record<string, number>; // { "calculator": 3, "protocol-generator": 1 }
}

// Erros
type BuildError = 'INVALID_INPUT' | 'PROMPT_GENERATION_FAILED' | 'API_ERROR';
type PromptGenerationError = 'API_TIMEOUT' | 'RATE_LIMITED' | 'INVALID_RESPONSE';
```

---

## Ferramentas Built-in

### calculator
```typescript
// Input: { expression: string }
// Output: resultado do cálculo como string
// Exemplo: { expression: "150 * 0.87 + 25" } → "155.5"
// Implementação: usar Function() com whitelist de operadores seguros
```

### text-formatter
```typescript
// Input: { content: string, format: "markdown" | "table" | "json" | "list" }
// Output: conteúdo formatado
```

### web-search (simulada)
```typescript
// Input: { query: string }
// Output: resultado fictício realista
// IMPORTANTE: deve deixar claro no output que é uma simulação
// "⚠️ Resultado simulado para demonstração: ..."
```

### protocol-generator
```typescript
// Input: { prefix?: string }
// Output: número de protocolo único
// Exemplo: "SUP-2024-001-A3F2"
```

---

## Fluxo de Tratamento de Erros

| Erro | Onde ocorre | Tratamento |
|------|-------------|------------|
| API_TIMEOUT | PromptGenerator, AgentRunner | Retry 1x, depois mensagem clara |
| RATE_LIMITED | RateLimiter | Aguarda N segundos, informa usuário, continua |
| INVALID_INPUT | AgentBuilder | Mensagem com erros de validação Zod |
| TOOL_ERROR | ToolExecutor | Agente recebe "Tool error: [msg]" e continua |
| TURN_LIMIT | AgentRunner | Mensagem de encerramento, exibe relatório |

---

## Meta-prompt para Geração de System Prompt

O PromptGenerator envia este meta-prompt ao Claude sonnet:

```
Você é um especialista em criação de system prompts para agentes de IA.

Crie um system prompt claro, profissional e eficaz para um agente com as seguintes características:

CONTEXTO DO AGENTE:
{input.context}

TAREFAS QUE O AGENTE PODE REALIZAR:
{input.tasks.map(t => `- ${t}`).join('\n')}

RESTRIÇÕES (o agente NÃO deve):
{input.restrictions.map(r => `- ${r}`).join('\n')}

FORMATO DE SAÍDA ESPERADO:
{input.outputFormat}

FERRAMENTAS DISPONÍVEIS:
{tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}

O system prompt deve:
1. Definir claramente a persona e missão do agente
2. Listar explicitamente o que o agente pode e não pode fazer
3. Instruir sobre o uso das ferramentas disponíveis
4. Especificar o formato de saída
5. Instruir o agente a ser transparente sobre limitações
6. Ser escrito em português (Brasil) a menos que o contexto exija outro idioma
7. Ter no máximo 800 palavras

Retorne APENAS o system prompt, sem explicações adicionais.
```

---

## Estratégia de Testes

- **Unitário:** AgentBuilder (mock da API Claude) — testa geração de config
- **Unitário:** ToolSelector — testa seleção por palavras-chave
- **Unitário:** SessionLogger — testa cálculo de custo e geração de relatório
- **Unitário:** cada tool built-in — testa os handlers
- **Integração (opcional):** AgentRunner com API real (marcado como slow test, requer .env)
