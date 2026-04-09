---
name: domain-analysis
description: Analisa o domínio de uma feature SDD usando DDD tático e Event Storming. Use quando o usuário mencionar "analisar domínio", "domain analysis", "event storming", "bounded contexts", "aggregates", "identificar VOs" ou quiser modelar o domínio antes de escrever design.md.
---

# Domain Analysis — SDD

Aplica DDD estratégico e tático para identificar Aggregates, Value Objects, Domain Events e Bounded Contexts a partir do `requirements.md` de uma feature. Produz o bloco de domínio em `specs/features/<feature>/design.md`.

## Contexto

Este projeto segue Arquitetura Hexagonal com DDD. A análise de domínio precede o design técnico — sem modelo de domínio bem definido, Ports e Adapters serão desenhados sobre areia.

Leia antes de iniciar:
- `specs/guidelines/Aplicando-DDD-GUIDELINES.md` — 8 blocos táticos: Entities, Value Objects, Aggregates, Domain Events, Domain Services, Repositories, Factories, Application Services
- `specs/guidelines/Identificando-Contextos-Delimitados-GUIDELINES.md` — 5 fases de descoberta de BCs, Context Map, 6 padrões de relacionamento

## Processo

### 1. Ler requirements.md

```bash
cat specs/features/<feature>/requirements.md
```

Extrair:
- **Substantivos** (candidatos a Entities e Value Objects)
- **Verbos de negócio** (candidatos a Commands e Domain Events)
- **Invariantes** explicitadas nos CAs (regras que o domínio deve garantir)
- **Limites de responsabilidade** (pistas de Bounded Context)

### 2. Event Storming lightweight

Seguindo `Identificando-Contextos-Delimitados-GUIDELINES.md` — Fase 1:

1. **Domain Events** — liste todos os fatos relevantes no passado ("PedidoConfirmado", "ContaCriada")
2. **Commands** — o que causou cada evento? ("ConfirmarPedido", "CriarConta")
3. **Aggregates** — agrupe Commands + Events em torno da entidade que os processa
4. **Bounded Contexts** — onde a linguagem ubíqua muda? Separe em contextos distintos

### 3. Identificar Aggregates e Aggregate Roots

Para cada candidato a Aggregate, verificar:
- Tem identidade única? → É Aggregate Root (Entidade)
- Faz sentido sem o Aggregate Root? → Pode ser Entity separada ou Value Object
- Não tem identidade, apenas valor? → Value Object
- Protege invariantes de negócio? → Deve ser Aggregate Root

Regras de `Aplicando-DDD-GUIDELINES.md`:
- Aggregates são acessados APENAS pela sua Aggregate Root
- Uma transação = um Aggregate (na maioria dos casos)
- Referências entre Aggregates por ID, nunca por objeto

### 4. Identificar Value Objects

Candidatos a VO (sem identidade, imutáveis):
- Valores com validação: Email, CPF, Dinheiro, Endereço, Período
- Combinações que fazem sentido juntas: Coordenada (lat+lng), Nome (primeiro+último)
- Enums com comportamento associado

### 5. Mapear Domain Events

Para cada transição de estado no Aggregate:
- Nomear no passado: `<Entidade><Verbo>` (ex: `ContaAtivada`, `PedidoCancelado`)
- Identificar quem produz e quem consome (dentro ou fora do BC)

### 6. Context Map (se houver múltiplos BCs)

Usando os 6 padrões de `Identificando-Contextos-Delimitados-GUIDELINES.md`:
- **Shared Kernel** — código compartilhado com governança conjunta
- **Customer/Supplier** — upstream define o contrato
- **Conformist** — downstream aceita o modelo upstream sem adaptar
- **ACL (Anti-Corruption Layer)** — tradutor entre modelos incompatíveis
- **Open Host Service** — protocolo publicado para múltiplos consumidores
- **Published Language** — linguagem compartilhada documentada (ex: eventos Kafka)

## Saída

Preencher ou criar a seção de domínio em `specs/features/<feature>/design.md`:

```markdown
## Modelo de Domínio

### Bounded Context: <Nome>

**Aggregate Root:** `<NomeAggregate>`
- Entidades filhas: `<Entity1>`, `<Entity2>`
- Value Objects: `<VO1>` (campos: ...), `<VO2>` (campos: ...)
- Invariantes: 
  - <regra de negócio 1>
  - <regra de negócio 2>

**Domain Events:**
| Evento | Produzido por | Consumido por |
|--------|--------------|---------------|
| `<NomeEvento>` | `<Aggregate>.<Método>()` | <BC externo / Adapter> |

**Context Map:**
- `<BC1>` → `<BC2>`: ACL (traduz modelo de pedido para faturamento)

### Rastreabilidade
| RF | Aggregate | Método | Domain Event |
|----|-----------|--------|--------------|
| RF-001 | `<Aggregate>` | `<Método>()` | `<Evento>` |
```

## Critérios de Qualidade

- Nenhum Aggregate referencia outro Aggregate por objeto (apenas por ID)
- Nenhum Value Object tem identidade (se tem ID, é Entity)
- Domain Events nomeados no passado, em linguagem ubíqua
- Cada RF rastreado a pelo menos um Aggregate/Método
- Domain nunca menciona infraestrutura (banco, HTTP, mensageria)

## Referências

- `specs/guidelines/Aplicando-DDD-GUIDELINES.md` — definição e regras de cada bloco tático DDD
- `specs/guidelines/Identificando-Contextos-Delimitados-GUIDELINES.md` — Event Storming e Context Map
- `specs/CLAUDE-ARCHITECT.md` — padrões agnósticos (Hexagonal + DDD)
- `specs/templates/net/design-template-net.md` — template de saída para projetos .NET
