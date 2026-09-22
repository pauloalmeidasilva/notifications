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
    role: "status",
    animation: "slide",
    maxVisible: Infinity,
    stackOrder: "below",
    pauseOnHover: false,
    progress: true,
};

const ANIMATIONS = ["slide", "fade", "none"];
const ARIA_ROLES = ["status", "alert"];

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

function resolveRole(role) {
    return ARIA_ROLES.includes(role) ? role : DEFAULTS.role;
}

function resolveAnimation(animation) {
    return ANIMATIONS.includes(animation) ? animation : DEFAULTS.animation;
}

function resolveStackOrder(order) {
    return order === "above" ? "above" : "below";
}

function resolveContent(content) {
    const value = typeof content === "function" ? content() : content;
    return value instanceof Element ? value : null;
}

export default class CJNotice {
    constructor(options = {}) {
        this.options = { ...DEFAULTS, ...options };
        this.tasks = new Map();
        this.queues = new Map();
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
        notice.dataset.animation = resolveAnimation(settings.animation);
        setType(notice, settings.type);
        notice.setAttribute("role", resolveRole(settings.role));
        applyStyle(notice, settings);

        if (settings.icon) {
            const icon = createElement("span", "cj-notice__icon");
            icon.setAttribute("aria-hidden", "true");
            icon.innerHTML = settings.icon;
            notice.append(icon);
        }

        const content = createElement("div", "cj-notice__content");
        const customContent = resolveContent(settings.content);
        if (customContent) content.append(customContent);
        else {
            if (settings.title)
                content.append(
                    createElement("h3", "cj-notice__title", settings.title),
                );
            if (settings.text)
                content.append(
                    createElement("p", "cj-notice__text", settings.text),
                );
        }
        notice.append(content);

        const close = createElement("button", "cj-notice__close", "\u00d7");
        close.type = "button";
        close.setAttribute(
            "aria-label",
            settings.closeLabel || "Fechar notificação",
        );
        close.addEventListener("click", () => this.dismiss(id, "close"));
        notice.addEventListener(
            "keydown",
            (event) => {
                if (event.key === "Escape") this.dismiss(id, "escape");
            },
            true,
        );
        notice.append(close);
        const progress =
            settings.progress !== false && settings.duration > 0
                ? createElement("span", "cj-notice__progress")
                : null;
        if (progress) notice.append(progress);
        const task = {
            element: notice,
            id,
            position,
            settings,
            timer: null,
            progress,
            progressTimer: null,
            remaining: settings.duration,
            startedAt: null,
            paused: false,
            onClose: settings.onClose,
            onExpire: settings.onExpire,
        };
        this.tasks.set(id, task);
        notice.addEventListener("mouseenter", () => this.#pauseTimer(task));
        notice.addEventListener("mouseleave", () => this.#resumeTimer(task));
        if (this.#canShow(position, settings.maxVisible))
            this.#mountTask(task, container);
        else this.#getQueue(position).push(task);
        return id;
    }

    update(id, options = {}) {
        const task = this.tasks.get(id);
        if (!task) return false;
        const settings = resolveOptions(task.settings, options);
        task.settings = settings;
        if (options.type) setType(task.element, settings.type);
        if (options.role)
            task.element.setAttribute("role", resolveRole(settings.role));
        if (options.animation)
            task.element.dataset.animation = resolveAnimation(
                settings.animation,
            );
        applyStyle(task.element, settings);
        if (
            options.title !== undefined ||
            options.text !== undefined ||
            options.content !== undefined
        )
            this.#renderContent(task, settings);
        if (options.icon !== undefined)
            this.#renderIcon(task.element, settings.icon);
        if (options.duration !== undefined || options.progress !== undefined) {
            this.#stopTimer(task);
            task.remaining = settings.duration;
            this.#renderProgress(task);
            if (task.element.isConnected) this.#startTimer(task);
        }
        return true;
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
        this.#stopTimer(task);
        this.tasks.delete(id);
        const queue = this.#getQueue(task.position);
        const queuedIndex = queue.indexOf(task);
        if (queuedIndex !== -1) queue.splice(queuedIndex, 1);
        if (reason === "timeout") task.onExpire?.(id);
        task.onClose?.({ id, reason });
        if (!task.element.isConnected) {
            this.#promote(task.position);
            return true;
        }
        task.element.classList.add("cj-notice--leaving");
        task.element.addEventListener(
            "transitionend",
            () => task.element.remove(),
            {
                once: true,
            },
        );
        window.setTimeout(() => {
            task.element.remove();
            this.#promote(task.position);
        }, 220);
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

    #getQueue(position) {
        if (!this.queues.has(position)) this.queues.set(position, []);
        return this.queues.get(position);
    }

    #canShow(position, configuredLimit = this.options.maxVisible) {
        const maxVisible = Number(configuredLimit);
        return (
            !Number.isFinite(maxVisible) ||
            this.#getContainer(position).querySelectorAll(".cj-notice").length <
                Math.max(0, maxVisible)
        );
    }

    #mountTask(task, container) {
        if (task.settings.stackOrder === "above")
            container.prepend(task.element);
        else container.append(task.element);
        task.element.querySelector(".cj-notice__close")?.focus();
        this.#renderProgress(task);
        this.#startTimer(task);
    }

    #promote(position) {
        const queue = this.#getQueue(position);
        if (
            !queue.length ||
            !this.#canShow(position, queue[0].settings.maxVisible)
        )
            return;
        const task = queue.shift();
        this.#mountTask(task, this.#getContainer(position));
    }

    #startTimer(task) {
        if (task.timer || task.remaining <= 0 || !task.element.isConnected)
            return;
        task.startedAt = Date.now();
        if (task.progress && !task.progressTimer) {
            task.progressTimer = window.setInterval(() => {
                const elapsed = Date.now() - task.startedAt;
                task.progress.style.setProperty(
                    "--cj-notice-progress",
                    `${Math.max(0, ((task.remaining - elapsed) / task.settings.duration) * 100)}%`,
                );
            }, 100);
        }
        task.timer = window.setTimeout(
            () => this.dismiss(task.id, "timeout"),
            task.remaining,
        );
    }

    #stopTimer(task) {
        if (!task.timer) return;
        const elapsed = Date.now() - task.startedAt;
        task.remaining = Math.max(0, task.remaining - elapsed);
        window.clearTimeout(task.timer);
        task.timer = null;
        task.startedAt = null;
        if (task.progressTimer) {
            window.clearInterval(task.progressTimer);
            task.progressTimer = null;
        }
        this.#renderProgress(task);
    }

    #pauseTimer(task) {
        if (!task.settings.pauseOnHover || task.paused || !task.timer) return;
        this.#stopTimer(task);
        task.paused = true;
        task.element.dataset.paused = "true";
    }

    #resumeTimer(task) {
        if (!task.paused) return;
        task.paused = false;
        delete task.element.dataset.paused;
        this.#startTimer(task);
    }

    #renderProgress(task) {
        if (!task.progress) return;
        const duration = Number(task.settings.duration);
        const percent = duration > 0 ? (task.remaining / duration) * 100 : 0;
        task.progress.style.setProperty(
            "--cj-notice-progress",
            `${Math.max(0, Math.min(100, percent))}%`,
        );
    }

    #renderContent(task, settings) {
        const content = task.element.querySelector(".cj-notice__content");
        content.replaceChildren();
        const customContent = resolveContent(settings.content);
        if (customContent) content.append(customContent);
        else {
            if (settings.title)
                content.append(
                    createElement("h3", "cj-notice__title", settings.title),
                );
            if (settings.text)
                content.append(
                    createElement("p", "cj-notice__text", settings.text),
                );
        }
    }

    #renderIcon(element, iconValue) {
        const existing = element.querySelector(".cj-notice__icon");
        if (existing) existing.remove();
        if (!iconValue) return;
        const icon = createElement("span", "cj-notice__icon");
        icon.setAttribute("aria-hidden", "true");
        icon.innerHTML = iconValue;
        element.prepend(icon);
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

export { ANIMATIONS, ARIA_ROLES, DEFAULTS, POSITIONS, TYPE_PRESETS };
