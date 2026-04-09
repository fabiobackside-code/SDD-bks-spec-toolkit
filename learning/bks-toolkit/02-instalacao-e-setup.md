# 02. Instalação e Setup da CLI

Como o **BKS Spec Toolkit** foi desenvolvido em **Node.js** com **TypeScript**, você precisa compilar o código fonte antes de utilizá-lo na linha de comando. 

## Pré-requisitos
- **Node.js**: Versão 16+ ou mais recente.
- **NPM**: O gerenciador de pacotes do Node (vem com a instalação do Node).

## Passo a Passo

1. Abra seu terminal (PowerShell, Command Prompt, etc).
2. Navegue até a pasta base do Toolkit:
```bash
cd D:\Fabio\BackSide\SDD\toolkit-app
```

3. Instale as dependências. Esse comando vai ler o `package.json` e baixar bibliotecas cruciais para interação no terminal (como `inquirer`, `commander`, e definições TypeScript):
```bash
npm install
```

4. Realize o Build. O código no diretório `src/` será transpilado do TypeScript para JavaScript puro que o Node entende e jogado na pasta `dist/`.
```bash
npm run build
```

*(Se não quiser utilizar o script, o comando que roda por baixo é um simples `npx tsc`)*

## Verificando a instalação

Se tudo der certo, a pasta `dist` possuirá um arquivo chamado `index.js`. 
Você pode testar a execução da CLI pedindo pela ajuda (help) padrão:

```bash
node dist/index.js --help
```

Você verá na tela as opções disponíveis no toolkit (como o uso do comando `create` etc.).

---

[Seguir para o próximo passo: 03. Criando seu Primeiro Projeto](./03-criando-projetos.md)
