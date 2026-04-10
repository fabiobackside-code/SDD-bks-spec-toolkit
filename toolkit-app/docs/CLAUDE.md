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
- ✅ Lógica refatorada e validada por revisão de engenharia
- ✅ Cobertura ≥80% (100% no código gerado)
- ✅ CAs provados por testes (sem dependências cíclicas)
- ✅ Build/compilação verde e estável
- ✅ Dependências entre módulos revisadas (sem violações arquiteturais)

---

## 6️⃣ AI System, Workflow & Guidelines

**System Prompt Importante:** Assuma o papel de Engenheiro SDD. Siga sempre as 5 Fases do `PLAN.md`. Use os guias na pasta `guidelines/` (Agnósticos e stack-específicos). **NUNCA** pule fases ou escreva código base sem RF/CA aprovados.

| Fase `PLAN.md` | Escopo |
| :--- | :--- |
| **1. Requirements** | Elicite e valide RF/RNF/CA — identifique Aggregates, Value Objects e Bounded Contexts. |
| **2. Design** | Hexagonal+DDD — gere `design.md` completo com Ports, Adapters e diagrama de fluxo. |
| **3. Tasks** | Escreva o código guiado pelo `design.md`; respeite Hexagonal Arch e evite acoplamentos. |
| **4. Tests** | TDD 70/20/10. Corrija erros de build iterativamente até a suite ficar verde. |
| **5. Integration** | Revise PRs, valide fronteiras arquiteturais e resolva comentários de review. |

☠️ **Antipadrões:** Começar código sem CA pronto | Ignorar Guidelines | Dependências Cíclicas | Cobertura < 80%.
