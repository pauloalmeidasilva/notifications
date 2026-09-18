# CJNotice.js

Plugin JavaScript vanilla para notificacoes empilhaveis e alerts de confirmacao.

## Uso

```js
import CJNotice from "cj-notice";
import "cj-notice/style.css";

const notice = new CJNotice({ duration: 4000 });
notice.success = (options) =>
    notice.show({ ...options, borderColor: "#16a34a" });
notice.show({
    position: "top-right",
    icon: '<strong aria-hidden="true">!</strong>',
    title: "Concluido",
    text: "A operacao foi realizada.",
});

notice.confirm({
    title: "Excluir registro?",
    text: "Esta acao nao pode ser desfeita.",
    confirmations: [
        { label: "Excluir", onClick: () => console.log("confirmado") },
    ],
});
```

## API

- `new CJNotice(options)`: cria uma instancia.
- `configure(options)`: altera os defaults da instancia.
- `show(options)` / `task(options)`: exibe uma task e retorna seu ID.
- `dismiss(id, reason)`: remove somente a task informada.
- `confirm(options)`: abre um alert centralizado.

As tasks aceitam `position` (`top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`), `title`, `text`, `icon`, `duration`, `background`, `color`, `borderColor`, `borderWidth`, `radius`, `onClose` e `onExpire`.

O texto e inserido como texto simples. O campo `icon` aceita HTML/SVG fornecido pelo consumidor e deve vir de uma fonte confiavel.
