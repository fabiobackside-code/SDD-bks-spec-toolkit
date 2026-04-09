# Case 1: Gerador de Agentes Simples

> Módulo 03 · Case Prático 1 · Tempo estimado: 2h
> Stack: Node.js + TypeScript + Claude API (Anthropic SDK)
> Nível: Avançado

---

## O que é Este Case

Um sistema que **gera e executa agentes de IA customizados** a partir de uma descrição em linguagem natural. O usuário fornece:

1. **Contexto:** qual é o domínio do agente? (ex: "agente de suporte ao cliente")
2. **Tarefas:** o que o agente deve fazer? (ex: "responder perguntas sobre produtos, escalar para humano se necessário")
3. **Restrições:** o que o agente NÃO pode fazer? (ex: "não pode dar descontos, não pode prometer prazos")
4. **Resultados esperados:** qual é o formato de saída? (ex: "resposta em português, sempre incluir número de protocolo")

O sistema gera um **agente configurado e pronto para uso**, com:
- System prompt otimizado
- Ferramentas (tools) definidas
- Loop de execução
- Logging e rastreabilidade

---

## Estrutura do Case

```
case-1-gerador-agentes/
├── README.md                    ← Você está aqui
├── memory-bank/
│   ├── product.md               ← O que é o sistema
│   ├── structure.md             ← Estrutura do código
│   └── tech.md                  ← Stack técnica
├── spec/
│   ├── requirements.md          ← O QUE o sistema deve fazer
│   ├── design.md                ← COMO está arquitetado
│   └── tasks.md                 ← Passos para o Claude executar
└── CLAUDE.md                    ← Memory bank raiz
```

---

## Conceito do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                  Agent Generator System                      │
│                                                              │
│  Input:                                                      │
│  ┌─────────────┐                                            │
│  │  Contexto   │                                            │
│  │  Tarefas    │ → AgentBuilder → AgentConfig              │
│  │  Restrições │                        │                   │
│  │  Resultados │                        ▼                   │
│  └─────────────┘               AgentRunner (Claude API)    │
│                                         │                   │
│                                         ▼                   │
│                                  Agente em execução         │
│                                  com ferramentas e logs     │
└─────────────────────────────────────────────────────────────┘
```

---

## Como Estudar Este Case

1. **Leia a spec completa primeiro** (requirements → design → tasks)
2. **Configure o CLAUDE.md** no seu ambiente
3. **Execute as tasks uma por uma** com o Claude Code
4. **Teste o agente gerado** com diferentes configurações
5. **Expanda:** adicione novos tipos de ferramentas ao gerador

---

## Referências

- [Anthropic Claude API Docs](https://docs.anthropic.com)
- [Tool Use (Function Calling)](https://docs.anthropic.com/en/docs/tool-use)
- [Spec: requirements.md](./spec/requirements.md)
- [Spec: design.md](./spec/design.md)
- [Spec: tasks.md](./spec/tasks.md)

---

## Resultado Final Esperado

Ao final, você terá um CLI assim:

```bash
# Criar e executar um agente de suporte
npx agent-gen create \
  --context "Suporte ao cliente de e-commerce" \
  --tasks "Responder dúvidas sobre pedidos, Consultar status de entrega, Registrar reclamações" \
  --restrictions "Não pode dar reembolso direto, Não pode prometer prazos além de 5 dias úteis" \
  --output "Resposta em português, sempre incluir protocolo, escalar para humano se insatisfeito"

# Saída:
# Agent "Suporte E-commerce" criado com sucesso!
# System prompt: 340 tokens
# Tools definidas: 3 (check_order, track_delivery, create_ticket)
# Iniciando sessão interativa...

User: Meu pedido #12345 está atrasado
Agent: [consultando status do pedido #12345...]
       Protocolo: SUP-2024-001
       Seu pedido #12345 está em trânsito e tem previsão de entrega para amanhã...
```
