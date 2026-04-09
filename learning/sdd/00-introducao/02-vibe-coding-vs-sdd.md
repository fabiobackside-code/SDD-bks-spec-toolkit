# Vibe Coding vs SDD: Comparação Detalhada

> Módulo 00 · Aula 2 · Tempo estimado: 20min

---

## O Cenário: Implementar um Endpoint de Cadastro de Usuário

Vamos usar o mesmo problema e ver como cada abordagem se comporta.

**Requisito:** "Criar um endpoint de cadastro de usuário com validação de e-mail e senha"

---

## Abordagem 1: Vibe Coding

### Como começa

```
Dev → Claude: "Cria um endpoint POST /users para cadastro com validação"
```

Claude gera algo funcional. O dev testa no Postman, parece OK. Commit.

### Semana 2: O cliente pede validações adicionais

```
Dev → Claude: "Adiciona validação de CPF no cadastro"
```

Claude adiciona, mas usa uma regex diferente da que já existia no projeto para outros campos. Dois padrões de validação coexistem.

### Semana 4: Bug em produção

Um usuário cadastrou com e-mail inválido porque a validação só ocorria no frontend. O endpoint aceita qualquer string.

```
Dev → Claude: "Tem um bug, o e-mail não está sendo validado no backend"
Claude: "Aqui está a correção..." [adiciona uma terceira biblioteca de validação]
```

### Semana 8: Novo dev no time

Ele lê o código e não entende: por que existem três formas de validação? Qual é a correta? Por que CPF está junto com o cadastro e não numa camada separada?

**Não há documentação. Não há spec. Só há código.**

### Custo total

- 3 bugs em produção
- 2 dias de refatoração
- Onboarding do novo dev: 1 semana para entender o cadastro

---

## Abordagem 2: SDD

### Antes de qualquer código: Requirements (30 minutos)

```markdown
# Spec: Cadastro de Usuário

## Requisitos Funcionais

RF-001: O sistema DEVE aceitar cadastro via POST /api/v1/users
RF-002: O sistema DEVE validar que o e-mail está em formato válido (RFC 5322)
RF-003: O sistema DEVE rejeitar e-mails já cadastrados com status 409
RF-004: A senha DEVE ter mínimo 8 caracteres, 1 maiúscula, 1 número, 1 especial
RF-005: O sistema DEVE enviar e-mail de confirmação após cadastro bem-sucedido
RF-006: O sistema NÃO DEVE retornar a senha em nenhuma resposta

## Restrições

RC-001: Usar a biblioteca class-validator (já presente no projeto) para todas as validações
RC-002: CPF será coletado em etapa separada (não faz parte deste endpoint)
RC-003: Rate limit: máximo 5 tentativas por IP por minuto

## Critérios de Aceite

CA-001: POST com e-mail válido e senha forte → 201 Created + {id, email, createdAt}
CA-002: POST com e-mail inválido → 400 Bad Request + {errors: [{field: "email", message: "..."}]}
CA-003: POST com e-mail duplicado → 409 Conflict
CA-004: POST com senha fraca → 400 Bad Request + {errors: [{field: "password", ...}]}
```

### Design (20 minutos)

```markdown
# Design: Cadastro de Usuário

## Componentes

- UserController: recebe e valida o DTO
- CreateUserUseCase: orquestra o fluxo de negócio
- UserRepository: persistência (PostgreSQL via TypeORM)
- EmailService: envia e-mail de confirmação (já existente)

## Fluxo de Dados

Request → UserController → CreateUserDTO (class-validator)
  → CreateUserUseCase → UserRepository.findByEmail()
  → [se existe] → throw ConflictException
  → [se não existe] → bcrypt.hash(password) → UserRepository.save()
  → EmailService.sendConfirmation()
  → return UserResponseDTO (sem password)

## Modelo de Dados

User { id: UUID, email: string, passwordHash: string, emailVerified: boolean, createdAt: Date }
```

### Tasks (10 minutos)

```markdown
# Tasks: Cadastro de Usuário

- [ ] 1. Criar CreateUserDTO com decorators do class-validator
- [ ] 2. Criar UserResponseDTO (omite passwordHash)
- [ ] 3. Implementar CreateUserUseCase com regras RF-001 a RF-006
- [ ] 4. Implementar UserController com rate limiting
- [ ] 5. Escrever testes unitários para o use case (mocks de UserRepository e EmailService)
- [ ] 6. Escrever testes de integração para o endpoint
```

### Execução com Claude

```
Dev → Claude: "Execute as tasks em spec/tasks.md referenciando spec/requirements.md e spec/design.md"
```

Claude executa **deterministicamente**. Usa class-validator porque está na spec. Não inventa CPF. Não esquece o rate limit.

---

## Comparação Lado a Lado

| Dimensão | Vibe Coding | SDD |
|----------|-------------|-----|
| **Tempo de setup** | 0 min | 60 min |
| **Primeira implementação** | 30 min | 45 min (Claude executa tasks) |
| **Bugs encontrados em produção** | 3 (semanas depois) | 0 (constraints na spec) |
| **Refatoração necessária** | 2 dias | 0 |
| **Onboarding do novo dev** | 1 semana | 1 hora (lê a spec) |
| **Previsibilidade do resultado** | Baixa | Alta |
| **Auditabilidade** | Nenhuma | Total (spec versionada no git) |
| **Custo total (8 semanas)** | Alto | Baixo |

---

## O Paradoxo da Velocidade

O Vibe Coding parece mais rápido no curto prazo, mas cria uma **dívida de contexto** que cresce exponencialmente:

```
Velocidade
│
│  Vibe Coding ────────────────────\
│                                   \
│                          SDD ──────\────────────
│          SDD               ↑        \
│    (curva de aceleração)  Ponto de   \
│                           cruzamento  ↓
└─────────────────────────────────────────── Tempo
     Sem 1  Sem 2  Sem 4   Mes 2   Mes 4
```

Com SDD, você investe 1 hora na spec e economiza dias de debugging.

---

## Quando NÃO Usar SDD

SDD tem um custo fixo de setup. Não faz sentido para:

- Scripts de uso único (< 50 linhas)
- Protótipos descartáveis (que você realmente vai descartar)
- Bug fixes pontuais e isolados

Faz sentido para:
- Qualquer feature que vai para produção
- APIs e endpoints
- Módulos de negócio
- Integrações com serviços externos
- Qualquer coisa que outro dev vai manter

---

## Resumo

| | Vibe Coding | SDD |
|--|-------------|-----|
| Tempo inicial | Rápido | Investimento |
| Qualidade | Imprevisível | Consistente |
| Manutenção | Cara | Barata |
| Onboarding | Difícil | Fácil |
| Auditoria | Impossível | Natural |

---

[EXERCÍCIO 00-2]
Escolha um endpoint ou módulo existente no seu projeto atual.
1. Escreva um requirements.md retroativo: o que ele deveria fazer?
2. Compare com o que ele realmente faz
3. Identifique as "suposições silenciosas" que foram feitas sem documentação

---

[Próxima Aula →](./03-ferramentas-ecossistema.md)
