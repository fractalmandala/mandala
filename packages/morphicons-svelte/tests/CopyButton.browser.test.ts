import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushSync, mount, unmount } from "svelte";
import CopyButton from "../src/demo/CopyButton.svelte";

const mounted: Array<Record<string, unknown>> = [];

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
});

afterEach(async () => {
  for (const component of mounted.splice(0)) await unmount(component);
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function settleClipboardPromise(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  flushSync();
}

function buttonIn(target: HTMLElement): HTMLButtonElement {
  const button = target.querySelector("button");
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("CopyButton did not render a button");
  }
  return button;
}

describe("CopyButton", () => {
  it("copies text and exposes the success label for 1600ms", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const target = document.createElement("div");
    const component = mount(CopyButton, {
      target,
      props: { text: "copy me", class: "custom-copy", size: "20" },
    });
    mounted.push(component);
    flushSync();

    const button = buttonIn(target);
    expect(button.type).toBe("button");
    expect(button.getAttribute("aria-label")).toBe("Copy to clipboard");
    expect(button.classList.contains("copy-button")).toBe(true);
    expect(button.classList.contains("custom-copy")).toBe(true);

    button.click();
    await settleClipboardPromise();

    expect(writeText).toHaveBeenCalledWith("copy me");
    expect(button.getAttribute("aria-label")).toBe("Copied");

    vi.advanceTimersByTime(1599);
    flushSync();
    expect(button.getAttribute("aria-label")).toBe("Copied");

    vi.advanceTimersByTime(1);
    flushSync();
    expect(button.getAttribute("aria-label")).toBe("Copy to clipboard");
  });

  it("clears and restarts the success timer after repeated successful copies", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const target = document.createElement("div");
    const component = mount(CopyButton, {
      target,
      props: { text: "copy me" },
    });
    mounted.push(component);
    flushSync();

    const button = buttonIn(target);
    button.click();
    await settleClipboardPromise();
    vi.advanceTimersByTime(1000);

    button.click();
    await settleClipboardPromise();
    vi.advanceTimersByTime(600);
    flushSync();
    expect(button.getAttribute("aria-label")).toBe("Copied");

    vi.advanceTimersByTime(999);
    flushSync();
    expect(button.getAttribute("aria-label")).toBe("Copied");

    vi.advanceTimersByTime(1);
    flushSync();
    expect(button.getAttribute("aria-label")).toBe("Copy to clipboard");
    expect(writeText).toHaveBeenCalledTimes(2);
  });

  it("fails safely for rejected and unavailable clipboard APIs", async () => {
    vi.useFakeTimers();
    const rejectedWriteText = vi
      .fn()
      .mockRejectedValue(new Error("permission denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText: rejectedWriteText } });
    const rejectedTarget = document.createElement("div");
    const rejectedComponent = mount(CopyButton, {
      target: rejectedTarget,
      props: { text: "copy me" },
    });
    mounted.push(rejectedComponent);
    flushSync();

    buttonIn(rejectedTarget).click();
    await settleClipboardPromise();
    expect(buttonIn(rejectedTarget).getAttribute("aria-label")).toBe(
      "Copy to clipboard",
    );
    expect(vi.getTimerCount()).toBe(0);

    vi.stubGlobal("navigator", {});
    const unavailableTarget = document.createElement("div");
    const unavailableComponent = mount(CopyButton, {
      target: unavailableTarget,
      props: { text: "copy me" },
    });
    mounted.push(unavailableComponent);
    flushSync();

    expect(() => buttonIn(unavailableTarget).click()).not.toThrow();
    expect(buttonIn(unavailableTarget).getAttribute("aria-label")).toBe(
      "Copy to clipboard",
    );
  });

  it("clears the success timer when destroyed", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const target = document.createElement("div");
    const component = mount(CopyButton, {
      target,
      props: { text: "copy me" },
    });
    mounted.push(component);
    flushSync();

    buttonIn(target).click();
    await settleClipboardPromise();
    expect(vi.getTimerCount()).toBe(1);

    await unmount(component);
    mounted.splice(mounted.indexOf(component), 1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
