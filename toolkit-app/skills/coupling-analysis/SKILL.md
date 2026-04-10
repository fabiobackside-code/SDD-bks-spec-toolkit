---
name: coupling-analysis
description: Analisa acoplamento e violações de Arquitetura Hexagonal em projetos .NET SDD. Use sempre que o usuário mencionar "acoplamento", "coupling", "dependências cíclicas", "violação hexagonal", "ArchUnit", "analisar dependências" ou quiser verificar se o código respeita os contratos de Ports & Adapters antes de abrir um PR.
---

# Coupling Analysis — SDD

Verifica se o código respeita os contratos de Arquitetura Hexagonal definidos nos guidelines do bks-spec-toolkit, detectando violações antes que se tornem dívida técnica.

## Contexto

Este projeto usa Arquitetura Hexagonal (Ports & Adapters). A regra central é:

- **Domain** nunca referencia Adapters, Infrastructure, ORMs, frameworks ou drivers
- **Adapters** conhecem Domain (implementam Ports)
- **Infrastructure** conhece Adapters e Domain
- Dependências cíclicas entre namespaces são sempre bloqueantes

Leia `specs/guidelines/Arquitetura-Hexagonal-GUIDELINES.md` para entender as regras completas de dependência antes de iniciar a análise.

## Processo

### 1. Mapear estrutura de namespaces

Identifique a estrutura do projeto:
```bash
find src/ -name "*.csproj" | head -20
find src/ -name "*.cs" -path "*/Domain/*" | head -30
find src/ -name "*.cs" -path "*/Adapters/*" | head -30
```

### 2. Detectar violações de dependência

Busque referências proibidas nas camadas internas:

```bash
# Domain referenciando Adapters (BLOCKER)
grep -rn "using.*Adapters\." src/*/Domain/ 2>/dev/null
grep -rn "using.*Infrastructure\." src/*/Domain/ 2>/dev/null
grep -rn "using.*EntityFramework\|using.*Dapper\|using.*Npgsql" src/*/Domain/ 2>/dev/null

# Domain referenciando Microsoft.AspNetCore (BLOCKER)
grep -rn "using Microsoft\.AspNetCore\." src/*/Domain/ 2>/dev/null

# Ports definidos fora de Domain (WARNING)
grep -rn "interface I.*Repository\|interface I.*Port\|interface I.*Service" src/ 2>/dev/null | grep -v "/Domain/"
```

### 3. Detectar dependências cíclicas

```bash
# Referências cruzadas entre Adapters (WARNING)
grep -rn "using.*Adapters\." src/*/Adapters/ 2>/dev/null

# Application referenciando Infrastructure diretamente (BLOCKER)
grep -rn "using.*Infrastructure\." src/*/Application/ 2>/dev/null
```

### 4. Verificar contratos de Port

```bash
# Implementações de Repository/Port que não estão em Adapters ou Infrastructure
grep -rn "class.*Repository\b\|class.*Adapter\b" src/ 2>/dev/null | grep -v "/Adapters/\|/Infrastructure/"
```

### 5. Correlacionar com testes de arquitetura

Se existir projeto de testes, verificar se os testes ArchUnit cobrem as violações encontradas:
```bash
find tests/ -name "*.cs" | xargs grep -l "ArchUnit\|Architecture\|HasDependencyOn" 2>/dev/null
```

## Relatório de Saída

Use sempre este formato:

```
## Coupling Analysis Report
**Data:** <data>
**Projeto:** <nome>

### Violações Encontradas

#### BLOCKER (impedem merge)
- [ ] `Domain/Aggregates/Foo.cs:42` — `using Adapters.PostgreSQL.Repositories` 
  → Remover. Injetar `IFooRepository` (Port) via construtor.

#### WARNING (devem ser corrigidas antes do merge)
- [ ] `Adapters/Http/FooController.cs:15` — Referencia `Adapters.Kafka.Producer` diretamente
  → Usar Port `IEventPublisher` injetado.

#### INFO (melhorias recomendadas)
- [ ] Port `IFooRepository` definido em `Application/` em vez de `Domain/Ports/`
  → Mover para `Domain/Ports/Outbound/IFooRepository.cs`

### Resumo
- Blockers: N
- Warnings: N
- Info: N
- Status: ✅ APROVADO / ❌ REPROVADO (blockers existem)
```

## Critérios de Aprovação

- Zero violações **BLOCKER** para aprovação
- Warnings devem ter issue criada ou ser corrigidos antes do merge
- Referenciar `specs/CLAUDE-TDD.md` se os testes ArchUnit não existirem: isso é um Warning automático (DoD exige 10% de testes de arquitetura)

## Referências

- `specs/guidelines/Arquitetura-Hexagonal-GUIDELINES.md` — Regras detalhadas de dependência
- `specs/CLAUDE-TDD.md` — Testes de arquitetura com ArchUnit (10% da pirâmide)
- `specs/guidelines/Arquitetura-Hexagonal-GUIDELINES.md` — Anti-patterns: cyclic dependencies, tight coupling, mixed concerns
