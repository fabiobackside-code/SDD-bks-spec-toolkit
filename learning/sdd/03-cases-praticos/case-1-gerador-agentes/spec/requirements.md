# Spec: Gerador de Agentes de IA
Versão: 1.0 | Data: 2024-01-15

## Contexto
Sistema CLI que permite criar e executar agentes de IA customizados sem necessidade
de programar o agente manualmente. O usuário descreve o que quer e o sistema gera.

---

## Requisitos Funcionais

### Criação de Agente

RF-001: O sistema DEVE aceitar como entrada:
        - context: string (domínio e propósito do agente)
        - tasks: string[] (lista de tarefas que o agente pode realizar)
        - restrictions: string[] (o que o agente NÃO deve fazer)
        - outputFormat: string (como o agente deve formatar as respostas)

RF-002: O sistema DEVE gerar um system prompt otimizado a partir dos inputs
        usando o modelo claude-sonnet-4-6

RF-003: O system prompt gerado DEVE:
        a) Definir claramente a persona e o domínio do agente
        b) Listar as tarefas permitidas de forma inequívoca
        c) Incluir as restrições como instruções explícitas (NÃO FAÇA X)
        d) Especificar o formato de saída esperado
        e) Instruir o agente a ser transparente sobre suas limitações

RF-004: O sistema DEVE selecionar automaticamente ferramentas (tools) adequadas
        com base nas tarefas descritas

RF-005: As ferramentas built-in disponíveis são:
        - calculator: para cálculos matemáticos
        - text-formatter: para formatação de texto (markdown, JSON, tabelas)
        - web-search: simulada (retorna dados fictícios realistas para demo)
        - protocol-generator: gera números de protocolo únicos

RF-006: O sistema DEVE exportar o AgentConfig gerado em formato JSON
        para reutilização sem nova chamada à API geradora

### Execução de Agente

RF-007: O sistema DEVE executar o agente em modo interativo (chat no terminal)

RF-008: O agente DEVE usar o modelo claude-haiku-4-5-20251001 durante a execução
        (mais rápido e econômico que o modelo de geração)

RF-009: O sistema DEVE exibir quando o agente usa uma ferramenta:
        "[usando ferramenta: calculator] Calculando..."

RF-010: O sistema DEVE manter histórico da conversa dentro de uma sessão

RF-011: O sistema DEVE limitar conversas a 20 turnos por sessão (configurável)

RF-012: QUANDO o agente atingir o limite de turnos,
        DEVE informar o usuário e encerrar a sessão graciosamente

RF-013: O sistema DEVE registrar log de cada sessão em logs/session-{timestamp}.json
        incluindo: configuração do agente, histórico de mensagens, ferramentas usadas,
        tokens consumidos, custo estimado

### Rastreabilidade e Custo

RF-014: O sistema DEVE exibir ao final de cada sessão:
        - Total de tokens consumidos (input + output)
        - Custo estimado em USD
        - Número de chamadas à API
        - Ferramentas utilizadas e quantas vezes

RF-015: O sistema DEVE implementar rate limiting: máximo 10 requests por minuto à API Claude

RF-016: QUANDO o rate limit for atingido,
        DEVE aguardar e informar o usuário: "Aguardando rate limit (Xs)..."

### Segurança

RF-017: O sistema NÃO DEVE logar ou exibir a API key em nenhuma circunstância
RF-018: O sistema NÃO DEVE permitir que o agente execute código no sistema host
RF-019: Agentes gerados NÃO DEVEM ter acesso ao filesystem real
RF-020: O sistema DEVE sanitizar inputs do usuário antes de enviar à API

---

## Restrições Técnicas

RC-001: Usar @anthropic-ai/sdk (SDK oficial) — não chamar a API via fetch diretamente
RC-002: Validar todo input CLI com Zod antes de processar
RC-003: API key carregada de .env via dotenv — nunca de args de linha de comando
RC-004: Timeout de 30 segundos para chamadas à API Claude
RC-005: AgentConfig exportado em JSON deve ser legível por humanos (pretty print)
RC-006: O comando CLI deve ser: `agent-gen create [opções]` e `agent-gen run <config.json>`

---

## Critérios de Aceite

CA-001: Criar agente com contexto válido → AgentConfig gerado em < 15 segundos
        com system prompt que menciona todas as tarefas e restrições informadas

CA-002: Executar agente → sessão interativa funcional
        com respostas coerentes com o contexto e restrições definidas

CA-003: Agente com tarefa "calcular preços" → ferramenta calculator disponível
        e usada quando usuário pede cálculo

CA-004: Agente com restrição "não dar descontos" → quando usuário pede desconto,
        agente recusa educadamente referenciando a política

CA-005: 10 requests em sequência rápida → 11ª aguarda automaticamente (rate limit)

CA-006: API key não deve aparecer em nenhum log ou output

CA-007: `agent-gen create --help` → exibe documentação clara dos parâmetros

CA-008: AgentConfig exportado pode ser carregado e executado sem nova chamada geradora:
        `agent-gen run ./meu-agente.json`

CA-009: Ao final de sessão de 5 mensagens → relatório de tokens e custo exibido

CA-010: Input vazio ou sem contexto → erro claro com instruções de uso

---

## Fora de Escopo
- Interface web ou API REST (apenas CLI nesta versão)
- Persistência de conversas entre sessões (cada execução é nova sessão)
- Multi-tenant ou usuários múltiplos
- Agentes com acesso real à internet (web-search é simulada)
- Geração de imagens ou outros tipos de conteúdo
- Deploy automático do agente em serviços de hospedagem
