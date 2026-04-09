# Spec: Analisador de Aplicações Legadas
Versão: 1.0 | Data: 2024-01-15

## Contexto
Ferramenta CLI que analisa repositórios de código legado (Java/Spring Boot, C#/.NET, Node.js/TypeScript)
e gera documentação arquitetural automática no formato C4 e Mapa de Contextos DDD.
Usa Claude API para análise semântica do código.

---

## Requisitos Funcionais

### Análise do Repositório

RF-001: O sistema DEVE aceitar o caminho de um repositório local como entrada
RF-002: O sistema DEVE detectar automaticamente a linguagem/framework:
        - Java + Spring Boot (presence of pom.xml + @SpringBootApplication)
        - C# + .NET (presence of .csproj + Program.cs)
        - TypeScript + Node.js (presence of package.json + tsconfig.json)
        - Python (presence of requirements.txt ou pyproject.toml)
RF-003: O sistema DEVE ler os arquivos de código do repositório para análise
        priorizando: controllers, services, repositories, entities/models
RF-004: O sistema DEVE ignorar: node_modules/, bin/, obj/, .git/, dist/, build/
RF-005: O sistema DEVE limitar a leitura a arquivos com extensões relevantes:
        .java, .cs, .ts, .js, .py, .go
RF-006: QUANDO o repositório tiver mais de 500 arquivos relevantes,
        o sistema DEVE amostrar estrategicamente: todos os controllers,
        todos os services, e amostra de 20% dos demais

### Identificação de Componentes

RF-007: O sistema DEVE identificar serviços/módulos principais com base em:
        - Nomes de classes com sufixo Service, Controller, Repository, Manager
        - Módulos NestJS (@Module decorator)
        - Controllers Spring (@RestController, @Controller)
        - ASP.NET Controllers (herança de ControllerBase)

RF-008: O sistema DEVE identificar use cases com base em:
        - Classes com sufixo UseCase, Handler, Command, Query, Interactor
        - Métodos públicos de Services com verbos de ação
        - Endpoints de Controllers (mapeamento de rota + HTTP verb)

RF-009: O sistema DEVE identificar entidades de domínio com base em:
        - Classes com anotações @Entity, @Document, @Table
        - Herança de classes base de entidade
        - Interfaces/types com campos típicos de domínio (id, createdAt, etc.)

RF-010: O sistema DEVE identificar integrações externas com base em:
        - Clientes HTTP (RestTemplate, HttpClient, fetch, axios)
        - Configurações de banco de dados (datasource, connection strings)
        - Clients de mensageria (RabbitMQ, Kafka, SQS)
        - Clientes de serviços de terceiros (AWS SDK, Stripe, SendGrid)

### Geração de Documentação C4

RF-011: O sistema DEVE gerar diagrama C4 — Nível de Contexto:
        - O sistema analisado como "System"
        - Usuários identificados como "Person"
        - Sistemas externos identificados como "System_Ext"
        - Relacionamentos entre eles

RF-012: O sistema DEVE gerar diagrama C4 — Nível de Container:
        - Aplicação principal, banco(s) de dados, cache, filas como containers
        - Relacionamentos e protocolos de comunicação

RF-013: O sistema DEVE gerar diagrama C4 — Nível de Componente:
        - Serviços e módulos internos como componentes
        - Dependências entre componentes

RF-014: Os diagramas C4 DEVEM ser gerados em formato Mermaid (C4Context, C4Container, C4Component)

### Geração de Mapa de Contextos DDD

RF-015: O sistema DEVE identificar Bounded Contexts com base em:
        - Namespaces/pacotes de nível superior
        - Módulos NestJS
        - Projetos separados em uma solução
        - Agrupamentos semânticos de entidades e services

RF-016: O sistema DEVE identificar relacionamentos entre contextos:
        - Upstream/Downstream (quem depende de quem)
        - Anti-Corruption Layer (quando há tradução explícita de modelos)
        - Shared Kernel (quando entidades são compartilhadas)
        - Open Host Service (quando há API pública entre contextos)

RF-017: O Mapa de Contextos DEVE ser gerado em Mermaid (flowchart ou C4Context adaptado)
        com legenda explicando os padrões DDD encontrados

### Catálogo de Use Cases

RF-018: O sistema DEVE gerar um catálogo de use cases com:
        - Nome do use case
        - Serviço/módulo onde está
        - Endpoint HTTP (se aplicável): método + path
        - Parâmetros de entrada identificados
        - Tipo de retorno identificado
        - Entidades envolvidas

RF-019: O catálogo DEVE ser agrupado por domínio/módulo

### Relatório de Arquitetura

RF-020: O sistema DEVE gerar um relatório de arquitetura contendo:
        - Estilo arquitetural predominante (Monolito, Microsserviços, Modular Monolith, etc.)
        - Padrões encontrados (Repository, Factory, Strategy, CQRS, etc.)
        - Violações de arquitetura detectadas (domínio dependendo de infra, ciclos, etc.)
        - Débitos técnicos identificados (código duplicado, classes deus, ausência de abstrações)
        - Recomendações prioritárias de melhoria

RF-021: O relatório DEVE classificar débitos técnicos por severidade:
        CRÍTICO | ALTO | MÉDIO | BAIXO

### Rastreabilidade

RF-022: Cada item da documentação gerada DEVE referenciar o(s) arquivo(s) e linha(s) de onde
        a informação foi extraída (quando possível)

RF-023: O sistema DEVE gerar um arquivo de manifesto (analysis-manifest.json) com:
        - Timestamp da análise
        - Hash do repositório analisado
        - Versão do analisador
        - Métricas: arquivos lidos, tokens consumidos, custo estimado

---

## Restrições Técnicas

RC-001: Usar @anthropic-ai/sdk para todas as chamadas à API Claude
RC-002: Modelo de análise: claude-sonnet-4-6 (melhor compreensão de código)
RC-003: Processar código em chunks de no máximo 100KB por chamada à API
RC-004: Paralelizar chamadas de análise (máx 3 simultâneas) para repositórios grandes
RC-005: Output em markdown compatível com GitHub, GitLab e Confluence
RC-006: Mermaid como formato padrão para todos os diagramas (sem PlantUML)
RC-007: NÃO executar código do repositório analisado
RC-008: NÃO modificar nenhum arquivo do repositório analisado (read-only)

---

## Critérios de Aceite

CA-001: Repositório Spring Boot → framework detectado como "Java + Spring Boot"
        e analysis-manifest.json criado com timestamp e métricas

CA-002: Repositório com controllers e services → catálogo de use cases não vazio,
        agrupado por módulo/pacote

CA-003: Diagrama C4 de contexto → sintaxe Mermaid válida (renderizável no GitHub)

CA-004: Repositório com integração ao banco de dados → banco identificado como container
        no diagrama C4 de containers

CA-005: Repositório sem testes → relatório de arquitetura menciona isso como débito técnico
        com severidade ALTO

CA-006: Repositório com 600+ arquivos → mensagem de aviso "Repositório grande: usando amostragem"
        e análise concluída em menos de 3 minutos

CA-007: Análise concluída → todos os 6 arquivos gerados em ./docs/architecture/

CA-008: analysis-manifest.json → contém custo estimado em USD e total de tokens

CA-009: Nenhum arquivo do repositório é modificado durante a análise

CA-010: Repositório que não é de software (apenas arquivos .txt, .pdf) →
        erro claro: "Nenhum arquivo de código encontrado. Suporte: Java, C#, TypeScript, Python"

---

## Fora de Escopo
- Análise de repositórios remotos (apenas locais)
- Diagramas de sequência (versão futura)
- Análise de qualidade de código (métricas de complexidade ciclomática, etc.)
- Geração automática de testes para o código legado
- Comparação entre duas versões do repositório (diff arquitetural)
- Suporte a Go, Rust, PHP (versão futura)
