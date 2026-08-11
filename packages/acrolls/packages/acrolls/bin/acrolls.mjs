#!/usr/bin/env node

import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let cliEntry;
try {
  cliEntry = require.resolve('@acrolls/cli/dist/index.js');
} catch {
  // Keep the workspace clone runnable before its node_modules links are rebuilt.
  const localEntry = resolve(dirname(fileURLToPath(import.meta.url)), '../../cli/dist/index.js');
  if (!existsSync(localEntry)) {
    console.error('Cannot find @acrolls/cli. Install dependencies with `pnpm add -D acrolls`.');
    process.exit(1);
  }
  cliEntry = localEntry;
}
const child = spawn(process.execPath, [cliEntry, ...process.argv.slice(2)], {
  stdio: 'inherit'
});

child.once('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});

child.once('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exitCode = code ?? 1;
});
