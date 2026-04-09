---
name: gh-address-comments
description: Resolve comentários de review de um PR no GitHub respeitando os contratos SDD. Use quando o usuário mencionar "address PR comments", "responder comentários do PR", "resolver review", "gh address comments", "corrigir feedback do reviewer" ou quiser tratar comentários de code review de forma sistemática.
---

# gh-address-comments — SDD

Resolve comentários de review de PR de forma sistemática, garantindo que cada correção respeita os princípios SDD (DoD, arquitetura hexagonal, cobertura de testes) e responde ao reviewer com o commit da correção.

## Contexto

Este projeto segue SDD — toda correção motivada por review deve respeitar os 6 princípios de `specs/CLAUDE.md` e o DoD de `specs/PLAN.md`. Uma correção que quebra ArchUnit ou reduz cobertura abaixo de 80% é uma violação do DoD, mesmo que o reviewer tenha pedido.

Requer `gh` CLI autenticado:
```bash
gh auth status
```

## Processo

### 1. Listar comentários pendentes do PR

```bash
# Identificar o PR atual
gh pr view --json number,title,state

# Listar comentários de review não resolvidos
gh pr view --json reviews,comments | jq '.reviews[] | select(.state == "CHANGES_REQUESTED")'

# Listar comentários inline (por arquivo/linha)
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments \
  --jq '.[] | {id: .id, path: .path, line: .line, body: .body, user: .user.login}'
```

### 2. Categorizar cada comentário

Para cada comentário, classificar antes de agir:

| Categoria | Ação |
|-----------|------|
| **Correção legítima** — alinha com SDD e arquitetura | Implementar |
| **Conflito com SDD** — pedido viola CLAUDE.md / arquitetura hexagonal | Responder explicando o princípio, não implementar |
| **Melhoria de legibilidade** — renomear, extrair método | Implementar se não quebra DoD |
| **Questão/dúvida** — não é solicitação de mudança | Responder via gh |

Verificar contra `specs/CLAUDE.md` e `specs/CLAUDE-ARCHITECT.md` antes de cada implementação.

### 3. Implementar correções

Para cada comentário que requer mudança de código:

1. Ler o arquivo referenciado no contexto do comentário
2. Verificar que a correção não:
   - Adiciona referência de infra no Domain
   - Remove testes existentes
   - Reduz cobertura abaixo de 80%
   - Introduz MediatR, `dynamic`, ou `throw` de exceção de negócio
3. Implementar a correção
4. Executar os testes afetados:
   ```bash
   dotnet test tests/ --filter "FullyQualifiedName~<área afetada>" --no-build
   ```

### 4. Verificar DoD após todas as correções

```bash
# Suite completa
dotnet test tests/ --collect:"XPlat Code Coverage"

# Verificar cobertura ≥ 80%
# Verificar ArchUnit passando (sem cyclic deps)
dotnet test tests/ --filter "Category=Architecture"

# Suite deve terminar em < 5 minutos
```

### 5. Responder aos comentários

Para cada comentário endereçado, responder via `gh api`:

```bash
# Responder comment inline
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments/{comment_id}/replies \
  -f body="Corrigido em <commit_hash>. <breve_explicação>"

# Para comentário geral de review
gh pr comment {pr_number} \
  --body "Todos os comentários de @<reviewer> foram endereçados. Suite passando (cobertura: X%). ArchUnit: ✅"
```

### 6. Comentários que conflitam com SDD

Quando um comentário pede algo que viola os princípios SDD:

```bash
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments/{comment_id}/replies \
  -f body="Este padrão conflita com o princípio [N] de specs/CLAUDE.md: <explicação>.
  
  Alternativa que atende o objetivo sem violar a arquitetura: <proposta>.
  
  Se quiser discutir a exceção, podemos abrir um ADR."
```

Nunca implementar silenciosamente algo que viola os princípios SDD para "fechar" um comentário.

## Checklist Final (DoD do PR)

- [ ] Todos os comentários foram respondidos (implementados ou explicados)
- [ ] Suite completa passando
- [ ] Cobertura ≥ 80% (não reduziu)
- [ ] ArchUnit passando (sem novas cyclic deps ou violações hexagonais)
- [ ] Suite completa < 5 minutos
- [ ] Nenhuma violação de `specs/CLAUDE.md` introduzida

## Referências

- `specs/CLAUDE.md` — 6 princípios SDD + DoD (Princípio 5): critério de aprovação de toda mudança
- `specs/CLAUDE-TDD.md` — Pirâmide 70/20/10: correções que adicionam funcionalidade precisam de testes
- `specs/CLAUDE-ARCHITECT.md` — Anti-patterns que correções não podem introduzir
- `specs/CLAUDE-ARCHITECT-NET.md` — Padrões C# que devem ser preservados
