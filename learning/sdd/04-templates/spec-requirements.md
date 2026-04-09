# Spec: [Nome da Feature]
Versão: 1.0 | Data: YYYY-MM-DD | Autor: [nome]

> INSTRUÇÕES: Preencha cada seção. Seja específico e não deixe ambiguidades.
> Cada RF deve ser verificável — se você não consegue imaginar um teste para ele, reformule.
> Remova estas instruções antes de usar com o Claude.

---

## Contexto

[Por que esta feature existe? Qual problema de negócio resolve?
Quem vai usar? Com que frequência? Qual é o impacto se não existir?]

---

## Dependências de Specs

> Se esta feature depende de outras specs já implementadas, liste aqui.

- [spec/auth/requirements.md: usuário deve estar autenticado]
- [nenhuma dependência]

---

## Requisitos Funcionais

> Use a linguagem EARS: O sistema DEVE / NÃO DEVE / PODE
> QUANDO [condição] O sistema DEVE [ação]
> Numere sequencialmente: RF-001, RF-002...

RF-001: O sistema DEVE [ação obrigatória principal]
RF-002: O sistema DEVE [segunda funcionalidade]
RF-003: O sistema PODE [funcionalidade opcional]
RF-004: O sistema NÃO DEVE [restrição de comportamento]
RF-005: QUANDO [condição específica] O sistema DEVE [resposta ao evento]

---

## Restrições Técnicas

> O QUE usar (bibliotecas, protocolos, padrões), não COMO implementar.

RC-001: [Biblioteca/padrão/protocolo obrigatório]
RC-002: [Limite de performance, segurança ou capacidade]
RC-003: [Formato de dados ou contrato de API]

---

## Critérios de Aceite

> Formato: DADO [estado inicial] QUANDO [ação] ENTÃO [resultado esperado]
> Cada CA deve ser diretamente testável.

DADO [pré-condição]
QUANDO [ação do usuário ou evento]
ENTÃO [resultado esperado, específico e verificável]

DADO [outra pré-condição]
QUANDO [ação que resulta em erro]
ENTÃO [erro específico com status HTTP e formato da mensagem]

---

## Fora de Escopo (Explícito)

> Liste explicitamente o que NÃO está nesta feature.
> Isso evita que o Claude implemente além do necessário.

- [Item que será implementado em outra spec]
- [Funcionalidade que foi decidido não incluir]
- [Caso de uso que pertence a outro módulo]

---

## Notas e Decisões de Design

> Decisões importantes que afetam a implementação mas não se encaixam nas seções acima.

- [Decisão: por que X foi escolhido ao invés de Y]
- [Restrição: motivo pelo qual Z não pode ser feito desta forma]
