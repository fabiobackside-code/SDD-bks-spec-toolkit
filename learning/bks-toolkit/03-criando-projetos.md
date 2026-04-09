# 03. Criando seu Primeiro Projeto

Com a CLI do Toolkit instalada e compilada na pasta interna `dist/`, você já pode injetar a estrutura base SDD em qualquer nova pasta do seu computador.

## Executando o Comando Principal

1. Estando dentro da raiz do `toolkit-app/`, execute o comando principal de criação:

```bash
node dist/index.js create
```

## O Workflow Interativo

A CLI usará o pacote `Inquirer` para perguntar os detalhes do projeto à você. 

1. **Nome do Projeto**: 
   A ferramenta vai perguntar de forma clara: *"Qual é o nome do projeto?"*
   *Exemplo*: `meu-novo-sistema`

2. **Template Tecnológico**:
   *"Selecione o template desejado"*
   A CLI oferecerá duas (ou mais, dependendo da versão) opções:
   - **Agnóstic**: Fornece os arquivos `CLAUDE` padronizados, a estrutura de features (requirements, design, tasks), mas sem assumir nenhuma linguagem de programação (uma tela em branco para Node, Python, Ruby, etc).
   - **.NET**: Adiciona arquivos aprofundados (`CLAUDE-ARCHITECT-NET.md`) instruindo regras de Clean Architecture específicas para arquiteturas com C# (.NET Core).

3. Após responder todas as perguntas, a ferramenta irá mostrar uma barra de progresso / spinner gerando os diretórios.
4. O resultado final será criado dentro da pasta referenciada internamente (se não especificado em flags ou caminho) para o local de destino do prompt. Se você quer que o projeto fique onde o comando rodou, utilize de diretórios em cima da raiz apropriados.

## E se eu quiser executar globalmente?
Você pode linkar o projeto utilizando o NPM:
```bash
npm link
```
Com isso, você consegue chamar o toolkit de qualquer lugar (ex. direto da sua pasta `MeusDocumentos`) digitando apenas algo como `bks-spec-toolkit create` (verifique no `package.json` em `bin` para ter certeza de qual alias foi atribuído para o CLI).

---

[Seguir para o próximo passo: 04. Anatomia da Estrutura Gerada](./04-estrutura-gerada.md)
