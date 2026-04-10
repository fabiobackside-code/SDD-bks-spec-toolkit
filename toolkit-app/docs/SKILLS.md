# Skills SDD — Mapa de Integração

Skills Claude Code criadas para o bks-spec-toolkit. Cada skill automatiza uma etapa do workflow SDD definido em [PLAN.md](PLAN.md) e é ancorada nos guidelines correspondentes.

---

## Matriz: Skills × Fases × Guidelines

| Skill | Fase PLAN.md | Guidelines Referenciados | Template de Saída |
|-------|-------------|--------------------------|-------------------|
| `domain-analysis` | 1 (Requirements) + 2 (Design) | Aplicando-DDD-GUIDELINES · Identificando-Contextos-Delimitados-GUIDELINES | design.md (seções Aggregates/VOs/BCs) |
| `technical-design-doc-creator` | 2 (Design) | Arquitetura-Hexagonal-GUIDELINES · Aplicando-DDD-GUIDELINES · Implementacao-DotNet-GUIDELINES | specs/features/\<feature\>/design.md |
| `sdd-engineer` | 3 (Tasks) + 4 (Tests) | Implementacao-DotNet-GUIDELINES · C# CS Erros Comuns | Código Fonte C# Validado |
| `coding-agent` | 3 (Tasks) | PLAN.md | Execução via Bash (pty/background) |
| `build-fixer` | 4 (Tests) | Compilação C# | Zero Erros C# |
| `arquiteto` | 2 (Design) + 5 (Integration) | Avaliação estrutural do código de acordo com o design | Relatório de Auditoria |
| `coupling-analysis` | 5 (Integration/Review) | Arquitetura-Hexagonal-GUIDELINES · CLAUDE-TDD (ArchUnit) | Relatório de violações inline |
| `gh-address-comments` | 5 (Integration/Review) | CLAUDE.md (DoD) · CLAUDE-TDD (suite passando) | Código corrigido + respostas via gh CLI |
---

## Skill: `domain-analysis`

**Quando usar:** No início de uma feature ou de um novo projeto, antes de escrever qualquer código. Aplica-se após ter o `requirements.md` preenchido.

**O que faz:**
1. Lê `specs/features/<feature>/requirements.md`
2. Aplica Event Storming lightweight para identificar Domain Events, Commands e Aggregates
3. Mapeia Bounded Contexts e relacionamentos (Context Map)
4. Identifica Value Objects e invariantes do domínio
5. Produz o bloco de design de domínio em `specs/features/<feature>/design.md`

**Alinhamento com Guidelines:**

- **[Aplicando-DDD-GUIDELINES.md](guidelines/Aplicando-DDD-GUIDELINES.md):** Os 8 blocos táticos DDD guiam a identificação de Entities, Value Objects, Aggregates e Domain Services que a skill deve encontrar
- **[Identificando-Contextos-Delimitados-GUIDELINES.md](guidelines/Identificando-Contextos-Delimitados-GUIDELINES.md):** As 5 fases de descoberta de BCs e os 6 padrões de relacionamento (ACL, Shared Kernel, etc.) estruturam o Context Map gerado
- **[Arquitetura-Hexagonal-GUIDELINES.md](guidelines/Arquitetura-Hexagonal-GUIDELINES.md):** Valida que o modelo de domínio segue Hexagonal — Domain é agnóstico, sem referências a infra

**Instalação:** `toolkit-app/skills/domain-analysis/SKILL.md`

---

## Skill: `technical-design-doc-creator`

**Quando usar:** Após `domain-analysis` ter identificado o modelo de domínio, para transformar o design em um documento estruturado pronto para a fase de Tasks.

**O que faz:**
1. Lê `requirements.md` (RFs, RNFs, CAs) e o modelo de domínio produzido pelo `domain-analysis`
2. Aplica os padrões de `Implementacao-DotNet-GUIDELINES.md` para traduzir para C# (namespaces, Aggregate Root, Ports, Adapters)
3. Preenche `specs/features/<feature>/design.md` usando `specs/templates/net/design-template-net.md`
4. Inclui diagrama de fluxo e tabela de rastreabilidade RF → Componente

**Alinhamento com Guidelines:**

- **[Arquitetura-Hexagonal-GUIDELINES.md](guidelines/Arquitetura-Hexagonal-GUIDELINES.md):** Define os padrões agnósticos (Hexagonal, Ports & Adapters, regras de dependência) que o documento deve refletir
- **[Implementacao-DotNet-GUIDELINES.md](guidelines/Implementacao-DotNet-GUIDELINES.md):** Fornece os exemplos C# concretos (Aggregate Root, Port interface, PostgreSQL Adapter) que alimentam o design document
- **[docs/templates/net/design-template-net.md](templates/net/design-template-net.md):** É o template que a skill preenche — a skill respeita cada seção do template

**Instalação:** `toolkit-app/skills/technical-design-doc-creator/SKILL.md`

---

## Skill: `coupling-analysis`

**Quando usar:** Antes de abrir o PR (Fase 5) ou durante code review para verificar que nenhuma violação de Hexagonal Architecture foi introduzida.

**O que faz:**
1. Escaneia `src/` em busca de referências cruzadas proibidas (Domain → Adapters, Domain → Infrastructure)
2. Detecta dependências cíclicas entre namespaces
3. Verifica que interfaces de Port estão em `Domain/Ports/`, não em Adapters
4. Classifica violações por severidade (Blocker / Warning / Info)
5. Produz relatório com arquivo:linha, tipo de violação e remediação sugerida

**Alinhamento com Guidelines:**

- **[Arquitetura-Hexagonal-GUIDELINES.md](guidelines/Arquitetura-Hexagonal-GUIDELINES.md):** As regras de dependência (Domain nunca importa Adapters; Adapters conhecem Domain) são as checagens implementadas
- **[CLAUDE-TDD.md](CLAUDE-TDD.md):** A pirâmide 70/20/10 inclui 10% de testes de arquitetura com ArchUnit — a skill valida o mesmo contrato que os testes deveriam garantir
- **[Arquitetura-Hexagonal-GUIDELINES.md](guidelines/Arquitetura-Hexagonal-GUIDELINES.md):** Seção anti-patterns (cyclic dependencies, tight coupling, mixed concerns) são os padrões que a skill detecta

**Instalação:** `toolkit-app/skills/coupling-analysis/SKILL.md`

---

## Skill: `gh-address-comments`

**Quando usar:** Após receber review de um PR no GitHub — para resolver os comentários de forma sistemática sem quebrar os contratos SDD.

**O que faz:**
1. Usa `gh pr view` e `gh api` para listar comentários pendentes do PR
2. Para cada comentário: lê o contexto do arquivo/linha referenciado
3. Verifica se a correção pedida conflita com CLAUDE.md (princípios SDD inegociáveis)
4. Implementa a correção respeitando os padrões de `Implementacao-DotNet-GUIDELINES.md`
5. Verifica que a suite de testes continua passando após cada correção
6. Gera resposta ao comentário via `gh api` (reply) sinalizando o commit da correção

**Alinhamento com Guidelines:**

- **[docs/CLAUDE.md](CLAUDE.md):** O DoD (Princípio 5) é verificado após cada correção — cobertura ≥80%, ArchUnit passando, suite < 5min
- **[CLAUDE-TDD.md](CLAUDE-TDD.md):** Garante que correções não quebram testes existentes e que novos cenários levantados no review recebem testes
- **Relação com pr-review-toolkit:** O plugin `pr-review-toolkit` (agents: `comment-analyzer`, `code-reviewer`) analisa o PR de fora. Esta skill atua de dentro, implementando as correções respeitando os contratos SDD

**Instalação:** `toolkit-app/skills/gh-address-comments/SKILL.md`

---

## Como Instalar as Skills

As skills ficam em `toolkit-app/skills/<nome>/SKILL.md`. Para torná-las disponíveis no Claude Code:

```bash
# Opção 1: Copiar diretamente
mkdir -p ~/.claude/skills/coupling-analysis
cp toolkit-app/skills/coupling-analysis/SKILL.md ~/.claude/skills/coupling-analysis/

# Repetir para cada skill

# Opção 2: Empacotar com skill-creator (recomendado)
# Use /skill-creator no Claude Code para gerar o .skill file instalável
```

Após instalar, as skills aparecem automaticamente quando Claude Code identifica os gatilhos descritos em cada SKILL.md.

---

## Fluxo Combinado no Workflow SDD

```
Fase 1: Requirements
  └── /domain-analysis          ← Identifica Aggregates, VOs, BCs a partir de requirements.md

Fase 2: Design
  ├── /technical-design-doc-creator  ← Gera design.md completo (templates/net/)
  └── /arquiteto                 ← Audita o prompt de design 

Fase 3: Tasks
  ├── (manual — preencher tasks.md a partir do design.md gerado)
  ├── /sdd-engineer              ← Garante que a escrita do código respeite o design
  └── /coding-agent              ← Executa as tarefas longas e maçantes em background

Fase 4: Tests
  ├── (manual — preencher tests.md + implementar suite 70/20/10)
  └── /build-fixer               ← Integrado iterativamente para garantir compilação verde e estabilidade base do código

Fase 5: Integration
  ├── /arquiteto                 ← Proteção contra dependências sujas (Auditoria final)
  ├── /coupling-analysis         ← Verifica Hexagonal + cyclic deps antes do PR
  └── /gh-address-comments       ← Resolve review comments respeitando DoD SDD
```

---

**Última atualização:** 2026-04-08
