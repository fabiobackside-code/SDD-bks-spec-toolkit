# Spec: Gerar Extrato

**RF-015 a RF-019** | **CA-008 a CA-009**

## RFs
- RF-015: Retornar transações com filtro por data
- RF-016: Paginar resultado (20 itens/página)
- RF-017: Ordenar por data DESC
- RF-018: Incluir tipo de transação
- RF-019: Isolamento multi-tenant

## CAs
- CA-008: GET /api/v1/accounts/{id}/statement?startDate=X&endDate=Y
- CA-009: Paginação com ?pageNumber=2&pageSize=20

Veja `../../CLAUDE.md` para workflow completo.
