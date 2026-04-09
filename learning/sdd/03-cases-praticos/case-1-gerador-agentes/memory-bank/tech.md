# tech.md — Stack Técnica

## Runtime
- Node.js 20 LTS
- TypeScript 5.3 (strict: true, noImplicitAny: true)

## Dependências Principais
```json
{
  "@anthropic-ai/sdk": "^0.35.0",
  "commander": "^12.0.0",
  "zod": "^3.22.0",
  "dotenv": "^16.0.0",
  "chalk": "^5.0.0",
  "ora": "^8.0.0"
}
```

## Dependências de Desenvolvimento
```json
{
  "jest": "^29.0.0",
  "ts-jest": "^29.0.0",
  "@types/node": "^20.0.0"
}
```

## Claude API
- SDK: @anthropic-ai/sdk (oficial Anthropic)
- Modelo para geração: claude-sonnet-4-6
- Modelo para execução: claude-haiku-4-5-20251001
- Autenticação: ANTHROPIC_API_KEY via .env
- Timeout padrão: 30 segundos
- Max tokens geração: 4096
- Max tokens execução: 1024

## Padrões de Código
- Resultado de operações: `Result<T, E>` type (sem throw em funções de domínio)
- Async/await (sem callbacks ou .then chains)
- Zod para validação de toda entrada externa (CLI args, API responses)
- Chalk para output colorido no terminal
- Ora para spinners durante chamadas de API

## Estrutura de Tipos do Agente
```typescript
interface AgentConfig {
  name: string;
  systemPrompt: string;
  tools: AgentTool[];
  model: string;
  maxTokens: number;
  maxTurns: number;
}

interface AgentTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>; // JSON Schema
  handler: (input: unknown) => Promise<string>;
}

interface AgentInput {
  context: string;       // Domínio e propósito do agente
  tasks: string[];       // Lista de tarefas que o agente pode fazer
  restrictions: string[]; // O que o agente NÃO deve fazer
  outputFormat: string;  // Como o agente deve formatar as respostas
}
```

## Variáveis de Ambiente
```
ANTHROPIC_API_KEY=sk-ant-...  # Obrigatório
MODEL_GENERATE=claude-sonnet-4-6  # Opcional (default acima)
MODEL_EXECUTE=claude-haiku-4-5-20251001  # Opcional (default acima)
MAX_REQUESTS_PER_MINUTE=10  # Rate limit
LOG_LEVEL=info  # debug | info | warn | error
```

## Testes
- Jest com ts-jest
- Mocks da API Claude via jest.mock('@anthropic-ai/sdk')
- Fixtures de AgentConfig e AgentInput em test/fixtures/
- Cobertura mínima: 80%
