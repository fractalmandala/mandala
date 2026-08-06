#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { readStdin, parseInput, skipIfDisabled, warn, allow } = require('./lib');

const HOOK_ID = 'stop:quality-batch';

function which(cmd) {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { encoding: 'utf8' });
  return r.status === 0;
}

(async () => {
  skipIfDisabled(HOOK_ID);
  parseInput(await readStdin());

  // Best-effort only: never block Stop. Prefer package scripts if present.
  const cwd = process.cwd();
  const pkgPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    allow();
  }

  let pkg = {};
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch {
    allow();
  }

  const scripts = pkg.scripts || {};
  // Prefer typecheck over full build; never invent failing CI
  if (scripts.typecheck && which('pnpm')) {
    const r = spawnSync('pnpm', ['run', 'typecheck'], { cwd, encoding: 'utf8', timeout: 120000 });
    if (r.status !== 0) {
      warn('typecheck reported issues (non-blocking). Fix before ship if this area changed.');
      if (r.stdout) warn(r.stdout.slice(0, 1500));
      if (r.stderr) warn(r.stderr.slice(0, 1500));
    }
  } else if (scripts['check'] && which('pnpm')) {
    // skip full check by default — too heavy for Stop
    warn('Project has a check script; run it intentionally before ship (Stop hook stays light).');
  }

  allow();
})().catch(() => process.exit(0));
