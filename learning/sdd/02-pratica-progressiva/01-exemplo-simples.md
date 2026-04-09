# Exemplo Simples: CRUD de Tarefas (Todo API)

> Módulo 02 · Exemplo 1 · Tempo estimado: 40min
> Stack: Node.js + TypeScript + Express + SQLite
> Nível: Iniciante em SDD

---

## Objetivo

Aplicar o workflow SDD completo em um problema simples. Ao final deste exemplo, você terá:
- Um CLAUDE.md básico
- Uma spec completa (requirements + design + tasks)
- Uma API funcional gerada pelo Claude Code

---

## O Problema

Criar uma API REST de gerenciamento de tarefas pessoais (Todo List).
É simples o suficiente para focar no **processo SDD**, não na complexidade técnica.

---

## Passo 1: Setup do Projeto

```bash
mkdir todo-api && cd todo-api
npm init -y
npm install express typescript ts-node @types/node @types/express sqlite3 better-sqlite3
npm install -D jest ts-jest @types/jest supertest @types/supertest
npx tsc --init
```

---

## Passo 2: Criar o Memory Bank

### CLAUDE.md

```markdown
# CLAUDE.md — Todo API

## Visão Geral
API REST simples para gerenciamento de tarefas pessoais.
Stack: Node.js + TypeScript + Express + SQLite.
Projeto de aprendizado SDD — simplicidade é prioridade.

## Regras Absolutas
1. NUNCA alterar o schema do banco diretamente — apenas via migrations/
2. NUNCA usar `any` no TypeScript
3. Testes são obrigatórios para cada endpoint
4. Respostas de erro sempre no formato: {error: string, details?: string[]}

## Estrutura
- src/routes/     → Controllers (Express Router)
- src/services/   → Lógica de negócio
- src/repository/ → Acesso ao banco
- src/database/   → Conexão e migrations
- test/           → Testes

## Stack
- Express 4 com TypeScript strict
- SQLite via better-sqlite3 (síncrono, simples)
- Jest + Supertest para testes
- Sem ORM — SQL puro com tipagem TypeScript
```

---

## Passo 3: Escrever os Requirements

### spec/todo/requirements.md

```markdown
# Spec: Gerenciamento de Tarefas (Todo CRUD)
Versão: 1.0 | Data: 2024-01-15

## Contexto
API para usuário único gerenciar sua lista de tarefas pessoais.
Não há autenticação nesta versão (versão educacional).

## Requisitos Funcionais

RF-001: O sistema DEVE criar tarefas via POST /tasks
RF-002: O sistema DEVE listar todas as tarefas via GET /tasks
RF-003: O sistema DEVE buscar uma tarefa por ID via GET /tasks/:id
RF-004: O sistema DEVE atualizar tarefas via PUT /tasks/:id
RF-005: O sistema DEVE excluir tarefas via DELETE /tasks/:id
RF-006: O sistema DEVE filtrar tarefas por status via GET /tasks?status=pending|done
RF-007: Uma tarefa DEVE conter: id, title, description (opcional), status, createdAt, updatedAt
RF-008: O status DEVE ser apenas "pending" ou "done"
RF-009: O title NÃO DEVE ser vazio ou ter mais de 100 caracteres
RF-010: O sistema DEVE retornar 404 para tarefas inexistentes

## Restrições Técnicas

RC-001: Usar SQLite via better-sqlite3 (sem ORMs)
RC-002: Respostas de lista devem ser ordenadas por createdAt DESC
RC-003: IDs são inteiros auto-incrementados (não UUID)

## Critérios de Aceite

CA-001: POST /tasks {title: "Estudar SDD"} → 201 {id: 1, title: "Estudar SDD", status: "pending", ...}
CA-002: POST /tasks {title: ""} → 400 {error: "Validação falhou", details: ["title não pode ser vazio"]}
CA-003: GET /tasks → 200 [{...}, {...}] (array, pode ser vazio)
CA-004: GET /tasks/1 → 200 {id: 1, ...}
CA-005: GET /tasks/999 → 404 {error: "Tarefa não encontrada"}
CA-006: PUT /tasks/1 {status: "done"} → 200 {id: 1, status: "done", updatedAt: "novo timestamp"}
CA-007: DELETE /tasks/1 → 204 (sem body)
CA-008: GET /tasks?status=pending → 200 [apenas tarefas com status pending]
CA-009: POST /tasks {title: string com 101 chars} → 400 {error: "Validação falhou", details: ["..."]}

## Fora de Escopo
- Autenticação/autorização
- Paginação (versão futura)
- Tags/categorias (versão futura)
- Múltiplos usuários
```

---

## Passo 4: Escrever o Design

### spec/todo/design.md

```markdown
# Design: Gerenciamento de Tarefas

## Componentes

- **taskRoutes** (src/routes/task.routes.ts)
  - Express Router com os 5 endpoints
  - Responsável por: validação de entrada, chamada ao service, formatação da resposta

- **TaskService** (src/services/task.service.ts)
  - Lógica de negócio: validações, regras de status
  - Depende de: TaskRepository

- **TaskRepository** (src/repository/task.repository.ts)
  - Acesso ao banco SQLite
  - SQL puro com tipagem TypeScript

- **db** (src/database/connection.ts)
  - Singleton da conexão SQLite

- **migration.ts** (src/database/migration.ts)
  - Cria a tabela tasks no startup

## Modelo de Dados

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'done')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## Tipos TypeScript

```typescript
type TaskStatus = 'pending' | 'done';

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

interface CreateTaskDTO {
  title: string;
  description?: string;
}

interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
```

## Fluxo de Dados

```
POST /tasks
  → taskRoutes: valida body (title obrigatório, maxLength 100)
  → TaskService.create(dto): sem lógica adicional neste caso
  → TaskRepository.create(dto): INSERT INTO tasks...
  → return Task

GET /tasks?status=pending
  → taskRoutes: extrai query param status
  → TaskService.findAll(filter): sem lógica adicional
  → TaskRepository.findAll(filter): SELECT... WHERE status = ?
  → return Task[]
```

## Tratamento de Erros

| Situação | HTTP | Resposta |
|----------|------|----------|
| Validação falhou | 400 | {error: "Validação falhou", details: string[]} |
| Tarefa não encontrada | 404 | {error: "Tarefa não encontrada"} |
| Erro interno | 500 | {error: "Erro interno do servidor"} |

## Estratégia de Testes

- **Integração:** testes com app Express real + SQLite em memória (:memory:)
- Um arquivo de teste por endpoint: task-create.spec.ts, task-list.spec.ts, etc.
- Cada teste cobre os critérios de aceite do requirements.md
```

---

## Passo 5: Escrever as Tasks

### spec/todo/tasks.md

```markdown
# Tasks: Gerenciamento de Tarefas

## Pré-condições
- Projeto Node.js inicializado com TypeScript
- Dependências instaladas (express, better-sqlite3, jest, supertest)

## Tarefas

- [ ] T-001: Criar conexão SQLite e migration de criação da tabela tasks
  - Arquivos: src/database/connection.ts, src/database/migration.ts
  - Referência: RC-001, modelo de dados do design.md

- [ ] T-002: Criar TaskRepository com métodos: create, findAll, findById, update, delete
  - Arquivo: src/repository/task.repository.ts
  - Referência: RF-001 a RF-010, RC-002, RC-003

- [ ] T-003: Criar TaskService com validações de entrada
  - Arquivo: src/services/task.service.ts
  - Validações: title obrigatório (RF-009), status válido (RF-008)
  - Referência: RF-007, RF-008, RF-009

- [ ] T-004: Criar taskRoutes com os 5 endpoints REST
  - Arquivo: src/routes/task.routes.ts
  - Referência: RF-001 a RF-006, CA-001 a CA-009

- [ ] T-005: Criar app.ts e server.ts (entry point)
  - Arquivos: src/app.ts, src/server.ts
  - Executar migration no startup

- [ ] T-006: Escrever testes de integração cobrindo todos os critérios de aceite
  - Arquivo: test/tasks.spec.ts
  - Cobrir: CA-001 a CA-009

## Definição de Pronto
- [ ] Todos os 9 critérios de aceite passam nos testes
- [ ] TypeScript compila sem erros (npx tsc --noEmit)
- [ ] Nenhum `any` no código TypeScript
```

---

## Passo 6: Executar com Claude Code

```bash
# Navegar para o diretório do projeto
cd todo-api

# Executar as tasks em sequência
claude "Execute as tasks T-001 a T-005 de spec/todo/tasks.md em sequência,
seguindo spec/todo/requirements.md e spec/todo/design.md.
Após cada task, aguarde minha aprovação.
Siga as regras de CLAUDE.md — especialmente: sem 'any', erros no formato correto."
```

### O que você vai ver

O Claude vai criar os arquivos em ordem:
1. `src/database/connection.ts` e `migration.ts`
2. `src/repository/task.repository.ts`
3. `src/services/task.service.ts`
4. `src/routes/task.routes.ts`
5. `src/app.ts` e `src/server.ts`

Depois execute T-006 separadamente para os testes:

```bash
claude "Execute T-006 de spec/todo/tasks.md.
Os testes devem cobrir todos os 9 critérios de aceite do requirements.md."
```

---

## Verificação Final

```bash
npx tsc --noEmit     # Deve compilar sem erros
npm test             # Todos os testes devem passar
```

```bash
# Testar manualmente
npm start
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Estudar SDD"}'
# → 201 Created com a tarefa criada

curl http://localhost:3000/tasks
# → 200 com array de tarefas

curl http://localhost:3000/tasks?status=pending
# → 200 com apenas tarefas pendentes
```

---

## Variante .NET (Minimal API + EF Core)

O mesmo exemplo com .NET. Apenas o `CLAUDE.md` e o `tech.md` mudam — **requirements.md e design.md são idênticos** (agnósticos de linguagem).

```markdown
# CLAUDE.md — Todo API (.NET)
Stack: .NET 8 + ASP.NET Core Minimal API + SQLite via EF Core.
1. NUNCA alterar Migrations existentes
2. NUNCA usar string SQL manual — apenas EF Core LINQ
3. Testes obrigatórios: xUnit + WebApplicationFactory
```

```
# Tasks .NET — diferenças em relação ao Node.js:
T-001: Criar TodoContext (DbContext) + Migration inicial
       Arquivo: src/Data/TodoContext.cs
T-002: Criar TaskRepository com EF Core (IQueryable, async/await)
T-003: Criar TaskService com FluentValidation
T-004: Criar endpoints Minimal API em Program.cs (MapGet, MapPost, MapPut, MapDelete)
T-005: Escrever testes com WebApplicationFactory + SQLite InMemory
```

Prompt para o Claude:
```
"Execute T-001 de spec/todo/tasks.md adaptando para .NET 8 conforme CLAUDE.md.
Use Minimal API (não controllers), EF Core com SQLite, FluentValidation para RF-009.
Siga a estrutura de design.md — apenas a implementação muda, não o comportamento."
```

---

## Lições Deste Exemplo

1. **A spec tomou ~30min** mas eliminou toda ambiguidade antes do código
2. **O Claude seguiu as convenções** porque estavam explícitas no CLAUDE.md
3. **Os testes derivam dos critérios de aceite** — não são inventados depois
4. **O resultado é auditável**: qualquer dev lê requirements.md e entende o sistema

---

[Próximo Exemplo →](./02-exemplo-medio.md)
