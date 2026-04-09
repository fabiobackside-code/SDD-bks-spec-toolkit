# Tests: [Feature Name]

---

## 🧪 Estratégia 70/20/10

### Unit Tests (70%)
```csharp
[Fact]
public void Create_WithValidData_ReturnsEntity()
{
    // Arrange
    // Act
    // Assert
}
```

### Integration Tests (20%)
```csharp
[Fact]
public async Task Endpoint_WithValidData_Returns201()
{
    // Arrange
    // Act
    // Assert
}
```

### Architecture Tests (10%)
```csharp
[Fact]
public void Domain_ShouldNotDependOnAdapters()
{
    // ArchUnit validation
}
```

---

## ✅ Checklist

- [ ] Unit tests: 70%
- [ ] Integration tests: 20%
- [ ] Architecture tests: 10%
- [ ] Cobertura >= 80%
- [ ] Suite < 5min

