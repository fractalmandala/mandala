#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { readStdin, parseInput, skipIfDisabled, allow, warn } = require('./lib');

const HOOK_ID = 'stop:session-ledger';

const FRACTAL_DIR = path.join(os.homedir(), '.fractal', 'sessions');
const LEDGER_FILE = path.join(FRACTAL_DIR, 'ledger.jsonl');
const ACTIVE_DIR = path.join(FRACTAL_DIR, 'active');

function hostName() {
  return (
    process.env.FRACTAL_HOST ||
    process.env.CLAUDE_HOST ||
    process.env.CODEX_HOST ||
    process.env.OPENCODE_HOST ||
    'unknown'
  );
}

function bossFromEnv() {
  return process.env.FRACTAL_ACTIVE_BOSS || '';
}

function capabilityModeFromEnv() {
  return process.env.FRACTAL_CAPABILITY_MODE || '';
}

function summarizeSession(input) {
  if (input && input.summary) return String(input.summary).slice(0, 200);
  if (input && input.last_message) return String(input.last_message).slice(0, 200);
  if (input && input.prompt) return String(input.prompt).slice(0, 200);
  if (input && input._raw) return String(input._raw).slice(0, 200);
  return '';
}

(async () => {
  skipIfDisabled(HOOK_ID);

  const raw = await readStdin();
  const input = parseInput(raw);

  try {
    fs.mkdirSync(FRACTAL_DIR, { recursive: true });
  } catch {
    // dir likely exists; continue
  }

  const handoffExists = (() => {
    try {
      return fs.existsSync(path.join(ACTIVE_DIR, 'handoff.md'));
    } catch {
      return false;
    }
  })();

  const line = JSON.stringify({
    host: hostName(),
    timestamp: new Date().toISOString(),
    boss: bossFromEnv(),
    capability_mode: capabilityModeFromEnv(),
    summary: summarizeSession(input),
    handoff_exists: handoffExists,
  });

  try {
    fs.appendFileSync(LEDGER_FILE, line + '\n', 'utf8');
  } catch (err) {
    warn('session-ledger: write failed — ' + err.message);
  }

  allow();
})().catch(() => process.exit(0));
