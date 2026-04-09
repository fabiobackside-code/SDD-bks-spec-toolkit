# CLAUDE.md — [Nome do Projeto]

> INSTRUÇÕES: Este é um template. Substitua todos os [campos entre colchetes] com informações reais do seu projeto.
> Mantenha este arquivo conciso — Claude Code o lê em TODA sessão.

---

## Visão Geral
[Descrição em 1-3 frases do que é o projeto, a stack principal e o contexto de produção]

Exemplo: "API REST de gestão de pedidos para e-commerce B2B. Stack: NestJS + TypeScript + PostgreSQL + Redis. 50+ clientes em produção."

---

## Regras Absolutas (Claude NÃO pode violar)

1. [Regra de integridade de dados - ex: "NUNCA alterar migrations existentes"]
2. [Regra de segurança - ex: "NUNCA logar dados sensíveis (senhas, tokens, CPF)"]
3. [Regra de tipagem - ex: "NUNCA usar 'any' no TypeScript — apenas tipos explícitos ou 'unknown'"]
4. [Regra de testes - ex: "Testes são OBRIGATÓRIOS para toda nova feature"]
5. [Regra de dependências - ex: "NUNCA adicionar dependências sem confirmação explícita"]
6. [Regra de padrão arquitetural - ex: "SEMPRE usar Result<T, E> para retorno de use cases"]

---

## Stack e Versões

- Linguagem: [Node.js 20 + TypeScript 5.3 | Java 21 + Spring Boot 3 | C# 12 + .NET 8]
- Framework: [NestJS 10 | Express 4 | Spring Boot | ASP.NET Core]
- Banco: [PostgreSQL 15 via TypeORM | SQL Server via EF Core | MongoDB]
- Cache: [Redis 7 via ioredis | não utilizado]
- Testes: [Jest + Supertest | xUnit + Testcontainers | JUnit + MockMvc]

---

## Referência ao Memory Bank

- Contexto do produto: [./memory-bank/product.md]
- Estrutura do código: [./memory-bank/structure.md]
- Detalhes técnicos: [./memory-bank/tech.md]

---

## Specs Ativas

- [Em andamento] [Nome da Feature]: [./spec/feature-name/]
- [Pendente] [Próxima Feature]: [./spec/next-feature/]

---

## Convenções de Nomenclatura

- [ex: "Arquivos: kebab-case (create-user.use-case.ts)"]
- [ex: "Classes: PascalCase (CreateUserUseCase)"]
- [ex: "Tabelas BD: snake_case (user_profiles)"]
- [ex: "Variáveis de ambiente: SCREAMING_SNAKE_CASE"]
