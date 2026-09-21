const POSITIONS = [
    "top-left",
    "top-center",
    "top-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
];

const DEFAULTS = {
    position: "top-right",
    duration: 5000,
    background: "#ffffff",
    color: "#182230",
    borderColor: "#2563eb",
    borderWidth: "4px",
    radius: "8px",
};

const TYPE_PRESETS = {
    success: {
        background: "#dcfce7",
        color: "#166534",
        borderColor: "#22c55e",
        icon: "&#10003;",
    },
    error: {
        background: "#fee2e2",
        color: "#991b1b",
        borderColor: "#ef4444",
        icon: "&#10005;",
    },
    warning: {
        background: "#fef3c7",
        color: "#92400e",
        borderColor: "#f59e0b",
        icon: "&#9888;",
    },
    info: {
        background: "#dbeafe",
        color: "#0c2340",
        borderColor: "#3b82f6",
        icon: "&#8505;",
    },
};

let nextId = 0;

function createElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function applyStyle(element, options) {
    element.style.setProperty("--cj-notice-background", options.background);
    element.style.setProperty("--cj-notice-color", options.color);
    element.style.setProperty("--cj-notice-border-color", options.borderColor);
    element.style.setProperty("--cj-notice-border-width", options.borderWidth);
    element.style.setProperty("--cj-notice-radius", options.radius);
}

function resolveOptions(defaults, options) {
    const preset = TYPE_PRESETS[options.type] || {};
    return { ...defaults, ...preset, ...options };
}

function setType(element, type) {
    if (TYPE_PRESETS[type]) element.dataset.type = type;
}

export default class CJNotice {
    constructor(options = {}) {
        this.options = { ...DEFAULTS, ...options };
        this.tasks = new Map();
        this.containers = new Map();
        this.activeConfirm = null;
    }

    configure(options = {}) {
        this.options = { ...this.options, ...options };
        return this;
    }

    show(options = {}) {
        const settings = resolveOptions(this.options, options);
        const position = POSITIONS.includes(settings.position)
            ? settings.position
            : DEFAULTS.position;
        const id = settings.id || `cj-notice-${++nextId}`;
        const container = this.#getContainer(position);
        const notice = createElement("article", "cj-notice");
        notice.dataset.noticeId = id;
        setType(notice, settings.type);
        notice.setAttribute("role", settings.role || "status");
        applyStyle(notice, settings);

        if (settings.icon) {
            const icon = createElement("span", "cj-notice__icon");
            icon.setAttribute("aria-hidden", "true");
            icon.innerHTML = settings.icon;
            notice.append(icon);
        }

        const content = createElement("div", "cj-notice__content");
        if (settings.title)
            content.append(
                createElement("h3", "cj-notice__title", settings.title),
            );
        if (settings.text)
            content.append(
                createElement("p", "cj-notice__text", settings.text),
            );
        notice.append(content);

        const close = createElement("button", "cj-notice__close", "\u00d7");
        close.type = "button";
        close.setAttribute(
            "aria-label",
            settings.closeLabel || "Fechar notificação",
        );
        close.addEventListener("click", () => this.dismiss(id, "close"));
        notice.append(close);
        container.append(notice);

        const timer =
            settings.duration > 0
                ? window.setTimeout(
                      () => this.dismiss(id, "timeout"),
                      settings.duration,
                  )
                : null;
        this.tasks.set(id, {
            element: notice,
            timer,
            onClose: settings.onClose,
            onExpire: settings.onExpire,
        });
        return id;
    }

    task(options = {}) {
        return this.show(options);
    }

    success(options = {}) {
        return this.show({ ...options, type: "success" });
    }

    error(options = {}) {
        return this.show({ ...options, type: "error" });
    }

    warning(options = {}) {
        return this.show({ ...options, type: "warning" });
    }

    info(options = {}) {
        return this.show({ ...options, type: "info" });
    }

    dismiss(id, reason = "dismiss") {
        const task = this.tasks.get(id);
        if (!task) return false;
        if (task.timer) window.clearTimeout(task.timer);
        this.tasks.delete(id);
        if (reason === "timeout") task.onExpire?.(id);
        task.onClose?.({ id, reason });
        task.element.classList.add("cj-notice--leaving");
        task.element.addEventListener(
            "transitionend",
            () => task.element.remove(),
            {
                once: true,
            },
        );
        window.setTimeout(() => task.element.remove(), 220);
        return true;
    }

    confirm(options = {}) {
        if (this.activeConfirm) this.#closeConfirm("replaced");
        const settings = resolveOptions(this.options, options);
        const previousFocus = document.activeElement;
        const modal = createElement("div", "cj-notice-modal");
        modal.setAttribute("role", "presentation");
        const dialog = createElement("section", "cj-notice-modal__dialog");
        setType(dialog, settings.type);
        dialog.setAttribute("role", "alertdialog");
        dialog.setAttribute("aria-modal", "true");
        applyStyle(dialog, settings);

        const content = createElement("div", "cj-notice-modal__content");
        if (settings.icon) {
            const icon = createElement("span", "cj-notice__icon");
            icon.setAttribute("aria-hidden", "true");
            icon.innerHTML = settings.icon;
            content.append(icon);
        }
        const copy = createElement("div");
        const title = createElement(
            "h2",
            "cj-notice-modal__title",
            settings.title || "Confirmação",
        );
        title.id = `cj-notice-title-${++nextId}`;
        dialog.setAttribute("aria-labelledby", title.id);
        copy.append(title);
        if (settings.text)
            copy.append(
                createElement("p", "cj-notice-modal__text", settings.text),
            );
        content.append(copy);
        dialog.append(content);

        const actions = createElement("div", "cj-notice-modal__actions");
        const cancel = {
            label: settings.cancelLabel || "Cancelar",
            onClick: settings.onCancel,
        };
        [cancel, ...(settings.confirmations || [])].forEach((action, index) => {
            const button = createElement(
                "button",
                `cj-notice__action${index === 0 ? " cj-notice__action--cancel" : ""}`,
                action.label,
            );
            button.type = "button";
            button.addEventListener("click", () => {
                action.onClick?.();
                this.#closeConfirm(index === 0 ? "cancel" : "confirm");
            });
            actions.append(button);
        });
        dialog.append(actions);
        modal.append(dialog);
        document.body.append(modal);
        this.activeConfirm = { modal, previousFocus };
        actions.querySelector("button")?.focus();
        modal.addEventListener("keydown", (event) => {
            if (event.key === "Escape") this.#closeConfirm("escape");
            if (event.key === "Tab") this.#trapFocus(event, dialog);
        });
        return this;
    }

    confirmSuccess(options = {}) {
        return this.confirm({ ...options, type: "success" });
    }

    confirmError(options = {}) {
        return this.confirm({ ...options, type: "error" });
    }

    confirmWarning(options = {}) {
        return this.confirm({ ...options, type: "warning" });
    }

    confirmInfo(options = {}) {
        return this.confirm({ ...options, type: "info" });
    }

    #getContainer(position) {
        let container = this.containers.get(position);
        if (!container) {
            container = createElement("div", "cj-notice-container");
            container.dataset.position = position;
            container.setAttribute("aria-live", "polite");
            document.body.append(container);
            this.containers.set(position, container);
        }
        return container;
    }

    #closeConfirm(reason) {
        if (!this.activeConfirm) return;
        const { modal, previousFocus } = this.activeConfirm;
        modal.remove();
        this.activeConfirm = null;
        previousFocus?.focus?.();
        this.options.onConfirmClose?.({ reason });
    }

    #trapFocus(event, dialog) {
        const focusable = [
            ...dialog.querySelectorAll("button:not([disabled])"),
        ];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
}

export { DEFAULTS, POSITIONS, TYPE_PRESETS };
