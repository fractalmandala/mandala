#!/usr/bin/env node
/**
 * L3 capture helper for code-to-design.
 * Usage:
 *   node capture-l3.mjs --url http://127.0.0.1:5173/ --out vendors/design-packages/fractaldharma-home
 *   node capture-l3.mjs --url ... --out ... --selector .app-shell
 *
 * Prefers Playwright if installed; falls back to Chrome headless screenshot only
 * (DOM freeze requires Playwright or a browser with remote debugging).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

const url = arg("url", "http://127.0.0.1:5173/");
const outDir = resolve(arg("out", "vendors/design-packages/capture"));
const selector = arg("selector", ".app-shell");
const chromePath =
  arg("chrome", null) ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

await mkdir(join(outDir, "preview"), { recursive: true });
await mkdir(join(outDir, "evidence"), { recursive: true });

async function tryPlaywright() {
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(800);
    const shot = join(outDir, "evidence", "screenshot.png");
    await page.screenshot({ path: shot, fullPage: true });

    const freeze = await page.evaluate((sel) => {
      const root = document.querySelector(sel) || document.body;
      const clone = root.cloneNode(true);
      // strip scripts
      clone.querySelectorAll("script").forEach((s) => s.remove());

      const sheets = [];
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (!rules) continue;
          for (const r of Array.from(rules)) sheets.push(r.cssText);
        } catch {
          /* cross-origin */
        }
      }
      return {
        html: clone.outerHTML,
        css: sheets.join("\n"),
        title: document.title,
      };
    }, selector);

    const doc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${freeze.title || "Design package preview"} (L3 freeze)</title>
<style>
/* L3 captured styles */
${freeze.css}
html, body { margin: 0; min-height: 100%; }
</style>
</head>
<body>
${freeze.html}
</body>
</html>
`;
    await writeFile(join(outDir, "preview", "index.html"), doc, "utf8");
    await browser.close();
    return { ok: true, engine: "playwright", screenshot: shot };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function tryChromeScreenshot() {
  if (!existsSync(chromePath)) {
    return { ok: false, error: "Chrome not found" };
  }
  const shot = join(outDir, "evidence", "screenshot.png");
  await new Promise((resolveP, reject) => {
    const child = spawn(
      chromePath,
      [
        "--headless=new",
        "--disable-gpu",
        "--window-size=1400,900",
        `--screenshot=${shot}`,
        url,
      ],
      { stdio: "ignore" }
    );
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolveP() : reject(new Error(`chrome exit ${code}`))
    );
  });
  return { ok: true, engine: "chrome-screenshot", screenshot: shot, dom: false };
}

const pw = await tryPlaywright();
if (pw.ok) {
  console.log(JSON.stringify({ status: "ok", ...pw, outDir, url }, null, 2));
  process.exit(0);
}

const ch = await tryChromeScreenshot();
if (ch.ok) {
  console.log(
    JSON.stringify(
      {
        status: "partial",
        note: "Screenshot only — write preview/index.html via L2 freeze or install playwright",
        playwrightError: pw.error,
        ...ch,
        outDir,
        url,
      },
      null,
      2
    )
  );
  process.exit(0);
}

console.error(
  JSON.stringify({ status: "fail", playwright: pw.error, chrome: ch.error }, null, 2)
);
process.exit(1);
