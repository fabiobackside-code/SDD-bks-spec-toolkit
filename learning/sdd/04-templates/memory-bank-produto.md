# Templates de Memory Bank

> INSTRUÇÕES: Copie os três arquivos abaixo para memory-bank/ do seu projeto.
> Preencha com informações reais. Estes arquivos são lidos pelo Claude em toda sessão.

---

## memory-bank/product.md

```markdown
# product.md — [Nome do Projeto]

## O que é
[Descrição objetiva do que o sistema faz em 2-4 frases.
Quem são os usuários? Qual problema resolve?]

## Usuários e Papéis
- **[Papel 1]:** [O que podem fazer]
- **[Papel 2]:** [O que podem fazer]
- **[Papel 3 — Admin]:** [O que podem fazer]

## Domínios de Negócio
1. **[Domínio Principal]** — [breve descrição]
2. **[Domínio 2]** — [breve descrição]
3. **[Domínio 3]** — [breve descrição]

## Restrições de Negócio
- [Restrição crítica 1 — ex: dados multi-tenant nunca se misturam]
- [Restrição de compliance — ex: LGPD, dados de pagamento PCI-DSS]
- [Restrição de SLA — ex: operações principais < 200ms p95]

## O que NÃO é este sistema
- [Exclusão explícita 1]
- [Exclusão explícita 2]
```

---

## memory-bank/structure.md

```markdown
# structure.md — Estrutura do Projeto

## Arquitetura
[Clean Architecture | Layered | Hexagonal | Modular Monolith | Microsserviços]

## Estrutura de Pastas

```
src/
├── [camada-1]/             ← [responsabilidade]
│   ├── [subcamada]/
│   └── [subcamada]/
├── [camada-2]/             ← [responsabilidade]
│   └── [subcamada]/
└── [camada-3]/             ← [responsabilidade]
    └── [subcamada]/

spec/                       ← Specs SDD por feature
memory-bank/                ← Contexto do projeto
test/
├── unit/                   ← Mesma estrutura de src/
└── integration/            ← Por domínio
```

## Convenções de Nomenclatura
- Arquivos: [kebab-case | snake_case | PascalCase]
- Classes: [PascalCase]
- Interfaces: [IPrefixo | sem prefixo]
- Testes: [FileName.spec.ts | FileNameTests.cs | FileNameTest.java]
- Tabelas BD: [snake_case | PascalCase]

## Onde Fica o Quê
- Regras de negócio: [src/domain/ | src/core/]
- Casos de uso: [src/application/use-cases/]
- Acesso a dados: [src/infrastructure/repositories/]
- Controllers/Adapters: [src/presentation/ | src/api/]
- DTOs: [src/application/dtos/ | ao lado dos controllers]
```

---

## memory-bank/tech.md

```markdown
# tech.md — Stack e Convenções Técnicas

## Runtime e Framework
- [Node.js 20 LTS + TypeScript 5.3 (strict: true)]
- [Java 21 + Spring Boot 3.2]
- [C# 12 + .NET 8 + ASP.NET Core]

## Banco de Dados
- [PostgreSQL 15 via TypeORM 0.3 | EF Core 8 | Hibernate 6]
- Migrações: [TypeORM migrations | EF Core migrations | Flyway]
- Nomenclatura BD: [snake_case | PascalCase]
- [NUNCA usar synchronize: true em produção]

## Cache
- [Redis 7 via ioredis | StackExchange.Redis | Lettuce]
- Padrões: [cache-aside para leituras, TTL em segundos]

## Autenticação
- [JWT com RS256 | HS256]
- Access token: [15min], Refresh token: [7 dias]
- [Biblioteca: passport-jwt | Microsoft.AspNetCore.Authentication.JwtBearer]

## Validação
- [class-validator + class-transformer (TypeScript)]
- [FluentValidation (C#)]
- [Jakarta Bean Validation (Java)]
- [NUNCA validação manual — sempre usar as bibliotecas acima]

## Padrão de Retorno (OBRIGATÓRIO)
[Descreva o padrão adotado pelo projeto para retorno de erros nos use cases]

Exemplo TypeScript:
```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

Exemplo C#:
```csharp
public record Result<T>(bool IsSuccess, T? Value, string? Error);
```

## Injeção de Dependência
- [NestJS DI nativo | ASP.NET Core DI | Spring IoC]
- Escopo: [Singleton para repositórios | Scoped para use cases]

## Testes
- [Jest + ts-jest + Supertest]
- [xUnit + Testcontainers + WebApplicationFactory]
- [JUnit 5 + Mockito + MockMvc + Testcontainers]
- Coverage mínima: [80% | 90%] (branches, lines, functions)
- Nomenclatura: [describe('NomeClasse') > it('deve fazer X quando Y')]

## Variáveis de Ambiente
- Carregadas via: [dotenv + @nestjs/config | appsettings.json | application.yml]
- Validadas no startup com schema Zod / FluentValidation / @Value annotations
- .env.example mantido atualizado (sem valores reais)

## Dependências Não Aprovadas (Não Adicionar)
- [Lista de libs que não devem ser adicionadas e por quê]
```
