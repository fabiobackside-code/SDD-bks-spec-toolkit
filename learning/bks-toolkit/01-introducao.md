# 01. Introdução ao BKS Spec Toolkit

## O que é o Toolkit?

O **BKS Spec Toolkit** (localizado na pasta `toolkit-app` da raiz) é uma aplicação CLI (Command Line Interface - de linha de comando) desenvolvida em TypeScript. 

Ele nasceu de uma necessidade latente: o SDD (Spec-Driven Development) dita regras incríveis sobre padronização de prompts, arquivos de contexto (`CLAUDE.md`, `CLAUDE-ARCHITECT.md`) e divisões de features, mas compor isso manualmente a cada novo projeto é lento e passível de erro humano.

O **Toolkit automatiza o "Start"**.

## Principais Responsabilidades da Ferramenta

1. **Scaffolding Inteligente**: Com um único comando interativo, ele gera a estrutura de pastas exata que o agente de IA espera encontrar na raiz do seu projeto.
2. **Templates de Qualidade**: Injeta automaticamente regras para inteligências artificiais. Há versões Agnósticas e focadas em ambientes específicos (como .NET C#).
3. **Padronização**: Garante que o projeto que você começou em Março usará a mesma estrutura que o projeto que outro membro da equipe criar em Outubro.

## Por que não só copiar/colar arquivos?

Copiar uma "pasta de esqueleto" funciona, mas o Toolkit foi desenhado para evoluir. Atualmente ele foca na geração (via `create`), mas seu design de comandos permite que no futuro ele seja expandido para:
- Validação automática de specs (ex: "verificar se uma feature nova possui design, requirement e tasks").
- Atualização e gestão de mudanças nas diretrizes de arquitetura para projetos legados.

---

[Seguir para o próximo passo: 02. Instalação e Setup](./02-instalacao-e-setup.md)
