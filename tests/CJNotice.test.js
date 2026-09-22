import { afterEach, describe, expect, it, vi } from "vitest";
import CJNotice from "../src/CJNotice.js";

afterEach(() => {
    document.body.innerHTML = "";
    vi.useRealTimers();
});

describe("CJNotice", () => {
    it("exibe e remove uma task individualmente", () => {
        vi.useFakeTimers();
        const notice = new CJNotice();
        const firstId = notice.show({ title: "Primeira", text: "Texto" });
        const secondId = notice.show({ title: "Segunda" });

        expect(document.querySelectorAll(".cj-notice")).toHaveLength(2);
        expect(notice.dismiss(firstId)).toBe(true);
        expect(
            document
                .querySelector(`[data-notice-id="${firstId}"]`)
                .classList.contains("cj-notice--leaving"),
        ).toBe(true);
        vi.advanceTimersByTime(220);
        expect(
            document.querySelector(`[data-notice-id="${firstId}"]`),
        ).toBeNull();
        expect(
            document.querySelector(`[data-notice-id="${secondId}"]`),
        ).not.toBeNull();
    });

    it("remove a task após o timer e chama onExpire", async () => {
        vi.useFakeTimers();
        const onExpire = vi.fn();
        const notice = new CJNotice();
        notice.show({ duration: 100, onExpire });

        vi.advanceTimersByTime(100);
        vi.advanceTimersByTime(220);

        expect(onExpire).toHaveBeenCalledTimes(1);
        expect(document.querySelector(".cj-notice")).toBeNull();
    });

    it("cria tasks tipadas com presets e permite customização", () => {
        const notice = new CJNotice();
        const id = notice.success({
            title: "Salvo",
            background: "#123456",
            icon: "OK",
        });
        const task = document.querySelector(`[data-notice-id="${id}"]`);

        expect(task.dataset.type).toBe("success");
        expect(task.style.getPropertyValue("--cj-notice-background")).toBe(
            "#123456",
        );
        expect(task.querySelector(".cj-notice__icon").innerHTML).toBe("OK");

        notice.error({ title: "Falha" });
        expect(document.querySelector('[data-type="error"]')).not.toBeNull();
    });

    it("foca o fechamento e permite dispensar a task com Escape", () => {
        vi.useFakeTimers();
        const notice = new CJNotice();
        const id = notice.show({ duration: 0 });
        const task = document.querySelector(`[data-notice-id="${id}"]`);
        const close = task.querySelector(".cj-notice__close");

        expect(document.activeElement).toBe(close);
        close.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

        expect(notice.tasks.has(id)).toBe(false);
        expect(task.classList.contains("cj-notice--leaving")).toBe(true);
    });

    it("configura roles e animações válidos e usa defaults para valores inválidos", () => {
        const notice = new CJNotice();
        const statusId = notice.show({ duration: 0 });
        const alertId = notice.show({
            duration: 0,
            role: "alert",
            animation: "fade",
        });
        const fallbackId = notice.show({
            duration: 0,
            role: "dialog",
            animation: "zoom",
        });

        expect(
            document
                .querySelector(`[data-notice-id="${statusId}"]`)
                .getAttribute("role"),
        ).toBe("status");
        expect(
            document
                .querySelector(`[data-notice-id="${alertId}"]`)
                .getAttribute("role"),
        ).toBe("alert");
        expect(
            document.querySelector(`[data-notice-id="${alertId}"]`).dataset
                .animation,
        ).toBe("fade");
        expect(
            document
                .querySelector(`[data-notice-id="${fallbackId}"]`)
                .getAttribute("role"),
        ).toBe("status");
        expect(
            document.querySelector(`[data-notice-id="${fallbackId}"]`).dataset
                .animation,
        ).toBe("slide");
    });

    it("permite desativar a animação", () => {
        const notice = new CJNotice();
        const id = notice.show({ duration: 0, animation: "none" });

        expect(
            document.querySelector(`[data-notice-id="${id}"]`).dataset
                .animation,
        ).toBe("none");
    });

    it("cria confirms tipados pelos métodos convenientes", () => {
        const notice = new CJNotice();

        notice.confirmWarning({ title: "Atenção" });

        const dialog = document.querySelector(".cj-notice-modal__dialog");
        expect(dialog.dataset.type).toBe("warning");
        expect(dialog.style.getPropertyValue("--cj-notice-border-color")).toBe(
            "#f59e0b",
        );
        expect(dialog.querySelector(".cj-notice__icon")).not.toBeNull();
    });

    it("abre confirmação, executa confirmação e restaura o foco", () => {
        const notice = new CJNotice();
        const trigger = document.createElement("button");
        document.body.append(trigger);
        trigger.focus();
        const onConfirm = vi.fn();

        notice.confirm({
            title: "Continuar?",
            confirmations: [{ label: "Sim", onClick: onConfirm }],
        });
        expect(document.querySelector('[role="alertdialog"]')).not.toBeNull();

        document.querySelectorAll(".cj-notice__action")[1].click();
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(document.querySelector(".cj-notice-modal")).toBeNull();
        expect(document.activeElement).toBe(trigger);
    });
});
