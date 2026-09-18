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