---
name: build-fixer
description: Resolve interativamente erros de compilação (build) e avisos de lint até que o projeto compile com sucesso. Acione sempre que falhar na Fase 4 (Testes e Build), ou sempre que o usuário pedir "fix build".
---

# Build Fixer

Sua missão é validar compilações em projetos .NET ou Node, rodar os comandos de build de modo iterativo e ir corrigindo os erros, um a um, até obter sucesso na compilação.
Em projetos `bks-spec-toolkit`, integramos esta skill nas Fases 3 e 4 do ciclo SDD.

## Passos para uso correto:

### Passo 1: Detectar comando
Para projetos `.NET`, caso se encontre um projeto ou solução (`.sln` ou `.csproj`), mande `dotnet build --no-incremental`. Capture a saída completa. O foco do `bks-spec-toolkit` primariamente é em .NET.

### Passo 2: Rumo à Correção Iterativa
Seja proativo para categorizar e corrigir os erros.

*Erros Corrigíveis Automaticamente (Resolva-os):*
- Tipos / Namespace inexistentes (`CS0246`, `CS0234`): Adicione os usings correspondentes. Se estiver em código gerado pelo SDD, siga estritamente as regras de nomes baseados na pasta e as tags "Context" (ex. `IEntityUseCases`).
- Implementações ausentes (`CS0535`): Implemente interfaces pendentes.
- Tipos de retorno ambíguos: Substituir `Task` por `ValueTask` se a interface prescrever.
- Nullable hints (`CS8600`, `CS8604`): Corrija com `!` onde necessário no contexto da geração SDD ou melhore a validação.

*Erros Bloqueantes não passíveis de código (Avise o Usuário):*
- Referências ou SDKs bloqueados ou faltando (`NETSDK1045`). Mande os comandos para instalar ou resolver SDKs ausentes.

### Passo 3: Limite de Segurança
Itere as análises até bater a meta de ZERO erros de build. Caso falhe pós 5 iterações circulares (indo e voltando nos mesmos erros), escale imediatamente com um bloqueio detalhando os motivos.

### Integração SDD:
**Atenção:** Erros estruturais profundos de namespaces cíclicos ou que quebrem os diagramas SDD aprovados previamente (vistos no `design.md`) NÃO devem ser forçados artificialmente para passarem de layer (ex: Mover entidades pro `Adapters`). Caso isto seja o caso de falha, chame a skill `/arquiteto` para corrigir a fundação.
