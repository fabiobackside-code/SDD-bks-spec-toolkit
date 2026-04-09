# Tasks: Analisador de Aplicações Legadas

## Pré-condições
- Node.js 20 instalado
- ANTHROPIC_API_KEY válida em .env
- `npm install` executado

---

## Tarefas

### Fase 1: Estrutura Base e Tipos

- [ ] T-001: Criar estrutura de pastas e configuração base
  - package.json, tsconfig.json, .env.example, .gitignore
  - Bin: `legacy-analyzer`
  - Scripts: build, dev, test, lint
  - Referência: RC-001, RC-005

- [ ] T-002: Criar todos os tipos TypeScript
  - Arquivo: src/types/index.ts
  - Tipos: RepositorySnapshot, FrameworkInfo, FileContent, AnalysisResult,
           ServiceInfo, UseCaseInfo, EntityInfo, IntegrationInfo,
           BoundedContext, ContextRelationship, TechnicalDebt
  - Referência: design.md "Tipos Principais"

- [ ] T-003: Configuração de ambiente e logging
  - Arquivo: src/config/env.ts (validação Zod de .env)
  - Arquivo: src/utils/logger.ts (chalk + verbose mode)
  - Referência: RC-001, RF-023

### Fase 2: Leitura do Repositório

- [ ] T-004: Implementar FrameworkDetector
  - Arquivo: src/reader/framework-detector.ts
  - Detecta: Java+Spring Boot, C#+.NET, TypeScript+Node.js, Python
  - Usa heurísticas de arquivos marcadores + imports/anotações
  - Referência: RF-002, CA-001

- [ ] T-005: Implementar CodeReader
  - Arquivo: src/reader/code-reader.ts
  - Lê arquivos relevantes (RF-003), ignora pastas excluídas (RF-004)
  - Filtra por extensões (RF-005)
  - Aplica amostragem para repositórios > 500 arquivos (RF-006)
  - Agrupa arquivos por tipo (controllers, services, repositories, entities, other)
  - Referência: RF-001 a RF-006, CA-006, CA-009, CA-010

### Fase 3: Análise via Claude API

- [ ] T-006: Implementar gerenciador de chunks e paralelismo
  - Arquivo: src/analyzer/chunk-manager.ts
  - Divide conteúdo em chunks de máx 100KB (RC-003)
  - Executa análises em paralelo (máx 3 simultâneas) (RC-004)
  - Implementa retry com backoff exponencial para erros de API

- [ ] T-007: Implementar prompts de análise
  - Arquivo: src/analyzer/analysis-prompts.ts
  - Prompts para: services, use-cases, entities, integrations, architecture
  - Templates baseados em design.md "Prompts de Análise"
  - Referência: RF-007 a RF-010, RF-015 a RF-016, RF-020

- [ ] T-008: Implementar CodeAnalyzer
  - Arquivo: src/analyzer/code-analyzer.ts
  - Orquestra análise usando ChunkManager + prompts
  - Chama Claude sonnet-4-6 (RC-002)
  - Parseia e valida resposta JSON do Claude com Zod
  - Consolida resultados parciais em AnalysisResult completo
  - Referência: RF-007 a RF-021, RC-002, RC-003, RC-004

### Fase 4: Geração de Documentação

- [ ] T-009: Implementar C4Generator
  - Arquivo: src/generator/c4-generator.ts
  - Métodos: generateContext(), generateContainers(), generateComponents()
  - Output: Mermaid C4Context, C4Container, C4Component
  - Incluir referência ao arquivo fonte de cada elemento (RF-022)
  - Referência: RF-011, RF-012, RF-013, RF-014, CA-003, CA-004

- [ ] T-010: Implementar DddContextMapGenerator
  - Arquivo: src/generator/ddd-context-map-generator.ts
  - Gera Mermaid flowchart com padrões DDD
  - Inclui tabela de relacionamentos com descrições
  - Referência: RF-015, RF-016, RF-017

- [ ] T-011: Implementar UseCaseCatalogGenerator
  - Arquivo: src/generator/use-case-catalog-generator.ts
  - Tabelas markdown agrupadas por domínio/módulo
  - Inclui endpoint HTTP quando disponível
  - Referência: RF-018, RF-019, CA-002

- [ ] T-012: Implementar ArchitectureReportGenerator
  - Arquivo: src/generator/architecture-report-generator.ts
  - Seções: estilo arquitetural, padrões encontrados, débitos técnicos (por severidade), recomendações
  - Referência: RF-020, RF-021, CA-005

- [ ] T-013: Implementar DocGenerator (orquestrador)
  - Arquivo: src/generator/doc-generator.ts
  - Chama todos os geradores especializados
  - Salva arquivos: c4-context.md, c4-containers.md, c4-components.md,
                    ddd-context-map.md, use-cases-catalog.md, architecture-report.md
  - Gera analysis-manifest.json (RF-023)
  - Referência: CA-007, CA-008

### Fase 5: Orquestração e CLI

- [ ] T-014: Implementar AnalysisOrchestrator
  - Arquivo: src/orchestrator/analysis-orchestrator.ts
  - Coordena: CodeReader → CodeAnalyzer → DocGenerator
  - Exibe progresso no terminal (spinner + mensagens de status)
  - Referência: CA-006 (aviso de repositório grande)

- [ ] T-015: Implementar CLI
  - Arquivo: src/cli/index.ts
  - Commander.js com comando `analyze`
  - Opções: --repo, --output, --lang, --verbose
  - Validação de entrada com Zod
  - Referência: CA-010

### Fase 6: Testes e Fixtures

- [ ] T-016: Criar repositório de exemplo para testes
  - Pasta: test/fixtures/sample-repo/
  - Estrutura Spring Boot mínima com controllers, services, entities
  - 10-15 arquivos Java que representem um sistema simples de pedidos
  - Referência: CA-001, CA-002, CA-003, CA-004, CA-005

- [ ] T-017: Escrever testes unitários do FrameworkDetector
  - Arquivo: test/unit/reader/framework-detector.spec.ts
  - Cobrir: Spring Boot, .NET, NestJS, não-reconhecido
  - Referência: RF-002, CA-001

- [ ] T-018: Escrever testes unitários do CodeReader
  - Arquivo: test/unit/reader/code-reader.spec.ts
  - Cobrir: leitura normal, amostragem (> 500 arquivos), exclusão de pastas
  - Usar sistema de arquivos virtual (memfs ou mock)
  - Referência: RF-003 a RF-006, CA-006, CA-009, CA-010

- [ ] T-019: Escrever testes unitários dos geradores de documentação
  - Arquivo: test/unit/generator/*.spec.ts (um por gerador)
  - Usar AnalysisResult fixture mockado
  - Usar snapshot testing para verificar Mermaid gerado
  - Referência: CA-003, CA-004, CA-005, CA-007

- [ ] T-020: Escrever teste de integração slow (end-to-end)
  - Arquivo: test/integration/full-analysis.spec.ts (marcado @slow)
  - Usa test/fixtures/sample-repo/ como input
  - Verifica todos os 6 arquivos gerados existem e são válidos
  - Requer ANTHROPIC_API_KEY (skip se não configurada)
  - Referência: CA-001 a CA-009

---

## Definição de Pronto

- [ ] Todos os 10 critérios de aceite (CA-001 a CA-010) validados
- [ ] TypeScript compila sem erros (npx tsc --noEmit)
- [ ] Testes unitários passam (npm test -- --testPathIgnorePatterns=integration)
- [ ] Cobertura > 80% nos geradores e no CodeReader
- [ ] Nenhum arquivo do repositório analisado é modificado (CA-009)
- [ ] Diagramas Mermaid gerados renderizam corretamente no GitHub
- [ ] analysis-manifest.json contém custo estimado (CA-008)

---

## Como Testar Manualmente

### Com repositório de exemplo incluído

```bash
npx legacy-analyzer analyze \
  --repo ./test/fixtures/sample-repo \
  --output ./docs/test-output \
  --verbose
```

### Com repositório real (Spring Boot)

```bash
npx legacy-analyzer analyze \
  --repo /caminho/para/seu/projeto-spring \
  --output ./docs/analise-spring
```

### Com repositório real (.NET)

```bash
npx legacy-analyzer analyze \
  --repo /caminho/para/sua/solucao-dotnet \
  --output ./docs/analise-dotnet
```

### Verificar saída

```bash
# Verificar que todos os 6 arquivos foram gerados
ls ./docs/test-output/

# Visualizar o mapa de contextos
cat ./docs/test-output/ddd-context-map.md

# Verificar manifesto
cat ./docs/test-output/analysis-manifest.json
```
