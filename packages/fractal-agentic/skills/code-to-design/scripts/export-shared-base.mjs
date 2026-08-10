#!/usr/bin/env node
/**
 * Export shared Open Design base design-system: fractal-mandala
 *
 *   node export-shared-base.mjs
 *   node export-shared-base.mjs --repo /path/to/mandala
 *
 * Writes:
 *   preprojects/code-design-loop/design-systems/fractal-mandala/  (versioned product)
 *   vendors/design-systems/fractal-mandala/                       (gitignored OD-local copy)
 */
import { readFile, writeFile, mkdir, cp } from "node:fs/promises";
import { join, resolve } from "node:path";

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    return process.argv[i + 1];
  }
  return fallback;
}

const repoRoot = resolve(arg("repo", process.cwd()));

const SOURCES = [
  {
    id: "fractaldharma",
    path: "sites/fractaldharma/src/lib/styles/_tokens.sass",
    themeSelectors: [":root", ".dark", ".light"],
  },
  {
    id: "fractalengine",
    path: "apps/fractalengine/src/lib/styles/_tokens.sass",
    themeSelectors: [":root", ".theme-amrit-dark", ".theme-amrit-light"],
  },
];

function parseTokenLines(text) {
  /** @type {{name:string,value:string,line:number}[]} */
  const tokens = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\t*(--[a-zA-Z0-9-]+)\s*:\s*(.+?)\s*$/);
    if (!m) continue;
    let value = m[2].replace(/\s*\/\/.*$/, "").trim();
    tokens.push({ name: m[1], value, line: i + 1 });
  }
  return tokens;
}

/** First occurrence wins (skip reduced-motion tails when possible by file order) */
function firstByName(list) {
  const m = new Map();
  for (const t of list) {
    if (!m.has(t.name)) m.set(t.name, t);
  }
  return m;
}

async function main() {
  const registry = {
    id: "fractal-mandala",
    version: "0.1.0",
    generatedAt: new Date().toISOString(),
    apps: [],
  };

  let tokensCss = `/* fractal-mandala shared base — generated; do not hand-edit for product truth */\n`;
  tokensCss += `/* Source of truth remains monorepo SASS per app. */\n\n`;

  const allNames = new Set();

  for (const src of SOURCES) {
    const abs = join(repoRoot, src.path);
    let text;
    try {
      text = await readFile(abs, "utf8");
    } catch (e) {
      console.error(`skip ${src.id}: ${e.message}`);
      continue;
    }
    const tokens = parseTokenLines(text);
    const map = firstByName(tokens);
    registry.apps.push({
      id: src.id,
      path: src.path,
      tokenCount: map.size,
    });

    tokensCss += `/* —— ${src.id} (${src.path}) —— */\n`;
    tokensCss += `[data-design-base="fractal-mandala"][data-app="${src.id}"],\n`;
    tokensCss += `.design-base-fractal-mandala.app-${src.id} {\n`;
    for (const [name, t] of [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      allNames.add(name);
      tokensCss += `  ${name}: ${t.value};\n`;
    }
    tokensCss += `}\n\n`;

    // Convenience aliases for common dark theme roots
    if (src.id === "fractaldharma") {
      tokensCss += `/* fractaldharma dark default convenience */\n`;
      tokensCss += `.app-shell.dark, [data-ssc-root].dark {\n`;
      for (const name of [
        "--background-primary",
        "--background-secondary",
        "--text-primary",
        "--text-secondary",
        "--theme-color",
        "--border-default",
        "--font-sans",
        "--text-bs",
        "--text-xl",
      ]) {
        if (map.has(name)) tokensCss += `  ${name}: ${map.get(name).value};\n`;
      }
      tokensCss += `}\n\n`;
    }
    if (src.id === "fractalengine") {
      tokensCss += `/* fractalengine dark theme convenience */\n`;
      tokensCss += `.theme-amrit-dark {\n`;
      for (const name of [
        "--background10",
        "--background20",
        "--text-primary",
        "--text-secondary",
        "--theme-color",
        "--border-primary",
        "--font-sans",
      ]) {
        if (map.has(name)) tokensCss += `  ${name}: ${map.get(name).value};\n`;
      }
      tokensCss += `}\n\n`;
    }
  }

  registry.tokenNameCount = allNames.size;

  const designMd = `# Fractal Mandala — shared design base

**id:** \`fractal-mandala\`  
**version:** ${registry.version}  
**role:** Shared Open Design brand base for the mandala monorepo  

## Layering

| Layer | Responsibility |
| --- | --- |
| **This package** | Portable brand/token export for Open Design + agents |
| **Per-surface packages** | \`vendors/design-packages/<surface-id>/\` overlays, freezes, loss, apply intents |
| **Monorepo SASS** | Product source of truth (\`_*tokens*.sass\` per app) |

Surfaces **extend** this base via \`base-ref.json\` — they must not redefine the full brand.

## Apps represented

${registry.apps.map((a) => `- **${a.id}** — \`${a.path}\` (${a.tokenCount} tokens)`).join("\n")}

## Usage in Open Design

1. Load this design system as the project brand (DESIGN.md + tokens.css).  
2. Open a surface package under \`vendors/design-packages/<id>/\` for page-specific preview.  
3. Apply back only via \`design-to-code\` with surface allowlists — promote shared tokens only with explicit flag.

## Regenerating

\`\`\`bash
node packages/fractal-agentic/skills/code-to-design/scripts/export-shared-base.mjs
\`\`\`

Generated: ${registry.generatedAt}
`;

  const manifest = {
    name: "fractal-mandala",
    version: registry.version,
    description: "Mandala monorepo shared design base for Open Design",
    files: ["DESIGN.md", "tokens.css", "manifest.json", "registry.json"],
    generatedAt: registry.generatedAt,
  };

  const dests = [
    join(repoRoot, "preprojects/code-design-loop/design-systems/fractal-mandala"),
    join(repoRoot, "vendors/design-systems/fractal-mandala"),
  ];

  for (const dest of dests) {
    await mkdir(dest, { recursive: true });
    await writeFile(join(dest, "DESIGN.md"), designMd, "utf8");
    await writeFile(join(dest, "tokens.css"), tokensCss, "utf8");
    await writeFile(join(dest, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
    await writeFile(join(dest, "registry.json"), JSON.stringify(registry, null, 2), "utf8");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        id: "fractal-mandala",
        version: registry.version,
        apps: registry.apps,
        tokenNameCount: registry.tokenNameCount,
        dests,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
