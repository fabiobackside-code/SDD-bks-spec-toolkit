# Spec: Login / Autenticação

**Fase:** 1 — Requirements  
**Bounded Context:** Wallet  
**Data:** 2026-04-09

---

## Requisitos Funcionais

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-010 | O sistema deve autenticar um usuário com email e senha | MUST |
| RF-011 | O sistema deve retornar um JWT com expiração de 1 hora | MUST |
| RF-012 | O sistema deve retornar um refresh token com expiração de 7 dias | SHOULD |
| RF-013 | O sistema deve rejeitar credenciais inválidas sem revelar qual campo está errado | MUST |
| RF-014 | O JWT deve conter `sub` (accountId), `email`, `iat`, `exp` | MUST |

---

## Requisitos Não-Funcionais

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-001 | Latência de autenticação | p99 < 400ms (inclui bcrypt verify) |
| RNF-002 | Segurança | Comparação de hash com tempo constante (sem timing attack) |

---

## Restrições Técnicas

| ID | Restrição |
|----|-----------|
| RC-001 | JWT assinado com RS256 (chave assimétrica) ou HS256 (segredo rotacionável) |
| RC-002 | bcrypt.verify com o mesmo fator usado na criação |
| RC-003 | Resposta de credenciais inválidas sempre com mesmo tempo de resposta (constant-time) |

---

## Critérios de Aceite

### CA-005 — Login com credenciais válidas

```gherkin
Given conta existente { email: "joao@email.com", password: "Senha@123" }
When POST /api/v1/auth/login body: { email: "joao@email.com", password: "Senha@123" }
Then status 200 OK
And body: { "accessToken": "<jwt>", "refreshToken": "<token>", "expiresIn": 3600 }
And JWT decodificado contém { sub: "<accountId>", email: "joao@email.com" }
```

### CA-006 — Credenciais inválidas

```gherkin
Given conta existente ou inexistente
When POST /api/v1/auth/login body: { email: "qualquer", password: "errada" }
Then status 401 Unauthorized
And body: { "error": "INVALID_CREDENTIALS" }
And sem informação sobre qual campo está incorreto
```

### CA-007 — Token expirado em endpoint protegido

```gherkin
Given JWT expirado (exp no passado)
When GET /api/v1/accounts/{id}/balance header Authorization: Bearer <expired-jwt>
Then status 401 Unauthorized
And body: { "error": "TOKEN_EXPIRED" }
```

---

## Casos de Borda

- Email não cadastrado → mesmo erro que senha errada (CA-006) — não revelar existência
- Refresh token expirado → 401 com erro `REFRESH_TOKEN_EXPIRED`
- Múltiplos logins simultâneos → permitido (sessões independentes)
