---
name: technical-design-doc-creator
description: Gera design.md completo para uma feature SDD em projetos .NET. Use quando o usuário mencionar "criar design", "gerar design.md", "technical design doc", "fase design", "documentar arquitetura da feature" ou quiser transformar requirements.md em documento de design técnico.
---

# Technical Design Doc Creator — SDD .NET

Transforma `requirements.md` e o modelo de domínio (resultado de `/domain-analysis`) em um `design.md` completo, seguindo `design-template-net.md` e os padrões de `Implementacao-DotNet-GUIDELINES.md`.

## Contexto

Este projeto segue Arquitetura Hexagonal com DDD em .NET 8+. O `design.md` é o artefato central da Fase 2: define quais Aggregates, Ports e Adapters serão implementados nas tasks seguintes. Um design incompleto gera tasks ambíguas e dívida técnica.

Leia antes de iniciar:
- `specs/guidelines/Arquitetura-Hexagonal-GUIDELINES.md` — Hexagonal Architecture: Ports & Adapters, regras de dependência (agnóstico)
- `specs/guidelines/Aplicando-DDD-GUIDELINES.md` — DDD tático: Aggregates, Value Objects, Domain Services
- `specs/guidelines/Implementacao-DotNet-GUIDELINES.md` — Implementações .NET: Aggregate Root em C#, Port interfaces, PostgreSQL Adapter, DI
- `specs/templates/net/design-template-net.md` — estrutura exata a ser preenchida

## Processo

### 1. Ler artefatos de entrada

```bash
cat specs/features/<feature>/requirements.md
cat specs/features/<feature>/design.md  # se já iniciado pelo domain-analysis
```

Extrair de `requirements.md`:
- RFs com identificadores (RF-001, RF-002...)
- RNFs mensuráveis (latência, throughput, cobertura)
- RCs de stack (banco, versão .NET, libs)
- CAs (critérios de aceite — guiam os Ports que precisam existir)

### 2. Mapear estrutura de pastas

Seguindo `Implementacao-DotNet-GUIDELINES.md` e a estrutura hexagonal:

```
src/<NomeProjeto>/
├── Domain/
│   ├── Core/
│   │   ├── Aggregates/          ← Aggregate Roots (identificados no domain-analysis)
│   │   ├── Entities/            ← Entidades filhas
│   │   └── ValueObjects/        ← VOs imutáveis
│   └── Ports/
│       ├── Application/         ← interfaces dos Use Cases (o que a app OFERECE)
│       └── Outbound/            ← interfaces das dependências (o que a app PRECISA)
├── Application/
│   └── UseCases/                ← implementações de Use Cases
├── Adapters/
│   ├── Inbound/
│   │   └── Http/                ← Controllers, Minimal API Endpoints
│   └── Outbound/
│       ├── Persistence/         ← Repositories (Dapper, EF Core)
│       └── Messaging/           ← Producers/Consumers (Kafka, RabbitMQ)
└── Infrastructure/
    └── DependencyInjection/     ← ServiceCollectionExtensions
```

### 3. Definir Ports (contratos)

Para cada dependência externa identificada nos RFs, criar Port em `Domain/Ports/Outbound/`:

```csharp
// Padrão obrigatório — Port é interface, fica no Domain
public interface I<Nome>Repository
{
    Task<<Aggregate>?> GetByIdAsync(<TId> id, CancellationToken ct = default);
    Task SaveAsync(<Aggregate> entity, CancellationToken ct = default);
}
```

Regra: **NUNCA** tecnologia no Port (sem `IDbConnection`, sem `DbContext`).

### 4. Definir Use Cases

Para cada grupo de RFs com mesmo Aggregate Root:

```csharp
// Port Application — o que a app OFERECE
public interface I<Feature>UseCase
{
    Task<PipelineResult<<FeatureResponse>>> ExecuteAsync(<FeatureTransaction> transaction, CancellationToken ct = default);
}

// Transaction — imutável, carrega contexto
public record <Feature>Transaction(
    string CorrelationId,
    string UserId,
    // ... parâmetros da operação
) : BaseTransaction<<FeatureResponse>>;
```

### 5. Definir Adapters

Para cada Port Outbound, o Adapter que implementa:

```csharp
// Adapter — fica em Adapters/Outbound/Persistence/
public class PostgreSql<Nome>Repository : I<Nome>Repository
{
    // Usa Dapper (preferência) ou EF Core
    // Mapeia entre modelo de persistência e Domain model
}
```

### 6. Diagrama de fluxo

Descrever o fluxo da operação principal:

```
HTTP Request
  └── <Nome>Endpoint (Adapter Inbound)
        └── cria <Feature>Transaction (CorrelationId, UserId, TraceId)
        └── <Feature>UseCase.ExecuteAsync(transaction)
              └── PipelineOrchestrator
                    ├── [10] ValidationStep
                    ├── [30] ProcessingStep → I<Nome>Repository.SaveAsync()
                    └── PipelineResult<<FeatureResponse>>
        └── HTTP 201 / 400 (Result Pattern)
```

### 7. Tabela de rastreabilidade

| RF | Aggregate/Método | Port | Adapter | CA |
|----|-----------------|------|---------|-----|
| RF-001 | `<Aggregate>.<Método>()` | `I<Nome>Repository` | `PostgreSql<Nome>Repository` | CA-001 |

## Saída

Arquivo `specs/features/<feature>/design.md` preenchido usando `specs/templates/net/design-template-net.md` com:

1. **Folder Structure** — estrutura de pastas com namespaces reais
2. **Code Examples** — Aggregate Root, Port interfaces, Adapter skeleton em C#
3. **Flow Diagram** — fluxo do caso de uso principal
4. **Rastreabilidade** — tabela RF → Componente → CA
5. **Decisões de design** — justificativas para escolhas não óbvias (ADR inline)

## Regras de Qualidade

- Domain nunca referencia `Microsoft.AspNetCore.*`, `EntityFrameworkCore`, drivers de banco
- Toda dependência externa tem um Port (`interface I...`) antes do Adapter
- Transaction é `record` imutável — nunca `class` mutável
- Use Cases retornam `PipelineResult<T>` — nunca `throw` de exceção de negócio
- Cada RF tem ≥1 componente mapeado na tabela de rastreabilidade

## Referências

- `specs/guidelines/Arquitetura-Hexagonal-GUIDELINES.md` — padrões agnósticos: Hexagonal, Ports & Adapters, regras de dependência
- `specs/guidelines/Aplicando-DDD-GUIDELINES.md` — DDD tático: Aggregates, Value Objects, Domain Services
- `specs/guidelines/Implementacao-DotNet-GUIDELINES.md` — implementações C# com exemplos
- `specs/templates/net/design-template-net.md` — template de saída obrigatório
- `specs/guidelines/Implementacao-DotNet-GUIDELINES.md` — libs mandatórias: Dapper, xUnit, Testcontainers, ArchUnit
