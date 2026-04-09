# Design: transferencia

Implementar usando Hexagonal Architecture com Pipeline pattern.

Veja `../../CLAUDE-ARCHITECT.md` e `../../CLAUDE-ARCHITECT-NET.md` para detalhes.

## Componentes

- **Aggregate:** Domain entity principal
- **Ports:** Interfaces para Repository, Service
- **Adapters:** Implementações PostgreSQL, REST
- **Pipeline:** Orquestração de steps

