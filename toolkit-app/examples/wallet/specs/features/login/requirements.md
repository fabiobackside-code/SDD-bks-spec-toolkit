# Spec: Login

**RF-006 a RF-010** | **CA-003 a CA-004**

## RFs
- RF-006: Login com email + senha
- RF-007: Retornar JWT access_token (15min) + refresh_token (7d)
- RF-008: Credenciais inválidas → 401
- RF-009: Validar JWT em requisições autenticadas
- RF-010: Refresh do access_token

## CAs
- CA-003: POST /api/v1/auth/login com credenciais corretas → 200 com tokens
- CA-004: Credenciais incorretas → 401

Veja `../../CLAUDE.md` para workflow completo.
