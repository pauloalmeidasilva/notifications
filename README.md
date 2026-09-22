# CJNotice.js

Plugin vanilla JavaScript para notificações empilháveis e alerts de confirmação. A biblioteca oferece uma API pequena para comunicar estados da interface, controlar avisos temporários e proteger ações irreversíveis sem depender de frameworks.

> Versão atual: `1.1.0`

[![GitHub](https://img.shields.io/badge/GitHub-repositório-172033?logo=github)](https://github.com/pauloalmeidasilva/notifications)
[![NPM](https://img.shields.io/npm/v/cj-notice?label=NPM)](https://www.npmjs.com/package/cj-notice)

## Recursos

- Tasks empilháveis em seis posições da tela.
- Duração automática ou controle manual com `dismiss()`.
- Alerts de confirmação com ações de cancelar e confirmar.
- Foco inicial, suporte à tecla `Escape` e foco restaurado no fechamento.
- Tasks fecháveis com `Escape`, foco no botão de fechamento e navegação por teclado.
- Role ARIA configurável (`status` por padrão ou `alert` para mensagens urgentes).
- Animações configuráveis (`slide`, `fade` ou `none`) com suporte a `prefers-reduced-motion`.
- Atualização de tasks, pausa opcional no hover, barra de progresso e fila por posição.
- Conteúdo customizado com elementos DOM ou funções geradoras.
- Callbacks para fechamento, expiração, cancelamento e confirmação.
- Personalização de cores, borda, raio, ícones e conteúdo.
- Tipos `success`, `error`, `warning` e `info` com presets de cores e ícones.
- Métodos convenientes para tasks e confirmações tipadas.
- Compatível com JavaScript vanilla e módulos ES.
- Playground interativo e página de documentação com demos funcionais.

## Instalação

```bash
npm install cj-notice
```

Durante a fase alpha, instale explicitamente a versão publicada:

```bash
npm install cj-notice@alpha
```

## Uso básico

```js
import CJNotice from "cj-notice";
import "cj-notice/style.css";

const notice = new CJNotice({ duration: 4000 });

notice.task({
    position: "top-right",
    icon: '<strong aria-hidden="true">✓</strong>',
    title: "Tudo certo",
    text: "A operação foi realizada.",
});
```

Também é possível usar tipos com presets visuais:

```js
notice.success({
    title: "Tudo certo",
    text: "A operação foi realizada.",
});

notice.error({ title: "Falha", text: "Não foi possível concluir." });
notice.warning({ title: "Atenção" });
notice.info({ title: "Informação" });
```

Os métodos tipados também podem ser usados com `show()` ou `task()` por meio
da opção `type`. As opções `background`, `color`, `borderColor` e `icon`
personalizadas substituem os presets automáticos.

`show(options)` também pode ser usado no lugar de `task(options)`.

## Confirmação

```js
notice.confirm({
    title: "Excluir registro?",
    text: "Esta ação não pode ser desfeita.",
    cancelLabel: "Cancelar",
    onCancel: () => console.log("cancelado"),
    confirmations: [
        {
            label: "Excluir",
            onClick: () => console.log("confirmado"),
        },
    ],
});
```

## API

### `new CJNotice(options)`

Cria uma instância do plugin. Os valores informados tornam-se defaults para as próximas tasks e confirmações.

```js
const notice = new CJNotice({
    duration: 5000,
    position: "bottom-right",
    borderColor: "#2563eb",
    role: "status",
    animation: "slide",
});
```

### `configure(options)`

Atualiza os defaults da instância e retorna o próprio objeto.

```js
notice.configure({ duration: 3000 });
```

### `show(options)` / `task(options)`

Exibe uma task e retorna um ID que pode ser usado para removê-la.

```js
const taskId = notice.task({
    position: "bottom-center",
    duration: 0,
    title: "Processando",
    text: "Aguarde a conclusão.",
    onClose: ({ reason }) => console.log(reason),
    onExpire: (id) => console.log("Expirou", id),
});

notice.dismiss(taskId, "completed");
```

As tasks aceitam:

| Opção          | Descrição                                                                                |
| -------------- | ---------------------------------------------------------------------------------------- |
| `position`     | `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center` ou `bottom-right`. |
| `title`        | Título.                                                                                  |
| `text`         | Conteúdo textual.                                                                        |
| `type`         | `success`, `error`, `warning` ou `info`; aplica um preset de cores e ícone.              |
| `icon`         | HTML ou SVG confiável para o ícone.                                                      |
| `duration`     | Tempo em milissegundos. Use `0` para controle manual.                                    |
| `background`   | Cores do fundo.                                                                          |
| `color`        | Cores do texto.                                                                          |
| `borderColor`  | Cor da borda lateral.                                                                    |
| `borderWidth`  | Espessura da borda lateral.                                                              |
| `radius`       | Raio dos cantos.                                                                         |
| `role`         | Role ARIA: `status` (padrão) ou `alert`.                                                 |
| `animation`    | Animação: `slide` (padrão), `fade` ou `none`.                                            |
| `pauseOnHover` | Pausa o timer e o progresso enquanto o mouse estiver sobre a task.                       |
| `progress`     | Exibe a barra de progresso em tasks temporizadas; use `false` para ocultá-la.            |
| `maxVisible`   | Limite de tasks visíveis na posição; excedentes entram na fila FIFO.                     |
| `stackOrder`   | `below` (padrão) adiciona ao final ou `above` adiciona ao topo da pilha.                 |
| `content`      | Elemento DOM ou função que retorna um elemento; substitui `title` e `text`.              |
| `onClose`      | Callback chamado ao fechar a task. Recebe `{ id, reason }`.                              |
| `onExpire`     | Callback chamado quando a duração termina. Recebe o ID.                                  |

### `dismiss(id, reason)`

Remove somente a task indicada. Retorna `true` quando a task existe e `false` quando ela não foi encontrada.

O botão de fechamento recebe foco quando a task é criada. Com o foco dentro da
task, `Escape` a dispensa e informa `reason: "escape"` ao callback `onClose`.
Quando o sistema operacional solicita movimento reduzido, as animações são
desativadas automaticamente.

### `update(id, options)`

Atualiza uma task existente sem trocar seu ID ou elemento. Retorna `true` quando
a task existe e `false` caso contrário. Alterar `duration` reinicia a contagem.

```js
const taskId = notice.task({ title: "Enviando", duration: 0 });
notice.update(taskId, {
    title: "Enviado",
    text: "Arquivo concluído.",
});
```

Tasks que excedem `maxVisible` aguardam na fila da própria posição. Ao fechar
uma task visível, a próxima é exibida automaticamente. `pauseOnHover: true`
pausa tanto o timer quanto a barra de progresso.

Conteúdo seguro pode ser fornecido sem `innerHTML`:

```js
notice.task({
    duration: 0,
    content: () => {
        const element = document.createElement("strong");
        element.textContent = "Conteúdo customizado";
        return element;
    },
});
```

Além de `show()` e `task()`, os métodos `success()`, `error()`, `warning()` e
`info()` criam tasks com o tipo correspondente e retornam o ID da task.

### `confirm(options)`

Abre um alert centralizado com foco gerenciado.

```js
notice.confirm({
    title: "Publicar alterações?",
    text: "A nova versão ficará disponível para sua equipe.",
    cancelLabel: "Ainda não",
    confirmations: [{ label: "Publicar", onClick: publicarAlteracoes }],
});
```

Confirmações tipadas podem usar `type` ou os métodos convenientes:

```js
notice.confirmSuccess({
    title: "Publicar alterações?",
    confirmations: [{ label: "Publicar", onClick: publicarAlteracoes }],
});

notice.confirmError({ title: "Excluir registro?" });
notice.confirmWarning({ title: "Atenção" });
notice.confirmInfo({ title: "Detalhes" });
```

Os tipos disponíveis são `success`, `error`, `warning` e `info`.

As opções específicas de confirmação são `cancelLabel`, `onCancel`, `confirmations` e `onConfirmClose`. Cada item de `confirmations` aceita `label` e `onClick`.

## Ícones SVG

O campo `icon` aceita HTML ou SVG fornecido pela aplicação:

```js
notice.task({
    icon: '<svg aria-hidden="true" viewBox="0 0 24 24">...</svg>',
    title: "Sincronizado",
    text: "Os dados estão atualizados.",
});
```

Como o ícone é inserido com `innerHTML`, use somente SVGs e HTML de fontes confiáveis. `title` e `text` são inseridos como texto simples.

## Exemplos e documentação

- [Landing page e documentação](index.html)
- [Playground interativo](examples/index.html)
- [Repositório no GitHub](https://github.com/pauloalmeidasilva/notifications)
- [Pacote no NPM](https://www.npmjs.com/package/cj-notice)

## Desenvolvimento

```bash
npm install
npm run dev
```

Scripts disponíveis:

```bash
npm run lint       # valida o código
npm test -- --run  # executa os testes
npm run build      # gera os arquivos em dist/
```

## Licença

MIT
