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
	radius: "8px"
}, n = {
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
}, r = 0;
function i(e, t, n) {
	let r = document.createElement(e);
	return r.className = t, n !== void 0 && (r.textContent = n), r;
}
function a(e, t) {
	e.style.setProperty("--cj-notice-background", t.background), e.style.setProperty("--cj-notice-color", t.color), e.style.setProperty("--cj-notice-border-color", t.borderColor), e.style.setProperty("--cj-notice-border-width", t.borderWidth), e.style.setProperty("--cj-notice-radius", t.radius);
}
function o(e, t) {
	let r = n[t.type] || {};
	return {
		...e,
		...r,
		...t
	};
}
function s(e, t) {
	n[t] && (e.dataset.type = t);
}
var c = class {
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
		let c = o(this.options, n), l = e.includes(c.position) ? c.position : t.position, u = c.id || `cj-notice-${++r}`, d = this.#e(l), f = i("article", "cj-notice");
		if (f.dataset.noticeId = u, s(f, c.type), f.setAttribute("role", c.role || "status"), a(f, c), c.icon) {
			let e = i("span", "cj-notice__icon");
			e.setAttribute("aria-hidden", "true"), e.innerHTML = c.icon, f.append(e);
		}
		let p = i("div", "cj-notice__content");
		c.title && p.append(i("h3", "cj-notice__title", c.title)), c.text && p.append(i("p", "cj-notice__text", c.text)), f.append(p);
		let m = i("button", "cj-notice__close", "×");
		m.type = "button", m.setAttribute("aria-label", c.closeLabel || "Fechar notificação"), m.addEventListener("click", () => this.dismiss(u, "close")), f.append(m), d.append(f);
		let h = c.duration > 0 ? window.setTimeout(() => this.dismiss(u, "timeout"), c.duration) : null;
		return this.tasks.set(u, {
			element: f,
			timer: h,
			onClose: c.onClose,
			onExpire: c.onExpire
		}), u;
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
		let t = o(this.options, e), n = document.activeElement, c = i("div", "cj-notice-modal");
		c.setAttribute("role", "presentation");
		let l = i("section", "cj-notice-modal__dialog");
		s(l, t.type), l.setAttribute("role", "alertdialog"), l.setAttribute("aria-modal", "true"), a(l, t);
		let u = i("div", "cj-notice-modal__content");
		if (t.icon) {
			let e = i("span", "cj-notice__icon");
			e.setAttribute("aria-hidden", "true"), e.innerHTML = t.icon, u.append(e);
		}
		let d = i("div"), f = i("h2", "cj-notice-modal__title", t.title || "Confirmação");
		f.id = `cj-notice-title-${++r}`, l.setAttribute("aria-labelledby", f.id), d.append(f), t.text && d.append(i("p", "cj-notice-modal__text", t.text)), u.append(d), l.append(u);
		let p = i("div", "cj-notice-modal__actions");
		return [{
			label: t.cancelLabel || "Cancelar",
			onClick: t.onCancel
		}, ...t.confirmations || []].forEach((e, t) => {
			let n = i("button", `cj-notice__action${t === 0 ? " cj-notice__action--cancel" : ""}`, e.label);
			n.type = "button", n.addEventListener("click", () => {
				e.onClick?.(), this.#t(t === 0 ? "cancel" : "confirm");
			}), p.append(n);
		}), l.append(p), c.append(l), document.body.append(c), this.activeConfirm = {
			modal: c,
			previousFocus: n
		}, p.querySelector("button")?.focus(), c.addEventListener("keydown", (e) => {
			e.key === "Escape" && this.#t("escape"), e.key === "Tab" && this.#n(e, l);
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
		return t || (t = i("div", "cj-notice-container"), t.dataset.position = e, t.setAttribute("aria-live", "polite"), document.body.append(t), this.containers.set(e, t)), t;
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
}, l = c;
//#endregion
export { c as CJNotice, l as default };

//# sourceMappingURL=cj-notice.es.js.map