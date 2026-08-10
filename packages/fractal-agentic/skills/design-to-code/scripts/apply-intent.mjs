#!/usr/bin/env node
/**
 * Apply apply-intent.json from a design package into allowlisted monorepo files.
 *
 *   node apply-intent.mjs --package vendors/design-packages/fractaldharma-home
 *   node apply-intent.mjs --package ... --dry-run
 *   node apply-intent.mjs --package ... --repo /path/to/mandala
 */
import { readFile, writeFile, access } from "node:fs/promises";
import { dirname, join, resolve, relative, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(__dirname, "..");

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    return process.argv[i + 1];
  }
  if (process.argv.includes(`--${name}`) && fallback === false) return true;
  return fallback;
}

const dryRun = process.argv.includes("--dry-run");
const packageDir = resolve(arg("package", "."));
const repoRoot = resolve(arg("repo", process.cwd()));

function underAllowlist(relPath, allowlist) {
  const n = normalize(relPath).replace(/\\/g, "/");
  return allowlist.paths.some((p) => {
    const prefix = p.endsWith("/") ? p : p + "/";
    return n === p.replace(/\/$/, "") || n.startsWith(prefix) || n === p;
  });
}

function isRefused(relPath, allowlist) {
  const n = normalize(relPath).replace(/\\/g, "/");
  return (allowlist.refusedPatterns || []).some((p) => n.startsWith(p.replace(/^\//, "")));
}

/**
 * Insert or replace a CSS custom property in indented SASS under a selector block.
 * Very small heuristic editor — P2 pilot quality, not a full SASS AST.
 */
function applyTokenToSass(source, { name, value, selectorHint = ":root" }) {
  const propLine = `\t${name}: ${value}`;
  const lines = source.split("\n");
  // Find selector line that equals or starts with selectorHint (no indent or less indent for root)
  let selIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === selectorHint || t.startsWith(selectorHint + " ") || t === selectorHint) {
      // prefer exact
      if (t === selectorHint || t.startsWith(selectorHint)) {
        selIdx = i;
        if (t === selectorHint) break;
      }
    }
  }
  if (selIdx < 0) {
    return { ok: false, error: `selector ${selectorHint} not found`, source };
  }

  // Block: following lines with more indent than selector
  const selIndent = lines[selIdx].match(/^\t*/)?.[0].length ?? 0;
  let end = selIdx + 1;
  while (end < lines.length) {
    const line = lines[end];
    if (line.trim() === "") {
      end++;
      continue;
    }
    const ind = line.match(/^\t*/)?.[0].length ?? 0;
    // media nested under :root can be same or more
    if (ind <= selIndent && !line.trim().startsWith("//")) break;
    end++;
  }

  // Search for existing prop in block
  const propRe = new RegExp(`^\\t+${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:`);
  for (let i = selIdx + 1; i < end; i++) {
    if (propRe.test(lines[i])) {
      const indent = lines[i].match(/^\t*/)?.[0] ?? "\t";
      lines[i] = `${indent}${name}: ${value}`;
      return { ok: true, action: "replaced", source: lines.join("\n"), line: i + 1 };
    }
  }

  // Insert after selector line (or after first comment block inside)
  let insertAt = selIdx + 1;
  while (insertAt < end && lines[insertAt].trim().startsWith("//")) insertAt++;
  const indent = "\t".repeat(selIndent + 1);
  lines.splice(insertAt, 0, `${indent}${name}: ${value}`);
  return { ok: true, action: "inserted", source: lines.join("\n"), line: insertAt + 1 };
}

async function main() {
  const report = {
    ok: false,
    dryRun,
    packageDir,
    repoRoot,
    applied: [],
    refused: [],
    errors: [],
  };

  let intent;
  let meta;
  try {
    intent = JSON.parse(await readFile(join(packageDir, "apply-intent.json"), "utf8"));
    meta = JSON.parse(await readFile(join(packageDir, "meta.json"), "utf8"));
  } catch (e) {
    console.error(JSON.stringify({ ok: false, error: `read package: ${e.message}` }, null, 2));
    process.exit(1);
  }

  const surfaceId = intent.surfaceId || meta.surfaceId;
  if (!surfaceId) {
    report.errors.push("missing surfaceId");
    console.error(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  if (intent.promoteToSharedBase === true) {
    report.errors.push(
      "promoteToSharedBase is not implemented in P2 — set false and scope to surface SASS"
    );
    console.error(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const allowlistPath = join(skillRoot, "references/allowlists", `${surfaceId}.json`);
  let allowlist;
  try {
    allowlist = JSON.parse(await readFile(allowlistPath, "utf8"));
  } catch {
    report.errors.push(`no allowlist at ${allowlistPath}`);
    console.error(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const tokens = intent.tokens || [];
  if (!tokens.length && !(intent.classes || []).length && !(intent.structure || []).length) {
    report.errors.push("apply-intent.json has no tokens/classes/structure to apply");
    console.error(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  for (const t of tokens) {
    const fileRel = (t.file || "").replace(/^\.\//, "");
    if (!fileRel) {
      report.refused.push({ token: t.name, reason: "missing file" });
      continue;
    }
    if (isRefused(fileRel, allowlist) || !underAllowlist(fileRel, allowlist)) {
      report.refused.push({ token: t.name, file: fileRel, reason: "outside allowlist" });
      continue;
    }
    if (!fileRel.endsWith(".sass") && !fileRel.endsWith(".scss") && !fileRel.endsWith(".css")) {
      report.refused.push({ token: t.name, file: fileRel, reason: "P2 only patches style sheets" });
      continue;
    }

    const abs = join(repoRoot, fileRel);
    let src;
    try {
      src = await readFile(abs, "utf8");
    } catch (e) {
      report.errors.push(`cannot read ${fileRel}: ${e.message}`);
      continue;
    }

    const result = applyTokenToSass(src, {
      name: t.name,
      value: t.value,
      selectorHint: t.selectorHint || ":root",
    });
    if (!result.ok) {
      report.errors.push(`${t.name} in ${fileRel}: ${result.error}`);
      continue;
    }

    if (!dryRun) {
      await writeFile(abs, result.source, "utf8");
    }
    report.applied.push({
      token: t.name,
      value: t.value,
      file: fileRel,
      action: result.action,
      line: result.line,
    });
  }

  // Sync package tokens.css lightly for applied :root-ish tokens
  if (!dryRun && report.applied.length) {
    try {
      let css = await readFile(join(packageDir, "tokens.css"), "utf8");
      for (const a of report.applied) {
        const re = new RegExp(`(${a.token.replace(/-/g, "\\-")}\\s*:\\s*)([^;]+);`);
        if (re.test(css)) css = css.replace(re, `$1${a.value};`);
        else if (css.includes(":root")) {
          css = css.replace(/:root\s*\{/, `:root {\n  ${a.token}: ${a.value};`);
        }
      }
      await writeFile(join(packageDir, "tokens.css"), css, "utf8");
    } catch {
      /* optional */
    }
  }

  report.ok = report.errors.length === 0 && report.applied.length > 0;
  report.rationale = intent.rationale || "";
  report.surfaceId = surfaceId;
  report.generatedAt = new Date().toISOString();

  const md = [
    `# Apply report — ${surfaceId}`,
    "",
    `**When:** ${report.generatedAt}`,
    `**Dry-run:** ${dryRun}`,
    `**Rationale:** ${report.rationale || "—"}`,
    "",
    "## Applied",
    "",
    ...(report.applied.length
      ? report.applied.map(
          (a) =>
            `- \`${a.token}: ${a.value}\` → \`${a.file}\` (${a.action}, ~L${a.line})`
        )
      : ["- _(none)_"]),
    "",
    "## Refused",
    "",
    ...(report.refused.length
      ? report.refused.map((r) => `- ${JSON.stringify(r)}`)
      : ["- _(none)_"]),
    "",
    "## Errors",
    "",
    ...(report.errors.length ? report.errors.map((e) => `- ${e}`) : ["- _(none)_"]),
    "",
    "## Verify",
    "",
    "```bash",
    `git diff -- ${report.applied.map((a) => a.file).join(" ") || "."}`,
    "# optional: re-run code-to-design extract for delta (P3)",
    "```",
    "",
  ].join("\n");

  if (!dryRun) {
    await writeFile(join(packageDir, "apply-report.md"), md, "utf8");
  }

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok || (dryRun && report.applied.length) ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
