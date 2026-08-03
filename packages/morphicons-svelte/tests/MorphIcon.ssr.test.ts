// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer, type ViteDevServer } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import {
  allocOutputs,
  buildPlan,
  interpPolar,
  resampleIcon,
  serialize,
} from "morphicons";
import { canonicalD } from "morphicons/dom";
import { CLOSE_PATH, MENU_PATH, PLAY_PATH } from "../src/lib/icons/paths";

let server: ViteDevServer;
let render: typeof import("svelte/server").render;
let MorphIcon: typeof import("../src/lib/MorphIcon.svelte").default;
let MenuCloseIcon: typeof import("../src/lib/icons/MenuCloseIcon.svelte").default;
let PlayPauseIcon: typeof import("../src/lib/icons/PlayPauseIcon.svelte").default;

function controlledD(source: string, target: string, progress: number): string {
  const plan = buildPlan(resampleIcon(source), resampleIcon(target));
  const output = allocOutputs(plan);
  interpPolar(plan, progress, output);
  return serialize(
    output,
    plan.items.map((item) => item.closed),
  );
}

beforeAll(async () => {
  server = await createServer({
    appType: "custom",
    configFile: false,
    root: process.cwd(),
    plugins: [svelte()],
    resolve: { dedupe: ["svelte"] },
    server: { middlewareMode: true },
    ssr: { noExternal: ["svelte"] },
  });

  render = (await server.ssrLoadModule("svelte/server")).render;
  MorphIcon = (await server.ssrLoadModule("/src/lib/MorphIcon.svelte")).default;
  MenuCloseIcon = (
    await server.ssrLoadModule("/src/lib/icons/MenuCloseIcon.svelte")
  ).default;
  PlayPauseIcon = (
    await server.ssrLoadModule("/src/lib/icons/PlayPauseIcon.svelte")
  ).default;
});

afterAll(async () => {
  await server.close();
});

describe("MorphIcon SSR", () => {
  it("emits the exact canonical path and accessible title", () => {
    const { body } = render(MorphIcon, {
      props: { icon: MENU_PATH, label: "Menu", size: 32 },
    });

    expect(body).toContain(`d="${canonicalD(MENU_PATH)}"`);
    expect(body).toContain("<title>Menu</title>");
    expect(body).toContain('role="img"');
    expect(body).not.toContain("aria-hidden");
  });

  it("keeps unlabeled icons out of the accessibility tree", () => {
    const { body } = render(MorphIcon, { props: { icon: MENU_PATH } });
    expect(body).toContain('aria-hidden="true"');
  });

  it("renders both learning components through the same adapter", () => {
    const menu = render(MenuCloseIcon, { props: {} }).body;
    const play = render(PlayPauseIcon, { props: {} }).body;

    expect(menu).toContain(`d="${canonicalD(MENU_PATH)}"`);
    expect(play).toContain(`d="${canonicalD(PLAY_PATH)}"`);
  });

  it("renders controlled from/to progress exactly on the server", () => {
    const atStart = render(MorphIcon, {
      props: { from: MENU_PATH, to: CLOSE_PATH, progress: 0 },
    }).body;
    const atMiddle = render(MorphIcon, {
      props: { from: MENU_PATH, to: CLOSE_PATH, progress: 0.5 },
    }).body;
    const atEnd = render(MorphIcon, {
      props: { from: MENU_PATH, to: CLOSE_PATH, progress: 1 },
    }).body;

    expect(atStart).toContain(`d="${canonicalD(MENU_PATH)}"`);
    expect(atMiddle).toContain(`d="${controlledD(MENU_PATH, CLOSE_PATH, 0.5)}"`);
    expect(atEnd).toContain(`d="${canonicalD(CLOSE_PATH)}"`);
  });
});
