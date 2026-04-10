# PLAN: 5 Fases de SDD

**Fluxo sequencial obrigatório para todo projeto**

---

## Fase 1: Requirements ✍️

**Objetivo:** Definir o que será construído

**Artefatos:**
- RF (Requisitos Funcionais): O que o sistema DEVE fazer
- RNF (Requisitos Não-Funcionais): Performance, segurança, escalabilidade
- RC (Restrições Técnicas): Stack obrigatória (ex: .NET 8+, PostgreSQL)
- CA (Critérios de Aceite): Testes de aceitação em formato Gherkin

**Skill disponível:** `/domain-analysis` — identifica Aggregates, Value Objects e Bounded Contexts a partir do `requirements.md` preenchido.

**Tempo:** 10-15% do total

**Definition of Done:**
- [ ] Mínimo 3 RF por feature
- [ ] RNF mensuráveis (ex: "latência < 200ms", não "rápido")
- [ ] RC explícitas
- [ ] Cada RF tem ≥1 CA
- [ ] Rastreabilidade: RF → CA → Código
- [ ] Validado com stakeholders

---

## Fase 2: Design 🏗️

**Objetivo:** Desenhar COMO será construído

**Artefatos:**
- Aggregates Root (DDD)
- Entities e Value Objects
- Ports (interfaces)
- Adapters (implementações)
- Diagrama fluxo de dados
- Diagrama sequência

**Padrões:**
- Hexagonal (Ports & Adapters)
- DDD (Aggregates, Entities, Value Objects)
- Pipeline para orquestração

**Skill disponível:** 
- `/technical-design-doc-creator` — gera `specs/features/<feature>/design.md` completo usando `design-template-net.md`, com namespaces C#, Ports, Adapters e diagrama de fluxo.
- `/arquiteto` — (Modo `--audit`) audita os prompts de design para verificar conformidade com o DDD.

**Tempo:** 15-20% do total

**Definition of Done:**
- [ ] Aggregate Root identificado
- [ ] Entities definidas
- [ ] Value Objects criados
- [ ] Ports abstratos definidos
- [ ] Fluxo diagramado
- [ ] Decisões documentadas (ADR)
- [ ] Auditoria validada pelo `/arquiteto`

---

## Fase 3: Tasks 📋

**Objetivo:** Dividir design em trabalho atômico

**Artefatos:**
- Tasks numeradas (T-001, T-002, ...)
- Cada task com:
  - Descrição clara
  - Path de arquivo
  - Dependências
  - Tempo estimado (1-3 dias)
  - DoD (Definition of Done)

**Exemplo:**
```
T-001: Criar Aggregate Account
  Path: src/Domain/Core/Aggregates/Account
  Deps: Nenhuma
  DoD: ✅ Aggregate criado, validações no construtor, factory method
  Time: 2h
```

**Skills disponíveis:**
- `/sdd-engineer` — guia a geração das implementações exigindo obediência a Hexagonal Arch e prevenção de acoplamentos e dependências cíclicas.
- `/coding-agent` — delegação em background (pty) para tarefas prolongadas ou monótonas de cópia de Boilerplate.

**Tempo:** 15-20% do total

**Definition of Done:**
- [ ] Mínimo 6-8 tasks por feature
- [ ] Cada task é "atômica" (completa em 1-3 dias)
- [ ] Dependências mapeadas
- [ ] Rastreáve a RF

---

## Fase 4: Testes 🧪

**Objetivo:** Validar que CAs são satisfeitos

**Estratégia:**
- 70% Unit Tests (lógica isolada)
- 20% Integration Tests (com BD)
- 10% Architecture Tests (padrões)

**Coverage:**
- 100% de código gerado (Aggregates, Value Objects)
- ≥80% de código novo (Repositories, Services)

**Artefatos:**
- Unit tests (framework agnóstico de testes unitários)
- Integration tests (testes com container ou banco real)
- Architecture tests (validação de padrões e dependências)

**Skills disponíveis:**
- `/build-fixer` *(stack-specific)* — Iteração automática para encontrar, categorizar e corrigir erros de compilação, acionado a cada ciclo de Red-Green-Refactor.

**Tempo:** 30-40% do total (maior tempo!)

**Definition of Done:**
- [ ] Todos CAs têm testes
- [ ] Cobertura ≥85% global
- [ ] Sem cyclic dependencies (architecture tests)
- [ ] Suite completa < 5 minutos
- [ ] Testes independentes (não dependem de ordem)

---

## Fase 5: Integration ⚙️

**Objetivo:** Combinar tudo, documentar, fazer deploy

**Atividades:**
- Integrar com outras features
- Teste end-to-end
- Documentar API (ex: Swagger/OpenAPI, AsyncAPI)
- Deploy (staging → production)
- Monitoramento

**Skills disponíveis:**
- `/arquiteto` — Proteção contra desvios arquiteturais; fiscalização em alta densidade dos artefatos produzidos (Phase 5 check).
- `/coupling-analysis` — detecta violações de Arquitetura Hexagonal (Domain → Adapters, cyclic deps) antes de abrir o PR
- `/gh-address-comments` — resolve comentários de review respeitando os contratos SDD (DoD, cobertura ≥80%, architecture tests)

**Tempo:** 10-15% do total

**Definition of Done:**
- [ ] Features combinadas sem conflitos
- [ ] API documentada (Swagger/OpenAPI ou equivalente)
- [ ] Logs estruturados
- [ ] Alertas configurados
- [ ] Runbook pronto

---

## 📊 Alocação de Tempo (Exemplo)

Para feature **Abertura de Conta** (5 RFs, 2 CAs):

| Fase | % | Dias |
|------|---|------|
| 1. Requirements | 10% | 0.5d |
| 2. Design | 15% | 0.75d |
| 3. Tasks | 20% | 1d |
| 4. Testes | 35% | 1.75d |
| 5. Integration | 20% | 1d |
| **Total** | **100%** | **~5 dias** |

---

## ✅ Checklist por Fase

### Fase 1
- [ ] RF escritos (EARS syntax)
- [ ] CA em Gherkin
- [ ] Rastreabilidade completa
- [ ] Validado com stakeholders

### Fase 2
- [ ] Aggregates identificados
- [ ] Ports abstratos
- [ ] Adapters planejados
- [ ] Fluxo diagramado

### Fase 3
- [ ] Tasks T-001... criadas
- [ ] Cada task atômica
- [ ] Dependências mapeadas
- [ ] Rastreáveis

### Fase 4
- [ ] Unit tests passando
- [ ] Integration tests passando
- [ ] Architecture tests passando
- [ ] Coverage ≥85%

### Fase 5
- [ ] Features integradas
- [ ] API documentada
- [ ] Deploy realizado
- [ ] Monitoramento ativo

---

## 🚫 Antipadrões

🚫 **Pular Requirements**
- ❌ "Vamos codar e ver"
- ✅ Sempre Requirements → Design → Code

🚫 **Tasks muito grandes**
- ❌ T-001: "Implementar login" (1 semana)
- ✅ T-001: "Criar interface IAuthRepository" (2h)

🚫 **Testes só ao final**
- ❌ 80% do tempo codando, 20% testando
- ✅ TDD Red-Green-Refactor durante Tasks

🚫 **Falta de rastreabilidade**
- ❌ RF-001 → (não sei que código implementa)
- ✅ RF-001 → CA-001 → T-002 → AccountAggregate

---

## 🔄 Iteração

Se novo requisito surge:

1. **Voltar à Fase 1** e adicionar novo RF
2. **Validar impacto** em Fases 2-5
3. **Ajustar tasks** se necessário
4. **Continuar normalmente**

Nunca pule fases!

