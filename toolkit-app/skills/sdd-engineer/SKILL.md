---
name: sdd-engineer
description: Guia de implementação de arquitetura Hexagonal e DDD para o bks-spec-toolkit (.NET 8+). Use ao gerar ou modificar código base, implementando Aggregates, Ports, e Adapters para assegurar que erros de namespace (CS0118), dependências proibidas, e a ordem de geração de camadas (Domain -> Ports -> Application -> Adapters) sejam estritamente seguidos.
---

# SDD Engineer - Guia de Geração .NET

Este skill unifica a implementação de Arquitetura Hexagonal, DDD Tático e a prevenção de erros comuns de compilação C# nas soluções SDD. NUNCA DEVE HAVER REFERÊNCIA AO INFRA/BANDO DE DADOS DENTRO DO DOMÍNIO.

## 1. Regras de Arquitetura (Ports & Adapters)

- **Domain/Core**: Contém APENAS **POCOs e Interfaces (Ports)**. Zero referências a bibliotecas externas, `Microsoft.AspNetCore`, `EntityFrameworkCore`, ou infraestrutura. NUNCA coloque `[Key]` nas entidades.
- **Adapters**: Onde implementações concretas de port residem (Controllers, Dapper/EF DbContext). Tudo que toca banco de dados ou protocolo externo reside aqui.
- **ServiceCollectionExtensions / DI**: Configurações Inbound (API) e Outbound (Persistence, Security) ficam nos seus respectivos namespaces de Adapter e não no Domínio.

## 2. Ordem de Geração Rigorosa

Para evitar referências futuras quebradas e erros sintáticos:
1. **Pipeline & Contracts**: `Domain/Core/Common/` -> `PipelineResult`, `BaseTransaction`, `ValidationStep`.
2. **Entidades**: `Domain/Core/Entities/{Entity}Context/` -> `class {Entity}`. **Crucial:** O sufíxo `Context` no namespace previne o erro `CS0118`.
3. **Ports**: `Domain/Core/Ports/Outbound/` (`I{Entity}Repository`) e `Domain/Core/Ports/Application/` (`I{Entity}UseCases`).
4. **Application**: `Application/UseCases/{Entity}/{Op}/` -> Implementar transação, dependências, respostas e as Steps usando os Ports.
5. **Adapters e Program.cs**.

## 3. Prevenção "Anti-Erro CS"

Antes de finalizar/entregar um arquivo \`.cs\`, valide os itens abaixo:

- **CS0118 (Shadowing)**: Nunca use o nome da entidade como o segmento final do namespace (ex. `Namespace.Cargo` com a classe `Cargo`). Exija sempre o sufixo: `Namespace.CargoContext; public class Cargo {}`. Nas \`Steps\`, se der conflito, inclua o alias explícito `using {Entity}Entity = {RootNs}.Features.{Ctx}.{Entity}.Domain.{Entity};`.
- **CS0246 (using ausentes)**:
  - Todas as **Steps** devem trazer 2 usings distintos se precisarem de Pipeline: `using ...Pipeline;` E `using ...Pipeline.Steps;`.
  - Interfaces \`I...UseCase.cs\` devem importar a própria transaction e, se não forem classe abstrata Create, referenciar `Create` se usarem respostas padrão.
  - \`*Endpoints.cs\` precisam de `using System.Diagnostics;`.
- **CS0535 / CS0738 (Assinatura Divergente)**: As interfaces `I*UseCase` usam sempre `ValueTask<PipelineResult<T>>`, *nunca* `Task<>`.
- **CS1061**: Lógica de exceção no trace deve substituir chamadas nativas de extension antigas por propriedades de Tag simples: `activity?.SetTag("exception.message", ex.Message)`.
- Fences MD: Garanta que blocos Markdown não estejam incluídos na primeira linha real dos arquivos `.cs`.

## 4. Otimização

- Utilize structs, `Span<T>` e code pools se o requerimento RNF exigir latência micro (<10ms).
- O Orchestrator e as Steps (Validation, Processing) sempre entregam sucesso ou tratam falha localmente via `PipelineResult<T>.Failure()`, sem lançar `Exception` natural de domínio dentro das pipelines de requisição web.
