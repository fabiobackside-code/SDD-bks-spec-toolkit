# Spec: Consultar Saldo

**RF-011 a RF-014** | **CA-005 a CA-007**

## RFs
- RF-011: Retornar saldo atual em tempo real
- RF-012: Suportar múltiplas moedas (USD, EUR, BRL)
- RF-013: Converter saldo com taxa de câmbio
- RF-014: Isolamento multi-tenant

## CAs
- CA-005: GET /api/v1/accounts/{id}/balance → 200 com saldo
- CA-006: Query param ?currency=EUR converte
- CA-007: Sem JWT → 401

Veja `../../CLAUDE.md` para workflow completo.
