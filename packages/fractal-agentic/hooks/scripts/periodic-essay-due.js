#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { readStdin, skipIfDisabled, pluginRoot, allow, warn } = require('./lib');

const HOOK_ID = 'periodic:essay-due';

(async () => {
  skipIfDisabled(HOOK_ID);
  await readStdin();

  const root = pluginRoot();
  const runner = path.join(root, 'scripts', 'periodic-essay-runner.js');
  if (!fs.existsSync(runner)) allow();

  const result = spawnSync(process.execPath, [runner, 'due', '--enqueue'], {
    encoding: 'utf8',
    timeout: 5000,
    stdio: ['ignore', 'ignore', 'pipe']
  });

  if (result.error && process.env.FRACTAL_ESSAY_HOOK_DEBUG === '1') {
    warn('Could not check scheduled essay state: ' + result.error.message);
  }
  // This hook only marks due work. It never starts an agent or blocks a session.
  allow();
})().catch(() => process.exit(0));

