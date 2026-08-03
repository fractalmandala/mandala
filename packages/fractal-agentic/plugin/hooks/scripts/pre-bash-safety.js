#!/usr/bin/env node
'use strict';

const { readStdin, parseInput, skipIfDisabled, commandFrom, block, allow } = require('./lib');

const HOOK_ID = 'pre:bash:safety';

// Patterns that are high-risk; block by default in all profiles that enable this hook.
const BLOCK = [
  { re: /\bgit\s+push\s+[^\n]*--force\b/i, msg: 'Blocked force-push. Use an explicit non-force push or get human confirmation.' },
  { re: /\bgit\s+push\s+[^\n]*-f\b/i, msg: 'Blocked force-push (-f). Prefer a normal push unless the user explicitly ordered force.' },
  { re: /\bgit\s+reset\s+--hard\b/i, msg: 'Blocked git reset --hard. This discards work; confirm with the user first.' },
  { re: /\bgit\s+clean\s+-fd/i, msg: 'Blocked git clean -fd. Destructive; confirm with the user first.' },
  { re: /\brm\s+(-[a-zA-Z]*f[a-zA-Z]*\s+)?\/\s*$/i, msg: 'Blocked rm targeting filesystem root.' },
  { re: /\brm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+\/(?!\S)/i, msg: 'Blocked recursive rm of /.' },
  { re: /\bDROP\s+(DATABASE|SCHEMA)\b/i, msg: 'Blocked DROP DATABASE/SCHEMA. Confirm with the user first.' },
  { re: /\bcurl\s+[^\n]*\|\s*(ba)?sh\b/i, msg: 'Blocked curl|sh pattern. Download and inspect first.' },
  { re: /\bwget\s+[^\n]*\|\s*(ba)?sh\b/i, msg: 'Blocked wget|sh pattern. Download and inspect first.' }
];

const WARN = [
  { re: /\beval\s*\(/i, msg: 'Warning: eval in shell command — prefer safer invocation.' },
  { re: /\bchmod\s+777\b/i, msg: 'Warning: chmod 777 is usually too permissive.' }
];

(async () => {
  skipIfDisabled(HOOK_ID);
  const input = parseInput(await readStdin());
  const cmd = commandFrom(input);
  if (!cmd) allow();

  for (const { re, msg } of BLOCK) {
    if (re.test(cmd)) block(msg);
  }
  for (const { re, msg } of WARN) {
    if (re.test(cmd)) {
      process.stderr.write('[fractal-hooks] ' + msg + '\n');
    }
  }
  allow();
})().catch(() => process.exit(0));
