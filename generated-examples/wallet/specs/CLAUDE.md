# 🎯 CLAUDE: 6 Fundamentos de SDD

**Spec-Driven Development** (SDD) = Especificação como fonte de verdade

---

## 1️⃣ Especificação Precisa

Toda feature começa com Requisitos Funcionais (RF), Não-Funcionais (RNF), Restrições (RC) e Critérios de Aceite (CA) explícitos.

**Regra:** Nenhum código até RF/RNF/RC/CA estarem validados.

---

## 2️⃣ Rastreabilidade Total

RF → CA → Tasks → Código → Testes

Cada linha de código deve ser rastreável até um requisito específico.

**Ferramenta:** Tabelas rastreabilidade em cada spec.

---

## 3️⃣ Testes como Contrato

Testes são o contrato que prova que CA foi satisfeito.

- **Unit:** 70% (lógica isolada)
- **Integration:** 20% (API + banco)
- **Architecture:** 10% (padrões, cyclic deps)

---

## 4️⃣ Padrões Obrigatórios

Use **sempre**:
- Hexagonal Architecture (Ports & Adapters)
- DDD (Aggregates, Entities, Value Objects)
- Pipeline Pattern para orquestração
- Repository Pattern para abstração

---

## 5️⃣ DoD: Definition of Done

Tarefa só é "pronta" se:
- ✅ Código implementado
- ✅ 100% de cobertura (código gerado)
- ✅ ≥80% de cobertura (código novo)
- ✅ CAs validadas com testes
- ✅ ArchUnit passando (sem ciclos)
- ✅ Suite < 5min

---

## 6️⃣ Stack-Agnostic Design

Specs **agnósticas** (padrões genéricos) vs **específicas** (tecnologia).

- `guidelines/Arquitetura-Hexagonal-GUIDELINES.md` — Padrões agnósticos (Hexagonal + DDD)
- `guidelines/Implementacao-DotNet-GUIDELINES.md` — Implementações .NET específicas
- `guidelines/Implementacao-Python-GUIDELINES.md` — (v1.1) Python específicas

---

## ⚖️ Antipadrões

🚫 Começar coding sem RF/RNF/RC/CA  
🚫 Testes com cobertura < 80%  
🚫 Cyclic dependencies (ArchUnit reprovado)  
🚫 Especificação ambígua ou incompleta  
🚫 Rastreabilidade quebrada  

---

## 📋 Workflow SDD

```
1. Requirements  → Validar RF/RNF/RC/CA
2. Design       → Arquitetura + Padrões
3. Tasks        → Dividir em trabalho atômico
4. Tests        → 70/20/10 pyramid
5. Integration  → Combine + Deploy
```

**Tempo estimado:** 5 fases, proporcionais ao escopo.
