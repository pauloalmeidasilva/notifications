//#region src/CJNotice.js
var e = [
	"top-left",
	"top-center",
	"top-right",
	"bottom-left",
	"bottom-center",
	"bottom-right"
], t = {
	position: "top-right",
	duration: 5e3,
	background: "#ffffff",
	color: "#182230",
	borderColor: "#2563eb",
	borderWidth: "4px",
	radius: "8px",
	role: "status",
	animation: "slide"
}, n = [
	"slide",
	"fade",
	"none"
], r = ["status", "alert"], i = {
	success: {
		background: "#dcfce7",
		color: "#166534",
		borderColor: "#22c55e",
		icon: "&#10003;"
	},
	error: {
		background: "#fee2e2",
		color: "#991b1b",
		borderColor: "#ef4444",
		icon: "&#10005;"
	},
	warning: {
		background: "#fef3c7",
		color: "#92400e",
		borderColor: "#f59e0b",
		icon: "&#9888;"
	},
	info: {
		background: "#dbeafe",
		color: "#0c2340",
		borderColor: "#3b82f6",
		icon: "&#8505;"
	}
}, a = 0;
function o(e, t, n) {
	let r = document.createElement(e);
	return r.className = t, n !== void 0 && (r.textContent = n), r;
}
function s(e, t) {
	e.style.setProperty("--cj-notice-background", t.background), e.style.setProperty("--cj-notice-color", t.color), e.style.setProperty("--cj-notice-border-color", t.borderColor), e.style.setProperty("--cj-notice-border-width", t.borderWidth), e.style.setProperty("--cj-notice-radius", t.radius);
}
function c(e, t) {
	let n = i[t.type] || {};
	return {
		...e,
		...n,
		...t
	};
}
function l(e, t) {
	i[t] && (e.dataset.type = t);
}
function u(e) {
	return r.includes(e) ? e : t.role;
}
function d(e) {
	return n.includes(e) ? e : t.animation;
}
var f = class {
	constructor(e = {}) {
		this.options = {
			...t,
			...e
		}, this.tasks = /* @__PURE__ */ new Map(), this.containers = /* @__PURE__ */ new Map(), this.activeConfirm = null;
	}
	configure(e = {}) {
		return this.options = {
			...this.options,
			...e
		}, this;
	}
	show(n = {}) {
		let r = c(this.options, n), i = e.includes(r.position) ? r.position : t.position, f = r.id || `cj-notice-${++a}`, p = this.#e(i), m = o("article", "cj-notice");
		if (m.dataset.noticeId = f, m.dataset.animation = d(r.animation), l(m, r.type), m.setAttribute("role", u(r.role)), s(m, r), r.icon) {
			let e = o("span", "cj-notice__icon");
			e.setAttribute("aria-hidden", "true"), e.innerHTML = r.icon, m.append(e);
		}
		let h = o("div", "cj-notice__content");
		r.title && h.append(o("h3", "cj-notice__title", r.title)), r.text && h.append(o("p", "cj-notice__text", r.text)), m.append(h);
		let g = o("button", "cj-notice__close", "×");
		g.type = "button", g.setAttribute("aria-label", r.closeLabel || "Fechar notificação"), g.addEventListener("click", () => this.dismiss(f, "close")), m.addEventListener("keydown", (e) => {
			e.key === "Escape" && this.dismiss(f, "escape");
		}, !0), m.append(g), p.append(m), g.focus();
		let _ = r.duration > 0 ? window.setTimeout(() => this.dismiss(f, "timeout"), r.duration) : null;
		return this.tasks.set(f, {
			element: m,
			timer: _,
			onClose: r.onClose,
			onExpire: r.onExpire
		}), f;
	}
	task(e = {}) {
		return this.show(e);
	}
	success(e = {}) {
		return this.show({
			...e,
			type: "success"
		});
	}
	error(e = {}) {
		return this.show({
			...e,
			type: "error"
		});
	}
	warning(e = {}) {
		return this.show({
			...e,
			type: "warning"
		});
	}
	info(e = {}) {
		return this.show({
			...e,
			type: "info"
		});
	}
	dismiss(e, t = "dismiss") {
		let n = this.tasks.get(e);
		return n ? (n.timer && window.clearTimeout(n.timer), this.tasks.delete(e), t === "timeout" && n.onExpire?.(e), n.onClose?.({
			id: e,
			reason: t
		}), n.element.classList.add("cj-notice--leaving"), n.element.addEventListener("transitionend", () => n.element.remove(), { once: !0 }), window.setTimeout(() => n.element.remove(), 220), !0) : !1;
	}
	confirm(e = {}) {
		this.activeConfirm && this.#t("replaced");
		let t = c(this.options, e), n = document.activeElement, r = o("div", "cj-notice-modal");
		r.setAttribute("role", "presentation");
		let i = o("section", "cj-notice-modal__dialog");
		l(i, t.type), i.setAttribute("role", "alertdialog"), i.setAttribute("aria-modal", "true"), s(i, t);
		let u = o("div", "cj-notice-modal__content");
		if (t.icon) {
			let e = o("span", "cj-notice__icon");
			e.setAttribute("aria-hidden", "true"), e.innerHTML = t.icon, u.append(e);
		}
		let d = o("div"), f = o("h2", "cj-notice-modal__title", t.title || "Confirmação");
		f.id = `cj-notice-title-${++a}`, i.setAttribute("aria-labelledby", f.id), d.append(f), t.text && d.append(o("p", "cj-notice-modal__text", t.text)), u.append(d), i.append(u);
		let p = o("div", "cj-notice-modal__actions");
		return [{
			label: t.cancelLabel || "Cancelar",
			onClick: t.onCancel
		}, ...t.confirmations || []].forEach((e, t) => {
			let n = o("button", `cj-notice__action${t === 0 ? " cj-notice__action--cancel" : ""}`, e.label);
			n.type = "button", n.addEventListener("click", () => {
				e.onClick?.(), this.#t(t === 0 ? "cancel" : "confirm");
			}), p.append(n);
		}), i.append(p), r.append(i), document.body.append(r), this.activeConfirm = {
			modal: r,
			previousFocus: n
		}, p.querySelector("button")?.focus(), r.addEventListener("keydown", (e) => {
			e.key === "Escape" && this.#t("escape"), e.key === "Tab" && this.#n(e, i);
		}), this;
	}
	confirmSuccess(e = {}) {
		return this.confirm({
			...e,
			type: "success"
		});
	}
	confirmError(e = {}) {
		return this.confirm({
			...e,
			type: "error"
		});
	}
	confirmWarning(e = {}) {
		return this.confirm({
			...e,
			type: "warning"
		});
	}
	confirmInfo(e = {}) {
		return this.confirm({
			...e,
			type: "info"
		});
	}
	#e(e) {
		let t = this.containers.get(e);
		return t || (t = o("div", "cj-notice-container"), t.dataset.position = e, t.setAttribute("aria-live", "polite"), document.body.append(t), this.containers.set(e, t)), t;
	}
	#t(e) {
		if (!this.activeConfirm) return;
		let { modal: t, previousFocus: n } = this.activeConfirm;
		t.remove(), this.activeConfirm = null, n?.focus?.(), this.options.onConfirmClose?.({ reason: e });
	}
	#n(e, t) {
		let n = [...t.querySelectorAll("button:not([disabled])")];
		if (!n.length) return;
		let r = n[0], i = n[n.length - 1];
		e.shiftKey && document.activeElement === r ? (e.preventDefault(), i.focus()) : !e.shiftKey && document.activeElement === i && (e.preventDefault(), r.focus());
	}
}, p = f;
//#endregion
export { f as CJNotice, p as default };

//# sourceMappingURL=cj-notice.es.js.map