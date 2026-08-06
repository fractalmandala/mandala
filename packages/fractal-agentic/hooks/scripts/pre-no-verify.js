#!/usr/bin/env node
'use strict';

const { readStdin, parseInput, skipIfDisabled, commandFrom, block, allow } = require('./lib');

const HOOK_ID = 'pre:bash:no-verify';

(async () => {
  skipIfDisabled(HOOK_ID);
  const input = parseInput(await readStdin());
  const cmd = commandFrom(input);
  if (!cmd) allow();

  // git commit/push/am with --no-verify or -n that skips hooks
  if (/\bgit\s+(commit|push|am|rebase|merge)\b/i.test(cmd) && /--no-verify\b|\s-n\b/.test(cmd)) {
    // -n on commit is --no-verify; be careful not to flag unrelated -n
    if (/--no-verify\b/.test(cmd) || /\bgit\s+commit\b[^\n]*\s-n\b/.test(cmd)) {
      block(
        'Blocked git --no-verify / commit -n. Skipping hooks hides quality and safety checks. Remove the flag or get explicit user approval to bypass.'
      );
    }
  }

  if (/\bHUSKY\s*=\s*0\b/i.test(cmd) || /\bHUSKY=0\b/.test(cmd)) {
    block('Blocked HUSKY=0. That disables git hooks for the command.');
  }

  allow();
})().catch(() => process.exit(0));
