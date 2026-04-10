# Design: [Feature] — .NET Implementation

**Stack:** .NET 8+, PostgreSQL, Dapper

---

## 📁 Folder Structure

```
src/
├─ Domain/Core/
│  ├─ Aggregates/[Entity].cs
│  ├─ Entities/[Entity].cs
│  ├─ ValueObjects/[ValueObject].cs
│  └─ Ports/
│     ├─ I[Repository].cs
│     └─ I[Service].cs
│
├─ Adapters/
│  ├─ Inbound/Presentation/Endpoints/[Entity]Endpoints.cs
│  └─ Outbound/Persistence/PostgreSQL/PostgreSql[Repository].cs
│
└─ Infrastructure/
   └─ DependencyInjection/ServiceCollectionExtensions.cs
```

---

## 💻 Code Examples

### Aggregate Root
```csharp
public class [Entity] : AggregateRoot
{
    public Guid Id { get; private set; }
    
    public static [Entity] Create(/* params */)
    {
        // Validation
        // Creation
    }
}
```

### Port (Interface)
```csharp
public interface I[Repository]
{
    Task<[Entity]> GetByIdAsync(Guid id);
    Task AddAsync([Entity] entity);
}
```

### Adapter (Repository)
```csharp
public class PostgreSql[Repository] : I[Repository]
{
    public async Task<[Entity]> GetByIdAsync(Guid id)
    {
        const string sql = "SELECT * FROM [table] WHERE id = @id";
        // Dapper query
    }
}
```

---

## 🔧 DI Setup (Program.cs)

```csharp
builder.Services
    .AddScoped<I[Repository], PostgreSql[Repository]>()
    .AddScoped<I[Service], [Service]>();
```

