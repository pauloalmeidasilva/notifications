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
