# Spec: Consulta de Saldo

**Fase:** 1 — Requirements  
**Bounded Context:** Wallet  
**Data:** 2026-04-09

---

## Requisitos Funcionais

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-015 | O sistema deve retornar o saldo atual da conta autenticada | MUST |
| RF-016 | O saldo deve refletir todas as transferências e depósitos processados | MUST |
| RF-017 | O sistema deve rejeitar acesso ao saldo de outra conta (autorização) | MUST |

---

## Requisitos Não-Funcionais

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-001 | Latência de consulta | p99 < 100ms |
| RNF-002 | Consistência | Leitura do saldo após transferência deve refletir valor atualizado (read-after-write) |

---

## Restrições Técnicas

| ID | Restrição |
|----|-----------|
| RC-001 | Endpoint protegido por JWT (Bearer token) |
| RC-002 | `accountId` da rota validado contra `sub` do JWT — acesso apenas à própria conta |
| RC-003 | Saldo retornado como `decimal` com 2 casas — nunca ponto flutuante (float/double) |

---

## Critérios de Aceite

### CA-008 — Consulta de saldo autenticada

```gherkin
Given conta existente {accountId} com saldo R$ 150,00
And JWT válido com sub = {accountId}
When GET /api/v1/accounts/{accountId}/balance
Then status 200 OK
And body: { "accountId": "{accountId}", "balance": 150.00, "currency": "BRL" }
```

### CA-009 — Acesso negado (conta de outro usuário)

```gherkin
Given JWT válido com sub = {myAccountId}
When GET /api/v1/accounts/{otherAccountId}/balance
Then status 403 Forbidden
And body: { "error": "ACCESS_DENIED" }
```

### CA-009b — Conta inexistente

```gherkin
Given JWT válido
When GET /api/v1/accounts/{unknownId}/balance
Then status 404 Not Found
And body: { "error": "ACCOUNT_NOT_FOUND" }
```

---

## Casos de Borda

- Consulta logo após transferência → deve refletir saldo atualizado (sem cache stale)
- Saldo zero → retornar `0.00`, não null ou ausente
