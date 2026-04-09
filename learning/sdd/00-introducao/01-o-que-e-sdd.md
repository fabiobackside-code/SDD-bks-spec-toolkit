# O que é Spec-Driven Development (SDD)?

> Módulo 00 · Aula 1 · Tempo estimado: 20min

---

## O Problema Que Estamos Resolvendo

Imagine este cenário, provavelmente familiar para você:

```
Você: "Cria um serviço de autenticação com JWT"
Claude: [gera 200 linhas de código]
Você: "Hmm, mas eu queria com refresh token também"
Claude: [refaz parcialmente]
Você: "Precisa validar o e-mail antes de ativar a conta"
Claude: [adiciona, mas quebra o refresh token]
Você: "Agora o logout não funciona..."
[2 horas depois, código inconsistente, difícil de testar]
```

Esse padrão tem nome: **Vibe Coding** — desenvolvimento por tentativa e erro com prompts vagos, onde o resultado "parece funcionar" mas acumula **dívida técnica invisível** que explode meses depois.

---

## O que é SDD

**Spec-Driven Development (SDD)** é uma metodologia que posiciona a **especificação como a principal fonte de verdade** do projeto, não o código.

A ideia central é: **desacelerar para acelerar**.

```
SDD = Especificação Formal → Agente de IA → Código Auditável
```

Em vez de pedir ao Claude para "criar um serviço de autenticação", você primeiro escreve:

1. **O que** o sistema deve fazer (Requirements)
2. **Como** os componentes se relacionam (Design)
3. **Quais passos** o agente deve executar (Tasks)

Só então você manda o Claude **executar** — não improvisar.

---

## Os 3 Níveis de Maturidade do SDD

Baseado na análise de Martin Fowler, o SDD evolui em três níveis:

### Nível 1: Spec-First
> "Escrevo a spec antes de pedir ao Claude"

- A spec guia a sessão atual
- Após o código pronto, a spec pode ser descartada
- **Resultado:** código melhor, mas sem rastreabilidade futura

```
[Spec] → [Sessão Claude] → [Código] → (spec arquivada ou descartada)
```

### Nível 2: Spec-Anchored
> "A spec permanece viva e evolui junto com o código"

- A spec é mantida no repositório
- Alterações no sistema passam pela spec primeiro
- **Resultado:** rastreabilidade total, onboarding mais rápido

```
[Spec viva no repo] ⇄ [Código] ← Claude sempre referencia a spec
```

### Nível 3: Spec-as-Source
> "Humanos só editam specs. Claude gera o código."

- Código marcado como `GENERATED FROM SPEC - DO NOT EDIT`
- Humanos trabalham no nível da especificação
- **Resultado:** máxima produtividade, mas requer maturidade da equipe

```
[Humano edita spec] → [Claude regenera código automaticamente]
```

> **Para este treinamento:** começaremos no Nível 1 e evoluiremos para o Nível 2.

---

## Por Que o SDD Funciona com IA

A IA (como o Claude) tem três características que tornam o SDD poderoso:

| Característica | Sem SDD | Com SDD |
|----------------|---------|---------|
| **Amnésia entre sessões** | Claude "esquece" decisões anteriores | Memory Bank persiste o contexto |
| **Suposições silenciosas** | Claude inventa soluções não solicitadas | Specs eliminam ambiguidades |
| **Alucinações** | Bibliotecas inexistentes, APIs erradas | Constraints explícitas da spec |

---

## SDD vs Outras Metodologias

| Aspecto | SDD | TDD | BDD | Vibe Coding |
|---------|-----|-----|-----|-------------|
| **Foco** | Intenção → Código | Teste → Código | Comportamento → Código | Prompt → Código |
| **Artefato central** | Spec (md) | Testes | Cenários Gherkin | Prompts ad-hoc |
| **Papel do dev** | Arquiteto de Intenção | Escritor de Testes | Analista | Operador de IA |
| **Previsibilidade** | Alta | Alta | Média | Baixa |
| **Velocidade inicial** | Mais lenta | Mais lenta | Média | Rápida |
| **Velocidade a longo prazo** | Alta | Alta | Média | Cai drasticamente |

> SDD **não substitui** TDD — eles são complementares. A spec do SDD define o comportamento; os testes do TDD o validam.

---

## O Papel do Engenheiro Muda

```
ANTES                        DEPOIS
─────────────────────        ────────────────────────
Escritor de código           Arquiteto de Intenção
↓                            ↓
"Como implementar X?"        "O que X deve fazer? Quais são as restrições?"
↓                            ↓
Preocupado com sintaxe       Preocupado com comportamento e contratos
↓                            ↓
Revisor de código gerado     Designer de especificações executáveis
```

O engenheiro sênior continua sendo indispensável — mas sua inteligência é aplicada onde tem mais impacto: na **definição do problema**, não na digitação da solução.

---

## Resumo

- SDD coloca a **especificação como fonte de verdade**, não o código
- Resolve os problemas do Vibe Coding: ambiguidade, suposições silenciosas, amnésia da IA
- Evolui em 3 níveis de maturidade (Spec-First → Spec-Anchored → Spec-as-Source)
- Muda o papel do engenheiro de escritor de código para arquiteto de intenção

---

## Próxima Aula

[02 — Vibe Coding vs SDD: Comparação Detalhada →](./02-vibe-coding-vs-sdd.md)

---

[EXERCÍCIO 00-1]
Pense em um projeto recente onde você usou IA (Claude, Copilot, etc.).
1. Quantas iterações foram necessárias até chegar no resultado esperado?
2. Havia uma spec clara antes de começar? Se não havia, o que poderia ter sido especificado?
3. O código gerado ainda existe no projeto? Está funcionando corretamente 3 meses depois?
