# Workflow SDD: Passo a Passo Completo

> Módulo 01 · Aula 3 · Tempo estimado: 30min

---

## O Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW SDD COMPLETO                         │
│                                                                  │
│  1. SETUP          2. ESPECIFICAÇÃO        3. EXECUÇÃO           │
│  ──────────        ────────────────        ──────────            │
│  CLAUDE.md         requirements.md         Claude executa tasks  │
│  memory-bank/  →   design.md           →   Task a task           │
│  (uma vez)         tasks.md                com revisão humana    │
│                    (por feature)                                  │
│                                                                  │
│  4. REVISÃO        5. REFINAMENTO          6. ENTREGA            │
│  ──────────        ──────────────          ──────────            │
│  Code review       Atualiza spec  →        PR + spec versionada  │
│  Testes passam     conforme aprendizado    no repositório        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fase 1: Setup (Uma Vez por Projeto)

### 1.1 Criar o Memory Bank

```bash
mkdir -p memory-bank spec

# Criar os arquivos base
touch CLAUDE.md
touch memory-bank/product.md
touch memory-bank/structure.md
touch memory-bank/tech.md
```

### 1.2 Popular o CLAUDE.md

Preencha as regras absolutas do seu projeto. Este arquivo é lido em TODA sessão, então seja preciso e conciso.

### 1.3 Verificar com o Claude

```
claude "Leia o CLAUDE.md e memory-bank/ e me diga o que você entendeu sobre o projeto. Liste qualquer ambiguidade ou informação faltante."
```

> Esta é a "calibração inicial". O Claude vai expor lacunas que você precisa preencher.

---

## Fase 2: Especificação (Por Feature)

### 2.1 Identificar a Feature

Antes de escrever qualquer spec, responda:
- Qual problema de negócio isso resolve?
- Quem vai usar?
- O que está explicitamente fora do escopo?

### 2.2 Criar requirements.md

Use o template em `04-templates/spec-requirements.md`.

**Dica:** Passe o rascunho pelo Claude para identificar ambiguidades:

```
claude "Revise spec/auth/requirements.md e liste:
1. Requisitos ambíguos que podem levar a suposições silenciosas
2. Casos de borda não cobertos
3. Contradições internas
Não implemente — apenas analise."
```

### 2.3 Criar design.md

Com os requisitos claros, defina a arquitetura. Você pode pedir ajuda ao Claude:

```
claude "Com base em spec/auth/requirements.md e nossa arquitetura em memory-bank/structure.md,
propor o design.md para esta feature. Inclua: componentes, fluxo de dados, interfaces TypeScript,
tratamento de erros e estratégia de testes. Não implemente ainda."
```

**Revisar o design gerado:**
- Os componentes seguem a Clean Architecture do projeto?
- As interfaces estão corretas?
- O tratamento de erros é consistente com o restante do sistema?

### 2.4 Criar tasks.md

Com o design aprovado, quebre em tasks atômicas:

```
claude "Com base em spec/auth/requirements.md e spec/auth/design.md,
crie spec/auth/tasks.md com tasks atômicas e ordenadas.
Cada task deve referenciar o(s) RF que implementa."
```

**Critérios de uma boa task:**
- [ ] É atômica (pode ser implementada independentemente)
- [ ] Referencia pelo menos um RF ou RC
- [ ] Tem um arquivo de destino claro
- [ ] É testável de forma isolada

---

## Fase 3: Execução (Por Task)

### 3.1 Executar uma Task por Vez

```
claude "Execute T-001 de spec/auth/tasks.md, seguindo spec/auth/design.md.
Apenas esta task — não avance para T-002."
```

> **Princípio:** Execute uma task por vez e revise antes de avançar. Corrigir um arquivo é muito mais barato que corrigir dez.

### 3.2 Revisar a Implementação

Após cada task:
1. Leia o código gerado
2. Verifique se segue as convenções do tech.md
3. Confirme que referencia o requisito correto

### 3.3 Marcar como Concluída

Ao aprovar a task, peça ao Claude para marcar:

```
claude "T-001 aprovada. Marque como [x] no tasks.md e execute T-002."
```

### 3.4 Execução em Lote (Avançado)

Quando você confia na spec e o Claude demonstrou consistência:

```
claude "Execute todas as tasks de T-001 a T-005 em spec/auth/tasks.md em sequência.
Pause após cada task e aguarde minha aprovação antes de continuar."
```

---

## Fase 4: Revisão

### 4.1 Revisão de Código

Além do code review padrão, verifique:
- O código implementa exatamente o que está na spec?
- Há comportamentos que a spec não contemplou?
- Os testes cobrem todos os critérios de aceite?

```
claude "Compare a implementação atual com spec/auth/requirements.md.
Liste qualquer divergência entre o código e os requisitos."
```

### 4.2 Executar os Testes

```bash
npm test -- --coverage
# ou
dotnet test --collect:"XPlat Code Coverage"
# ou
./mvnw test jacoco:report
```

Os critérios de aceite do requirements.md devem se traduzir em testes que passam.

---

## Fase 5: Refinamento da Spec

### Por que refinar depois?

Durante a implementação, você aprende coisas sobre o domínio que não sabia antes. A spec deve refletir esse aprendizado.

```
claude "Após implementar a feature de login, identifique:
1. Decisões tomadas durante a implementação que não estão na spec
2. Casos de borda descobertos durante os testes
3. Atualizações necessárias em requirements.md e design.md"
```

### Tipos de refinamento

| Situação | Ação |
|----------|------|
| Novo requisito descoberto | Adicionar RF novo no requirements.md |
| Decisão de design não documentada | Adicionar nota no design.md |
| Restrição técnica implícita | Adicionar RC no requirements.md |
| Task concluída de forma diferente | Atualizar a task e justificar |

---

## Fase 6: Entrega

### 6.1 Commit da Spec junto com o Código

```bash
git add spec/auth/ CLAUDE.md memory-bank/
git commit -m "feat(auth): implementar login com JWT e rate limiting

Spec: spec/auth/requirements.md
Implementa: RF-001 a RF-008, RC-001 a RC-004
Testes: unitários (LoginUseCase) + integração (POST /auth/login)"
```

> **Princípio:** A spec vai no mesmo commit (ou PR) que o código. Elas evoluem juntas.

### 6.2 PR com Referência à Spec

```markdown
## Descrição
Implementação do login com JWT conforme spec/auth/requirements.md

## Checklist
- [x] Todos os critérios de aceite passam nos testes
- [x] Spec atualizada com decisões de implementação
- [x] Nenhum secret no código
- [x] Coverage > 80%

## Para o Revisor
Ler spec/auth/requirements.md antes de revisar o código — o PR implementa exatamente essa spec.
```

---

## Diagrama de Fluxo Decisório

```
Nova Feature Solicitada
         │
         ▼
 Escopo está claro?
    │         │
   NÃO        SIM
    │           │
    ▼           ▼
 Reunião     Existe spec
 de escopo   similar?
         │         │
        NÃO        SIM
         │           │
         ▼           ▼
    requirements.  Copiar e
    md do zero     adaptar
              │
              ▼
         design.md
              │
              ▼
         tasks.md
              │
              ▼
    Claude executa (task a task)
              │
              ▼
    Revisão + Testes
              │
              ▼
    Refinamento da spec
              │
              ▼
    Commit + PR (spec + código)
```

---

## Checklist por Fase

### Setup ✓
- [ ] CLAUDE.md criado com regras absolutas
- [ ] memory-bank/product.md com contexto de produto
- [ ] memory-bank/structure.md com estrutura de pastas
- [ ] memory-bank/tech.md com stack e convenções
- [ ] Claude calibrado ("o que você entendeu?")

### Especificação ✓
- [ ] requirements.md com mínimo 5 RF, 2 RC, 3 CA
- [ ] Revisão de ambiguidades feita com Claude
- [ ] design.md com componentes, fluxo, interfaces, erros, testes
- [ ] tasks.md com tasks atômicas referenciando RFs

### Execução ✓
- [ ] Tasks executadas uma por vez com revisão
- [ ] Código segue convenções do tech.md
- [ ] Tasks concluídas marcadas no tasks.md

### Entrega ✓
- [ ] Todos os critérios de aceite passam
- [ ] Coverage mínima atingida
- [ ] Spec refinada com aprendizados
- [ ] Commit inclui spec + código
- [ ] PR referencia a spec

---

[Próxima Aula →](./04-claude-code-setup.md)
