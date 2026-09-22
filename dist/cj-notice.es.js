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
	animation: "slide",
	maxVisible: Infinity,
	stackOrder: "below",
	pauseOnHover: !1,
	progress: !0
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
function f(e) {
	let t = typeof e == "function" ? e() : e;
	return t instanceof Element ? t : null;
}
var p = class {
	constructor(e = {}) {
		this.options = {
			...t,
			...e
		}, this.tasks = /* @__PURE__ */ new Map(), this.queues = /* @__PURE__ */ new Map(), this.containers = /* @__PURE__ */ new Map(), this.activeConfirm = null;
	}
	configure(e = {}) {
		return this.options = {
			...this.options,
			...e
		}, this;
	}
	show(n = {}) {
		let r = c(this.options, n), i = e.includes(r.position) ? r.position : t.position, p = r.id || `cj-notice-${++a}`, m = this.#e(i), h = o("article", "cj-notice");
		if (h.dataset.noticeId = p, h.dataset.animation = d(r.animation), l(h, r.type), h.setAttribute("role", u(r.role)), s(h, r), r.icon) {
			let e = o("span", "cj-notice__icon");
			e.setAttribute("aria-hidden", "true"), e.innerHTML = r.icon, h.append(e);
		}
		let g = o("div", "cj-notice__content"), _ = f(r.content);
		_ ? g.append(_) : (r.title && g.append(o("h3", "cj-notice__title", r.title)), r.text && g.append(o("p", "cj-notice__text", r.text))), h.append(g);
		let v = o("button", "cj-notice__close", "×");
		v.type = "button", v.setAttribute("aria-label", r.closeLabel || "Fechar notificação"), v.addEventListener("click", () => this.dismiss(p, "close")), h.addEventListener("keydown", (e) => {
			e.key === "Escape" && this.dismiss(p, "escape");
		}, !0), h.append(v);
		let y = r.progress !== !1 && r.duration > 0 ? o("span", "cj-notice__progress") : null;
		y && h.append(y);
		let b = {
			element: h,
			id: p,
			position: i,
			settings: r,
			timer: null,
			progress: y,
			progressTimer: null,
			remaining: r.duration,
			startedAt: null,
			paused: !1,
			onClose: r.onClose,
			onExpire: r.onExpire
		};
		return this.tasks.set(p, b), h.addEventListener("mouseenter", () => this.#s(b)), h.addEventListener("mouseleave", () => this.#c(b)), this.#n(i, r.maxVisible) ? this.#r(b, m) : this.#t(i).push(b), p;
	}
	update(e, t = {}) {
		let n = this.tasks.get(e);
		if (!n) return !1;
		let r = c(n.settings, t);
		return n.settings = r, t.type && l(n.element, r.type), t.role && n.element.setAttribute("role", u(r.role)), t.animation && (n.element.dataset.animation = d(r.animation)), s(n.element, r), (t.title !== void 0 || t.text !== void 0 || t.content !== void 0) && this.#u(n, r), t.icon !== void 0 && this.#d(n.element, r.icon), (t.duration !== void 0 || t.progress !== void 0) && (this.#o(n), n.remaining = r.duration, this.#l(n), n.element.isConnected && this.#a(n)), !0;
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
		if (!n) return !1;
		this.#o(n), this.tasks.delete(e);
		let r = this.#t(n.position), i = r.indexOf(n);
		return i !== -1 && r.splice(i, 1), t === "timeout" && n.onExpire?.(e), n.onClose?.({
			id: e,
			reason: t
		}), n.element.isConnected ? (n.element.classList.add("cj-notice--leaving"), n.element.addEventListener("transitionend", () => n.element.remove(), { once: !0 }), window.setTimeout(() => {
			n.element.remove(), this.#i(n.position);
		}, 220), !0) : (this.#i(n.position), !0);
	}
	confirm(e = {}) {
		this.activeConfirm && this.#f("replaced");
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
				e.onClick?.(), this.#f(t === 0 ? "cancel" : "confirm");
			}), p.append(n);
		}), i.append(p), r.append(i), document.body.append(r), this.activeConfirm = {
			modal: r,
			previousFocus: n
		}, p.querySelector("button")?.focus(), r.addEventListener("keydown", (e) => {
			e.key === "Escape" && this.#f("escape"), e.key === "Tab" && this.#p(e, i);
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
		return this.queues.has(e) || this.queues.set(e, []), this.queues.get(e);
	}
	#n(e, t = this.options.maxVisible) {
		let n = Number(t);
		return !Number.isFinite(n) || this.#e(e).querySelectorAll(".cj-notice").length < Math.max(0, n);
	}
	#r(e, t) {
		e.settings.stackOrder === "above" ? t.prepend(e.element) : t.append(e.element), e.element.querySelector(".cj-notice__close")?.focus(), this.#l(e), this.#a(e);
	}
	#i(e) {
		let t = this.#t(e);
		if (!t.length || !this.#n(e, t[0].settings.maxVisible)) return;
		let n = t.shift();
		this.#r(n, this.#e(e));
	}
	#a(e) {
		e.timer || e.remaining <= 0 || !e.element.isConnected || (e.startedAt = Date.now(), e.progress && !e.progressTimer && (e.progressTimer = window.setInterval(() => {
			let t = Date.now() - e.startedAt;
			e.progress.style.setProperty("--cj-notice-progress", `${Math.max(0, (e.remaining - t) / e.settings.duration * 100)}%`);
		}, 100)), e.timer = window.setTimeout(() => this.dismiss(e.id, "timeout"), e.remaining));
	}
	#o(e) {
		if (!e.timer) return;
		let t = Date.now() - e.startedAt;
		e.remaining = Math.max(0, e.remaining - t), window.clearTimeout(e.timer), e.timer = null, e.startedAt = null, e.progressTimer &&= (window.clearInterval(e.progressTimer), null), this.#l(e);
	}
	#s(e) {
		e.settings.pauseOnHover && !e.paused && e.timer && (this.#o(e), e.paused = !0, e.element.dataset.paused = "true");
	}
	#c(e) {
		e.paused && (e.paused = !1, delete e.element.dataset.paused, this.#a(e));
	}
	#l(e) {
		if (!e.progress) return;
		let t = Number(e.settings.duration), n = t > 0 ? e.remaining / t * 100 : 0;
		e.progress.style.setProperty("--cj-notice-progress", `${Math.max(0, Math.min(100, n))}%`);
	}
	#u(e, t) {
		let n = e.element.querySelector(".cj-notice__content");
		n.replaceChildren();
		let r = f(t.content);
		r ? n.append(r) : (t.title && n.append(o("h3", "cj-notice__title", t.title)), t.text && n.append(o("p", "cj-notice__text", t.text)));
	}
	#d(e, t) {
		let n = e.querySelector(".cj-notice__icon");
		if (n && n.remove(), !t) return;
		let r = o("span", "cj-notice__icon");
		r.setAttribute("aria-hidden", "true"), r.innerHTML = t, e.prepend(r);
	}
	#f(e) {
		if (!this.activeConfirm) return;
		let { modal: t, previousFocus: n } = this.activeConfirm;
		t.remove(), this.activeConfirm = null, n?.focus?.(), this.options.onConfirmClose?.({ reason: e });
	}
	#p(e, t) {
		let n = [...t.querySelectorAll("button:not([disabled])")];
		if (!n.length) return;
		let r = n[0], i = n[n.length - 1];
		e.shiftKey && document.activeElement === r ? (e.preventDefault(), i.focus()) : !e.shiftKey && document.activeElement === i && (e.preventDefault(), r.focus());
	}
}, m = p;
//#endregion
export { p as CJNotice, m as default };

//# sourceMappingURL=cj-notice.es.js.map