# Hexagonal Architecture (Ports & Adapters)

**Padrão agnóstico que mantém Domain isolado de infraestrutura**

---

## 🏗️ Estrutura

```
        User Interface (Web, CLI, API)
                ↓
        ┌─────────────────┐
        │    Adapters     │  ← Inbound: Controllers, Endpoints
        │    (Inbound)    │
        └────────┬────────┘
                 │
        ┌─────────────────┐
        │ Ports (Interface)│  ← IUserRepository, IAuthService
        └────────┬────────┘
                 │
        ┌─────────────────┐
        │     Domain      │  ← User (Aggregate), Email (Value Object)
        │  (Business      │  ← ISOLADO, sem dependências externas
        │   Logic)        │
        └────────┬────────┘
                 │
        ┌─────────────────┐
        │ Ports (Interface)│  ← IUserRepository (saída)
        └────────┬────────┘
                 │
        ┌─────────────────┐
        │    Adapters     │  ← Outbound: PostgreSQL, Redis, APIs
        │   (Outbound)    │
        └─────────────────┘
                 │
        Database, Cache, External APIs
```

---

## 📦 Componentes

### Domain (Núcleo)
```csharp
public class User : AggregateRoot
{
    public Guid Id { get; private set; }
    public Email Email { get; private set; }
    public string FullName { get; private set; }
    
    public static User Create(Email email, string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            throw new DomainException("FullName required");
        
        return new User { Id = Guid.NewGuid(), Email = email, FullName = fullName };
    }
}
```

**Características:**
- ✅ Lógica de negócio pura
- ✅ Sem dependências de BD, APIs, etc
- ✅ Testável isoladamente
- ✅ Reutilizável

### Port (Interface)
```csharp
public interface IUserRepository
{
    Task<User> GetByIdAsync(Guid id);
    Task AddAsync(User user);
    Task UpdateAsync(User user);
}
```

**Características:**
- ✅ Contrato de comunicação
- ✅ Agnóstico (não sabe se é BD ou cache)
- ✅ Facilita testes com mocks

### Adapter (Implementação)
```csharp
public class PostgreSqlUserRepository : IUserRepository
{
    private readonly IDbConnection _connection;

    public async Task<User> GetByIdAsync(Guid id)
    {
        const string sql = "SELECT * FROM users WHERE id = @id";
        var row = await _connection.QuerySingleOrDefaultAsync(sql, new { id });
        return row != null ? MapToUser(row) : null;
    }

    public async Task AddAsync(User user)
    {
        const string sql = @"
            INSERT INTO users (id, email, full_name) 
            VALUES (@id, @email, @fullName)";
        
        await _connection.ExecuteAsync(sql, new 
        { 
            user.Id, 
            email = user.Email.Value, 
            fullName = user.FullName 
        });
    }
}
```

**Características:**
- ✅ Implementação específica (Dapper, EF Core, MongoDB)
- ✅ Conhece detalhes de BD
- ✅ Fácil trocar (PostgreSQL → MongoDB)

---

## 🔄 Fluxo: Criar Usuário

```
POST /api/v1/users
  │
  ├─ Adapter (Inbound)
  │  └─ UserController.Create(request)
  │
  ├─ Port (IUserRepository)
  │  └─ Interface abstrata
  │
  ├─ Domain
  │  └─ User.Create(email, fullName) ← Lógica pura
  │
  ├─ Adapter (Outbound)
  │  └─ PostgreSqlUserRepository.AddAsync(user) ← BD específica
  │
  └─ 201 Created com novo usuário
```

---

## ✅ Benefícios

| Aspecto | Benefício |
|---------|-----------|
| **Testabilidade** | Domain testado sem BD |
| **Flexibilidade** | Trocar PostgreSQL ↔ MongoDB |
| **Clareza** | Domain separado de infraestrutura |
| **Reusabilidade** | Domain reutilizável em CLIs, APIs, etc |
| **Manutenção** | Mudanças em BD não afetam lógica |

---

## 🚫 Anti-padrão: Camadas Tradicionais

```
❌ Ruim (Onion):
Layer 1: Controllers (REST)
  ├─ Services (BD acesso)
  │   ├─ Repositories
  │   └─ Direct BD queries
  └─ Tudo entrelinha

❌ Problema:
- Services fazem tudo (God Class)
- BD acoplado à lógica
- Difícil testar sem BD
- Difícil trocar BD

✅ Bom (Hexagonal):
Domain (puro)
  ├─ Port (IUserRepository)
  │   └─ Adapter (PostgreSql)
  └─ Port (IEmailService)
      └─ Adapter (SendGrid)

✅ Benefício:
- Domain isolado
- Fácil trocar implementações
- Testável e claro
```

---

## 📋 Checklist Hexagonal

- [ ] Domain sem imports de externa
- [ ] Ports (interfaces) definidas
- [ ] Adapters implementam ports
- [ ] Dependency Injection configurado
- [ ] Testes unit sem BD
- [ ] Testes integration com BD real

---

**Próximo:** Aprenda `ddd.md` (modelagem do Domain)

