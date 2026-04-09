# CLAUDE.md — Agent Generator

## Visão Geral
Sistema CLI para geração e execução de agentes de IA customizados.
O usuário descreve o agente (contexto, tarefas, restrições, resultados)
e o sistema gera o agente pronto para executar via Claude API.

## Regras Absolutas
1. NUNCA logar API keys ou tokens nos logs — apenas mascarados (sk-ant-***xxx)
2. NUNCA hardcode de chaves — apenas process.env via dotenv
3. Agentes gerados NUNCA podem executar código arbitrário no sistema host
4. Toda chamada à API Claude DEVE ter timeout configurado (padrão: 30s)
5. SEMPRE implementar rate limiting para evitar custos excessivos (máx 10 req/min)
6. Testes são obrigatórios — especialmente para AgentBuilder (geração de prompts)

## Contexto de Desenvolvimento
- Node.js 20 + TypeScript 5 (strict mode)
- @anthropic-ai/sdk para chamadas à API
- Commander.js para CLI
- Zod para validação de schema de entrada
- Jest para testes
- Chaves em .env (ANTHROPIC_API_KEY, MODEL_NAME)

## Referência ao Memory Bank
- Produto: ./memory-bank/product.md
- Estrutura: ./memory-bank/structure.md
- Técnico: ./memory-bank/tech.md

## Spec Ativa
- [Em implementação] Gerador de Agentes: ./spec/

## Variante .NET (se preferir C#)
Stack alternativa: .NET 8 Console App + Anthropic.SDK (NuGet) + System.CommandLine
- `Anthropic.SDK` é o SDK oficial para C# — mesma API, sintaxe C#
- Substitui Commander.js → `System.CommandLine` ou `Spectre.Console.Cli`
- Substitui Zod → FluentValidation ou record types com validação no construtor
- O CLAUDE.md e specs (requirements + design + tasks) permanecem os mesmos
- Apenas tech.md lista as diferenças de stack

## Modelo Claude a usar
- Geração de agentes: claude-sonnet-4-6 (mais criativo para system prompts)
- Execução de agentes: claude-haiku-4-5-20251001 (mais rápido, mais barato para interações)
