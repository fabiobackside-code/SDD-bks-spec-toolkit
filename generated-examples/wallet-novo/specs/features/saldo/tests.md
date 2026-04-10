# Tests: Consulta de Saldo

**Fase 4 | Estratégia:** 70% Unit · 20% Integration · 10% Architecture

---

## Unit Tests (70%)

```csharp
// GetBalanceStep_OtherUserId_ReturnsForbidden (RF-017, CA-009)
[Fact]
public async Task GetBalance_RequestingUserIsNotOwner_ReturnsForbidden()
{
    var walletId = WalletId.New();
    var transaction = new GetBalanceTransaction("corr", walletId, RequestingUserId: "outro-user-id");

    var result = await _step.ExecuteAsync(transaction, default);

    result.IsSuccess.Should().BeFalse();
    result.ErrorCode.Should().Be("ACCESS_DENIED");
}

// GetBalanceStep_AccountNotFound_ReturnsNotFound (CA-009b)
[Fact]
public async Task GetBalance_AccountNotFound_ReturnsNotFound()
{
    var walletId = WalletId.New();
    _readRepoMock.Setup(r => r.GetBalanceAsync(walletId, default))
                 .ReturnsAsync((WalletBalanceDto?)null);

    var transaction = new GetBalanceTransaction("corr", walletId,
        RequestingUserId: walletId.Value.ToString());

    var result = await _step.ExecuteAsync(transaction, default);
    result.ErrorCode.Should().Be("ACCOUNT_NOT_FOUND");
}
```

## Integration Tests (20%)

```csharp
// Saldo após transferência reflete valor correto (RF-016, CA-008)
[Fact]
public async Task GetBalance_AfterTransfer_ReflectsUpdatedBalance()
{
    var account = await _fixture.CreateWalletAsync(balance: 100m);
    var target = await _fixture.CreateWalletAsync(balance: 0m);

    // Executar transferência
    await _client.PostAsJsonAsync($"/api/v1/accounts/{account.Id}/transfer",
        new { targetAccountId = target.Id, amount = 30m });

    // Consultar saldo
    var result = await _client.GetAsync($"/api/v1/accounts/{account.Id}/balance");
    result.StatusCode.Should().Be(HttpStatusCode.OK);
    var body = await result.Content.ReadFromJsonAsync<BalanceResponse>();
    body!.Balance.Should().Be(70m); // read-after-write
}

// Acesso negado a conta de outro usuário (CA-009)
[Fact]
public async Task GetBalance_OtherUserAccount_Returns403()
{
    var account = await _fixture.CreateWalletAsync();
    var other = await _fixture.CreateWalletAsync();

    // Autenticar como 'account', tentar ver saldo de 'other'
    _client.DefaultRequestHeaders.Authorization = new("Bearer",
        await _fixture.GetTokenAsync(account.Id));

    var result = await _client.GetAsync($"/api/v1/accounts/{other.Id}/balance");
    result.StatusCode.Should().Be(HttpStatusCode.Forbidden);
}
```
