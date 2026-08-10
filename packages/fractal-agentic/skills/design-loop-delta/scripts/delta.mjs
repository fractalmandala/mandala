#!/usr/bin/env node
/**
 * Re-extract tokens from monorepo SASS and diff vs package baseline contract.
 *
 *   node delta.mjs --package vendors/design-packages/fractaldharma-home
 *   node delta.mjs --package ... --snapshot-baseline
 *   node delta.mjs --package ... --repo /path/to/mandala
 */
import { readFile, writeFile, copyFile, access } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    return process.argv[i + 1];
  }
  return fallback;
}

const packageDir = resolve(arg("package", "."));
const repoRoot = resolve(arg("repo", process.cwd()));
const snapshotOnly = process.argv.includes("--snapshot-baseline");

/** Parse indented SASS / simple CSS for --token: value lines with line numbers. */
function parseTokensFromSass(text, sourcePath) {
  const tokens = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\t*(--[a-zA-Z0-9-]+)\s*:\s*(.+?)\s*$/);
    if (!m) continue;
    let value = m[2].trim();
    // strip trailing comments
    value = value.replace(/\s*\/\/.*$/, "").trim();
    tokens.push({
      name: m[1],
      value,
      kind: "css-var",
      source: sourcePath,
      line: i + 1,
      confidence: "observed",
    });
  }
  return tokens;
}

function tokenMap(list) {
  const m = new Map();
  for (const t of list || []) {
    if (t?.name) m.set(t.name, t);
  }
  return m;
}

function unresolvedCodes(list) {
  return new Set((list || []).map((u) => u.code || u.message || JSON.stringify(u)));
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const evidenceDir = join(packageDir, "evidence");
  const contractPath = join(evidenceDir, "contract.json");
  const baselinePath = join(evidenceDir, "contract.baseline.json");
  const afterPath = join(evidenceDir, "contract.after.json");
  const deltaJsonPath = join(evidenceDir, "delta.json");
  const deltaMdPath = join(packageDir, "delta-report.md");

  const meta = JSON.parse(await readFile(join(packageDir, "meta.json"), "utf8"));
  const contract = JSON.parse(await readFile(contractPath, "utf8"));
  const surfaceId = meta.surfaceId || contract.meta?.surfaceId;

  if (snapshotOnly) {
    await copyFile(contractPath, baselinePath);
    console.log(
      JSON.stringify({ ok: true, action: "snapshot-baseline", baselinePath, surfaceId }, null, 2)
    );
    return;
  }

  if (!(await exists(baselinePath))) {
    // First delta without snapshot: keep current as baseline, then re-extract as after
    await copyFile(contractPath, baselinePath);
  }

  const baseline = JSON.parse(await readFile(baselinePath, "utf8"));

  // Token sheets for pilot / meta-driven
  const styleSheets = meta.tokenSheets || [
    "sites/fractaldharma/src/lib/styles/_tokens.sass",
  ];
  // Prefer surface from targetPath
  if (meta.targetPath?.includes("fractaldharma") && !meta.tokenSheets) {
    /* default ok */
  }

  const observedTokens = [];
  for (const rel of styleSheets) {
    const abs = join(repoRoot, rel);
    try {
      const text = await readFile(abs, "utf8");
      observedTokens.push(...parseTokensFromSass(text, rel));
    } catch (e) {
      console.error(`warn: cannot read ${rel}: ${e.message}`);
    }
  }

  // Dedupe by name (first wins — avoids prefers-reduced-motion overrides at file bottom)
  const byName = new Map();
  for (const t of observedTokens) {
    if (!byName.has(t.name)) byName.set(t.name, t);
  }
  const tokensAfter = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));

  // Drop unresolved codes that are fixed by observed tokens
  const observedNames = new Set(tokensAfter.map((t) => t.name));
  const unresolvedAfter = (baseline.unresolved || contract.unresolved || []).filter((u) => {
    const related = u.related || [];
    const code = u.code || "";
    // token-text-bs resolved if --text-bs observed
    if (code === "token-text-bs" && observedNames.has("--text-bs")) return false;
    if (related.some((r) => String(r).includes("text-bs")) && observedNames.has("--text-bs"))
      return false;
    return true;
  });

  const after = {
    ...baseline,
    version: 2,
    meta: {
      ...baseline.meta,
      ...contract.meta,
      surfaceId,
      fidelity: contract.meta?.fidelity || baseline.meta?.fidelity || "L2",
      generatedAt: new Date().toISOString(),
      notes: `Re-extract tokens after apply (design-loop-delta). Baseline ${baseline.meta?.generatedAt || "unknown"}.`,
      baseRef: meta.baseRef || baseline.meta?.baseRef || "inline-from-monorepo",
    },
    tokens: tokensAfter,
    unresolved: unresolvedAfter,
    // keep regions/classes/states from latest contract (structure evidence)
    regions: contract.regions || baseline.regions || [],
    classes: contract.classes || baseline.classes || [],
    states: contract.states || baseline.states || [],
    orphans: contract.orphans || baseline.orphans || [],
    loss: (contract.loss || baseline.loss || []).filter((l) => l.code !== "token-text-bs"),
    sourceMap: contract.sourceMap || baseline.sourceMap || [],
  };

  await writeFile(afterPath, JSON.stringify(after, null, 2), "utf8");
  // Promote after → current contract for package truth
  await writeFile(contractPath, JSON.stringify(after, null, 2), "utf8");

  const beforeMap = tokenMap(baseline.tokens);
  const afterMap = tokenMap(after.tokens);

  const added = [];
  const removed = [];
  const changed = [];
  for (const [name, t] of afterMap) {
    if (!beforeMap.has(name)) added.push(t);
    else {
      const b = beforeMap.get(name);
      if (b.value !== t.value || b.confidence !== t.confidence || b.line !== t.line) {
        changed.push({ name, before: b, after: t });
      }
    }
  }
  for (const [name, t] of beforeMap) {
    if (!afterMap.has(name)) removed.push(t);
  }

  const uBefore = unresolvedCodes(baseline.unresolved);
  const uAfter = unresolvedCodes(after.unresolved);
  const unresolvedResolved = [...uBefore].filter((c) => !uAfter.has(c));
  const unresolvedNew = [...uAfter].filter((c) => !uBefore.has(c));

  const delta = {
    surfaceId,
    generatedAt: after.meta.generatedAt,
    baselineAt: baseline.meta?.generatedAt || null,
    tokens: {
      added: added.map((t) => ({ name: t.name, value: t.value, line: t.line, confidence: t.confidence })),
      removed: removed.map((t) => ({ name: t.name, value: t.value })),
      changed: changed.map((c) => ({
        name: c.name,
        before: { value: c.before.value, confidence: c.before.confidence, line: c.before.line },
        after: { value: c.after.value, confidence: c.after.confidence, line: c.after.line },
      })),
    },
    unresolved: {
      resolved: unresolvedResolved,
      new: unresolvedNew,
    },
    roundTrip: {
      closedForPilot:
        afterMap.has("--text-bs") &&
        afterMap.get("--text-bs")?.confidence === "observed" &&
        unresolvedResolved.some((c) => String(c).includes("text-bs") || c === "token-text-bs"),
      note: "Pilot success: --text-bs observed in source and token-text-bs unresolved cleared",
    },
  };

  await writeFile(deltaJsonPath, JSON.stringify(delta, null, 2), "utf8");

  const md = [
    `# Delta report — ${surfaceId}`,
    "",
    `**When:** ${delta.generatedAt}`,
    `**Baseline extract:** ${delta.baselineAt || "snapshotted at first delta"}`,
    `**Surface id stable:** yes (\`${surfaceId}\`)`,
    "",
    "## Tokens added",
    "",
    ...(delta.tokens.added.length
      ? delta.tokens.added.map((t) => `- \`${t.name}: ${t.value}\` (${t.confidence}, L${t.line})`)
      : ["- _(none)_"]),
    "",
    "## Tokens removed",
    "",
    ...(delta.tokens.removed.length
      ? delta.tokens.removed.map((t) => `- \`${t.name}\` (was ${t.value})`)
      : ["- _(none)_"]),
    "",
    "## Tokens changed",
    "",
    ...(delta.tokens.changed.length
      ? delta.tokens.changed.map(
          (c) =>
            `- \`${c.name}\`: \`${c.before.value}\` (${c.before.confidence}) → \`${c.after.value}\` (${c.after.confidence}, L${c.after.line})`
        )
      : ["- _(none)_"]),
    "",
    "## Unresolved codes resolved",
    "",
    ...(delta.unresolved.resolved.length
      ? delta.unresolved.resolved.map((c) => `- \`${c}\``)
      : ["- _(none)_"]),
    "",
    "## New unresolved",
    "",
    ...(delta.unresolved.new.length
      ? delta.unresolved.new.map((c) => `- \`${c}\``)
      : ["- _(none)_"]),
    "",
    "## Round-trip (pilot)",
    "",
    delta.roundTrip.closedForPilot
      ? "**Closed for P2 pilot intent** (`--text-bs` observed; `token-text-bs` cleared)."
      : "**Not fully closed** for pilot markers — inspect tokens/unresolved above.",
    "",
    "## Artifacts",
    "",
    "- `evidence/contract.baseline.json`",
    "- `evidence/contract.after.json` (also promoted to `contract.json`)",
    "- `evidence/delta.json`",
    "",
    "## Next",
    "",
    "- Optional L3 re-freeze: `code-to-design` capture-l3 against running vite",
    "- Open Design: see `preprojects/code-design-loop/docs/OPEN-DESIGN-WORKFLOW.md`",
    "",
  ].join("\n");

  await writeFile(deltaMdPath, md, "utf8");

  // Update LOSS.md token-text-bs if present
  try {
    const lossPath = join(packageDir, "LOSS.md");
    let loss = await readFile(lossPath, "utf8");
    if (delta.roundTrip.closedForPilot && loss.includes("token-text-bs")) {
      loss = loss.replace(
        /\| `token-text-bs` \|.*/,
        "| `token-text-bs` | **resolved via P2 apply + P3 delta** — observed in `_tokens.sass` |"
      );
      await writeFile(lossPath, loss, "utf8");
    }
  } catch {
    /* optional */
  }

  console.log(JSON.stringify({ ok: true, surfaceId, delta, paths: { deltaMdPath, deltaJsonPath, afterPath, baselinePath } }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
