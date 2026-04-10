# Design: transferencia

Implementar usando Hexagonal Architecture com Pipeline pattern.

Veja `../../guidelines/Arquitetura-Hexagonal-GUIDELINES.md` e `../../guidelines/Implementacao-DotNet-GUIDELINES.md` para detalhes.

## Componentes

- **Aggregate:** Domain entity principal
- **Ports:** Interfaces para Repository, Service
- **Adapters:** Implementações PostgreSQL, REST
- **Pipeline:** Orquestração de steps

