# Tasks: [Feature] — .NET Specific

---

## T-001 até T-012: Tarefas .NET Típicas

### T-001: Criar Aggregate [Entity]
- Path: src/Domain/Core/Aggregates/[Entity].cs
- Métodos: Create (factory), validações
- DoD: ✅ Aggregate com todas as regras de negócio

### T-002: Criar Port I[Repository]
- Path: src/Domain/Core/Ports/I[Repository].cs
- Métodos: GetByIdAsync, AddAsync, UpdateAsync
- DoD: ✅ Interface definida

### T-003: Implementar PostgreSql[Repository]
- Path: src/Adapters/Outbound/Persistence/PostgreSQL/
- Usar: Dapper para queries manuais
- DoD: ✅ Todos os métodos implementados

### T-004 até T-007: Pipeline Steps
- Path: src/Adapters/Inbound/Presentation/Handlers/
- Padrão: IStep interface
- DoD: ✅ Steps com Order explícita

### T-008: Endpoint [Entity]
- Path: src/Adapters/Inbound/Presentation/Endpoints/
- Padrão: Minimal APIs
- DoD: ✅ Endpoint completo com validação

### T-009 até T-012: Testes
- Unit: xUnit + Moq
- Integration: Testcontainers
- Architecture: ArchUnit
- DoD: ✅ Cobertura >=80%

