# Exemplo Complexo: Microsserviço de Pedidos com Eventos

> Módulo 02 · Exemplo 3 · Tempo estimado: 90min
> Stack: Spring Boot + Java + PostgreSQL + RabbitMQ
> Nível: Avançado em SDD

---

## Objetivo

Aplicar SDD em um sistema com:
- Arquitetura orientada a eventos (Event-Driven)
- Múltiplos microsserviços comunicando-se via mensageria
- Saga Pattern para consistência distribuída
- Idempotência e tratamento de falhas
- Spec dividida em múltiplos contextos (DDD)

Este exemplo mostra como o SDD **escala para sistemas complexos**.

---

## O Problema

Sistema de pedidos e-commerce com:
- **Order Service:** cria e gerencia pedidos
- **Inventory Service:** verifica e reserva estoque
- **Payment Service:** processa pagamentos
- **Notification Service:** envia e-mails/SMS

Fluxo: Pedido criado → Reserva estoque → Cobra pagamento → Notifica

---

## Técnica: Spec por Bounded Context (DDD)

Em sistemas distribuídos, a spec é organizada por **Bounded Context**:

```
spec/
├── order-context/
│   ├── requirements.md          ← Regras do Order Service
│   ├── design.md
│   ├── tasks.md
│   └── events/
│       ├── order-created.event.md    ← Contrato do evento
│       ├── order-confirmed.event.md
│       └── order-failed.event.md
│
├── inventory-context/
│   ├── requirements.md
│   ├── design.md
│   ├── tasks.md
│   └── events/
│       ├── stock-reserved.event.md
│       └── stock-insufficient.event.md
│
└── saga/
    ├── order-fulfillment-saga.md    ← Orquestração da saga
    └── compensation-flows.md        ← Fluxos de compensação
```

---

## Spec dos Contratos de Eventos (Crucial!)

Em sistemas distribuídos, os **contratos de eventos** são a spec mais importante — são a fronteira entre serviços.

### spec/order-context/events/order-created.event.md

```markdown
# Evento: OrderCreated
Versão: 1.0 | Exchange: orders | Routing Key: order.created

## Propósito
Sinaliza que um novo pedido foi criado e aguarda processamento.
Publicado por: Order Service
Consumido por: Inventory Service, Notification Service

## Contrato do Payload

```json
{
  "eventId": "uuid-v4",           // Idempotência — processar uma vez por eventId
  "eventType": "OrderCreated",
  "eventVersion": "1.0",
  "occurredAt": "ISO-8601",       // Timestamp do momento da criação
  "orderId": "uuid-v4",
  "customerId": "uuid-v4",
  "items": [
    {
      "productId": "uuid-v4",
      "sku": "string",
      "quantity": "integer > 0",
      "unitPrice": "decimal (centavos)"
    }
  ],
  "totalAmount": "decimal (centavos)",
  "shippingAddress": {
    "street": "string",
    "city": "string",
    "state": "string (2 chars)",
    "zipCode": "string (8 chars)"
  }
}
```

## Invariantes do Evento
- eventId é único por publicação (UUID v4 gerado no momento do publish)
- totalAmount = soma(items[i].quantity * items[i].unitPrice)
- items NÃO pode ser vazio
- Versão do schema sempre presente (para evolução futura)

## Regras de Idempotência
Consumidores DEVEM verificar se já processaram o eventId antes de agir.
Armazenar eventId processados com TTL de 7 dias (Redis ou tabela processed_events).

## Evolução do Schema
- ADICIONAR campos é compatível (consumidores ignoram campos desconhecidos)
- REMOVER ou RENOMEAR campos requer incremento de versão (eventVersion: "2.0")
- Manter suporte a versões anteriores por 30 dias após nova versão
```

---

## Spec: Order Service

### spec/order-context/requirements.md

```markdown
# Spec: Order Service — Criação de Pedidos
Versão: 1.0

## Contexto
Microsserviço responsável pelo ciclo de vida dos pedidos.
Parte da Saga de Fulfillment — coordena com Inventory e Payment via eventos.

## Estado do Pedido (Máquina de Estados)

```
PENDING → CONFIRMED → SHIPPED → DELIVERED
   ↓           ↓
CANCELLED   FAILED (pagamento recusado ou sem estoque)
```

Transições válidas:
- PENDING → CONFIRMED (estoque reservado + pagamento aprovado)
- PENDING → CANCELLED (cancelamento pelo usuário em até 5min)
- CONFIRMED → FAILED (pagamento recusado pela processadora)
- CONFIRMED → SHIPPED (integração com transportadora)

## Requisitos Funcionais

RF-001: O sistema DEVE criar pedidos via POST /api/v1/orders
RF-002: Um pedido criado DEVE ter status "PENDING" e publicar evento OrderCreated
RF-003: O sistema DEVE garantir que a publicação do evento é atômica com a persistência
         (Outbox Pattern — sem publicação parcial)
RF-004: O sistema DEVE processar evento StockReserved e transicionar para aguardar pagamento
RF-005: O sistema DEVE processar evento StockInsufficient e transicionar para FAILED
RF-006: O sistema DEVE processar evento PaymentApproved e transicionar para CONFIRMED
RF-007: O sistema DEVE processar evento PaymentDeclined e transicionar para FAILED
RF-008: O sistema DEVE ser idempotente — processar o mesmo evento múltiplas vezes
         NÃO deve resultar em transições de estado duplicadas
RF-009: O sistema DEVE permitir cancelamento via PATCH /api/v1/orders/:id/cancel
         apenas para pedidos com status PENDING e criados há menos de 5 minutos
RF-010: O sistema DEVE publicar evento OrderCancelled ao processar cancelamento

## Restrições Técnicas

RC-001: Outbox Pattern obrigatório para garantir atomicidade entre DB e mensageria
RC-002: Idempotência via tabela processed_events (eventId + consumerId, TTL 7 dias)
RC-003: RabbitMQ com exchanges topic para publicação de eventos
RC-004: Máximo 3 retentativas para mensagens com Dead Letter Queue (DLQ)
RC-005: Timeout da Saga: 30 minutos entre OrderCreated e confirmação final
         → após timeout, cancelar automaticamente

## Critérios de Aceite

DADO usuário autenticado com carrinho válido
QUANDO POST /api/v1/orders com items e endereço
ENTÃO 201 com pedido em status PENDING
E evento OrderCreated publicado no exchange orders com routing key order.created

DADO pedido em status PENDING
QUANDO evento StockInsufficient recebido para o pedido
ENTÃO pedido transiciona para FAILED
E evento OrderFailed publicado
E usuário notificado (via Notification Service)

DADO mesmo eventId StockReserved recebido duas vezes
QUANDO segundo processamento do evento
ENTÃO nenhuma transição de estado ocorre (idempotência)
E log de warning: "evento já processado: {eventId}"

DADO pedido PENDING criado há 6 minutos
QUANDO PATCH /api/v1/orders/:id/cancel
ENTÃO 422 {error: "Pedido não pode ser cancelado após 5 minutos"}

## Fora de Escopo
- Processamento de pagamento (Payment Service)
- Verificação de estoque (Inventory Service)
- Interface de administração
- Rastreamento de entrega
```

---

## A Saga como Spec

### spec/saga/order-fulfillment-saga.md

```markdown
# Saga: Order Fulfillment
Versão: 1.0 | Tipo: Coreografia (sem orquestrador central)

## Participantes
1. Order Service (publicador e consumidor)
2. Inventory Service (consumidor e publicador)
3. Payment Service (consumidor e publicador)
4. Notification Service (consumidor)

## Fluxo Normal

```
[Customer] → POST /orders → [Order Service]
                                    │ publica
                                    ▼
                            OrderCreated
                                    │
                    ┌───────────────┤
                    ▼               ▼
            [Inventory          [Notification
              Service]            Service]
                 │              (envia e-mail
          reserva estoque         "pedido recebido")
                 │
       ┌─────────┴──────────┐
       ▼                    ▼
StockReserved        StockInsufficient
       │                    │
[Order Service]      [Order Service]
 aguarda pagto.       → FAILED
       │              publica OrderFailed
       ▼
[Payment Service]
 processa pagto.
       │
  ┌────┴────┐
  ▼         ▼
PaymentApproved  PaymentDeclined
  │               │
[Order Service]  [Order Service]
  → CONFIRMED     → FAILED + compensação
  publica          publica OrderFailed
  OrderConfirmed   [Inventory Service]
                   libera reserva
```

## Fluxos de Compensação

| Falha | Compensação |
|-------|-------------|
| StockInsufficient | Nenhuma (nada foi reservado) |
| PaymentDeclined | Inventory: liberar reserva (StockReleased) |
| Timeout (30min) | Inventory: liberar reserva; Order: → CANCELLED |

## Invariantes da Saga
- Um pedido NÃO PODE estar em dois fluxos simultâneos
- Compensações são idempotentes (podem ser executadas múltiplas vezes)
- DLQ monitora mensagens não processáveis para intervenção manual

## SLA
- StockReserved esperado em até 5 segundos após OrderCreated
- PaymentApproved/Declined esperado em até 30 segundos após StockReserved
- Timeout total da saga: 30 minutos
```

---

## Design: Outbox Pattern (Crucial para SDD)

```markdown
## Outbox Pattern — Atomicidade Garantida

### Problema que resolve
Sem Outbox: save no DB e publish no RabbitMQ são operações separadas.
Se o app cair entre as duas, o evento se perde.

### Solução

Tabela outbox no banco:
```sql
CREATE TABLE outbox_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type   VARCHAR(100) NOT NULL,
  payload      JSONB NOT NULL,
  exchange     VARCHAR(100) NOT NULL,
  routing_key  VARCHAR(100) NOT NULL,
  status       VARCHAR(20) DEFAULT 'PENDING', -- PENDING | SENT | FAILED
  created_at   TIMESTAMP DEFAULT now(),
  sent_at      TIMESTAMP,
  retry_count  INT DEFAULT 0
);
```

### Fluxo com Outbox

Transaction:
  1. INSERT INTO orders (...)         ← Persiste o pedido
  2. INSERT INTO outbox_events (...)  ← Persiste o evento (sem publicar ainda)
COMMIT

Background Job (OutboxPublisher, a cada 1 segundo):
  SELECT * FROM outbox_events WHERE status = 'PENDING'
  → publish no RabbitMQ
  → UPDATE outbox_events SET status = 'SENT'

### Task para implementar
T-005: Implementar OutboxPublisher (Spring Scheduled Task)
T-006: Implementar outbox_events table migration
T-007: Modificar CreateOrderUseCase para usar transação com outbox
```

---

## Prompt Avançado para Sistemas Complexos

```
claude "Estamos implementando a Saga de Order Fulfillment conforme spec/saga/order-fulfillment-saga.md.

Execute T-007 de spec/order-context/tasks.md: implementar o Outbox Pattern no CreateOrderUseCase.

Contexto importante:
- spec/order-context/events/order-created.event.md define o contrato exato do payload
- RC-001: a persistência do Order e da outbox_events DEVE ser atômica (@Transactional)
- A tabela outbox_events já foi criada em T-006 (migration V003__create_outbox_events.sql)
- OutboxPublisher já existe em src/infrastructure/messaging/OutboxPublisher.java

NÃO reimplemente:
- A migration da tabela (T-006 já fez isso)
- O OutboxPublisher (T-005 já implementou)
- A entidade Order (T-001 já implementou)

Apenas modifique CreateOrderUseCase para usar a abordagem outbox."
```

---

## Lições Deste Exemplo

### 1. Specs de Eventos São Contratos de API Distribuída

```markdown
# Trate eventos como API REST:
# - Versionamento semântico
# - Compatibilidade retroativa
# - Contrato explícito do payload
# - Regras de idempotência documentadas
```

### 2. A Saga Precisa de uma Spec Própria

A saga é o "fluxo de negócio" em sistemas distribuídos. Sem spec da saga:
- Cada serviço entende o fluxo de forma diferente
- Fluxos de compensação ficam implícitos e são esquecidos
- Debugging de falhas distribuídas se torna um pesadelo

### 3. Outbox e Idempotência São RF, Não RC

```markdown
# ERRADO (como restrição técnica):
RC-001: Usar Outbox Pattern

# CORRETO (como requisito funcional):
RF-003: O sistema DEVE garantir que a publicação do evento é atômica
        com a persistência (sem publicação parcial)
RC-001: Implementar atomicidade via Outbox Pattern
```

A distinção importa: RF define **o quê** (a garantia de negócio), RC define **como** (a abordagem técnica).

### 4. Specs de Compensação São Tão Importantes Quanto o Fluxo Normal

Uma spec que só documenta o "caminho feliz" é incompleta. Os fluxos de compensação devem ser especificados com o mesmo nível de detalhe.

---

## Para Adaptar para .NET

As mesmas specs funcionam. Apenas mude o tech.md:

```markdown
# tech.md (para .NET)
- ASP.NET Core 8 com minimal API ou controllers
- Entity Framework Core com PostgreSQL (Npgsql)
- MassTransit + RabbitMQ para mensageria
- Outbox Pattern via MassTransit.EntityFrameworkCore
- xUnit + Testcontainers para testes de integração
```

As specs de requirements.md e design.md são agnósticas de linguagem!

---

[Próximo: Cases Práticos →](../03-cases-praticos/case-1-gerador-agentes/README.md)
