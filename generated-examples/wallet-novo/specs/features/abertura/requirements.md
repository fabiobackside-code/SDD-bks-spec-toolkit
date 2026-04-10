# Spec: Abertura de Conta

**Fase:** 1 — Requirements  
**Bounded Context:** Wallet  
**Data:** 2026-04-09

---

## Requisitos Funcionais

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-001 | O sistema deve criar uma conta com email, senha e nome completo | MUST |
| RF-002 | O email deve ser único no sistema | MUST |
| RF-003 | A conta deve ser inicializada com saldo zero | MUST |
| RF-004 | A senha deve ser armazenada com bcrypt (fator 12) | MUST |
| RF-005 | O identificador da conta deve ser um UUID v7 gerado no Domain (não pelo banco) | MUST |
| RF-006 | O sistema deve emitir Domain Event `AccountOpened` ao criar a conta | SHOULD |

---

## Requisitos Não-Funcionais

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-001 | Latência de criação de conta | p99 < 300ms |
| RNF-002 | UUID v7 gerado no Domain | Sem dependência de sequence ou autoincrement do banco |

---

## Restrições Técnicas

| ID | Restrição |
|----|-----------|
| RC-001 | .NET 8+, PostgreSQL 15+, Dapper |
| RC-002 | bcrypt com fator mínimo 12 — nunca MD5, SHA1 ou armazenamento plain text |
| RC-003 | UUID v7 gerado via `Uuid7.NewUuid7()` ou equivalente no Domain |
| RC-004 | Email normalizado para lowercase antes de persistir |

---

## Critérios de Aceite

### CA-001 — Criação com dados válidos

```gherkin
Given dados válidos { email: "joao@email.com", password: "Senha@123", name: "João Silva" }
When POST /api/v1/accounts
Then status 201 Created
And body: { "accountId": "<uuid-v7>", "email": "joao@email.com", "name": "João Silva", "balance": 0.00 }
And header Location: /api/v1/accounts/{accountId}
And senha armazenada como hash bcrypt (não plain text)
And Domain Event AccountOpened emitido
```

### CA-002 — Email duplicado

```gherkin
Given conta já existente com email "joao@email.com"
When POST /api/v1/accounts body: { email: "joao@email.com", ... }
Then status 409 Conflict
And body: { "error": "EMAIL_ALREADY_EXISTS", "email": "joao@email.com" }
```

### CA-003 — Dados inválidos

```gherkin
Given body com email inválido "nao-e-um-email"
When POST /api/v1/accounts
Then status 422 Unprocessable Entity
And body: { "error": "VALIDATION_ERROR", "fields": [{ "field": "email", "message": "..." }] }
```

### CA-004 — Senha fraca

```gherkin
Given senha "123" (menos de 8 caracteres)
When POST /api/v1/accounts
Then status 422 Unprocessable Entity
And body com erro de validação no campo password
```

---

## Casos de Borda

- Email com letras maiúsculas → normalizar para lowercase antes de salvar
- Nome vazio ou só espaços → 422
- Senha com apenas números → aceitar ou rejeitar? (definir política mínima: 8 chars)

---

## Rastreabilidade

| RF | CA | Componente (Fase 2) |
|----|-----|---------------------|
| RF-001 | CA-001 | a definir na Fase 2 |
| RF-002 | CA-002 | a definir na Fase 2 |
| RF-003 | CA-001 | a definir na Fase 2 |
| RF-004 | CA-001 | a definir na Fase 2 |
| RF-005 | CA-001 | a definir na Fase 2 |
| RF-006 | CA-001 | a definir na Fase 2 |
