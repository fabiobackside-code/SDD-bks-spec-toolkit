# 04. Anatomia da Estrutura Gerada

Assim que o CLI do Toolkit gerar o projeto, abra a nova pasta gerada (`meu-novo-sistema`) e olhe a árvore de arquivos. 

O coração do que o Toolkit faz é criar esta base robusta:

```
meu-novo-sistema/
├── docs/                 # A Bíblia do seu repositório
│   ├── CLAUDE.md
│   ├── CLAUDE-PROJECT.md
│   └── CLAUDE-ARCHITECT.md
├── specs/                # As features separadas de ponta a ponta
│   └── features/
│       └── exemplo/
│           ├── design.md
│           ├── requirements.md
│           └── tasks.md
└── CONTINUIDADE.md       # Arquivo "Aondearei" do seu projeto
```

## Os arquivos `CLAUDE.md`

- **`CLAUDE.md`**: São os "10 Mandamentos" da IA. Ensina como ela não deve sair escrevendo código sem rumo, como ela deve planejar, testar e pedir sua permissão para interações destrutivas.
- **`CLAUDE-PROJECT.md`**: É onde VOCÊ anota as bibliotecas, serviços, e decisões fixas do projeto. (ex: *"Usamos Tailwind v3 e Supabase para Auth"*). O toolkit entrega ele pré-preenchido ou comentando o que você deve fazer.
- **`CLAUDE-ARCHITECT.md`**: Padrões de design limpo (Clean Architecture, Ports and Adapters, etc.).

*(Nota: Alguns destes arquivos podem não estar lá dependendo da escolha Agnostic vs .NET, mas o conceito das regras persistentes é o mesmo).*

## A pasta `specs/` (Especificações)

Por que `requirements.md`, `design.md` e `tasks.md`?

O toolkit não vai programar a feature por você. O toolkit injeta templates para que **você alimente a Inteligência Artificial**. 
Quando você for criar a feature "Login", as regras dizem que você deve criar a pasta `specs/features/login/` e pedir que sua IA crie o arquivo descritivo das tasks baseadas no que você ditar.

---

[Seguir para o passo final: 05. O Ciclo de Vida Prático no SDD](./05-ciclo-de-vida-sdd.md)
