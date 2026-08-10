#!/usr/bin/env node
/** Validate a design package directory against P1 hard gates. */
import { readFile, access } from "node:fs/promises";
import { join, resolve } from "node:path";

const dir = resolve(process.argv[2] || ".");
const required = [
  "DESIGN.md",
  "tokens.css",
  "base-ref.json",
  "preview/index.html",
  "evidence/contract.json",
  "evidence/report.md",
  "LOSS.md",
  "meta.json",
];

const errors = [];
for (const rel of required) {
  try {
    await access(join(dir, rel));
  } catch {
    errors.push(`missing ${rel}`);
  }
}

let contract;
try {
  contract = JSON.parse(await readFile(join(dir, "evidence/contract.json"), "utf8"));
  if (contract.version !== 2) errors.push(`contract.version must be 2, got ${contract.version}`);
  if (!contract.meta?.surfaceId) errors.push("meta.surfaceId required");
  if (!contract.meta?.fidelity) errors.push("meta.fidelity required");
  if (!["L1", "L2", "L3", "L4"].includes(contract.meta.fidelity)) {
    errors.push("meta.fidelity invalid");
  }
  if (!contract.meta?.previewEntry) errors.push("meta.previewEntry required");
} catch (e) {
  errors.push(`contract.json: ${e.message}`);
}

const preview = await readFile(join(dir, "preview/index.html"), "utf8").catch(() => "");
if (preview.length < 200) errors.push("preview/index.html too small");
if (/tree fallback|region-tree/i.test(preview) && !/data-ssc-root|app-shell/i.test(preview)) {
  errors.push("preview looks like degraded tree, not UI");
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, dir, errors }, null, 2));
  process.exit(1);
}
console.log(
  JSON.stringify(
    {
      ok: true,
      dir,
      surfaceId: contract.meta.surfaceId,
      fidelity: contract.meta.fidelity,
    },
    null,
    2
  )
);
