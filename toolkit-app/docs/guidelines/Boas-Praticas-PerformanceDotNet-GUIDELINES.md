# BOAS-PRATICAS-PERFORMANCEDOTNET-GUIDELINES

> **Versão:** 1.0  
> **Escopo:** .NET / C# — Minimizar alocações, pressão no GC, e maximizar throughput  
> **Paradigma:** Específico para .NET 6+ / C# 10+  
> **Temperatura de decisão:** 0.02 — regras prescritivas baseadas em benchmarks reais

---

## PROPÓSITO DESTE ARQUIVO

Este guideline instrui agentes de IA e desenvolvedores sobre como escrever código .NET de alta performance, com foco em **minimizar alocações desnecessárias de memória** e reduzir a pressão no Garbage Collector (GC). Destina-se a paths críticos de performance — hot paths em APIs, processamento de dados, e loops de alta frequência.

> **Aviso de escopo:** Não aplique todas estas técnicas indiscriminadamente.
> Pergunte sempre: "Este código está em um hot path medido?"
> Perfil primeiro → otimize depois. Premature optimization é o problema, não a solução.

---

## PRINCÍPIO FUNDAMENTAL

> **Alocação = trabalho para o GC. Menos alocações = menos pausas = maior throughput.**

O GC do .NET é excelente, mas toda alocação no heap tem custo: pressão de memória, pausas de coleta, fragmentação. Em hot paths, o objetivo é **alocar zero ou mínimo**.

---

## SEÇÃO 1 — SPAN\<T\> E MEMORY\<T\>

### O Que São
- `Span<T>` — view de memória contigua, na stack ou heap, SEM alocação. É `ref struct`.
- `ReadOnlySpan<T>` — view imutável da mesma região.
- `Memory<T>` — versão "safe" que pode ir para heap (para uso em `async`).
- `ReadOnlyMemory<T>` — versão imutável de Memory.

### Regras de Uso

```csharp
// ✅ CORRETO — Parse sem alocação de substring
ReadOnlySpan<char> input = "2024-01-15".AsSpan();
int ano = int.Parse(input.Slice(0, 4));
int mes = int.Parse(input.Slice(5, 2));
int dia = int.Parse(input.Slice(8, 2));

// ❌ ERRADO — Cada Substring aloca nova string no heap
string input = "2024-01-15";
int ano = int.Parse(input.Substring(0, 4));   // aloca
int mes = int.Parse(input.Substring(5, 2));   // aloca
int dia = int.Parse(input.Substring(8, 2));   // aloca
```

```csharp
// ✅ CORRETO — Processar bytes sem copiar
void ProcessarDados(ReadOnlySpan<byte> dados)
{
    for (int i = 0; i < dados.Length; i++)
    {
        // processa sem alocar
    }
}

// ✅ CORRETO — Span sobre array existente (sem alocação)
byte[] buffer = new byte[1024];
Span<byte> span = buffer.AsSpan(0, 512);  // sem alocação, apenas view
```

### Limitações de Span (Regra Crítica)
```csharp
// ❌ NÃO PODE — Span<T> não pode ser campo de classe (é ref struct)
class MeuServico
{
    private Span<byte> _buffer; // ERRO de compilação ✅ (bom — compilador protege)
}

// ✅ PODE — Memory<T> como campo de classe (quando necessário persistir)
class MeuServico
{
    private Memory<byte> _buffer; // OK
}

// Regra: Use Span<T> em parâmetros/variáveis locais.
//        Use Memory<T> quando precisar armazenar ou usar em async.
```

### Decisão Span vs Memory
```
Span<T>:
  ✅ Métodos síncronos
  ✅ Parâmetros de método
  ✅ Variáveis locais
  ❌ Campos de classe
  ❌ Métodos async/await

Memory<T>:
  ✅ Campos de classe
  ✅ Métodos async/await
  ✅ Quando Span não compila
  ⚠️ Ligeiramente mais overhead que Span
```

---

## SEÇÃO 2 — ARRAYBUFFER E OBJECT POOLING

### ArrayPool\<T\>

```csharp
// ✅ CORRETO — Reusar buffer do pool em vez de alocar
var pool = ArrayPool<byte>.Shared;
byte[] buffer = pool.Rent(minimumLength: 4096);
try
{
    // usa buffer para processamento
    int bytesLidos = stream.Read(buffer, 0, buffer.Length);
    ProcessarDados(buffer.AsSpan(0, bytesLidos));
}
finally
{
    pool.Return(buffer, clearArray: false); // SEMPRE retornar no finally
}

// ❌ ERRADO — Alocar novo array em cada chamada de hot path
byte[] buffer = new byte[4096]; // aloca no heap, GC vai coletar
```

```csharp
// ✅ Padrão com stackalloc para buffers pequenos e tamanho conhecido em compile time
// Use quando: tamanho ≤ 1KB e fixo
Span<byte> buffer = stackalloc byte[256]; // stack, zero alocação heap
```

### ObjectPool\<T\> (Microsoft.Extensions.ObjectPool)

```csharp
// ✅ Pooling de objetos custosos de criar
// Registrar no DI:
services.AddSingleton<ObjectPool<StringBuilder>>(serviceProvider =>
{
    var policy = new StringBuilderPooledObjectPolicy();
    return new DefaultObjectPool<policy>(policy, maximumRetained: 100);
});

// Usar:
public class MeuServico(ObjectPool<StringBuilder> pool)
{
    public string ConstruirMensagem(IEnumerable<string> partes)
    {
        var sb = pool.Get();
        try
        {
            foreach (var parte in partes)
                sb.Append(parte);
            return sb.ToString();
        }
        finally
        {
            pool.Return(sb);
        }
    }
}

// Candidatos a pooling:
// - StringBuilder (alto uso em hot paths)
// - MemoryStream
// - Conexões a recursos externos
// - Objetos de serialização/deserialização
```

### Regras de Pooling
```
USE pool quando:
  - Objeto é caro de criar (>1ms ou alocação significativa)
  - Objeto é usado frequentemente em hot paths
  - Objeto não tem estado entre usos (ou estado é resetável)

NÃO USE pool quando:
  - Objeto é barato de criar
  - Uso é raro
  - Estado não pode ser limpo de forma confiável
  
SEMPRE:
  - Retornar ao pool no finally (ou IDisposable)
  - Nunca usar objeto após retornar ao pool
  - Resetar estado antes de retornar (se necessário)
```

---

## SEÇÃO 3 — STRUCT vs CLASS

### Regra de Decisão

```
Use struct quando:
  ✅ Tamanho ≤ 16 bytes (idealmente ≤ 3 palavras de máquina)
  ✅ Representa um valor simples (Value Object do domínio)
  ✅ Semanticamente é um valor (igualdade por valor natural)
  ✅ Não tem herança (além de interfaces)
  ✅ Curta duração de vida (variável local, parâmetro)

Use class quando:
  ✅ Tamanho > 16 bytes (custo de cópia supera benefício de stack)
  ✅ Precisa de herança
  ✅ Referência compartilhada intencional
  ✅ Longa duração (campo de classe, coleção grande)
  ✅ Nullable com semântica de referência

ARMADILHA:
  ❌ Struct grande copiada frequentemente é PIOR que class (custo de cópia)
  ❌ Struct boxed (cast para object, interface) aloca no heap — pior dos dois mundos
```

### Evitar Boxing
```csharp
// ❌ ERRADO — Boxing: struct vai para heap
int valor = 42;
object boxed = valor;           // aloca no heap
IComparable comp = valor;       // aloca no heap

// ✅ CORRETO — Genérico mantém tipo sem boxing
void Processar<T>(T valor) where T : struct { ... }

// ❌ ERRADO — Dictionary com struct como value (boxing em algumas operações)
Dictionary<string, int> dict;
dict["chave"] = 42;

// ✅ MELHOR — Quando int é o value, Dictionary<string, int> é OK
//             Problema surge quando a struct é usada como interface

// Regra: Evite interfaces em structs em hot paths
// Use genéricos com constraints ao invés de interfaces para evitar boxing
```

### readonly struct
```csharp
// ✅ Marcar struct como readonly quando imutável
// Previne cópias defensivas do compilador em chamadas de método
readonly struct Coordenada
{
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    
    // Método em readonly struct = sem cópia defensiva ✅
    public double DistanciaDe(Coordenada outro) { ... }
}

// ❌ Struct mutável com métodos que modificam estado
// Compilador faz cópia defensiva em cada chamada → performance pior
```

---

## SEÇÃO 3B — RECORD: QUANDO SUBSTITUI CLASS, QUANDO SUBSTITUI STRUCT

> **Versão mínima:** C# 9 (`record class`) / C# 10 (`record struct`)  
> **Contexto:** Records são açúcar sintático — a performance depende do tipo subjacente (class ou struct).

### Anatomia dos Tipos de Record

```csharp
// record class (C# 9+) — É uma CLASS. Aloca no heap. Semântica de referência.
record class PedidoResponse(Guid Id, string Status, decimal Total);

// record struct (C# 10+) — É uma STRUCT. Aloca na stack. Semântica de valor.
record struct Coordenada(double Latitude, double Longitude);

// readonly record struct (C# 10+) — STRUCT imutável. Zero cópias defensivas.
readonly record struct PedidoId(Guid Value);
readonly record struct Dinheiro(decimal Valor, string Moeda);
```

### Tabela de Decisão Record vs Class vs Struct

```
┌──────────────────────────┬────────────────┬───────────────┬─────────────────────┐
│ Cenário                  │ Tipo           │ Por quê       │ Exemplo             │
├──────────────────────────┼────────────────┼───────────────┼─────────────────────┤
│ Value Object do domínio  │ readonly record│ ≤16 bytes,    │ PedidoId, Email,    │
│ (≤16 bytes, imutável)    │ struct         │ zero alloc,   │ Dinheiro, Cep       │
│                          │                │ equality auto │                     │
├──────────────────────────┼────────────────┼───────────────┼─────────────────────┤
│ Value Object do domínio  │ record class   │ >16 bytes,    │ Endereco, Periodo,  │
│ (>16 bytes, imutável)    │ (ou class)     │ heap OK,      │ Intervalo           │
│                          │                │ equality auto │                     │
├──────────────────────────┼────────────────┼───────────────┼─────────────────────┤
│ DTO / Command / Query    │ record class   │ semântica de  │ CriarPedidoCommand, │
│ (Application layer)      │                │ dado, não hot │ BuscarPedidoQuery   │
│                          │                │ path, imut.   │ PedidoResponse      │
├──────────────────────────┼────────────────┼───────────────┼─────────────────────┤
│ Entity / Aggregate Root  │ class          │ identidade,   │ Pedido, Cliente,    │
│                          │                │ mutável,      │ Conta               │
│                          │                │ ref sharing   │                     │
├──────────────────────────┼────────────────┼───────────────┼─────────────────────┤
│ Result / Option pattern  │ readonly record│ curta duração,│ Result<T>,          │
│ (retorno de método)      │ struct         │ zero alloc,   │ Option<T>           │
│                          │                │ discriminated │                     │
├──────────────────────────┼────────────────┼───────────────┼─────────────────────┤
│ Hot path — tamanho >16B  │ class          │ cópia de      │ buffers, contextos  │
│ ou vida longa            │                │ struct cara   │ de processamento    │
└──────────────────────────┴────────────────┴───────────────┴─────────────────────┘
```

### `readonly record struct` — Substituto Ideal para Value Objects

```csharp
// ✅ ANTES: struct manual — correto mas verboso
readonly struct PedidoId : IEquatable<PedidoId>
{
    public Guid Value { get; }
    public PedidoId(Guid value) => Value = value;
    public bool Equals(PedidoId other) => Value == other.Value;
    public override bool Equals(object? obj) => obj is PedidoId other && Equals(other);
    public override int GetHashCode() => Value.GetHashCode();
    public static bool operator ==(PedidoId a, PedidoId b) => a.Equals(b);
    public static bool operator !=(PedidoId a, PedidoId b) => !a.Equals(b);
}

// ✅ DEPOIS: readonly record struct — idêntica performance, muito menos código
readonly record struct PedidoId(Guid Value);
// Compilador gera: Equals, GetHashCode, ==, !=, Deconstruct, ToString

// Ambos têm performance IDÊNTICA no runtime:
//   - Stack allocation (sem heap, sem GC)
//   - Zero cópias defensivas (porque é readonly)
//   - Igualdade por valor sem boxing
```

### `record class` — Bom para DTOs, Não Para Hot Paths

```csharp
// ✅ CORRETO — record class para Commands/Responses (Application layer, não hot path)
record class CriarPedidoCommand(
    Guid ClienteId,
    IReadOnlyList<ItemPedidoDto> Itens,
    string EnderecoEntrega
);

record class PedidoResponse(
    Guid Id,
    string Status,
    decimal Total,
    DateTimeOffset CriadoEm
);

// ⚠️ ATENÇÃO — `with` em record class ALOCA um novo objeto no heap
var cmd = new CriarPedidoCommand(clienteId, itens, endereco);
var cmdAtualizado = cmd with { EnderecoEntrega = novoEndereco }; // nova alocação!

// ✅ `with` em readonly record struct NÃO aloca — copia na stack
readonly record struct Dinheiro(decimal Valor, string Moeda);
var preco = new Dinheiro(100m, "BRL");
var precoReajustado = preco with { Valor = 110m }; // sem heap, stack copy ✅
```

### `record struct` vs `readonly record struct`

```csharp
// record struct — MUTÁVEL (evitar, semântica confusa para Value Object)
record struct PontoMutavel(double X, double Y);  // pode ser modificado — ❌ confuso

// readonly record struct — IMUTÁVEL (preferir sempre para Value Objects)
readonly record struct Ponto(double X, double Y); // imutável, sem cópias defensivas ✅

// REGRA: Se usar record struct, sempre adicione readonly.
//        record struct sem readonly é raro ter caso de uso válido.
```

### Records e Performance — Armadilhas

```csharp
// ❌ ARMADILHA 1 — record class com coleção mutável: falsa imutabilidade
record class PedidoDto(Guid Id, List<string> Itens); // Itens é mutável mesmo no record!
// Use: IReadOnlyList<string> para intenção correta

// ❌ ARMADILHA 2 — readonly record struct com campo de classe grande
// Se o record struct contém um campo de classe (string, array, etc.),
// a STRUCT é na stack, mas o conteúdo ainda está no heap
readonly record struct ProdutoInfo(string Nome, string Descricao, decimal Preco);
// Nome e Descricao são referências para strings no heap — struct está na stack,
// mas não é "zero heap" — as strings ainda estão lá.
// Correto em semântica; entender em performance.

// ❌ ARMADILHA 3 — record class como Aggregate Root (errada semântica)
record class Pedido(Guid Id, PedidoStatus Status); // ERRADO — Aggregate tem identidade!
// Record usa igualdade por VALOR. Dois pedidos com mesmo Id seriam "iguais" para o record.
// Use class para Aggregates e Entities — identidade, não valor.

// ✅ CORRETO — record class só para objetos SEM identidade própria
// DTOs, Commands, Queries, Responses → record class ✅
// Entities, Aggregates → class ✅ (nunca record)
// Value Objects pequenos → readonly record struct ✅
// Value Objects grandes → record class ✅ (ou class com equality manual)
```

### Resumo de Regras para Records

```
REGRAS:
  1. Entity / Aggregate Root → NUNCA use record (semântica errada de igualdade)
  2. Value Object (≤16 bytes) → readonly record struct (zero alloc, equality grátis)
  3. Value Object (>16 bytes) → record class (aceitável, equality grátis, heap OK)
  4. Command / Query / DTO → record class (imutabilidade por convenção, legibilidade)
  5. Response / ViewModel → record class (transferência de dados, sem hot path)
  6. Resultado de método (Result<T>) → readonly record struct (zero alloc, retorno rápido)
  7. record struct sem readonly → evitar (semântica de VO mutável é confusa)
  8. with em record class em hot path → atenção (aloca novo objeto)
  9. with em readonly record struct → seguro (stack copy, sem heap)
```

---

## SEÇÃO 4 — STRING HANDLING

### Regras de String

```csharp
// ✅ CORRETO — StringComparison para evitar alocações de cultura
if (string.Equals(a, b, StringComparison.OrdinalIgnoreCase)) { }

// ❌ ERRADO — ToLower/ToUpper aloca nova string
if (a.ToLower() == b.ToLower()) { }

// ✅ CORRETO — Span para manipulação sem alocação
ReadOnlySpan<char> span = minhaString.AsSpan();
if (span.StartsWith("prefix", StringComparison.Ordinal)) { }

// ✅ CORRETO — String interpolation otimizada (C# 10+)
// O compilador usa DefaultInterpolatedStringHandler internamente (evita formatação intermediária)
string msg = $"Pedido {pedidoId} para {nomeCliente}";

// ❌ ERRADO para hot paths — string.Format e + concatenação
string msg = "Pedido " + pedidoId + " para " + nomeCliente; // múltiplas alocações
string msg = string.Format("Pedido {0} para {1}", pedidoId, nomeCliente);

// ✅ CORRETO para hot paths com muitas concatenações
var sb = new StringBuilder();
sb.Append("Pedido ").Append(pedidoId).Append(" para ").Append(nomeCliente);
string msg = sb.ToString();

// ✅ MELHOR para hot paths — pool o StringBuilder (ver Seção 2)
```

### string.Create para Formatting Customizado
```csharp
// ✅ string.Create — aloca exatamente uma vez, sem buffer intermediário
public static string FormatarPedidoId(int numero) =>
    string.Create(10, numero, static (span, n) =>
    {
        span[0] = 'P';
        span[1] = 'E';
        span[2] = 'D';
        span[3] = '-';
        n.TryFormat(span[4..], out _);
    });
```

---

## SEÇÃO 5 — COLLECTIONS E LINQ

### Regras de Coleções
```csharp
// ✅ CORRETO — Pre-sizing evita re-alocações internas
var lista = new List<Pedido>(capacity: pedidosEstimados);
var dict = new Dictionary<string, int>(capacity: 1000);

// ❌ ERRADO — Sem capacity: cresce dobrando (várias re-alocações e cópias)
var lista = new List<Pedido>();

// ✅ CORRETO — CollectionsMarshal para acesso direto em hot paths
var dict = new Dictionary<string, int>();
ref int valor = ref CollectionsMarshal.GetValueRefOrAddDefault(dict, "chave", out _);
valor++;  // Incrementa in-place sem lookup duplo

// ✅ CORRETO — Span sobre array de List (evita cópia)
List<int> lista = new() { 1, 2, 3 };
Span<int> span = CollectionsMarshal.AsSpan(lista);
```

### LINQ — Regras para Performance
```csharp
// ❌ EVITE em hot paths — LINQ aloca enumeradores, closures, etc.
var resultado = pedidos
    .Where(p => p.Status == PedidoStatus.Pendente)
    .Select(p => p.Id)
    .ToList();  // múltiplas alocações

// ✅ CORRETO para hot paths — loop manual
var resultado = new List<PedidoId>(capacidade);
foreach (var pedido in pedidos)
{
    if (pedido.Status == PedidoStatus.Pendente)
        resultado.Add(pedido.Id);
}

// REGRA DE OURO:
// LINQ é excelente para legibilidade em código não-crítico.
// Em hot paths medidos → substitua por loops.
// Meça antes de mudar. Use BenchmarkDotNet.
```

### Prefer Array sobre List quando tamanho é fixo
```csharp
// ✅ Array — tamanho fixo, sem overhead de List, cache-friendly
PedidoStatus[] statusValidos = [PedidoStatus.Pendente, PedidoStatus.Confirmado];

// ✅ ReadOnlySpan para arrays constantes — zero alocação em runtime
private static readonly string[] _statusNomes = ["Pendente", "Confirmado", "Cancelado"];
ReadOnlySpan<string> span = _statusNomes;
```

---

## SEÇÃO 6 — ASYNC/AWAIT E VALUETASK

### ValueTask vs Task

```csharp
// ✅ Task — Use quando a operação é SEMPRE assíncrona
public Task<Pedido> BuscarPedidoAsync(PedidoId id)
{
    return _dbContext.Pedidos.FindAsync(id.Value).AsTask();
}

// ✅ ValueTask — Use quando a operação FREQUENTEMENTE é síncrona (cache hit, etc.)
// ValueTask evita alocação de Task quando retorna sincronamente
public ValueTask<Pedido?> BuscarPedidoComCacheAsync(PedidoId id)
{
    if (_cache.TryGetValue(id, out var pedido))
        return ValueTask.FromResult(pedido);  // sem alocação de Task!
    
    return new ValueTask<Pedido?>(BuscarNoBancoAsync(id));
}

// REGRA: Não use ValueTask se a operação é sempre async — overhead sem benefício.
//        Meça com BenchmarkDotNet antes de trocar Task por ValueTask.
```

### ConfigureAwait
```csharp
// ✅ Em bibliotecas e infrastructure — sempre ConfigureAwait(false)
// Evita captura desnecessária de SynchronizationContext
public async Task<Pedido> BuscarAsync(PedidoId id)
{
    var entity = await _dbContext.Pedidos
        .FindAsync(id.Value)
        .ConfigureAwait(false);
    
    return _mapper.ParaDominio(entity);
}

// ✅ Em ASP.NET Core controllers — ConfigureAwait(false) é OK também
//    (ASP.NET Core não tem SynchronizationContext desde .NET Core 1.0)
```

### Async Paralelo com WhenAll
```csharp
// ✅ CORRETO — Operações independentes em paralelo
var (pedido, cliente, estoque) = await (
    _pedidoRepo.BuscarAsync(pedidoId),
    _clienteRepo.BuscarAsync(clienteId),
    _estoqueService.VerificarAsync(produtoId)
).WhenAll();  // C# 7+ tuple deconstruct

// ❌ ERRADO — await sequencial quando operações são independentes
var pedido  = await _pedidoRepo.BuscarAsync(pedidoId);   // espera
var cliente = await _clienteRepo.BuscarAsync(clienteId); // espera novamente
```

---

## SEÇÃO 7 — EVITAR ALOCAÇÕES COMUNS

### Closures e Captures
```csharp
// ❌ ERRADO — Closure captura variável → aloca objeto no heap
int threshold = 100;
var resultado = lista.Where(x => x.Valor > threshold); // captura threshold → aloca

// ✅ CORRETO — Passar estado explicitamente quando possível
var resultado = lista.Where(static (x, t) => x.Valor > t, threshold); // sem closure
```

### Delegates e Lambdas Estáticos
```csharp
// ✅ CORRETO — static lambda = sem captura = sem alocação
Func<int, bool> isPositivo = static x => x > 0;

// ❌ ERRADO — lambda não-static pode capturar estado
Func<int, bool> isPositivo = x => x > 0; // compilador pode ou não alocar
```

### Params e IEnumerable
```csharp
// ❌ ERRADO — params aloca array em cada chamada
void Logar(params string[] mensagens) { }
Logar("a", "b", "c"); // aloca string[] a cada chamada

// ✅ CORRETO — ReadOnlySpan como params (C# 13+)
void Logar(params ReadOnlySpan<string> mensagens) { }
Logar("a", "b", "c"); // stack allocation, sem heap

// ✅ CORRETO alternativo — overloads específicos
void Logar(string msg) { }
void Logar(string msg1, string msg2) { }
void Logar(string msg1, string msg2, string msg3) { }
```

### IEnumerable vs concreto
```csharp
// ❌ EVITE retornar IEnumerable<T> de hot paths quando resultado é materializado
// Força boxing de enumeradores de valor (ex: List<T>.Enumerator é struct → ok)
// Mas pode forçar alocação se consumidor usa LINQ em cima

// ✅ PREFIRA retornar tipo concreto em APIs internas
public List<Pedido> BuscarPedidosPendentes() { ... }
public Pedido[] BuscarPedidosDoCliente(ClienteId id) { ... }

// IEnumerable<T> em APIs públicas de biblioteca ainda é recomendado para abstração
// Em código interno de performance crítica → tipo concreto.
```

---

## SEÇÃO 8 — MEDIÇÃO E FERRAMENTAS

### BenchmarkDotNet (Obrigatório antes de otimizar)
```csharp
// ✅ Sempre benchmark antes de afirmar que algo é mais rápido
[MemoryDiagnoser]          // mostra alocações por operação
[SimpleJob(RuntimeMoniker.Net80)]
public class MeuBenchmark
{
    [Benchmark(Baseline = true)]
    public string ComSubstring() => "2024-01-15".Substring(0, 4);
    
    [Benchmark]
    public int ComSpan() => int.Parse("2024-01-15".AsSpan(0, 4));
}

// Execute: dotnet run -c Release
// Leia: Mean, Allocated (bytes por operação), Gen0 collections
```

### dotnet-counters (Monitoramento em Produção)
```bash
# Ver pressão de GC em tempo real
dotnet-counters monitor --process-id <PID> \
  System.Runtime[gc-heap-size,gen-0-gc-count,gen-1-gc-count,alloc-rate]

# Valores saudáveis em API de alta carga:
# gen-0-gc-count: < 10/segundo
# alloc-rate: < 100MB/segundo
# gen-1-gc-count: raramente (sinal de problema se frequente)
# gen-2-gc-count: muito raramente
```

### dotnet-trace e PerfView
```bash
# Capturar trace para análise de alocações
dotnet-trace collect --process-id <PID> \
  --profile gc-verbose \
  --output trace.nettrace

# Ver alocações por tipo e call stack no PerfView
```

---

## SEÇÃO 9 — PADRÕES ESPECÍFICOS ASP.NET CORE

### Minimal API com ResponseCaching
```csharp
// ✅ OutputCache para respostas cacheáveis
app.MapGet("/produtos/{id}", async (int id, IProdutoRepository repo) =>
    await repo.BuscarAsync(id))
   .CacheOutput(p => p.Expire(TimeSpan.FromMinutes(5)));
```

### ILogger com Structured Logging (zero alocação em disabled levels)
```csharp
// ✅ CORRETO — Source-generated logging (zero alocação quando nível desabilitado)
[LoggerMessage(Level = LogLevel.Information, Message = "Pedido {PedidoId} criado")]
static partial void LogPedidoCriado(ILogger logger, PedidoId pedidoId);

// ❌ ERRADO — String interpolation em log aloca mesmo quando nível desabilitado
_logger.LogInformation($"Pedido {pedidoId} criado"); // aloca sempre!

// ✅ CORRETO alternativo — Template estruturado (sem interpolação)
_logger.LogInformation("Pedido {PedidoId} criado", pedidoId); // sem alocação quando desabilitado
```

### HttpClient e Pooling
```csharp
// ✅ CORRETO — IHttpClientFactory gerencia pool de HttpMessageHandler
services.AddHttpClient<IMeuServico, MeuServico>(client =>
{
    client.BaseAddress = new Uri("https://api.exemplo.com");
});

// ❌ ERRADO — new HttpClient() em cada uso (esgota sockets)
using var client = new HttpClient();
```

---

## CHECKLIST DE PERFORMANCE

### Hot Path Review
```
[ ] Alocações de string foram minimizadas? (Span<char> em vez de Substring?)
[ ] Arrays temporários usam ArrayPool ou stackalloc?
[ ] Objetos reutilizáveis custosos estão em pool?
[ ] LINQ em hot paths foi substituído por loops?
[ ] Structs são menores que 16 bytes?
[ ] Structs imutáveis marcadas como readonly?
[ ] Boxing evitado (sem cast de struct para object/interface)?
[ ] Collections criadas com capacity pré-definida?
[ ] ValueTask usado onde operação é frequentemente síncrona?
[ ] ConfigureAwait(false) em código de biblioteca/infraestrutura?
[ ] Closures em hot paths evitadas (static lambdas)?
[ ] Logs usando template estruturado (não interpolação)?

### Medição
[ ] BenchmarkDotNet rodado com [MemoryDiagnoser]?
[ ] Baseline definido antes da otimização?
[ ] Resultado medido em Release mode (não Debug)?
[ ] dotnet-counters validou alocações em produção?
[ ] Gen 2 GC não está ocorrendo frequentemente?
```

---

## TABELA DE DECISÃO RÁPIDA

| Situação | Use |
|---|---|
| Processar substring sem alocar | `ReadOnlySpan<char>` |
| Buffer temporário < 1KB | `stackalloc` + `Span<T>` |
| Buffer temporário > 1KB | `ArrayPool<T>.Shared.Rent()` |
| Objeto caro de criar, reutilizável | `ObjectPool<T>` |
| Concatenar strings em hot path | `StringBuilder` (poolado) |
| Formatar string uma vez | `string.Create()` |
| Comparar strings | `StringComparison.Ordinal` |
| Operação async frequentemente síncrona | `ValueTask<T>` |
| Lambda sem captura de estado | `static` lambda |
| Collection de tamanho conhecido | `new List<T>(capacity)` |
| Struct pequena e imutável | `readonly struct` |
| LINQ em hot path | Loop `foreach` manual |
| Value Object ≤16 bytes (domínio) | `readonly record struct` |
| Value Object >16 bytes (domínio) | `record class` |
| Command / Query / Response (Application) | `record class` |
| Entity / Aggregate Root (domínio) | `class` (nunca record) |
| Resultado de método (Result/Option) | `readonly record struct` |
| `with` sem alocação de heap | `readonly record struct` (não `record class`) |

---

## REFERÊNCIAS

- Microsoft — *Avoid memory allocations and data copies in C#* — docs.microsoft.com
- Adam Sitnik & Ben Adams — *Writing High Performance .NET Code*
- Stephen Toub — *Understanding ValueTask* — devblogs.microsoft.com
- Andrew Lock — *High Performance .NET* — andrewlock.net
- BenchmarkDotNet — benchmarkdotnet.org
- JetBrains dotMemory / dotTrace — para profiling em produção
- PerfView — github.com/microsoft/perfview
