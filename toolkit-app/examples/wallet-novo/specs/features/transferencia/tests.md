# Tests: Transferência

**Fase 4 | Estratégia:** 70% Unit · 20% Integration · 10% Architecture  
**Rastreabilidade:** cada teste aponta ao CA que valida

---

## Unit Tests (70%) — xUnit + Moq

**Projeto:** `tests/Wallet.Api.Unit/UseCases/Transfer/`

### Money — Value Object

```csharp
// Money_Subtract_WithInsufficientFunds_ThrowsInsufficientFundsException (RF-021, CA-011)
[Fact]
public void Debit_WhenBalanceLessThanAmount_ThrowsInsufficientFundsException()
{
    var wallet = WalletBuilder.WithBalance(10m);
    var act = () => wallet.Debit(new Money(50m, "BRL"));
    act.Should().Throw<InsufficientFundsException>()
       .Which.Available.Amount.Should().Be(10m);
}

// Money_Add_DifferentCurrencies_ThrowsCurrencyMismatchException
[Fact]
public void Money_Add_DifferentCurrencies_ThrowsCurrencyMismatch()
{
    var brl = new Money(10m, "BRL");
    var usd = new Money(10m, "USD");
    var act = () => brl.Add(usd);
    act.Should().Throw<CurrencyMismatchException>();
}

// Money_Subtract_ExactBalance_SetsToZero (RF-021)
[Fact]
public void Debit_ExactBalance_SetsBalanceToZero()
{
    var wallet = WalletBuilder.WithBalance(50m);
    wallet.Debit(new Money(50m, "BRL"));
    wallet.Balance.Amount.Should().Be(0m);
}
```

### Wallet — Aggregate

```csharp
// Wallet_Transfer_ToSameAccount_ThrowsSelfTransferException (RF-024, CA-012)
[Fact]
public void Debit_NegativeAmount_ThrowsInvalidAmountException()
{
    var wallet = WalletBuilder.WithBalance(100m);
    var act = () => wallet.Debit(new Money(-10m, "BRL"));
    act.Should().Throw<InvalidAmountException>();
}

// Wallet_Debit_EmitsDomainEvent (RF-026, CA-010)
[Fact]
public void Debit_Valid_EmitsMoneyDebitedEvent()
{
    var wallet = WalletBuilder.WithBalance(100m);
    wallet.Debit(new Money(30m, "BRL"));
    wallet.DomainEvents.Should().ContainSingle()
          .Which.Should().BeOfType<MoneyDebited>()
          .Which.Amount.Amount.Should().Be(30m);
}

// Wallet_Credit_EmitsDomainEvent (RF-026)
[Fact]
public void Credit_Valid_EmitsMoneyCreditedEvent()
{
    var wallet = WalletBuilder.WithBalance(0m);
    wallet.Credit(new Money(50m, "BRL"));
    wallet.DomainEvents.Should().ContainSingle()
          .Which.Should().BeOfType<MoneyCredited>();
}
```

### TransferValidationStep

```csharp
// SelfTransfer_ReturnsSelfTransferError (RF-024, CA-012)
[Fact]
public async Task Validate_SameOriginAndTarget_ReturnsSelfTransferError()
{
    var id = WalletId.New();
    var transaction = new TransferTransaction("corr", "user", id, id,
                                              new Money(10m, "BRL"), null);
    var result = await _step.ExecuteAsync(transaction, default);
    result.IsSuccess.Should().BeFalse();
    result.ErrorCode.Should().Be("SELF_TRANSFER_NOT_ALLOWED");
}

// ZeroAmount_ReturnsInvalidAmountError (CA-012 variante)
[Fact]
public async Task Validate_ZeroAmount_ReturnsInvalidAmountError()
{
    var transaction = new TransferTransaction("corr", "user",
        WalletId.New(), WalletId.New(), new Money(0m, "BRL"), null);
    var result = await _step.ExecuteAsync(transaction, default);
    result.ErrorCode.Should().Be("INVALID_AMOUNT");
}
```

---

## Integration Tests (20%) — xUnit + Testcontainers (PostgreSQL real)

**Projeto:** `tests/Wallet.Api.Integration/Transfer/`

```csharp
// TransferUseCase_ValidAccounts_DebitAndCredit (CA-010)
[Fact]
public async Task Transfer_ValidAccounts_BalancesUpdatedCorrectly()
{
    // Arrange
    var origin = await _fixture.CreateWalletAsync(balance: 100m);
    var target = await _fixture.CreateWalletAsync(balance: 0m);

    // Act
    var result = await _client.PostAsJsonAsync(
        $"/api/v1/accounts/{origin.Id}/transfer",
        new { targetAccountId = target.Id, amount = 50m });

    // Assert
    result.StatusCode.Should().Be(HttpStatusCode.OK);
    var body = await result.Content.ReadFromJsonAsync<TransferResponse>();
    body!.OriginBalance.Should().Be(50m);
    body.TargetBalance.Should().Be(50m);

    // Verificar persistência no banco
    var originDb = await _fixture.GetBalanceAsync(origin.Id);
    var targetDb = await _fixture.GetBalanceAsync(target.Id);
    originDb.Should().Be(50m);
    targetDb.Should().Be(50m);
}

// Transfer_InsufficientBalance_Returns400 (CA-011)
[Fact]
public async Task Transfer_InsufficientBalance_Returns400WithErrorCode()
{
    var origin = await _fixture.CreateWalletAsync(balance: 10m);
    var target = await _fixture.CreateWalletAsync(balance: 0m);

    var result = await _client.PostAsJsonAsync(
        $"/api/v1/accounts/{origin.Id}/transfer",
        new { targetAccountId = target.Id, amount = 50m });

    result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    var body = await result.Content.ReadFromJsonAsync<ErrorResponse>();
    body!.Error.Should().Be("INSUFFICIENT_FUNDS");
    body.Available.Should().Be(10m);

    // Saldo deve estar inalterado (atomicidade)
    var originDb = await _fixture.GetBalanceAsync(origin.Id);
    originDb.Should().Be(10m);
}

// Transfer_Idempotent_SecondCallReturnsCache (CA-014)
[Fact]
public async Task Transfer_WithIdempotencyKey_SecondCallReturnsIdenticalResult()
{
    var origin = await _fixture.CreateWalletAsync(balance: 100m);
    var target = await _fixture.CreateWalletAsync(balance: 0m);
    var idempotencyKey = Guid.NewGuid().ToString();

    // Primeira chamada
    var first = await _client.PostAsJsonAsync(
        $"/api/v1/accounts/{origin.Id}/transfer",
        new { targetAccountId = target.Id, amount = 30m },
        headers: new() { ["Idempotency-Key"] = idempotencyKey });

    // Segunda chamada (idêntica)
    var second = await _client.PostAsJsonAsync(
        $"/api/v1/accounts/{origin.Id}/transfer",
        new { targetAccountId = target.Id, amount = 30m },
        headers: new() { ["Idempotency-Key"] = idempotencyKey });

    first.StatusCode.Should().Be(HttpStatusCode.OK);
    second.StatusCode.Should().Be(HttpStatusCode.OK);

    // Saldo debitado apenas uma vez
    var originDb = await _fixture.GetBalanceAsync(origin.Id);
    originDb.Should().Be(70m); // 100 - 30 (não 100 - 60)
}

// Transfer_Concurrent_OnlyOneSucceeds (CA-015 variante — concorrência)
[Fact]
public async Task Transfer_ConcurrentSameAccount_OnlyOneSucceedsWithSelectForUpdate()
{
    var origin = await _fixture.CreateWalletAsync(balance: 50m);
    var target1 = await _fixture.CreateWalletAsync(balance: 0m);
    var target2 = await _fixture.CreateWalletAsync(balance: 0m);

    // Duas transferências de R$50 simultâneas — apenas uma pode ter saldo
    var task1 = _client.PostAsJsonAsync($"/api/v1/accounts/{origin.Id}/transfer",
        new { targetAccountId = target1.Id, amount = 50m });
    var task2 = _client.PostAsJsonAsync($"/api/v1/accounts/{origin.Id}/transfer",
        new { targetAccountId = target2.Id, amount = 50m });

    var results = await Task.WhenAll(task1, task2);
    var statuses = results.Select(r => r.StatusCode).ToList();

    statuses.Should().Contain(HttpStatusCode.OK);
    statuses.Should().Contain(HttpStatusCode.BadRequest); // INSUFFICIENT_FUNDS
}
```

---

## Architecture Tests (10%) — ArchUnit (NetArchTest ou equivalente)

**Projeto:** `tests/Wallet.Api.Architecture/`

```csharp
// Domain não referencia Adapters (BLOCKER)
[Fact]
public void Domain_ShouldNot_HaveDependencyOn_Adapters()
{
    var result = Types.InAssembly(typeof(Wallet).Assembly)
        .That().ResideInNamespace("Wallet.Api.Domain")
        .ShouldNot().HaveDependencyOn("Wallet.Api.Adapters")
        .GetResult();
    result.IsSuccessful.Should().BeTrue(result.FailingTypeNames?.FirstOrDefault());
}

// Domain não referencia Infrastructure
[Fact]
public void Domain_ShouldNot_HaveDependencyOn_Infrastructure()
{
    var result = Types.InAssembly(typeof(Wallet).Assembly)
        .That().ResideInNamespace("Wallet.Api.Domain")
        .ShouldNot().HaveDependencyOn("Wallet.Api.Infrastructure")
        .GetResult();
    result.IsSuccessful.Should().BeTrue();
}

// Domain não referencia EntityFramework nem Dapper
[Fact]
public void Domain_ShouldNot_Reference_OrmLibraries()
{
    var result = Types.InAssembly(typeof(Wallet).Assembly)
        .That().ResideInNamespace("Wallet.Api.Domain")
        .ShouldNot().HaveDependencyOnAny("Dapper", "Microsoft.EntityFrameworkCore", "Npgsql")
        .GetResult();
    result.IsSuccessful.Should().BeTrue();
}

// Ports são interfaces no Domain
[Fact]
public void Ports_ShouldBe_Interfaces_And_ResideIn_Domain()
{
    var result = Types.InAssembly(typeof(Wallet).Assembly)
        .That().ResideInNamespace("Wallet.Api.Domain.Ports")
        .Should().BeInterfaces()
        .GetResult();
    result.IsSuccessful.Should().BeTrue();
}

// Application não referencia Adapters diretamente
[Fact]
public void Application_ShouldNot_HaveDependencyOn_Adapters()
{
    var result = Types.InAssembly(typeof(Wallet).Assembly)
        .That().ResideInNamespace("Wallet.Api.Application")
        .ShouldNot().HaveDependencyOn("Wallet.Api.Adapters")
        .GetResult();
    result.IsSuccessful.Should().BeTrue();
}
```

---

## Cobertura Esperada

| Camada | Cobertura alvo | Ferramenta |
|--------|---------------|-----------|
| Domain (Aggregates, VOs) | 100% | xUnit + Moq |
| Application (Steps, UseCases) | ≥90% | xUnit + Moq |
| Adapters (Persistence) | ≥80% | Testcontainers |
| Global | ≥85% | dotnet-coverage |

**Tempo máximo da suite:** < 5 minutos  
**Ordem de execução:** Unit → Architecture → Integration (mais lento por container startup)
