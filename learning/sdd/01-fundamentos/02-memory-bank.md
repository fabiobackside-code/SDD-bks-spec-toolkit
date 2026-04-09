# Memory Bank: Contexto Persistente do Projeto

> Módulo 01 · Aula 2 · Tempo estimado: 30min

---

## O Problema da Amnésia da IA

Cada sessão com o Claude começa do zero. Sem contexto persistente, você precisa repetir as mesmas informações toda vez:

```
Sessão 1: "Nosso projeto usa Clean Architecture, TypeScript, PostgreSQL..."
Sessão 2: "Nosso projeto usa Clean Architecture, TypeScript, PostgreSQL..."
Sessão 3: "Nosso projeto usa Clean Architecture, TypeScript, PostgreSQL..."
```

Isso é ineficiente e perigoso: se você esquecer de mencionar uma restrição importante, o Claude pode tomar decisões inconsistentes com o restante do projeto.

**O Memory Bank resolve isso.**

---

## O que é o Memory Bank

O Memory Bank é um conjunto de arquivos markdown que o Claude lê automaticamente no início de cada sessão. Ele contém o **contexto fundacional e imutável** do projeto.

```
memory-bank/
├── product.md      ← O que é o produto e para quem
├── structure.md    ← Como o código está organizado
└── tech.md         ← Stack, libs, convenções técnicas

CLAUDE.md           ← Arquivo raiz (lido automaticamente pelo Claude Code)
```

> O `CLAUDE.md` é o ponto de entrada. Ele pode conter o memory bank diretamente ou referenciar os arquivos na pasta `memory-bank/`.

---

## CLAUDE.md — O Arquivo Raiz

O Claude Code lê `CLAUDE.md` automaticamente em toda sessão. É o arquivo mais importante do seu setup SDD.

### Estrutura do CLAUDE.md

```markdown
# CLAUDE.md — [Nome do Projeto]

## Visão Geral
[1-3 frases sobre o projeto]

## Regras Absolutas (NÃO NEGOCIÁVEIS)
[O que o Claude NUNCA pode fazer neste projeto]

## Referência ao Memory Bank
- Produto: ./memory-bank/product.md
- Estrutura: ./memory-bank/structure.md
- Técnico: ./memory-bank/tech.md

## Specs Ativas
[Links para specs em andamento]
```

### Exemplo Real: CLAUDE.md de uma API

```markdown
# CLAUDE.md — OrderFlow API

## Visão Geral
API REST de gerenciamento de pedidos para e-commerce B2B.
Stack: Node.js + TypeScript + NestJS + PostgreSQL + Redis.
Serve 50+ clientes empresariais em produção.

## Regras Absolutas (NÃO NEGOCIÁVEIS)
1. NUNCA alterar arquivos de migração existentes em /src/database/migrations/
2. NUNCA adicionar dependências sem solicitar confirmação explícita
3. NUNCA usar `any` no TypeScript — usar tipos explícitos ou `unknown`
4. SEMPRE usar o padrão Result<T, E> para retorno de use cases
5. Testes são OBRIGATÓRIOS para toda feature — sem testes, a task não está concluída
6. NUNCA logar dados sensíveis (senha, token, CPF, cartão)

## Contexto de Desenvolvimento
- Ambiente: Node 20, TypeScript 5.3, NestJS 10
- Banco: PostgreSQL 15 (Docker local), Redis 7
- Testes: Jest + Supertest (integração), coverage mínima 80%
- Lint: ESLint + Prettier (configuração em .eslintrc.js)

## Referência ao Memory Bank
- Produto: ./memory-bank/product.md
- Estrutura: ./memory-bank/structure.md
- Técnico: ./memory-bank/tech.md

## Specs Ativas
- [Em andamento] Autenticação: ./spec/auth/
- [Pendente] Gestão de Pedidos: ./spec/orders/
```

---

## product.md — O Produto

Define o contexto de negócio. Ajuda o Claude a tomar decisões alinhadas com os objetivos do produto.

```markdown
# product.md — OrderFlow API

## O que é
Plataforma B2B de gestão de pedidos que conecta distribuidores a varejistas.
Substitui processos manuais via planilha/telefone.

## Usuários
- **Distribuidores:** criam catálogos, definem preços por cliente, gerenciam estoque
- **Varejistas:** fazem pedidos, acompanham status, gerenciam crédito
- **Administradores:** aprovam distribuidores, monitoram métricas, resolvem disputas

## Domínios de Negócio
1. **Autenticação e Autorização** — multi-tenant, RBAC
2. **Catálogo de Produtos** — preços dinâmicos por cliente
3. **Gestão de Pedidos** — ciclo completo: rascunho → aprovação → entrega
4. **Financeiro** — crédito, NF-e, contas a receber
5. **Notificações** — e-mail, WhatsApp, webhook

## Restrições de Negócio
- Dados de clientes NUNCA podem ser compartilhados entre distribuidores (multi-tenant)
- Preços são CONFIDENCIAIS — varejista A não vê preço do varejista B
- NF-e é obrigatória para pedidos acima de R$ 500
- SLA: operações de pedido < 200ms (p95)
```

---

## structure.md — A Estrutura

Define como o código está organizado. Evita que o Claude crie arquivos em lugares errados.

```markdown
# structure.md — Estrutura do Projeto

## Arquitetura: Clean Architecture

```
src/
├── domain/                    # Regras de negócio puras (sem dependências externas)
│   ├── entities/              # Entidades do domínio (Order, Product, User)
│   ├── repositories/          # Interfaces de repositórios
│   ├── services/              # Domain services (lógica de negócio complexa)
│   └── value-objects/         # CPF, Money, Email, etc.
│
├── application/               # Casos de uso (orquestração)
│   ├── use-cases/             # Um arquivo por use case
│   │   └── orders/
│   │       ├── create-order.use-case.ts
│   │       └── create-order.use-case.spec.ts
│   ├── services/              # Application services (TokenService, etc.)
│   └── dtos/                  # Objetos de transferência de dados
│
├── infrastructure/            # Implementações de infraestrutura
│   ├── database/
│   │   ├── repositories/      # Implementações TypeORM dos repositórios
│   │   ├── migrations/        # ← NUNCA ALTERAR EXISTENTES
│   │   └── entities/          # TypeORM entities
│   ├── cache/                 # Implementações Redis
│   └── messaging/             # Fila de mensagens (Bull/RabbitMQ)
│
└── presentation/              # Controllers e roteamento
    ├── controllers/
    ├── middlewares/
    └── guards/

spec/                          # Specs das features
memory-bank/                   # Contexto do projeto
test/
├── unit/                      # Testes unitários (mesma estrutura de src/)
└── integration/               # Testes de integração por domínio
```

## Convenções de Nomenclatura
- Use cases: `create-order.use-case.ts`
- Entities: `order.entity.ts`
- Repositories: `order.repository.ts` (interface), `typeorm-order.repository.ts` (impl)
- DTOs: `create-order.dto.ts`, `order-response.dto.ts`
- Specs: `test/unit/use-cases/orders/create-order.use-case.spec.ts`
```

---

## tech.md — A Stack Técnica

Define a stack, bibliotecas e convenções técnicas. É a "constituição técnica" do projeto.

```markdown
# tech.md — Stack e Convenções Técnicas

## Runtime e Framework
- Node.js 20 LTS + TypeScript 5.3 (strict mode)
- NestJS 10 com módulos por domínio

## Banco de Dados
- PostgreSQL 15 via TypeORM 0.3
- Migrações: TypeORM migrations (NUNCA usar synchronize em produção)
- Nomenclatura: snake_case para tabelas e colunas

## Cache e Estado
- Redis 7 via ioredis
- Padrões: cache-aside para leituras, write-through para sessões

## Autenticação
- JWT com RS256 (chave assimétrica)
- Access token: 15min, Refresh token: 7 dias
- Blacklist via Redis

## Validação
- DTOs: class-validator + class-transformer (SEMPRE, nunca validação manual)
- Domínio: Value Objects com invariantes no construtor

## Padrão de Retorno (OBRIGATÓRIO)
```typescript
// Use cases SEMPRE retornam Result<T, E>
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// Nunca throw em use cases — use Result
const result = await createOrderUseCase.execute(dto);
if (!result.ok) {
  // trata o erro
}
```

## Injeção de Dependência
- NestJS DI nativo (@Injectable, @Inject)
- Módulos por domínio (OrdersModule, AuthModule, etc.)

## Testes
- Jest + ts-jest para unitários
- Supertest para integração (app real, banco de teste)
- Nomenclatura: `describe('LoginUseCase')` → `it('deve retornar tokens para credenciais válidas')`
- Coverage mínima: 80% (branches, lines, functions)

## Variáveis de Ambiente
- Nunca hardcode — sempre process.env via @nestjs/config
- Arquivo .env.example mantido atualizado (sem valores reais)
- Validação de env no startup com Joi schema
```

---

## Como o Claude Usa o Memory Bank

Quando você executa `claude "Implemente a task T-004"`, o Claude:

1. Lê `CLAUDE.md` automaticamente
2. Segue os links para `memory-bank/product.md`, `structure.md`, `tech.md`
3. Carrega a spec referenciada
4. Executa a task com todo o contexto correto

```
┌─────────────────────────────────────────────┐
│              Sessão Claude                   │
│                                              │
│  CLAUDE.md          → Regras globais         │
│  memory-bank/*.md   → Contexto do projeto    │
│  spec/tasks.md      → O que fazer agora      │
│                                              │
│  Resultado: execução contextualizada e       │
│  consistente com todo o histórico            │
└─────────────────────────────────────────────┘
```

---

## O que NÃO colocar no Memory Bank

O Memory Bank é para contexto **estável e duradouro**:

| Coloque no Memory Bank | NÃO coloque |
|------------------------|-------------|
| Princípios arquiteturais | Detalhes de implementação de uma feature específica |
| Stack e versões | Código ou snippets |
| Regras de negócio permanentes | Status de tasks em andamento |
| Estrutura de pastas | Decisões temporárias |
| Convenções de código | Bugs e suas soluções |

---

[EXERCÍCIO 01-2]
Crie o Memory Bank do seu projeto atual:
1. `CLAUDE.md` com regras absolutas (mínimo 5 regras)
2. `memory-bank/product.md` com visão do produto
3. `memory-bank/structure.md` com a estrutura de pastas real
4. `memory-bank/tech.md` com a stack técnica completa

Tempo: 45 minutos

---

[Próxima Aula →](./03-workflow-sdd.md)
