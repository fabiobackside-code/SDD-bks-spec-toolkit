# 6 Princípios de SDD

**Foundation dos 6 pilares que guiam tudo em Spec-Driven Development**

---

## 1️⃣ Especificação Precisa

**Toda feature começa com RF/RNF/RC/CA explícitos**

```
❌ Ruim: "Fazer login"
✅ Bom: 
  RF-006: Sistema DEVE retornar JWT com access_token (15min TTL)
  RNF-005: JWT assinado com HS256 ou RS256
  CA-003: POST /api/v1/auth/login com credenciais corretas 
          → 200 OK com {accessToken, refreshToken}
```

**Regra:** Nenhum código até RF/RNF/RC/CA estarem validados

---

## 2️⃣ Rastreabilidade Total

**RF → CA → Tasks → Código → Testes**

```
RF-006 (Requirement)
  ├─ CA-003 (Teste de aceitação)
  │   ├─ T-005: Criar IAuthService (interface)
  │   ├─ T-006: Implementar JwtAuthService
  │   ├─ T-007: Criar AuthEndpoints
  │   └─ tests/Unit/AuthServiceTests.cs
  │
  └─ "Por que JwtAuthService existe?"
      → Porque RF-006 precisa de autenticação
      → Rastreabilidade clara ✅
```

**Benefício:** Código não-órfão, fácil refatorar

---

## 3️⃣ Testes como Contrato

**Testes não validam qualidade, validam CA**

```
Test Pyramid:
          /\
         /  \         Architecture (10%)
        /    \        ArchUnit: sem cyclic deps
       /      \
      /________\      Integration (20%)
     /          \     Testcontainers: BD real
    /            \
   /______________\   Unit (70%)
                      Domain logic isolado

Meta: ≥85% cobertura, todos CAs testados
```

**Regra:** Sem teste = Sem prova que CA foi satisfeito

---

## 4️⃣ Padrões Obrigatórios

**Use SEMPRE (nunca "talvez")**

- **Hexagonal:** Ports & Adapters (Domain isolado)
- **DDD:** Aggregates, Entities, Value Objects (Domínio rico)
- **Pipeline:** Orquestração de steps (Separação de concerns)
- **Repository:** Abstração de persistência (Testável)

**Resultado:** Código consistente, previsível, testável

---

## 5️⃣ DoD: Definition of Done

**Tarefa só é "pronta" se:**

```
✅ Código implementado
✅ 100% de cobertura (código gerado)
✅ ≥80% de cobertura (código novo)
✅ CAs validadas com testes
✅ ArchUnit passando (sem ciclos)
✅ Suite < 5min (performance)
✅ Code review aprovado
```

**Sem DoD claro = "pronto" ≠ "realmente pronto"**

---

## 6️⃣ Stack-Agnostic Design

**Especificação agnóstica, implementação específica**

```
CLAUDE-ARCHITECT.md
├─ Padrões agnósticos (qualquer linguagem)
├─ Hexagonal, DDD, Pipeline (genérico)
└─ Exemplo em pseudocódigo

CLAUDE-ARCHITECT-NET.md
├─ Implementação .NET específica
├─ C# code examples
└─ Dapper, xUnit, Testcontainers

(Futura) CLAUDE-ARCHITECT-PYTHON.md
├─ Implementação Python específica
├─ FastAPI, pytest
└─ SQLAlchemy
```

**Benefício:** Mesmo padrão em diferentes linguagens

---

## 🎓 Como Aplicar os 6 Princípios

| Fase | Princípio | Ação |
|------|-----------|------|
| Requirements | 1 + 2 | Escrever RF/RNF/RC/CA com rastreabilidade |
| Design | 4 + 6 | Aplicar padrões agnósticos |
| Implementation | 4 + 6 | Seguir padrões específicos da linguagem |
| Testing | 3 + 5 | Implementar testes 70/20/10, validar DoD |
| Delivery | 2 + 5 | Verificar rastreabilidade, DoD completo |

---

## 📝 Checklist: 6 Princípios em Novo Projeto

- [ ] RF/RNF/RC/CA escritos (Princípio 1)
- [ ] Rastreabilidade mapeada (Princípio 2)
- [ ] Testes 70/20/10 planejados (Princípio 3)
- [ ] Padrões escolhidos (Princípio 4)
- [ ] DoD definido (Princípio 5)
- [ ] Stack agnóstico vs específico claro (Princípio 6)

---

**Próximo:** Aprenda sobre `hexagonal.md` (padrão arquitetural)

