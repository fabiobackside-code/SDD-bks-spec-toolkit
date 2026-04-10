# Spec: Extrato de Transações

**Fase:** 1 — Requirements  
**Bounded Context:** Wallet  
**Data:** 2026-04-09

---

## Requisitos Funcionais

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-030 | O sistema deve retornar os lançamentos da conta em ordem cronológica decrescente | MUST |
| RF-031 | Cada lançamento deve conter: id, tipo (TRANSFER_IN/TRANSFER_OUT), valor, saldo_após, data, correlationId | MUST |
| RF-032 | O sistema deve suportar paginação via `cursor` (não offset) | SHOULD |
| RF-033 | O sistema deve suportar filtro por período (data_inicio, data_fim) | SHOULD |
| RF-034 | O sistema deve rejeitar acesso ao extrato de outra conta | MUST |

---

## Requisitos Não-Funcionais

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-001 | Latência de consulta | p99 < 200ms para páginas de até 50 itens |
| RNF-002 | Paginação | Cursor-based — sem degradação com tabelas grandes |

---

## Restrições Técnicas

| ID | Restrição |
|----|-----------|
| RC-001 | Endpoint protegido por JWT |
| RC-002 | Paginação por cursor (UUID do último item) — nunca OFFSET |
| RC-003 | Tamanho máximo de página: 100 itens |
| RC-004 | Índice no banco: `(account_id, created_at DESC)` para performance |

---

## Critérios de Aceite

### CA-016 — Extrato com lançamentos

```gherkin
Given conta {accountId} com 3 lançamentos registrados
And JWT válido com sub = {accountId}
When GET /api/v1/accounts/{accountId}/statement
Then status 200 OK
And body:
  {
    "items": [
      { "id": "<uuid>", "type": "TRANSFER_IN", "amount": 50.00, "balanceAfter": 100.00, "occurredAt": "<iso8601>", "correlationId": "<uuid>" },
      ...
    ],
    "nextCursor": "<uuid-do-ultimo>",
    "hasMore": true
  }
And itens em ordem decrescente por data
```

### CA-017 — Extrato vazio

```gherkin
Given conta {accountId} sem lançamentos
When GET /api/v1/accounts/{accountId}/statement
Then status 200 OK
And body: { "items": [], "nextCursor": null, "hasMore": false }
```

### CA-018 — Acesso negado

```gherkin
Given JWT com sub = {myAccountId}
When GET /api/v1/accounts/{otherAccountId}/statement
Then status 403 Forbidden
```

### CA-019 — Filtro por período

```gherkin
When GET /api/v1/accounts/{accountId}/statement?from=2026-01-01&to=2026-01-31
Then status 200 OK
And todos os itens têm occurredAt entre 2026-01-01 e 2026-01-31
```

---

## Casos de Borda

- Período inválido (from > to) → 422
- Cursor inválido (UUID mal formado) → 422
- Página de 0 itens no período → 200 com items: []
