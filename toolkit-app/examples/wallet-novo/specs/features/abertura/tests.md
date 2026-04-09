# Tests: Abertura de Conta

**Fase 4 | Estratégia:** 70% Unit · 20% Integration · 10% Architecture

---

## Unit Tests (70%)

```csharp
// Wallet_Open_WithValidData_InitializesWithZeroBalance (CA-001, RF-003)
[Fact]
public void Open_ValidData_CreatesWalletWithZeroBalance()
{
    var wallet = Wallet.Open(new Email("joao@email.com"), PasswordHash.FromHash("$2a$..."), "João");
    wallet.Balance.Amount.Should().Be(0m);
    wallet.Balance.Currency.Should().Be("BRL");
    wallet.Id.Value.Should().NotBeEmpty();
}

// Wallet_Open_EmitsAccountOpenedEvent (RF-006)
[Fact]
public void Open_Valid_EmitsAccountOpenedEvent()
{
    var wallet = Wallet.Open(new Email("joao@email.com"), PasswordHash.FromHash("$2a$..."), "João");
    wallet.DomainEvents.Should().ContainSingle().Which.Should().BeOfType<AccountOpened>();
}

// Email_Uppercase_NormalizedToLowercase (RC-004)
[Fact]
public void Email_ConstructedWithUppercase_IsNormalizedToLowercase()
{
    var email = new Email("JOAO@EMAIL.COM");
    email.Value.Should().Be("joao@email.com");
}

// Email_Invalid_ThrowsDomainException
[Theory]
[InlineData("nao-e-email")]
[InlineData("")]
[InlineData("@semdominio")]
public void Email_InvalidFormat_ThrowsDomainException(string invalid)
{
    var act = () => new Email(invalid);
    act.Should().Throw<DomainException>();
}

// WalletId_New_GeneratesUniqueIds (RF-005)
[Fact]
public void WalletId_New_GeneratesTwoDistinctIds()
{
    var id1 = WalletId.New();
    var id2 = WalletId.New();
    id1.Should().NotBe(id2);
}

// OpenAccountValidationStep_WeakPassword_ReturnsValidationError (CA-004)
[Theory]
[InlineData("123")]       // curto demais
[InlineData("")]          // vazio
public async Task Validate_WeakPassword_ReturnsValidationFailure(string password)
{
    var transaction = new OpenAccountTransaction("corr", "joao@email.com", password, "João");
    var result = await _validationStep.ExecuteAsync(transaction, default);
    result.IsSuccess.Should().BeFalse();
    result.ErrorCode.Should().Be("VALIDATION_ERROR");
}
```

## Integration Tests (20%) — Testcontainers

```csharp
// POST /api/v1/accounts com dados válidos → 201 (CA-001)
[Fact]
public async Task OpenAccount_ValidData_Returns201WithLocation()
{
    var result = await _client.PostAsJsonAsync("/api/v1/accounts",
        new { email = "joao@email.com", password = "Senha@123", name = "João Silva" });

    result.StatusCode.Should().Be(HttpStatusCode.Created);
    result.Headers.Location.Should().NotBeNull();
    var body = await result.Content.ReadFromJsonAsync<OpenAccountResponse>();
    body!.Balance.Should().Be(0m);
    body.Email.Should().Be("joao@email.com");
}

// Email duplicado → 409 (CA-002)
[Fact]
public async Task OpenAccount_DuplicateEmail_Returns409Conflict()
{
    await _fixture.CreateWalletAsync(email: "joao@email.com");

    var result = await _client.PostAsJsonAsync("/api/v1/accounts",
        new { email = "joao@email.com", password = "Senha@123", name = "João" });

    result.StatusCode.Should().Be(HttpStatusCode.Conflict);
    var body = await result.Content.ReadFromJsonAsync<ErrorResponse>();
    body!.Error.Should().Be("EMAIL_ALREADY_EXISTS");
}

// Senha nunca em plain text no banco
[Fact]
public async Task OpenAccount_PasswordStoredAsHash_NotPlainText()
{
    await _client.PostAsJsonAsync("/api/v1/accounts",
        new { email = "joao@email.com", password = "Senha@123", name = "João" });

    var raw = await _fixture.GetRawPasswordAsync("joao@email.com");
    raw.Should().StartWith("$2a$"); // bcrypt hash
    raw.Should().NotBe("Senha@123");
}
```
