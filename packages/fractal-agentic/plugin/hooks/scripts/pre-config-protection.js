#!/usr/bin/env node
'use strict';

const path = require('path');
const { readStdin, parseInput, skipIfDisabled, filePathFrom, block, allow } = require('./lib');

const HOOK_ID = 'pre:edit:config-protection';

const PROTECTED = [
  /^\.eslintrc(\.|$)/i,
  /eslint\.config\.(js|cjs|mjs|ts)$/i,
  /^\.prettierrc/i,
  /prettier\.config\.(js|cjs|mjs|ts)$/i,
  /biome\.json$/i,
  /tsconfig(\.[^/]+)?\.json$/i,
  /\.editorconfig$/i,
  /ruff\.toml$/i,
  /pyproject\.toml$/i, // only when changing lint tools — still protected lightly
  /\.golangci\.ya?ml$/i
];

// Allow pyproject if not clearly a "disable lint" path — still protect common names only via basename
const BASENAME_ONLY = new Set([
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.json',
  '.prettierrc',
  '.prettierrc.js',
  '.prettierrc.cjs',
  '.prettierrc.json',
  'prettier.config.js',
  'prettier.config.cjs',
  'prettier.config.mjs',
  'biome.json',
  'biome.jsonc',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  '.editorconfig',
  'ruff.toml',
  '.golangci.yml',
  '.golangci.yaml'
]);

(async () => {
  skipIfDisabled(HOOK_ID);
  const input = parseInput(await readStdin());
  const fp = filePathFrom(input);
  if (!fp) allow();

  const base = path.basename(fp);
  const protectedFile = BASENAME_ONLY.has(base) || PROTECTED.some((re) => re.test(base) || re.test(fp));

  if (protectedFile) {
    block(
      `Protected tooling config: ${base}. Fix the code or types instead of weakening lint/format/tsconfig. If the user explicitly asked to change this config, set FRACTAL_DISABLED_HOOKS=pre:edit:config-protection for this session.`
    );
  }
  allow();
})().catch(() => process.exit(0));
