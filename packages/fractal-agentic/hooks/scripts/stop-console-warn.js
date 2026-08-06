#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const { readStdin, parseInput, skipIfDisabled, warn, allow } = require('./lib');

const HOOK_ID = 'stop:console-warn';

(async () => {
  skipIfDisabled(HOOK_ID);
  parseInput(await readStdin());

  // Best-effort: git diff for console.log / debugger in working tree
  const r = spawnSync('git', ['diff', '--unified=0', 'HEAD'], { encoding: 'utf8', timeout: 15000 });
  if (r.status !== 0 || !r.stdout) allow();

  const hits = [];
  for (const line of r.stdout.split('\n')) {
    if (!line.startsWith('+') || line.startsWith('+++')) continue;
    if (/console\.(log|debug|info)\s*\(/.test(line) || /\bdebugger\b/.test(line)) {
      hits.push(line.slice(0, 120));
    }
  }
  if (hits.length) {
    warn(`Debug leftovers in staged/unstaged +lines (${hits.length}). Remove before ship if unintentional:`);
    hits.slice(0, 8).forEach((h) => warn('  ' + h));
  }
  allow();
})().catch(() => process.exit(0));
