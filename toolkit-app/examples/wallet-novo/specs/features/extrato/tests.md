# Tests: Extrato

**Fase 4 | Estratégia:** 70% Unit · 20% Integration · 10% Architecture

---

## Unit Tests (70%)

```csharp
// Período inválido (from > to) → 422 (RF-033)
[Fact]
public async Task GetStatement_FromAfterTo_Returns422()
{
    var transaction = new GetStatementTransaction("corr", WalletId.New(),
        RequestingUserId: "owner", Cursor: null,
        From: new DateOnly(2026, 2, 1), To: new DateOnly(2026, 1, 1), PageSize: 20);

    var result = await _step.ExecuteAsync(transaction, default);
    result.ErrorCode.Should().Be("INVALID_DATE_RANGE");
}

// PageSize > 100 → normalizado para 100
[Fact]
public async Task GetStatement_PageSizeOver100_NormalizedTo100()
{
    var captor = new StatementReadRepositoryCaptor();
    var step = new GetStatementProcessingStep(captor, ...);

    var transaction = new GetStatementTransaction("corr", _walletId,
        RequestingUserId: _walletId.ToString(), PageSize: 999);
    await step.ExecuteAsync(transaction, default);

    captor.CapturedPageSize.Should().Be(100);
}

// Acesso negado (RF-034, CA-018)
[Fact]
public async Task GetStatement_OtherUser_ReturnsForbidden()
{
    var transaction = new GetStatementTransaction("corr", WalletId.New(),
        RequestingUserId: "outro-user", PageSize: 20);
    var result = await _step.ExecuteAsync(transaction, default);
    result.ErrorCode.Should().Be("ACCESS_DENIED");
}
```

## Integration Tests (20%)

```csharp
// Extrato com lançamentos em ordem decrescente (CA-016)
[Fact]
public async Task GetStatement_WithTransactions_ReturnsChronologicallyDescending()
{
    var account = await _fixture.CreateWalletAsync(balance: 200m);
    var target = await _fixture.CreateWalletAsync(balance: 0m);

    await _fixture.TransferAsync(account.Id, target.Id, 30m);
    await _fixture.TransferAsync(account.Id, target.Id, 20m);

    var result = await _client.GetAsync($"/api/v1/accounts/{account.Id}/statement");
    result.StatusCode.Should().Be(HttpStatusCode.OK);
    var body = await result.Content.ReadFromJsonAsync<StatementResponse>();

    body!.Items.Should().HaveCount(2);
    body.Items[0].OccurredAt.Should().BeAfter(body.Items[1].OccurredAt); // decrescente
    body.Items[0].Type.Should().Be("TRANSFER_OUT");
    body.Items[0].BalanceAfter.Should().Be(150m);
}

// Paginação por cursor (RF-032)
[Fact]
public async Task GetStatement_WithCursor_ReturnsNextPage()
{
    var account = await _fixture.CreateWalletWithTransactionsAsync(count: 25);

    var page1 = await _client.GetFromJsonAsync<StatementResponse>(
        $"/api/v1/accounts/{account.Id}/statement?pageSize=20");
    page1!.HasMore.Should().BeTrue();
    page1.NextCursor.Should().NotBeNull();

    var page2 = await _client.GetFromJsonAsync<StatementResponse>(
        $"/api/v1/accounts/{account.Id}/statement?pageSize=20&cursor={page1.NextCursor}");
    page2!.Items.Should().HaveCount(5);
    page2.HasMore.Should().BeFalse();
}

// Extrato vazio → 200 com items: [] (CA-017)
[Fact]
public async Task GetStatement_NoTransactions_Returns200WithEmptyArray()
{
    var account = await _fixture.CreateWalletAsync(); // sem transferências

    var result = await _client.GetAsync($"/api/v1/accounts/{account.Id}/statement");
    result.StatusCode.Should().Be(HttpStatusCode.OK);
    var body = await result.Content.ReadFromJsonAsync<StatementResponse>();
    body!.Items.Should().BeEmpty();
    body.HasMore.Should().BeFalse();
    body.NextCursor.Should().BeNull();
}
```
