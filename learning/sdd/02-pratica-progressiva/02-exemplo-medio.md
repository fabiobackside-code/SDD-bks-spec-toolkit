# Exemplo Médio: API de Gestão de Projetos

> Módulo 02 · Exemplo 2 · Tempo estimado: 60min
> Stack: NestJS + TypeScript + PostgreSQL + JWT
> Nível: Intermediário em SDD

---

## Objetivo

Aplicar SDD em um sistema com:
- Múltiplos domínios (usuários + projetos + membros)
- Autenticação JWT
- Controle de acesso por papel (RBAC)
- Relações entre entidades

Este exemplo apresenta specs mais sofisticadas com **specs encadeadas** e **specs que dependem de outras**.

---

## A Feature

Sistema de gestão de projetos onde:
- Usuários podem criar projetos
- Projetos têm membros com papéis (owner, admin, member)
- Apenas owners e admins podem adicionar/remover membros
- Qualquer membro pode criar tarefas no projeto

---

## Técnica: Specs Encadeadas

Em sistemas reais, features dependem de outras. O SDD lida com isso usando **referências entre specs**:

```
spec/
├── auth/                    ← Spec base (autenticação)
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
│
├── projects/                ← Depende de auth/
│   ├── requirements.md      ← Referencia auth/requirements.md
│   ├── design.md
│   └── tasks.md
│
└── project-members/         ← Depende de auth/ e projects/
    ├── requirements.md
    ├── design.md
    └── tasks.md
```

No requirements.md de cada spec, declare as dependências:

```markdown
## Dependências de Specs
- auth/requirements.md: usuário deve estar autenticado (JWT válido)
- projects/requirements.md: projeto deve existir e o usuário ser membro
```

---

## Spec: Criação e Gestão de Projetos

### spec/projects/requirements.md

```markdown
# Spec: Gestão de Projetos
Versão: 1.0 | Data: 2024-01-15

## Dependências de Specs
- auth/requirements.md: todos os endpoints requerem JWT válido no header Authorization

## Contexto
Usuários autenticados podem criar projetos e convidar membros.
Cada projeto tem um ciclo de vida: ativo → arquivado.

## Requisitos Funcionais

RF-001: O sistema DEVE criar projetos via POST /api/v1/projects
RF-002: Um projeto DEVE conter: id, name, description, status, ownerId, createdAt
RF-003: O status DEVE ser "active" ou "archived"
RF-004: O usuário que cria o projeto DEVE ser automaticamente o owner (papel "owner")
RF-005: O sistema DEVE listar os projetos do usuário via GET /api/v1/projects
RF-006: GET /api/v1/projects DEVE retornar apenas projetos onde o usuário é membro
RF-007: O sistema DEVE buscar um projeto por ID via GET /api/v1/projects/:id
RF-008: Apenas membros do projeto DEVEM poder visualizar seus dados (RF-010)
RF-009: O sistema DEVE arquivar projetos via PATCH /api/v1/projects/:id/archive
RF-010: Apenas o owner DEVE poder arquivar o projeto
RF-011: O name NÃO DEVE ser vazio e NÃO DEVE ter mais de 100 caracteres
RF-012: O sistema NÃO DEVE excluir projetos — apenas arquivar

## Restrições Técnicas

RC-001: PostgreSQL via TypeORM, entidades mapeadas como classes
RC-002: Usuário extraído do JWT (não recebido no body)
RC-003: Soft delete via status "archived" (sem DELETE no banco)
RC-004: Paginação: GET /projects aceita ?page=1&limit=20

## Critérios de Aceite

DADO usuário autenticado com JWT válido
QUANDO POST /api/v1/projects {name: "Meu Projeto", description: "..."}
ENTÃO 201 com {id, name, description, status: "active", ownerId: <userId>, createdAt}

DADO usuário autenticado que não é membro do projeto
QUANDO GET /api/v1/projects/:id
ENTÃO 403 Forbidden

DADO usuário com papel "member" (não owner)
QUANDO PATCH /api/v1/projects/:id/archive
ENTÃO 403 Forbidden com {error: "Apenas o owner pode arquivar o projeto"}

DADO owner do projeto
QUANDO PATCH /api/v1/projects/:id/archive
ENTÃO 200 com {id, status: "archived", updatedAt}

## Fora de Escopo
- Exclusão permanente de projetos
- Transferência de ownership (spec futura)
- Upload de arquivos no projeto (spec futura)
- Notificações (spec futura)
```

### spec/projects/design.md

```markdown
# Design: Gestão de Projetos

## Arquitetura: Clean Architecture com NestJS

## Módulo NestJS
- ProjectsModule importa AuthModule (para guard JWT)

## Componentes

- **ProjectsController** (src/projects/projects.controller.ts)
  - Guards: JwtAuthGuard (todos), ProjectMemberGuard (RF-008), ProjectOwnerGuard (RF-010)

- **CreateProjectUseCase** (src/projects/use-cases/create-project.use-case.ts)
  - Input: {name, description, userId}
  - Output: Result<ProjectDto, CreateProjectError>

- **GetUserProjectsUseCase** (src/projects/use-cases/get-user-projects.use-case.ts)
  - Input: {userId, page, limit}
  - Output: Result<PaginatedResult<ProjectDto>, never>

- **ArchiveProjectUseCase** (src/projects/use-cases/archive-project.use-case.ts)
  - Input: {projectId, requestingUserId}
  - Output: Result<ProjectDto, ArchiveProjectError>

- **ProjectRepository** (src/projects/repositories/project.repository.interface.ts)

- **ProjectMemberRepository** (src/projects/repositories/project-member.repository.interface.ts)

## Entidades TypeORM

```typescript
@Entity('projects')
class ProjectEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ nullable: true }) description: string;
  @Column({ default: 'active' }) status: 'active' | 'archived';
  @Column() ownerId: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  @OneToMany(() => ProjectMemberEntity, m => m.project)
  members: ProjectMemberEntity[];
}

@Entity('project_members')
class ProjectMemberEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() projectId: string;
  @Column() userId: string;
  @Column({ default: 'member' }) role: 'owner' | 'admin' | 'member';
  @CreateDateColumn() joinedAt: Date;

  @ManyToOne(() => ProjectEntity) project: ProjectEntity;
}
```

## Guards de Autorização

```typescript
// ProjectMemberGuard: verifica se usuário é membro do projeto
// Injetado em: GET /projects/:id, PATCH /projects/:id/archive
// Como: lê projectId do req.params, userId do req.user.id
//       busca ProjectMemberRepository.findByProjectAndUser()

// ProjectOwnerGuard: verifica se usuário é owner
// Injetado em: PATCH /projects/:id/archive
```

## Tipos de Erro

```typescript
type CreateProjectError = 'INVALID_NAME';
type ArchiveProjectError = 'NOT_OWNER' | 'PROJECT_NOT_FOUND' | 'ALREADY_ARCHIVED';
```

## Estratégia de Testes

- **Unitário:** cada use case com mocks dos repositórios
- **Integração:** endpoints com banco PostgreSQL de teste
- **Guard:** testar ProjectMemberGuard e ProjectOwnerGuard separadamente
```

---

## Técnica Avançada: Prompt Encadeado

Quando a feature depende de outra spec já implementada, use este prompt:

```
claude "Implemente T-001 de spec/projects/tasks.md.

Contexto adicional:
- A autenticação (JWT) está implementada conforme spec/auth/
- O JwtAuthGuard já existe em src/auth/guards/jwt-auth.guard.ts
- O tipo AuthUser (extraído do JWT) está em src/auth/types/auth-user.type.ts

Não reimplemente a autenticação — apenas use o guard existente."
```

---

## Spec: Gerenciamento de Membros (Encadeada)

### spec/project-members/requirements.md (parcial)

```markdown
# Spec: Membros de Projeto
Versão: 1.0

## Dependências de Specs
- auth/requirements.md: todos os endpoints requerem JWT válido
- projects/requirements.md: projeto deve existir; usuário deve ser membro

## Requisitos Funcionais

RF-001: O sistema DEVE adicionar membros via POST /api/v1/projects/:id/members
RF-002: Apenas owner ou admin DEVEM poder adicionar membros
RF-003: O membro adicionado DEVE receber papel "member" por padrão
RF-004: Owner e admin PODEM especificar papel: "admin" ou "member"
RF-005: O sistema NÃO DEVE permitir adicionar o próprio owner como membro (já é owner)
RF-006: O sistema DEVE listar membros via GET /api/v1/projects/:id/members
RF-007: Qualquer membro DEVE poder listar outros membros do mesmo projeto
RF-008: O sistema DEVE remover membros via DELETE /api/v1/projects/:id/members/:userId
RF-009: Apenas owner ou admin DEVEM poder remover membros
RF-010: Owner NÃO DEVE poder ser removido (use PATCH /archive para encerrar o projeto)
```

---

## Lições Deste Exemplo

### 1. Specs Encadeadas vs. Specs Monolíticas

Evite colocar tudo em uma spec gigante. Quebre por domínio:
- `auth/` → autenticação
- `projects/` → CRUD de projetos
- `project-members/` → membros

### 2. Guards como Parte da Spec

A autorização (quem pode fazer o quê) deve estar nos **requirements**, não apenas no código. Isso evita que o Claude omita verificações de segurança.

```markdown
# BOM no requirements.md:
RF-010: Apenas o owner DEVE poder arquivar o projeto

# Ruim (deixar implícito):
"O sistema deve ter controle de acesso adequado"
```

### 3. Tipos de Erro Explícitos no Design

```typescript
// No design.md, defina os tipos de erro explicitamente:
type ArchiveProjectError = 'NOT_OWNER' | 'PROJECT_NOT_FOUND' | 'ALREADY_ARCHIVED';
```

Isso força o Claude a tratar cada caso de erro, não apenas o caminho feliz.

### 4. O Guard como Pré-condição das Tasks

```markdown
# tasks.md
- [ ] T-001: Criar ProjectEntity e ProjectMemberEntity (TypeORM)
- [ ] T-002: Criar ProjectRepository e ProjectMemberRepository (interfaces + implementações)
- [ ] T-003: Implementar CreateProjectUseCase
- [ ] T-004: Implementar ProjectMemberGuard        ← Antes dos controllers
- [ ] T-005: Implementar ProjectOwnerGuard          ← Antes dos controllers
- [ ] T-006: Implementar ProjectsController com guards
```

---

## Variante .NET — Gestão de Projetos

Mesmos requirements.md e design.md. Somente tech.md e tasks mudam:

```markdown
# tech.md (adições para .NET)
- ASP.NET Core 8 com Controllers (não Minimal API — projeto médio justifica)
- Entity Framework Core 8 + PostgreSQL (Npgsql.EntityFrameworkCore.PostgreSQL)
- JWT: Microsoft.AspNetCore.Authentication.JwtBearer
- Validação: FluentValidation (não DataAnnotations)
- Testes: xUnit + Testcontainers.PostgreSql + WebApplicationFactory
- Autorização: Policy-based (não attribute-based puro)
```

**Guards → Policies .NET:**

O `ProjectMemberGuard` do NestJS vira uma `IAuthorizationRequirement`:

```csharp
// Equivalente ao ProjectMemberGuard
public class ProjectMemberRequirement : IAuthorizationRequirement { }

public class ProjectMemberHandler : AuthorizationHandler<ProjectMemberRequirement>
{
    // Injeta IProjectMemberRepository, verifica se userId é membro do projectId
}
```

No CLAUDE.md, adicione:
```
- SEMPRE usar Result<T> (OneOf ou FluentResults) para retorno de use cases — nunca throw em domínio
- Guards de autorização são Policies registradas no Program.cs, não atributos inline
```

---

[Próximo Exemplo →](./03-exemplo-complexo.md)
