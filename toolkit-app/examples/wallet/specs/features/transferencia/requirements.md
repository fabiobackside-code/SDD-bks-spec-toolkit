# Spec: Transferência

**RF-020 a RF-024** | **CA-010 a CA-012**

## RFs
- RF-020: Transferência entre contas
- RF-021: Validar saldo suficiente
- RF-022: Atomicidade (ACID)
- RF-023: Registrar TRANSFER_OUT e TRANSFER_IN
- RF-024: Não permitir transferência para própria conta

## CAs
- CA-010: POST /api/v1/accounts/{id}/transfer saldo suficiente → 200
- CA-011: Saldo insuficiente → 400
- CA-012: Mesma conta → 400

Veja `../../CLAUDE.md` para workflow completo.
