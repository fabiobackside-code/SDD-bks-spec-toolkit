# Spec: [Feature Name]

**Versão:** 1.0 | **Data:** 2026-04-08 | **Status:** Rascunho

---

## 📋 Contexto

Descrição breve do que esta feature faz e por que existe.

---

## 🎯 Requisitos Funcionais (RF)

- **RF-001:** Sistema DEVE...
- **RF-002:** Sistema NÃO DEVE...
- **RF-003:** Sistema DEVE...

---

## 📈 Requisitos Não Funcionais (RNF)

### Performance
- **RNF-001:** Latência P95 < 200ms
- **RNF-002:** Throughput > 1000 req/s

### Segurança
- **RNF-003:** Dados sensíveis com hash
- **RNF-004:** JWT para autenticação

---

## ⚙️ Restrições Técnicas (RC)

- **RC-001:** .NET 8+
- **RC-002:** PostgreSQL 15+
- **RC-003:** Dapper para queries

---

## ✅ Critérios de Aceite (CA)

### CA-001: [Cenário]
```
DADO uma condição inicial
QUANDO uma ação ocorre
ENTÃO resultado esperado
E efeito colateral esperado
```

### CA-002: [Cenário]
```
DADO outra condição
QUANDO outra ação
ENTÃO resultado diferente
```

---

## 🔗 Rastreabilidade

| RF | RNF | RC | CA | Status |
|----|----|----|-----|--------|
| 001-003 | 001-004 | 001-003 | 001-002 | ✓ |

