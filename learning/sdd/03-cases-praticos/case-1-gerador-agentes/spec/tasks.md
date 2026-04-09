# Tasks: Gerador de Agentes de IA

## Pré-condições
- Node.js 20 instalado
- ANTHROPIC_API_KEY válida em .env
- Dependências instaladas: `npm install`

---

## Tarefas

### Fase 1: Estrutura Base

- [ ] T-001: Criar estrutura de pastas e configurações base
  - Arquivos: package.json, tsconfig.json, .env.example, .gitignore
  - package.json com scripts: `build`, `dev`, `test`, `agent-gen` (bin)
  - tsconfig.json com strict: true
  - .gitignore: node_modules/, dist/, .env, logs/
  - Referência: RC-003, RC-005

- [ ] T-002: Criar tipos compartilhados
  - Arquivo: src/types/index.ts
  - Tipos: AgentInput, AgentConfig, AgentTool, ToolResult, SessionReport, BuildError
  - Referência: design.md "Tipos Completos", RF-001

- [ ] T-003: Criar configuração e validação de variáveis de ambiente
  - Arquivo: src/config/env.ts
  - Schema Zod para validar .env no startup
  - Falhar com mensagem clara se ANTHROPIC_API_KEY não estiver configurada
  - Referência: RC-003, RF-017

### Fase 2: Ferramentas Built-in

- [ ] T-004: Implementar ferramenta `calculator`
  - Arquivo: src/tools/calculator.tool.ts
  - Input schema: { expression: string }
  - Sanitizar expressão (apenas números e operadores matemáticos básicos)
  - NÃO usar eval() diretamente — usar parser seguro
  - Referência: RF-005, RF-018

- [ ] T-005: Implementar ferramenta `text-formatter`
  - Arquivo: src/tools/text-formatter.tool.ts
  - Input schema: { content: string, format: "markdown" | "table" | "json" | "list" }
  - Referência: RF-005

- [ ] T-006: Implementar ferramenta `web-search` (simulada)
  - Arquivo: src/tools/web-search.tool.ts
  - Input schema: { query: string }
  - Retornar resultado fictício realista com disclaimer "⚠️ Resultado simulado"
  - Referência: RF-005, RF-019

- [ ] T-007: Implementar ferramenta `protocol-generator`
  - Arquivo: src/tools/protocol-generator.tool.ts
  - Input schema: { prefix?: string }
  - Formato: {PREFIX}-{ANO}-{SEQ3}-{RANDOM4}
  - Referência: RF-005

### Fase 3: Builder

- [ ] T-008: Implementar ToolSelector
  - Arquivo: src/builder/tool-selector.ts
  - Lógica de seleção por palavras-chave nas tasks
  - Sempre incluir protocol-generator no conjunto de tools
  - Referência: RF-004, RF-005, design.md "ToolSelector"

- [ ] T-009: Implementar PromptGenerator
  - Arquivo: src/builder/prompt-generator.ts
  - Integração com @anthropic-ai/sdk
  - Usar meta-prompt definido em design.md "Meta-prompt"
  - Modelo: claude-sonnet-4-6, max_tokens: 1500
  - Timeout: 30s (RC-004)
  - Referência: RF-002, RF-003, RC-001

- [ ] T-010: Implementar AgentBuilder
  - Arquivo: src/builder/agent-builder.ts
  - Orquestra ToolSelector + PromptGenerator
  - Valida AgentInput com Zod antes de processar
  - Retorna Result<AgentConfig, BuildError>
  - Referência: RF-001, RF-002, RF-004, RC-002

### Fase 4: Runner

- [ ] T-011: Implementar RateLimiter
  - Arquivo: src/runner/rate-limiter.ts
  - Sliding window: máximo 10 requests/minuto
  - Aguarda e exibe countdown quando limite atingido
  - Referência: RF-015, RF-016

- [ ] T-012: Implementar SessionLogger
  - Arquivo: src/runner/session-logger.ts
  - Registra: mensagens, tool calls, tokens, timestamps
  - Calcula custo estimado (preços: haiku input=$0.80/M tokens, output=$4/M tokens)
  - Salva JSON em logs/ com nome session-{ISO-timestamp}.json
  - Referência: RF-013, RF-014

- [ ] T-013: Implementar ToolExecutor
  - Arquivo: src/runner/tool-executor.ts
  - Mapeia tool_name → handler
  - Exibe "[usando ferramenta: {name}]..." antes de executar
  - Trata erros do handler e retorna ToolResult com error
  - Referência: RF-009, design.md "ToolExecutor"

- [ ] T-014: Implementar AgentRunner
  - Arquivo: src/runner/agent-runner.ts
  - Loop principal: readline → Claude haiku → [tool_use?] → exibe resposta
  - Gerencia histórico (ConversationManager inline ou separado)
  - Respeita maxTurns (RF-011, RF-012)
  - Usa RateLimiter para cada chamada à API
  - Retorna SessionReport ao final
  - Referência: RF-007, RF-008, RF-009, RF-010, RF-011, RF-012

### Fase 5: CLI e Integração

- [ ] T-015: Implementar CLI com Commander.js
  - Arquivo: src/cli/index.ts
  - Comando `create`: recebe --context, --tasks (separados por vírgula), --restrictions, --output
  - Comando `run`: recebe caminho para JSON de AgentConfig
  - --help com documentação clara
  - Exibe spinner durante geração (ora)
  - Referência: RF-006, RC-006, CA-007, CA-008, CA-010

### Fase 6: Testes

- [ ] T-016: Escrever fixtures de teste
  - Arquivo: test/fixtures/agent-input.fixture.ts (3 exemplos: suporte, análise, automação)
  - Arquivo: test/fixtures/agent-config.fixture.ts (AgentConfig mock completo)

- [ ] T-017: Escrever testes unitários do AgentBuilder
  - Arquivo: test/unit/builder/agent-builder.spec.ts
  - Mock @anthropic-ai/sdk
  - Cobrir: input válido, input inválido (Zod), falha de API
  - Referência: CA-001, CA-010

- [ ] T-018: Escrever testes unitários das ferramentas
  - Arquivo: test/unit/tools/
  - Cobrir: calculator (expressões válidas, inválidas), protocol-generator (formato correto)
  - Referência: CA-003

- [ ] T-019: Escrever testes unitários do ToolSelector
  - Arquivo: test/unit/builder/tool-selector.spec.ts
  - Cobrir: seleção por palavras-chave, protocol-generator sempre presente
  - Referência: RF-004, RF-005

- [ ] T-020: Escrever testes unitários do SessionLogger
  - Arquivo: test/unit/runner/session-logger.spec.ts
  - Cobrir: cálculo de custo, formato do relatório
  - Referência: RF-013, RF-014

---

## Definição de Pronto

- [ ] Todos os 10 critérios de aceite (CA-001 a CA-010) validados manualmente
- [ ] TypeScript compila sem erros (npx tsc --noEmit)
- [ ] Testes passam (npm test)
- [ ] Cobertura > 80% nas camadas builder e tools
- [ ] API key não aparece em nenhum log (verificação manual em logs/)
- [ ] .env.example atualizado com todas as variáveis necessárias
- [ ] README com instruções de instalação e exemplos de uso

---

## Exemplos de Teste Manual

### Exemplo 1: Agente de Suporte

```bash
npx agent-gen create \
  --context "Atendimento ao cliente de loja de eletrônicos online" \
  --tasks "Responder dúvidas sobre produtos,Verificar status de pedidos,Registrar reclamações" \
  --restrictions "Não pode oferecer descontos,Não pode prometer prazo menor que 5 dias úteis,Não pode cancelar pedidos diretamente" \
  --output "Resposta em português,Sempre incluir número de protocolo,Linguagem cordial e profissional"
```

### Exemplo 2: Agente de Análise Financeira

```bash
npx agent-gen create \
  --context "Assistente de análise financeira para pequenas empresas" \
  --tasks "Calcular margens de lucro,Analisar fluxo de caixa,Comparar cenários de investimento" \
  --restrictions "Não pode dar conselhos de investimento específicos,Não pode garantir retornos" \
  --output "Respostas com números formatados em BRL,Sempre mostrar fórmula do cálculo,Incluir aviso de que não é consultoria financeira"
```

### Exemplo 3: Carregar Agente Existente

```bash
npx agent-gen run ./agents/suporte-eletronicos.json
```
