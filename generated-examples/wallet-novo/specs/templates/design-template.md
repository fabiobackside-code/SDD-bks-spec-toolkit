# Design: [Feature Name]

**Baseado em:** Hexagonal Architecture + DDD

---

## 🏗️ Componentes

### Aggregates
- [Entity]: Root aggregate com validações

### Value Objects
- [ValueObject]: Imutável, comparado por valor

### Ports
- I[Repository]: Abstração para persistência
- I[Service]: Abstração para lógica externa

### Adapters
- [Adapter]Repository: Implementação Dapper
- [Adapter]Service: Implementação externa

---

## 📊 Fluxo de Dados

[ASCII diagram ou descrição]

---

## 🧪 Validações

- Validações no Aggregate
- Erros de domínio
- Casos edge

