# 05. O Ciclo de Vida Prático no SDD

Se você seguiu os passos anteriores e já tem uma pasta usando a estrutura do **Toolkit**, parabéns, seu projeto está formatado para Extrair 10x mais valor do Cursor, Claude, GitHub Copilot.

Mas como usar no dia a dia?

## A Dinâmica de Pair-Programming

### 1. Nascimento da Feature (Briefing)
Como humano, o cliente solicita uma nova feature, ex: "Um filtro avançado na loja".
Você cria a pasta: `specs/features/filtro-loja/`.
Você cria o documento inicial (manualmente ou pedindo pra IA): `requirements.md` focado com requisitos funcionais vindos do negócio.

### 2. O Design da Solução
Em vez de dizer: "IA, construa a feature do zero" (o que leva a bad-vibes de alucinações).
Você diz: *"IA, baseada nos requisitos em `specs/features/filtro-loja/requirements.md` e na arquitetura no nosso `docs/CLAUDE-ARCHITECT.md`, elabore o documento `design.md` sugerindo como vamos desenvolver isto tecnicamente."*
Você analisa a solução que a IA escreveu no `design.md`.

### 3. A Quebra em Tarefas Menores
Se você aprovar o design, você dirá: *"IA, tudo certo no design. Agora elabore o `tasks.md` dividido em caixas de checagem [ ] e com as estimativas."*

### 4. Executando o Código (Vibe Coding Controilada)
Só agora você inicia o código. O comando é tão simples quanto:
*"IA, vá para o arquivo de tasks recém-criado, leia a primeira task, analise as regras, e implemente."*

Após terminar, você escreve: *"Risque do `tasks.md` o que foi feito. E vamos pra próxima task."*

## Manutenção de Curto e Longo Prazo

- **CONTINUIDADE.md**: Se for sexta-feira 18h e faltarem duas tasks da feature do Filtro e a IA precisa de pausa ou você. O seu último pedido do dia é: "Atualize o `CONTINUIDADE.md` para eu ler na Segunda as 9h.".
- **Toolkit na Evolução**: Toda a inteligência estruturada que você extrai da pasta serve como contexto denso. Sempre que um Bug aparece, você aponta o Bug versus a Spec daquela área. 

Esse é o verdadeiro poder da estrutura entregue em 5 segundos pelo `toolkit-app`. Você programa focado em engenharia de texto, e menos digitando ponto-e-vírgula.

---

🏁 **Chegamos ao fim deste guia.** Retorne à [Trilha Completa na raiz do Learning](../README.md) se desejar ver mais exemplos teóricos ou aprofundamentos da própria metodologia SDD.
