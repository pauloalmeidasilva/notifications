# Plugin de notificação

## Descrição

### Nome

CJNotice.js

### Objetivo

Criar um plugin js que fará o gerenciamento de notificações na tela. Ele terá tasks de alertas e alerts centrais de confirmações

## Requisito

### Tasks

- Ele deve aparecer nas seguintes posições da tela:
    - superior: esquerda, centro ou direita
    - inferior: esquerda, centro ou direita
- Ele deve conter uma posição de ícone, titulo e texto
- Ele deve conter uma estilização de fundo da notificação (escolha de cores), borda esquerda (escolha de cores e espessura da borda), raio da borda
- Ele deve suportar temporizador para deleção da notificação
- Ele deve conter um botão de exclusão d notificação, ele exclui somente a notificação que está o botão.
- Ele será alimentado com um json das configurações
- Deve conter os métodos básicos de inserção de configurações, lançamento e exclusão
- Ele deve suportar a pilha de notificações (se várias aparecerem)

### Alerts de confirmação

- Ele aparecerá obrigatóriamente na posição centralizado da tela
- Ele deve conter uma posição de ícone, titulo e texto
- Ele deve conter uma estilização de fundo da notificação (escolha de cores), borda esquerda (escolha de cores e espessura da borda), raio da borda
- ele deve suportar um botão centralizado abaixo abaixo das informações para cancelamento (se não tiver configuração personalizada ele fecha o alerta)
- ele deve suportar botões de confirmações que será agrupado junto ao botão de cancelamento em que pode ter uma chamada de evento

## Melhorias planejadas

### Tasks e API

- [x] Criar tipos de notificação: `success`, `error`, `warning` e `info`, com cores e ícones padrão.
- [x] Adicionar métodos convenientes, como `notice.success()` e `notice.error()`, incluindo métodos tipados para confirms.
- [ ] Criar `update(id, options)` para atualizar uma task existente sem removê-la.
- [ ] Pausar o temporizador quando o usuário passar o mouse sobre a notificação.
- [ ] Adicionar uma barra de progresso mostrando o tempo restante da task.
- [ ] Definir um limite de notificações visíveis com `maxVisible`.
- [ ] Criar uma fila para notificações excedentes ao limite.
- [ ] Permitir escolher se as novas notificações aparecem acima ou abaixo da pilha.
- [ ] Permitir conteúdo customizado com elemento DOM, função geradora ou componente compatível.

### Acessibilidade e experiência

- [ ] Permitir fechar tasks com a tecla `Escape`.
- [ ] Garantir navegação adequada entre ações usando o teclado.
- [ ] Tornar o `role` ARIA configurável, usando `status` para mensagens comuns e `alert` para erros urgentes.
- [ ] Permitir configurar animações como `slide`, `fade` e `none`.
- [ ] Respeitar `prefers-reduced-motion` em todas as animações.

### Alerts de confirmação

- [ ] Suportar callbacks assíncronos nas confirmações.
- [ ] Exibir estado de carregamento enquanto uma confirmação assíncrona estiver em execução.
- [ ] Permitir configurar um texto de carregamento, como `loadingLabel`.
- [ ] Permitir fechar ao clicar fora do diálogo com `closeOnBackdrop`.
- [ ] Criar um estilo ou preset para ações destrutivas, como exclusões.
- [ ] Permitir usar `Enter` para confirmar e `Escape` para cancelar.
- [ ] Tornar os atalhos de teclado configuráveis.

### Qualidade e distribuição

- [ ] Adicionar testes para foco, tecla `Escape`, múltiplas confirmações, timers, pausa e callbacks.
- [ ] Adicionar testes de acessibilidade e dos atributos ARIA.
- [ ] Criar definições TypeScript em `index.d.ts` ou migrar a implementação para TypeScript.
- [ ] Documentar a customização de CSS, ícones, tamanhos e variáveis visuais.
- [ ] Documentar exemplos completos de tasks, confirmações e temas.
- [ ] Oferecer uma alternativa segura ao `innerHTML` para ícones, aceitando elementos DOM ou funções geradoras.
- [ ] Avaliar compatibilidade com Trusted Types.

## Ordem sugerida de implementação

1. [x] Tipos de notificação e métodos convenientes.
2. [ ] Método `update()` para tasks existentes.
3. [ ] Pausa do temporizador ao passar o mouse.
4. [ ] Barra de progresso.
5. [ ] Limite e fila de notificações.
6. [ ] Confirmações assíncronas com estado de carregamento.
7. [ ] Melhorias de acessibilidade e atalhos de teclado.
8. [ ] Conteúdo customizado e alternativa segura ao `innerHTML`.
9. [ ] Tipagens TypeScript, testes adicionais e documentação.
