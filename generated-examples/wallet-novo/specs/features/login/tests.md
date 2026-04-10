# Tests: Login

**Fase 4 | Estratégia:** 70% Unit · 20% Integration · 10% Architecture

---

## Unit Tests (70%)

```csharp
// PasswordHash_Verify_CorrectPassword_ReturnsTrue (RF-004)
[Fact]
public void PasswordHash_Verify_CorrectPlaintext_ReturnsTrue()
{
    var hash = PasswordHash.FromHash(BCrypt.Net.BCrypt.HashPassword("Senha@123", 12));
    hash.Verify("Senha@123").Should().BeTrue();
}

// PasswordHash_Verify_WrongPassword_ReturnsFalse
[Fact]
public void PasswordHash_Verify_WrongPassword_ReturnsFalse()
{
    var hash = PasswordHash.FromHash(BCrypt.Net.BCrypt.HashPassword("Senha@123", 12));
    hash.Verify("OutraSenha").Should().BeFalse();
}

// AuthProcessingStep_InvalidEmail_ReturnsSameErrorAsWrongPassword (CA-006)
[Fact]
public async Task Authenticate_NonExistentEmail_ReturnsInvalidCredentials()
{
    _walletRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<Email>(), default))
                   .ReturnsAsync((Wallet?)null);

    var result = await _step.ExecuteAsync(
        new AuthenticateTransaction("corr", "inexistente@email.com", "qualquer"), default);

    result.ErrorCode.Should().Be("INVALID_CREDENTIALS");
}

// AuthProcessingStep_WrongPassword_ReturnsSameError (CA-006)
[Fact]
public async Task Authenticate_WrongPassword_ReturnsInvalidCredentials()
{
    var wallet = WalletBuilder.WithPassword("Senha@123");
    _walletRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<Email>(), default))
                   .ReturnsAsync(wallet);

    var result = await _step.ExecuteAsync(
        new AuthenticateTransaction("corr", "joao@email.com", "SenhaErrada"), default);

    result.ErrorCode.Should().Be("INVALID_CREDENTIALS");
    // IMPORTANTE: não revela se o erro é email ou senha
}
```

## Integration Tests (20%)

```csharp
// Login com credenciais válidas → 200 + JWT (CA-005)
[Fact]
public async Task Login_ValidCredentials_Returns200WithTokens()
{
    await _fixture.CreateWalletAsync(email: "joao@email.com", password: "Senha@123");

    var result = await _client.PostAsJsonAsync("/api/v1/auth/login",
        new { email = "joao@email.com", password = "Senha@123" });

    result.StatusCode.Should().Be(HttpStatusCode.OK);
    var body = await result.Content.ReadFromJsonAsync<AuthResponse>();
    body!.AccessToken.Should().NotBeNullOrEmpty();
    body.ExpiresIn.Should().Be(3600);

    // Validar claims do JWT
    var jwt = new JwtSecurityTokenHandler().ReadJwtToken(body.AccessToken);
    jwt.Claims.Should().Contain(c => c.Type == "sub");
    jwt.Claims.Should().Contain(c => c.Type == "email" && c.Value == "joao@email.com");
}

// Credenciais inválidas → 401 mesmo para email inexistente (CA-006)
[Fact]
public async Task Login_NonExistentEmail_Returns401WithSameErrorAsWrongPassword()
{
    var result = await _client.PostAsJsonAsync("/api/v1/auth/login",
        new { email = "inexistente@email.com", password = "qualquer" });

    result.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    var body = await result.Content.ReadFromJsonAsync<ErrorResponse>();
    body!.Error.Should().Be("INVALID_CREDENTIALS");
    // Não menciona "email" ou "password" no erro
}
```
