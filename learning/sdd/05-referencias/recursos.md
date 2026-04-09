# Recursos e Referências SDD

> Módulo 05 · Tempo estimado: 30min (leitura e exploração)

---

## Artigos Fundamentais

### DS Academy — Série SDD (5 partes)
> Série completa em português sobre SDD, escrita com foco na comunidade brasileira.

- **Parte 1:** Spec-Driven Development — A Nova Arquitetura de Engenharia de Software
  `https://blog.dsacademy.com.br/spec-driven-development-a-nova-arquitetura-de-engenharia-de-software-na-era-dos-agentes-de-ia-parte-1/`
  **Leia quando:** quiser entender a filosofia e motivação do SDD

- **Partes 2-5:** Continuação da série sobre ferramentas, workflow e casos práticos
  > Acesse o blog para as próximas partes

### Martin Fowler — Exploring Gen AI: SDD Tools
`https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html`
**Leia quando:** quiser análise crítica e prática das ferramentas (Kiro, Spec-Kit, Tessl)
**Destaque:** análise honesta das limitações do SDD — importante para expectativas realistas

---

## Vídeos

### Introdução ao SDD com Claude Code
`https://www.youtube.com/watch?v=9L4iyiNT86k`
**Assista quando:** quiser ver o workflow SDD em ação, passo a passo
**Duração estimada:** 30-60min

### Spec-Driven Development na Prática
`https://www.youtube.com/watch?v=e_D9M_MJ9Hs`
**Assista quando:** quiser ver exemplos reais de specs sendo criadas e executadas

### SDD para Equipes: Escalando o Processo
`https://www.youtube.com/watch?v=cenPrHKGIRQ`
**Assista quando:** quiser entender como adotar SDD no contexto de uma equipe

### Série Completa SDD (Playlist)
`https://www.youtube.com/watch?v=-jPYunHFGL4&list=PLz_YTBuxtxt74pV0UiFzG3gdXe6Em8v44&index=6`
**Assista quando:** quiser aprofundamento completo no tema

---

## Documentação das Ferramentas

### Claude Code
- Documentação oficial: `https://docs.anthropic.com/en/docs/claude-code`
- Guia de configuração: `https://docs.anthropic.com/en/docs/claude-code/quickstart`
- Arquivo CLAUDE.md: `https://docs.anthropic.com/en/docs/claude-code/memory`

### Anthropic API e SDK
- Referência da API: `https://docs.anthropic.com/en/api`
- SDK TypeScript/JavaScript: `https://github.com/anthropic-ai/anthropic-sdk-node`
- Tool Use (Function Calling): `https://docs.anthropic.com/en/docs/tool-use`
- Models disponíveis: `https://docs.anthropic.com/en/docs/models-overview`

### Kiro (IDE AWS com SDD embutido)
- Site oficial: `https://kiro.dev`
- Documentação: procure por "Kiro IDE documentation"

### Spec-Kit (CLI open source)
- GitHub: procure por "spec-kit" no GitHub

---

## Padrões e Metodologias Relacionados

### EARS (Easy Approach to Requirements Syntax)
> O padrão de escrita de requisitos usado nos templates SDD.
- Paper original: Alistair Mavin et al., "Easy Approach to Requirements Syntax"
- **Palavras-chave EARS:**
  - `MUST` / `DEVE` — obrigatório
  - `SHALL NOT` / `NÃO DEVE` — proibido
  - `SHOULD` / `DEVERIA` — recomendado
  - `MAY` / `PODE` — opcional
  - `WHEN [condition] MUST` — condicional

### C4 Model (Diagramas de Arquitetura)
- Site oficial: `https://c4model.com`
- **Os 4 níveis:**
  1. Context: sistema e seus usuários/sistemas externos
  2. Container: aplicações, bancos, filas dentro do sistema
  3. Component: módulos e serviços dentro de um container
  4. Code: classes e interfaces (raramente necessário)
- Mermaid com suporte a C4: `https://mermaid.js.org/syntax/c4.html`

### DDD Context Maps (Mapa de Contextos)
- Livro base: "Domain-Driven Design" — Eric Evans
- Referência prática: "Implementing Domain-Driven Design" — Vaughn Vernon
- **Padrões de relacionamento:**
  - `Upstream/Downstream (U/D)` — quem influencia quem
  - `Shared Kernel (SK)` — código compartilhado (use com cuidado)
  - `Anti-Corruption Layer (ACL)` — tradução de modelos na fronteira
  - `Open Host Service (OHS)` — API pública bem definida
  - `Conformist (CF)` — adaptação ao modelo do upstream
  - `Customer/Supplier` — negociação explícita entre times

### Clean Architecture
- Livro: "Clean Architecture" — Robert C. Martin
- **Regra de dependência:** camadas internas nunca dependem de externas
  ```
  Domínio ← Aplicação ← Infraestrutura ← Apresentação
  (sem ← invertidas)
  ```

---

## Ferramentas de Suporte

### Mermaid (Diagramas em Markdown)
- Editor online: `https://mermaid.live`
- Sintaxe C4: `https://mermaid.js.org/syntax/c4.html`
- Renderizado automaticamente no GitHub, GitLab, Notion, Confluence

### Formatos de Spec Alternativos

**Para times que preferem outros formatos:**

- **Gherkin (BDD):** `Given/When/Then` — bom para comportamentos de usuário
  ```gherkin
  Scenario: Login com credenciais válidas
    Given um usuário cadastrado com email "user@example.com"
    When faz login com a senha correta
    Then recebe tokens de acesso e refresh
  ```

- **OpenAPI/Swagger:** para specs de API REST
  ```yaml
  post:
    /auth/login:
      requestBody: { email, password }
      responses:
        200: { accessToken, refreshToken }
        401: { message }
  ```

- **AsyncAPI:** para specs de eventos (equivalente ao OpenAPI para mensageria)

---

## Livros Recomendados

| Livro | Autor | Relevância para SDD |
|-------|-------|---------------------|
| Domain-Driven Design | Eric Evans | Bounded Contexts, Linguagem Ubíqua |
| Implementing DDD | Vaughn Vernon | Aplicação prática do DDD |
| Clean Architecture | Robert C. Martin | Separação de camadas |
| Building Microservices | Sam Newman | Arquitetura distribuída, eventos |
| The Pragmatic Programmer | Hunt & Thomas | Mentalidade de engenharia de qualidade |

---

## Checklist de Adoção do SDD na Equipe

### Semana 1: Setup e Primeiro Projeto
- [ ] Todos assistiram/leram os materiais de introdução (Módulo 00)
- [ ] Claude Code instalado e configurado em todos os computadores
- [ ] Primeiro CLAUDE.md criado para um projeto real
- [ ] Memory bank criado (product, structure, tech)
- [ ] Primeira spec completa escrita para uma feature pequena

### Semana 2-3: Primeira Feature Completa em SDD
- [ ] requirements.md revisado pela equipe (não apenas pelo autor)
- [ ] design.md aprovado por pelo menos um engenheiro sênior
- [ ] Claude Code executou as tasks com a spec como guia
- [ ] Spec atualizada com aprendizados pós-implementação

### Mês 1: Processo Estabelecido
- [ ] Toda nova feature começa com spec (sem exceções)
- [ ] Code review inclui revisão da spec
- [ ] Specs estão no mesmo repositório que o código
- [ ] Equipe consegue onboarding de novos devs usando specs existentes

### Mês 2-3: Maturidade
- [ ] Specs de features antigas escritas retroativamente (tech debt da documentação)
- [ ] Templates refinados com as preferências da equipe
- [ ] CLAUDE.md atualizado com aprendizados
- [ ] Métricas: comparar velocidade e bugs antes/depois do SDD

---

## FAQ: Dúvidas Comuns

### "Quanto tempo leva para escrever uma spec?"

Para features típicas:
- Micro-feature (1-2 endpoints): 30-60 minutos
- Feature média (1 domínio, 4-6 endpoints): 2-3 horas
- Feature complexa (múltiplos domínios, eventos): meio dia

O tempo de spec é compensado pela eliminação de iterações ad-hoc.

### "E para bug fixes? Preciso de spec?"

Para bugs pontuais: não. Apenas descreva o bug no prompt do Claude.
Para mudanças de comportamento que afetam usuários: sim, atualize o requirements.md.

### "O Claude sempre segue a spec?"

Não 100% — o Claude pode interpretar erroneamente ou omitir partes.
Por isso o processo inclui revisão após cada task.
Specs mais detalhadas (com exemplos de código nas interfaces) geram resultados mais consistentes.

### "Posso usar SDD com Cursor, Copilot, etc.?"

Sim! SDD é agnóstico de ferramenta. O CLAUDE.md pode ser adaptado para:
- Cursor: use `.cursorrules`
- GitHub Copilot: use comentários de contexto no início dos arquivos
- Qualquer agente: forneça os arquivos de spec como contexto

### "E para projetos legados sem documentação?"

Use o Case 2 (Analisador de Legado) para gerar a documentação inicial.
Depois adote SDD para todas as novas features.
