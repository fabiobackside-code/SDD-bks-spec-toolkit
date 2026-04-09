# Spec: Transferência entre Contas

**Fase:** 1 — Requirements  
**Bounded Context:** Wallet  
**Autor:** SDD Case Prático  
**Data:** 2026-04-09

---

## Requisitos Funcionais

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-020 | O sistema deve permitir transferência de saldo entre duas contas distintas | MUST |
| RF-021 | O sistema deve validar que a conta de origem possui saldo suficiente antes da transferência | MUST |
| RF-022 | A transferência deve ser atômica (ACID): débito e crédito ocorrem na mesma transação de banco | MUST |
| RF-023 | O sistema deve registrar dois lançamentos: `TRANSFER_OUT` na conta de origem e `TRANSFER_IN` na conta de destino | MUST |
| RF-024 | O sistema deve rejeitar transferência para a própria conta | MUST |
| RF-025 | O sistema deve suportar idempotência via header `Idempotency-Key` | SHOULD |
| RF-026 | O sistema deve registrar Domain Events `MoneyDebited` e `MoneyCredited` para auditoria futura | SHOULD |

---

## Requisitos Não-Funcionais

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-001 | Latência da operação de transferência | p99 < 500ms sob carga de 50 req/s |
| RNF-002 | Atomicidade da operação | 0 estados inconsistentes sob falha entre débito e crédito |
| RNF-003 | Idempotência | Segunda chamada com mesmo `Idempotency-Key` retorna mesmo resultado sem novo lançamento |
| RNF-004 | Rastreabilidade | Toda transferência deve ter `CorrelationId` presente nos logs |

---

## Restrições Técnicas

| ID | Restrição |
|----|-----------|
| RC-001 | .NET 8+, PostgreSQL 15+, Dapper (sem EF Core no fluxo de transferência) |
| RC-002 | Sem distributed transactions — contas residem no mesmo banco |
| RC-003 | Atomicidade garantida via `SELECT FOR UPDATE` + transação `IDbTransaction` explícita |
| RC-004 | `Idempotency-Key` armazenado em tabela `idempotency_keys` com TTL de 24h |

---

## Critérios de Aceite

### CA-010 — Transferência com saldo suficiente

```gherkin
Given duas contas existentes (origem com saldo R$ 100,00, destino com R$ 0,00)
And header Idempotency-Key: "key-abc-123"
When POST /api/v1/accounts/{originId}/transfer
  body: { "targetAccountId": "{targetId}", "amount": 50.00 }
Then status 200 OK
And body: { "transactionId": "<uuid>", "originBalance": 50.00, "targetBalance": 50.00 }
And lançamento TRANSFER_OUT registrado na conta de origem
And lançamento TRANSFER_IN registrado na conta de destino
And Domain Events MoneyDebited e MoneyCredited emitidos
```

### CA-011 — Saldo insuficiente

```gherkin
Given conta de origem com saldo R$ 10,00
When POST /api/v1/accounts/{originId}/transfer
  body: { "targetAccountId": "{targetId}", "amount": 50.00 }
Then status 400 Bad Request
And body: { "error": "INSUFFICIENT_FUNDS", "available": 10.00, "requested": 50.00 }
And saldo da conta de origem permanece R$ 10,00
And nenhum lançamento criado
```

### CA-012 — Transferência para própria conta

```gherkin
Given conta existente {accountId}
When POST /api/v1/accounts/{accountId}/transfer
  body: { "targetAccountId": "{accountId}", "amount": 50.00 }
Then status 422 Unprocessable Entity
And body: { "error": "SELF_TRANSFER_NOT_ALLOWED" }
```

### CA-013 — Conta de origem inexistente

```gherkin
Given id de conta inexistente {unknownId}
When POST /api/v1/accounts/{unknownId}/transfer
  body: { "targetAccountId": "{targetId}", "amount": 50.00 }
Then status 404 Not Found
And body: { "error": "ACCOUNT_NOT_FOUND", "accountId": "{unknownId}" }
```

### CA-014 — Idempotência

```gherkin
Given transferência previamente processada com Idempotency-Key: "key-abc-123"
When POST /api/v1/accounts/{originId}/transfer (mesma key, mesmos dados)
Then status 200 OK
And body idêntico ao retorno original
And nenhum novo lançamento criado
And saldo das contas inalterado
```

### CA-015 — Atomicidade sob falha simulada

```gherkin
Given conta de origem com saldo R$ 100,00
And falha simulada após débito (antes do crédito)
When POST /api/v1/accounts/{originId}/transfer
Then status 500 Internal Server Error
And saldo da conta de origem permanece R$ 100,00 (rollback)
And saldo da conta de destino permanece inalterado
```

---

## Rastreabilidade

| RF | CA | Componente (Fase 2) |
|----|-----|---------------------|
| RF-020 | CA-010 | a definir na Fase 2 |
| RF-021 | CA-011 | a definir na Fase 2 |
| RF-022 | CA-015 | a definir na Fase 2 |
| RF-023 | CA-010 | a definir na Fase 2 |
| RF-024 | CA-012 | a definir na Fase 2 |
| RF-025 | CA-014 | a definir na Fase 2 |
| RF-026 | CA-010 | a definir na Fase 2 |

---

## Casos de Borda Identificados

- Transferência de valor zero → rejeitar com 422 (`INVALID_AMOUNT`)
- Transferência com valor negativo → rejeitar com 422 (`INVALID_AMOUNT`)
- Conta de destino inexistente → 404 específico
- Concorrência: duas transferências simultâneas da mesma conta com saldo exato → apenas uma aprovada (`SELECT FOR UPDATE` serializa)
- `Idempotency-Key` com payload diferente → 409 Conflict

---

## Glossário

| Termo | Significado no contexto |
|-------|------------------------|
| `TRANSFER_OUT` | Lançamento de débito na conta de origem |
| `TRANSFER_IN` | Lançamento de crédito na conta de destino |
| `MoneyDebited` | Domain Event emitido quando saldo é debitado |
| `MoneyCredited` | Domain Event emitido quando saldo é creditado |
| `Idempotency-Key` | UUID fornecido pelo cliente para garantir operação única |
