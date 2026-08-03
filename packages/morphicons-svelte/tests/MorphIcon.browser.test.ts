import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushSync, mount, unmount } from "svelte";
import {
  allocOutputs,
  buildPlan,
  interpPolar,
  resampleIcon,
  serialize,
} from "morphicons";
import { canonicalD } from "morphicons/dom";
import MorphIcon from "../src/lib/MorphIcon.svelte";
import MorphIconHarness from "./MorphIconHarness.svelte";
import { CLOSE_PATH, MENU_PATH, PLAY_PATH } from "../src/lib/icons/paths";

const mounted: Array<Record<string, unknown>> = [];

function controlledD(source: string, target: string, progress: number): string {
  const plan = buildPlan(resampleIcon(source), resampleIcon(target));
  const output = allocOutputs(plan);
  interpPolar(plan, progress, output);
  return serialize(
    output,
    plan.items.map((item) => item.closed),
  );
}

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
});

afterEach(async () => {
  for (const component of mounted.splice(0)) await unmount(component);
  vi.unstubAllGlobals();
});

describe("MorphIcon in the browser", () => {
  it("exposes an imperative set method without giving Svelte ownership of d", () => {
    const target = document.createElement("div");
    const component = mount(MorphIcon, {
      target,
      props: { icon: MENU_PATH, class: "demo-icon", "data-test": "morph" },
    });
    mounted.push(component);
    flushSync();

    const svg = target.querySelector("svg");
    const path = target.querySelector("path");
    expect(svg?.classList.contains("demo-icon")).toBe(true);
    expect(svg?.getAttribute("data-test")).toBe("morph");
    expect(path?.getAttribute("d")).toBe(canonicalD(MENU_PATH));

    component.set(CLOSE_PATH);
    expect(path?.getAttribute("d")).toBe(canonicalD(CLOSE_PATH));
  });

  it("seeds the first imperative morph immediately when props are empty", () => {
    const target = document.createElement("div");
    const component = mount(MorphIcon, { target });
    mounted.push(component);
    flushSync();

    component.morphTo(MENU_PATH);
    expect(target.querySelector("path")?.getAttribute("d")).toBe(
      canonicalD(MENU_PATH),
    );
  });

  it("keeps imperative state until controlled props change, then rebases", () => {
    const target = document.createElement("div");
    const component = mount(MorphIconHarness, {
      target,
      props: { from: MENU_PATH, to: CLOSE_PATH, progress: 0.5 },
    });
    mounted.push(component);
    flushSync();

    expect(target.querySelector("path")?.getAttribute("d")).toBe(
      controlledD(MENU_PATH, CLOSE_PATH, 0.5),
    );

    component.set(PLAY_PATH);
    expect(target.querySelector("path")?.getAttribute("d")).toBe(
      canonicalD(PLAY_PATH),
    );

    component.update({ progress: 0.75 });
    flushSync();
    expect(target.querySelector("path")?.getAttribute("d")).toBe(
      controlledD(MENU_PATH, CLOSE_PATH, 0.75),
    );
  });

  it("lets an imperative set win until an uncontrolled prop changes", () => {
    const target = document.createElement("div");
    const component = mount(MorphIconHarness, {
      target,
      props: { icon: MENU_PATH },
    });
    mounted.push(component);
    flushSync();

    component.set(CLOSE_PATH);
    expect(target.querySelector("path")?.getAttribute("d")).toBe(
      canonicalD(CLOSE_PATH),
    );

    component.update({ icon: PLAY_PATH });
    flushSync();
    expect(target.querySelector("path")?.getAttribute("d")).toBe(
      canonicalD(PLAY_PATH),
    );
  });
});
