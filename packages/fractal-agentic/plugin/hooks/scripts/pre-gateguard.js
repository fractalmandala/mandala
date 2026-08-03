#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const {
  readStdin,
  parseInput,
  skipIfDisabled,
  filePathFrom,
  block,
  allow,
  warn
} = require('./lib');

const HOOK_ID = 'pre:edit:gateguard';

function statePath() {
  const dir = path.join(os.tmpdir(), 'fractal-agentic-hooks');
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {
    /* ignore */
  }
  const cwdHash = crypto.createHash('sha1').update(process.cwd()).digest('hex').slice(0, 12);
  return path.join(dir, `gateguard-${cwdHash}.json`);
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(statePath(), 'utf8'));
  } catch {
    return { allowed: {} };
  }
}

function saveState(state) {
  try {
    fs.writeFileSync(statePath(), JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

(async () => {
  if (process.env.FRACTAL_GATEGUARD === 'off') process.exit(0);
  skipIfDisabled(HOOK_ID);

  const input = parseInput(await readStdin());
  const fp = filePathFrom(input);
  if (!fp) allow();

  const abs = path.resolve(fp);
  const state = loadState();
  if (state.allowed[abs]) {
    allow();
  }

  // First touch: demand investigation, then mark allowed so retry succeeds.
  // This is a light GateGuard: deny once with a clear fact list, then allow.
  state.allowed[abs] = true;
  saveState(state);

  const msg = [
    `GateGuard (strict profile): first edit of ${fp}.`,
    'Before changing this file, investigate and state:',
    '1) Importers / callers (grep)',
    '2) Public API / types affected',
    '3) Data formats if this file touches persistence',
    '4) Quote the user instruction you are implementing',
    'Then retry the edit. FRACTAL_GATEGUARD=off disables this for the session.'
  ].join(' ');

  warn(msg);
  block(msg);
})().catch(() => process.exit(0));
