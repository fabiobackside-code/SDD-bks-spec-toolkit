# Tests: [Feature] — .NET Implementation

**Stack:** xUnit, Moq, Testcontainers, ArchUnit

---

## 🧪 Unit Tests (xUnit + Moq)

```csharp
public class [Entity]AggregateTests
{
    [Fact]
    public void Create_WithValidData_ReturnsEntity()
    {
        // Arrange
        var entity = [Entity].Create(/* args */);
        
        // Act & Assert
        Assert.NotNull(entity);
        Assert.Equal(expectedValue, entity.Property);
    }
}
```

---

## 🔗 Integration Tests (Testcontainers)

```csharp
public class [Repository]IntegrationTests : IAsyncLifetime
{
    private PostgreSqlContainer _container;
    
    public async Task InitializeAsync()
    {
        _container = new PostgreSqlBuilder().Build();
        await _container.StartAsync();
    }
    
    [Fact]
    public async Task Add_WithValidEntity_PersistsToDb()
    {
        // Test com BD real
    }
}
```

---

## 🏛️ Architecture Tests (ArchUnit)

```csharp
public class ArchitectureTests
{
    [Fact]
    public void Domain_ShouldNotDependOnAdapters()
    {
        var result = Classes
            .That().ResideInNamespace("*.Domain.*")
            .Should().NotDependOnAny("*.Adapters.*")
            .GetResult();
        
        Assert.True(result.IsSuccessful);
    }
}
```

