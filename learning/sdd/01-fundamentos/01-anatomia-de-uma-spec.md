# Anatomia de uma Spec

> Módulo 01 · Aula 1 · Tempo estimado: 40min

---

## Os Três Documentos de uma Spec

Uma spec SDD completa é composta por três documentos markdown em sequência:

```
spec/
├── requirements.md   ← O QUE o sistema deve fazer
├── design.md         ← COMO os componentes se organizam
└── tasks.md          ← QUAIS passos o agente deve executar
```

Eles são criados **nessa ordem** e cada um depende do anterior.

---

## 1. requirements.md — O QUE

### Propósito

Define o comportamento esperado do sistema em termos de **negócio**, não de tecnologia. É a conversa com o stakeholder traduzida em linguagem formal.

### Estrutura

```markdown
# Spec: [Nome da Feature]
Versão: 1.0 | Data: YYYY-MM-DD | Autor: [nome]

## Contexto
[Por que esta feature existe? Qual problema resolve?]

## Requisitos Funcionais

RF-001: O sistema DEVE [ação obrigatória]
RF-002: O sistema DEVE permitir que [ator] [ação]
RF-003: O sistema PODE [ação opcional]
RF-004: O sistema NÃO DEVE [restrição]

## Restrições Técnicas

RC-001: [biblioteca/padrão/protocolo obrigatório]
RC-002: [limite de performance/segurança]

## Critérios de Aceite

DADO [contexto]
QUANDO [ação do usuário]
ENTÃO [resultado esperado]

## Fora de Escopo (Importante!)
- [O que explicitamente NÃO está nesta feature]
```

### A Linguagem EARS (Easy Approach to Requirements Syntax)

EARS é um padrão de escrita de requisitos que elimina ambiguidade:

| Padrão | Uso | Exemplo |
|--------|-----|---------|
| `DEVE` (SHALL) | Obrigatório | "O sistema DEVE validar o e-mail" |
| `DEVE ser capaz de` | Capacidade | "O sistema DEVE ser capaz de processar 1000 req/s" |
| `NÃO DEVE` (SHALL NOT) | Proibição | "O sistema NÃO DEVE armazenar senha em plaintext" |
| `PODE` (MAY) | Opcional | "O sistema PODE enviar notificação por SMS" |
| `QUANDO [condição] DEVE` | Condicional | "QUANDO o usuário está inativo por 30min, DEVE expirar a sessão" |

### Exemplo Real: Feature de Login

```markdown
# Spec: Autenticação de Usuário (Login)
Versão: 1.0 | Data: 2024-01-15 | Autor: Equipe Backend

## Contexto
O sistema precisa autenticar usuários para proteger recursos privados.
A autenticação usa JWT com refresh token para manter sessões longas sem comprometer segurança.

## Requisitos Funcionais

RF-001: O sistema DEVE autenticar usuários via POST /api/v1/auth/login
RF-002: O sistema DEVE aceitar {email, password} no corpo da requisição
RF-003: O sistema DEVE retornar {accessToken, refreshToken, expiresIn} em caso de sucesso
RF-004: O sistema DEVE retornar 401 para credenciais inválidas (sem indicar qual campo está errado)
RF-005: O sistema DEVE bloquear o IP após 5 tentativas falhas em 15 minutos
RF-006: O accessToken DEVE expirar em 15 minutos
RF-007: O refreshToken DEVE expirar em 7 dias
RF-008: O sistema DEVE registrar log de tentativa de login (sucesso e falha) com IP e timestamp

## Restrições Técnicas

RC-001: Usar bcrypt com cost factor 12 para comparação de senha
RC-002: JWT assinado com RS256 (chave assimétrica)
RC-003: Blacklist de tokens via Redis (TTL igual ao tempo de expiração do token)
RC-004: Rate limiting implementado via Redis (chave: "login_attempts:{ip}")

## Critérios de Aceite

DADO um usuário cadastrado com email "user@example.com" e senha válida
QUANDO POST /api/v1/auth/login com as credenciais corretas
ENTÃO resposta 200 com {accessToken: string, refreshToken: string, expiresIn: 900}

DADO credenciais inválidas
QUANDO POST /api/v1/auth/login
ENTÃO resposta 401 com {message: "Credenciais inválidas"} (sem especificar qual campo)

DADO 5 tentativas falhas do mesmo IP em 15 minutos
QUANDO 6ª tentativa de POST /api/v1/auth/login
ENTÃO resposta 429 com {message: "Muitas tentativas. Tente novamente em X minutos"}

## Fora de Escopo
- Login via OAuth (Google, GitHub) — será spec separada
- Autenticação 2FA — será spec separada
- Recuperação de senha — será spec separada
```

---

## 2. design.md — COMO

### Propósito

Define a **arquitetura técnica** da feature: componentes, fluxo de dados, modelo de dados, tratamento de erros. É a ponte entre os requisitos e o código.

### Estrutura

```markdown
# Design: [Nome da Feature]

## Componentes Envolvidos
[Quais classes/módulos/serviços participam da solução]

## Fluxo de Dados
[Diagrama textual ou ASCII do fluxo request → response]

## Interfaces e Contratos
[DTOs, interfaces, tipos — o "contrato" entre componentes]

## Modelo de Dados
[Entidades, tabelas, campos relevantes]

## Tratamento de Erros
[Quais erros podem ocorrer e como cada um é tratado]

## Estratégia de Testes
[Quais testes serão escritos e em qual nível]

## Dependências Externas
[Serviços, libs, APIs de terceiros utilizados]
```

### Exemplo Real: Design do Login

```markdown
# Design: Autenticação de Usuário (Login)

## Componentes

- **AuthController** (src/presentation/controllers/auth.controller.ts)
  - Recebe request, valida DTO, delega ao use case

- **LoginUseCase** (src/application/use-cases/auth/login.use-case.ts)
  - Orquestra a lógica de negócio

- **UserRepository** (src/domain/repositories/user.repository.interface.ts)
  - Interface; implementação em infra/

- **TokenService** (src/application/services/token.service.ts)
  - Geração e validação de JWT (RS256)

- **RateLimitService** (src/application/services/rate-limit.service.ts)
  - Controle de tentativas via Redis

- **AuditLogService** (src/application/services/audit-log.service.ts)
  - Registro de eventos de autenticação

## Fluxo de Dados

```
POST /api/v1/auth/login
  → AuthController
    → LoginRequestDTO (class-validator: email, password)
    → RateLimitService.check(ip) → [429 se bloqueado]
    → LoginUseCase.execute({email, password})
      → UserRepository.findByEmail(email) → [null → falha]
      → bcrypt.compare(password, user.passwordHash) → [falso → falha]
      → TokenService.generatePair(userId) → {accessToken, refreshToken}
      → AuditLogService.log({userId, ip, success: true})
      → return {accessToken, refreshToken, expiresIn: 900}
    → 200 OK com TokenResponseDTO
```

## Interfaces e Contratos

```typescript
// DTO de entrada
class LoginRequestDTO {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
}

// DTO de saída
class TokenResponseDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // segundos
}

// Resultado do use case
type LoginResult = Result<TokenResponseDTO, AuthError>;
type AuthError = 'INVALID_CREDENTIALS' | 'RATE_LIMITED' | 'USER_NOT_FOUND';
```

## Tratamento de Erros

| Erro | Causa | HTTP Status | Response Body |
|------|-------|-------------|---------------|
| USER_NOT_FOUND | E-mail não cadastrado | 401 | {message: "Credenciais inválidas"} |
| INVALID_CREDENTIALS | Senha incorreta | 401 | {message: "Credenciais inválidas"} |
| RATE_LIMITED | >5 tentativas em 15min | 429 | {message: "Muitas tentativas. Tente em Xmin"} |

> Nota: USER_NOT_FOUND e INVALID_CREDENTIALS retornam o mesmo erro para evitar user enumeration.

## Estratégia de Testes

- **Unitário:** LoginUseCase — mock de UserRepository, TokenService, RateLimitService
- **Integração:** POST /api/v1/auth/login — banco real, Redis real
- **Segurança:** Tentar 6 logins e verificar o bloqueio
```

---

## 3. tasks.md — QUAIS PASSOS

### Propósito

Lista as **tarefas atômicas** que o agente deve executar para implementar a feature. É a instrução de trabalho do Claude.

### Estrutura

```markdown
# Tasks: [Nome da Feature]

## Pré-condições
[O que deve existir antes de começar]

## Tarefas

- [ ] T-001: [Descrição atômica e clara]
  - Arquivo: src/caminho/arquivo.ts
  - Referência: RF-001, RF-002

- [ ] T-002: [Próxima tarefa]
  - Depende de: T-001

## Definição de Pronto
- [ ] Todos os critérios de aceite passam
- [ ] Cobertura de testes > 80%
- [ ] Nenhum lint warning
- [ ] PR aberto e revisado
```

### Exemplo Real: Tasks do Login

```markdown
# Tasks: Autenticação de Usuário (Login)

## Pré-condições
- UserRepository e User entity existem (de spec anterior: user-registration)
- Redis está configurado e rodando
- Chaves RS256 estão em .env (JWT_PRIVATE_KEY, JWT_PUBLIC_KEY)

## Tarefas

- [ ] T-001: Criar LoginRequestDTO com validações class-validator
  - Arquivo: src/presentation/dtos/auth/login-request.dto.ts
  - Referência: RF-002, RC-001

- [ ] T-002: Criar TokenResponseDTO
  - Arquivo: src/presentation/dtos/auth/token-response.dto.ts
  - Referência: RF-003

- [ ] T-003: Implementar RateLimitService.checkLoginAttempts(ip)
  - Arquivo: src/application/services/rate-limit.service.ts
  - Lógica: incr Redis key "login:{ip}", ex em 900s, bloqueia se > 5
  - Referência: RF-005, RC-004

- [ ] T-004: Implementar LoginUseCase seguindo o fluxo do design.md
  - Arquivo: src/application/use-cases/auth/login.use-case.ts
  - Referência: RF-001 a RF-008

- [ ] T-005: Implementar AuthController.login()
  - Arquivo: src/presentation/controllers/auth.controller.ts
  - Adicionar rota POST /api/v1/auth/login no router

- [ ] T-006: Escrever testes unitários do LoginUseCase
  - Arquivo: test/unit/use-cases/auth/login.use-case.spec.ts
  - Cobrir: credenciais válidas, inválidas, rate limit

- [ ] T-007: Escrever testes de integração do endpoint
  - Arquivo: test/integration/auth/login.spec.ts
  - Cobrir: todos os critérios de aceite do requirements.md

## Definição de Pronto
- [ ] Todos os 7 critérios de aceite do requirements.md passam nos testes
- [ ] Cobertura de testes do LoginUseCase > 90%
- [ ] Nenhum secret hardcoded (revisão manual)
- [ ] Rate limit testado (6 tentativas consecutivas)
```

---

## A Relação Entre os Três Documentos

```
requirements.md          design.md              tasks.md
─────────────────        ──────────────         ──────────────────
RF-001: POST /login  →   AuthController    →   T-005: Criar AuthController
RF-005: rate limit   →   RateLimitService  →   T-003: Implementar RateLimitService
CA-001: 200 com JWT  →   TokenResponseDTO  →   T-006: Teste de credenciais válidas
```

**Rastreabilidade total**: cada task aponta para um requisito; cada design component implementa um requisito.

---

[EXERCÍCIO 01-1]
Pegue uma feature do seu projeto atual e escreva os três documentos:
1. requirements.md (mínimo 5 RF, 2 RC, 3 CA)
2. design.md (componentes, fluxo, interfaces)
3. tasks.md (mínimo 5 tasks com referências aos RFs)

Tempo: 45 minutos

---

[Próxima Aula →](./02-memory-bank.md)
