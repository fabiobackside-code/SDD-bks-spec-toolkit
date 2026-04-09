# Tasks: [Nome da Feature]

> INSTRUÇÕES: Preencha este template APÓS o design.md estar aprovado.
> Tasks devem ser ATÔMICAS: implementáveis de forma independente, com resultado verificável.
> Cada task deve referenciar pelo menos um RF ou RC do requirements.md.
> Remova estas instruções antes de usar com o Claude.

---

## Pré-condições

> O que deve existir ANTES de iniciar estas tasks.

- [Dependência de infra: ex "PostgreSQL rodando localmente"]
- [Dependência de código: ex "UserRepository existe (de spec anterior)"]
- [Dependência de config: ex "Variável X configurada no .env"]

---

## Tarefas

> Use o formato:
> - [ ] T-NNN: Descrição clara e atômica
>   - Arquivo(s): caminho/do/arquivo.ts
>   - Referência: RF-XXX, RC-YYY
>   - Depende de: T-NNN (se aplicável)

### [Grupo 1: Nome do Grupo — ex: Infraestrutura / Domínio / Aplicação / Apresentação]

- [ ] T-001: [Primeira tarefa — geralmente model/migration]
  - Arquivo: src/caminho/arquivo.ts
  - Referência: RF-XXX (qual requisito implementa)
  - Depende de: (nenhuma dependência)

- [ ] T-002: [Segunda tarefa]
  - Arquivo: src/caminho/outro-arquivo.ts
  - Referência: RF-YYY, RC-ZZZ
  - Depende de: T-001

### [Grupo 2: Nome do Grupo]

- [ ] T-003: [Terceira tarefa]
  - Arquivo: src/caminho/terceiro.ts
  - Referência: RF-AAA
  - Depende de: T-002

### [Grupo 3: Testes]

- [ ] T-XXX: Escrever testes unitários de [ComponentePrincipal]
  - Arquivo: test/unit/caminho/arquivo.spec.ts
  - Cobrir: [cenário de sucesso], [cenário de erro X], [cenário de erro Y]
  - Referência: CA-001, CA-002, CA-003

- [ ] T-XXX: Escrever testes de integração do endpoint
  - Arquivo: test/integration/caminho/arquivo.spec.ts
  - Cobrir: todos os critérios de aceite (CA-001 a CA-00N)
  - Depende de: T-XXX (implementação concluída)

---

## Definição de Pronto

> Checklist que deve estar completamente verde antes de abrir PR.

- [ ] Todos os critérios de aceite do requirements.md passam nos testes
- [ ] TypeScript compila sem erros (`npx tsc --noEmit` / `dotnet build` / `./mvnw compile`)
- [ ] Lint passa sem warnings (`npm run lint` / configuração equivalente)
- [ ] Cobertura de testes >= [80]% no componente principal
- [ ] Nenhum dado sensível nos logs (revisão manual)
- [ ] Nenhum secret ou chave hardcoded
- [ ] Tasks marcadas como concluídas neste arquivo
- [ ] spec/requirements.md e spec/design.md atualizados com aprendizados da implementação

---

## Prompts Sugeridos para o Claude

### Iniciar a implementação

```
"Execute T-001 de spec/[feature]/tasks.md.
Siga spec/[feature]/requirements.md para o comportamento esperado
e spec/[feature]/design.md para a estrutura técnica.
Siga as convenções de CLAUDE.md e memory-bank/tech.md.
Após concluir, explique o que foi criado e aguarde aprovação para T-002."
```

### Executar múltiplas tasks

```
"Execute T-001 a T-005 de spec/[feature]/tasks.md em sequência.
Após cada task, aguarde minha aprovação antes de continuar.
Em caso de ambiguidade, pergunte — não assuma."
```

### Verificar completude

```
"Compare a implementação atual com spec/[feature]/requirements.md.
Para cada RF e CA, indique: IMPLEMENTADO | PARCIAL | PENDENTE.
Não escreva código — apenas verifique."
```

### Gerar testes

```
"Execute T-XXX: escreva os testes de integração para o endpoint [nome].
Cada teste deve corresponder a um critério de aceite do requirements.md.
Use [Jest+Supertest | xUnit+WebApplicationFactory | JUnit+MockMvc]
conforme memory-bank/tech.md."
```
