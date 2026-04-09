# Design: [Nome da Feature]

> INSTRUÇÕES: Preencha este template APÓS o requirements.md estar aprovado.
> O design define COMO, não O QUÊ — o requirements.md define o comportamento,
> o design define a estrutura técnica para alcançá-lo.
> Remova estas instruções antes de usar com o Claude.

---

## Componentes Envolvidos

> Liste cada classe/módulo/serviço que participa da solução.
> Para cada um: onde fica, qual é sua responsabilidade.

- **[NomeDoComponente]** (`src/caminho/arquivo.ts`)
  - Responsabilidade: [o que faz]
  - Depende de: [outros componentes]

- **[OutroComponente]** (`src/caminho/outro.ts`)
  - Responsabilidade: [o que faz]

---

## Fluxo de Dados

> Diagrama ASCII ou textual do caminho de uma request/evento até a resposta.
> Use → para indicar chamadas, [colchetes] para condicionais.

```
[Trigger: POST /endpoint ou evento]
  → ComponenteA
    → [validação: se inválido → 400]
    → ComponenteB.método(params)
      → ComponenteC.operação()
      → return resultado
    → return ResponseDTO
```

---

## Interfaces e Contratos

> Defina os tipos TypeScript / classes C# / interfaces Java dos contratos entre componentes.
> Seja preciso — estas interfaces serão implementadas pelo Claude.

```typescript
// TypeScript
interface InputDTO {
  campo1: string;
  campo2: number;
  campo3?: boolean;
}

interface OutputDTO {
  id: string;
  resultado: string;
  criadoEm: string; // ISO 8601
}

type OperationError = 'ERRO_1' | 'ERRO_2' | 'ERRO_3';
type OperationResult = Result<OutputDTO, OperationError>;
```

```csharp
// C# — adapte conforme necessário
public record InputDto(string Campo1, int Campo2);
public record OutputDto(Guid Id, string Resultado, DateTime CriadoEm);
public enum OperationError { Erro1, Erro2 }
```

---

## Modelo de Dados

> Entidades de banco relevantes para esta feature.
> Se criar novas tabelas, inclua o SQL de criação.
> Se modificar tabelas existentes, especifique a migration.

```sql
-- Nova tabela (se aplicável)
CREATE TABLE nome_tabela (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campo1      VARCHAR(255) NOT NULL,
  campo2      INTEGER,
  criado_em   TIMESTAMP DEFAULT now(),
  atualizado_em TIMESTAMP DEFAULT now()
);

-- Index necessário
CREATE INDEX idx_nome_tabela_campo1 ON nome_tabela(campo1);
```

---

## Tratamento de Erros

> Para cada erro possível: o que causa, qual é o tratamento.

| Erro | Causa | HTTP Status | Resposta |
|------|-------|-------------|----------|
| ERRO_1 | [quando isso ocorre] | 400 | `{error: "mensagem", details: [...]}` |
| ERRO_2 | [quando isso ocorre] | 404 | `{error: "não encontrado"}` |
| ERRO_3 | [quando isso ocorre] | 409 | `{error: "conflito"}` |
| Exceção inesperada | Erro interno | 500 | `{error: "Erro interno do servidor"}` |

> Nota de segurança: [se aplicável, ex: "Erros de credencial não revelam qual campo está errado"]

---

## Dependências Externas

> Serviços externos, APIs de terceiros, bibliotecas específicas usadas nesta feature.

- **[NomeDaLib]:** [para que é usada] — já existe no projeto / precisa ser adicionada
- **[ServiçoExterno]:** [como é integrado] — via [protocolo]

---

## Estratégia de Testes

> Que tipos de testes serão escritos e o que cada um cobre.

**Testes Unitários:**
- `[NomeDoUseCase]`: mock de [repositório/serviço], cobre [cenários principais]
- [Lista de cenários: sucesso, falha X, falha Y]

**Testes de Integração:**
- `[endpoint ou operação]`: banco/redis real, cobre [critérios de aceite do requirements]
- Cenários: [lista dos CAs que serão testados por integração]

**Testes de Segurança (se aplicável):**
- [Cenário de autorização/autenticação que deve ser testado]

---

## Considerações de Performance

> Se a feature tem requisitos de performance, como serão atendidos.

- [Cache: onde e por quanto tempo]
- [Index: qual índice de banco cobre as consultas principais]
- [Paginação: como funciona para listas grandes]
- [Não aplicável para esta feature]

---

## Sequência de Implementação Recomendada

> Ordem sugerida para implementar os componentes (alimenta as tasks.md).

1. [Modelo de dados / migration]
2. [Interfaces e tipos]
3. [Repositório]
4. [Use case / serviço]
5. [Controller / adapter]
6. [Testes]
