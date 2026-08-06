#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  readStdin,
  parseInput,
  skipIfDisabled,
  pluginRoot,
  allow,
  warn
} = require('./lib');

const HOOK_ID = 'session:start';

function maxChars() {
  const n = parseInt(process.env.FRACTAL_SESSION_START_MAX_CHARS || '4000', 10);
  return Number.isFinite(n) && n > 0 ? n : 4000;
}

(async () => {
  skipIfDisabled(HOOK_ID);
  await readStdin(); // consume

  if (process.env.FRACTAL_SESSION_START_CONTEXT === 'off') {
    allow();
  }

  const root = pluginRoot();
  const lines = [];
  lines.push('Fractal Agentic session bootstrap (non-blocking).');
  lines.push(`Plugin root: ${root}`);

  const soul = path.join(root, 'SOUL.md');
  const agents = path.join(root, 'AGENTS.md');
  const bosses = path.join(root, 'docs', 'bosses', 'INDEX.md');
  if (fs.existsSync(soul)) lines.push('Identity: SOUL.md');
  if (fs.existsSync(agents)) lines.push('Startup router: AGENTS.md (select exactly one boss).');
  if (fs.existsSync(bosses)) {
    lines.push('Boss playbook: docs/bosses/<boss>/INDEX.md (read one; stop until handoff).');
  }
  lines.push('Delivery: skills/boss-orchestration + /orchestrate when changing the repo.');
  lines.push('Pins: optional quality only — never refuse product work if types are missing (docs/progression.md).');
  lines.push(`Hook profile: ${process.env.FRACTAL_HOOK_PROFILE || 'minimal (default)'}`);

  let text = lines.join('\n');
  if (text.length > maxChars()) text = text.slice(0, maxChars()) + '\n…';

  // Prefer systemMessage-style JSON when hosts honor it; always also stderr for visibility.
  try {
    process.stdout.write(
      JSON.stringify({
        continue: true,
        systemMessage: text,
        hookSpecificOutput: { additionalContext: text }
      }) + '\n'
    );
  } catch {
    /* ignore */
  }
  warn(text);
  allow();
})().catch(() => process.exit(0));
