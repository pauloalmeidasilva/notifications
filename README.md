# CJNotice.js

Plugin vanilla JavaScript para notificações empilháveis e alerts de confirmação. A biblioteca oferece uma API pequena para comunicar estados da interface, controlar avisos temporários e proteger ações irreversíveis sem depender de frameworks.

> Versão atual: `0.1.0-alpha.1`

[![GitHub](https://img.shields.io/badge/GitHub-repositório-172033?logo=github)](https://github.com/pauloalmeidasilva/notifications)
[![NPM](https://img.shields.io/npm/v/cj-notice?label=NPM)](https://www.npmjs.com/package/cj-notice)

## Recursos

- Tasks empilháveis em seis posições da tela.
- Duração automática ou controle manual com `dismiss()`.
- Alerts de confirmação com ações de cancelar e confirmar.
- Foco inicial, suporte à tecla `Escape` e foco restaurado no fechamento.
- Callbacks para fechamento, expiração, cancelamento e confirmação.
- Personalização de cores, borda, raio, ícones e conteúdo.
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

| Opção | Descrição |
| --- | --- |
| `position` | `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center` ou `bottom-right`. |
| `title` | Título. |
| `text` | Conteúdo textual. |
| `icon` | HTML ou SVG confiável para o ícone. |
| `duration` | Tempo em milissegundos. Use `0` para controle manual. |
| `background` | Cores do fundo. |
| `color` | Cores do texto. |
| `borderColor` | Cor da borda lateral. |
| `borderWidth` | Espessura da borda lateral. |
| `radius` | Raio dos cantos. |
| `onClose` | Callback chamado ao fechar a task. Recebe `{ id, reason }`. |
| `onExpire` | Callback chamado quando a duração termina. Recebe o ID. |

### `dismiss(id, reason)`

Remove somente a task indicada. Retorna `true` quando a task existe e `false` quando ela não foi encontrada.

### `confirm(options)`

Abre um alert centralizado com foco gerenciado.

```js
notice.confirm({
    title: "Publicar alterações?",
    text: "A nova versão ficará disponível para sua equipe.",
    cancelLabel: "Ainda não",
    confirmations: [
        { label: "Publicar", onClick: publicarAlteracoes },
    ],
});
```

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
