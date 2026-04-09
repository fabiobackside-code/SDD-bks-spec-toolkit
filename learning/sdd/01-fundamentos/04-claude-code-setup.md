# Configurando Claude Code para SDD

> Módulo 01 · Aula 4 · Tempo estimado: 20min

---

## Instalação

```bash
# Instalar Claude Code globalmente
npm install -g @anthropic-ai/claude-code

# Verificar instalação
claude --version

# Autenticar (abre browser para login)
claude auth login
```

---

## Modos de Uso

### 1. Modo Interativo (Chat)
```bash
claude
# Inicia sessão interativa — você digita prompts
# Melhor para: discussão de specs, revisão de design, dúvidas
```

### 2. Modo de Comando Único
```bash
claude "Execute T-001 de spec/auth/tasks.md"
# Executa um prompt e encerra
# Melhor para: tasks bem definidas
```

### 3. Modo com Contexto Adicional
```bash
claude --add-dir ./spec/auth "Implemente os requisitos"
# Adiciona diretório ao contexto explicitamente
# Útil quando CLAUDE.md não referencia o diretório
```

---

## Configuração do Projeto para SDD

### settings.json do Claude Code

Crie `.claude/settings.json` na raiz do projeto:

```json
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Write(src/**)",
      "Write(test/**)",
      "Write(spec/**)",
      "Bash(npm test*)",
      "Bash(npm run lint*)",
      "Bash(npx typeorm migration:generate*)"
    ],
    "deny": [
      "Write(src/database/migrations/*.ts)",
      "Bash(npm publish*)",
      "Bash(git push*)",
      "Bash(docker rm*)",
      "Bash(rm -rf*)"
    ]
  }
}
```

> **Princípio de menor privilégio:** Claude Code só deve ter permissão para o que precisa. Negar acesso a migrações existentes, publicação e operações destrutivas.

### Para .NET (C#)

```json
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Write(src/**)",
      "Write(tests/**)",
      "Write(spec/**)",
      "Bash(dotnet build*)",
      "Bash(dotnet test*)",
      "Bash(dotnet run*)"
    ],
    "deny": [
      "Write(src/**/Migrations/*.cs)",
      "Bash(dotnet publish*)",
      "Bash(git push*)"
    ]
  }
}
```

### Para Spring Boot (Java)

```json
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Write(src/**)",
      "Write(spec/**)",
      "Bash(./mvnw test*)",
      "Bash(./mvnw compile*)",
      "Bash(./gradlew test*)"
    ],
    "deny": [
      "Write(src/main/resources/db/migration/*.sql)",
      "Bash(./mvnw deploy*)",
      "Bash(git push*)"
    ]
  }
}
```

---

## Prompts SDD Fundamentais

### 1. Calibração Inicial
```
"Leia CLAUDE.md e memory-bank/. Me diga:
1. O que você entendeu sobre o projeto
2. Quais informações estão faltando ou são ambíguas
3. Quais decisões técnicas estão implícitas mas não documentadas
Não escreva código — apenas analise."
```

### 2. Revisão de Spec
```
"Revise spec/[feature]/requirements.md e identifique:
1. Requisitos com ambiguidade que podem gerar suposições silenciosas
2. Casos de borda não cobertos
3. Contradições internas
4. Requisitos não testáveis (sem critério de aceite claro)
Não implemente — apenas liste os problemas."
```

### 3. Geração de Design
```
"Com base em spec/[feature]/requirements.md e nossa arquitetura em memory-bank/structure.md:
1. Identifique os componentes necessários
2. Proponha o fluxo de dados (ASCII diagram)
3. Defina as interfaces TypeScript dos contratos entre componentes
4. Liste a estratégia de tratamento de erros
5. Proponha a estratégia de testes

Siga as convenções de memory-bank/tech.md.
Salve o resultado em spec/[feature]/design.md."
```

### 4. Geração de Tasks
```
"Com base em spec/[feature]/requirements.md e spec/[feature]/design.md:
Crie spec/[feature]/tasks.md com:
- Tasks atômicas e ordenadas
- Cada task referenciando o(s) RF que implementa
- O arquivo de destino de cada task
- As dependências entre tasks
- A definição de pronto (testes incluídos)"
```

### 5. Execução de Task
```
"Execute T-001 de spec/[feature]/tasks.md.
Siga rigorosamente:
- spec/[feature]/requirements.md para o comportamento
- spec/[feature]/design.md para a estrutura
- memory-bank/tech.md para as convenções

Após concluir, explique o que foi implementado e aguarde aprovação."
```

### 6. Verificação de Completude
```
"Compare a implementação atual com spec/[feature]/requirements.md.
Para cada RF e CA, diga:
- IMPLEMENTADO: [onde está no código]
- PARCIAL: [o que falta]
- NÃO IMPLEMENTADO: [não existe]

Não escreva código — apenas verifique."
```

---

## Integração com VS Code

### Extensão Claude Code

1. Instale a extensão "Claude Code" no VS Code
2. Abra o painel lateral (ícone Claude)
3. Sessões no VS Code têm acesso ao workspace automaticamente

### Atalhos úteis

```
Ctrl+Shift+P → "Claude: Open Chat"     # Abre chat inline
Ctrl+Shift+P → "Claude: Run Command"   # Executa comando direto
```

### Dica: Abrir spec e implementação lado a lado

```
VS Code → Split Editor
Esquerda: spec/feature/requirements.md
Direita: src/feature/implementation.ts
```

---

## Boas Práticas de Prompt para SDD

### DO: Prompts precisos com contexto

```
# BOM
"Execute T-003 de spec/orders/tasks.md.
T-003 implementa RF-005 (rate limiting por IP).
Use Redis via ioredis conforme memory-bank/tech.md.
A implementação fica em src/application/services/rate-limit.service.ts."

# RUIM
"Implementa o rate limiting"
```

### DO: Restrições explícitas

```
# BOM
"Implemente o CreateOrderUseCase.
NÃO crie o OrderController ainda (T-004).
NÃO altere o esquema do banco (migrations são spec separada).
USE o padrão Result<T, E> definido em memory-bank/tech.md."
```

### DO: Pedir análise antes de implementar

```
# BOM
"Antes de implementar T-001, analise spec/auth/design.md e identifique:
- Qualquer ambiguidade que possa levar a implementações incorretas
- Dependências que devem existir antes de T-001
Se houver ambiguidades, pergunte — não assuma."
```

### DON'T: Deixar o Claude tomar decisões arquiteturais implicitamente

```
# RUIM
"Implementa a autenticação"
# Claude vai inventar uma arquitetura própria

# BOM
"Implemente a autenticação conforme spec/auth/.
Decisões de arquitetura já estão em spec/auth/design.md — siga-as."
```

---

## Fluxo de Trabalho Diário com Claude Code

```bash
# Início do dia: calibrar o contexto
claude "Leia CLAUDE.md e spec/orders/tasks.md.
Quais tasks estão pendentes? Qual devemos atacar primeiro?"

# Durante o dia: executar tasks
claude "Execute T-003 conforme spec/orders/tasks.md"

# Revisar o código gerado no editor

# Após aprovação
claude "T-003 aprovada. Marque como concluída no tasks.md.
Há pré-condições para T-004?"

# Ao final do dia: status
claude "Liste o status de todas as tasks de spec/orders/tasks.md.
Para as concluídas, confirme que os testes passam."
```

---

## Solução de Problemas Comuns

### Claude ignorou uma restrição da spec

```
claude "Você implementou [X], mas RF-004 diz [Y].
Por favor, revise src/[arquivo].ts para alinhar com RF-004."
```

### Claude saiu do escopo da task

```
claude "A task T-002 foi concluída, mas você também criou [arquivo extra].
Esse arquivo não estava no escopo de T-002. Por favor, remova-o.
Ele será criado quando executarmos T-005."
```

### Código não segue as convenções do tech.md

```
claude "O código em src/[arquivo].ts usa [padrão X], mas memory-bank/tech.md
define que devemos usar [padrão Y]. Por favor, refatore para seguir a convenção."
```

---

[Próximo Módulo: Prática Progressiva →](../02-pratica-progressiva/01-exemplo-simples.md)
