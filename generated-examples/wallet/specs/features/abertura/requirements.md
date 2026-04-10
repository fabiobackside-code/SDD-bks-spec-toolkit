# Spec: Abertura de Conta

**RF-001 a RF-005** | **CA-001 a CA-002**

## RFs
- RF-001: Criar conta com email, senha, nome
- RF-002: Email deve ser único
- RF-003: Inicializar com saldo zero USD
- RF-004: Senha com bcrypt
- RF-005: UUID para cada conta

## CAs
- CA-001: POST /api/v1/accounts com dados válidos → 201 Created
- CA-002: Email duplicado → 400 Bad Request

Veja `../../CLAUDE.md` para workflow completo.
