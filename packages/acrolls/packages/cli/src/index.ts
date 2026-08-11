#!/usr/bin/env node
import { mkdir, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { parseArgs, exists } from './util.js';
import { cmdIntegrate, detectHost } from './integrate.js';
import { cmdOnboard } from './onboarding.js';
import { cmdStudio } from './studio.js';
import {
  formatValidationDiagnostic,
  validateCorpus,
  validationExitCode
} from './validate.js';

const VERSION = '0.1.1';

function help() {
  console.log(`acrolls ${VERSION}

Usage:
  acrolls                        Show project state
  acrolls --cwd <path> <command> Run against a host without changing directories
  acrolls init [--content-dir <path>] [--dry-run]
  acrolls integrate [--dry-run] [--mode foundation|default] [--yes]
  acrolls onboard [--docs-dir <path>] [--base-href <path>] [--mode foundation|default] [--acrolls-root <path>] [--check] [--non-interactive|--interactive] [--json]
  acrolls validate <file.md|file.svx|directory> [--strict] [--mode authored|migration] [--on-invalid fail|error-page] [--report <file>]
  acrolls studio <file.md|file.svx> [--port <n>] [--no-open] [--mode foundation|default]
  acrolls --help
  acrolls --version
`);
}

async function cmdInit(args: ReturnType<typeof parseArgs>) {
  const dry = Boolean(args.flags['dry-run']);
  const contentDir = String(args.flags['content-dir'] ?? 'content/blog');
  const root = process.cwd();
  const abs = resolve(root, contentDir);

  if (dry) {
    console.log(`[dry-run] would create ${relative(root, abs) || contentDir}`);
    return 0;
  }
  await mkdir(abs, { recursive: true });
  console.log(`Created content launchpad: ${relative(root, abs) || contentDir}`);
  console.log('No article generated — write a .md or .svx file when ready.');
  return 0;
}

async function cmdValidate(args: ReturnType<typeof parseArgs>) {
  const file = args._[1];
  if (!file) {
    console.error('Usage: acrolls validate <file.md|file.svx|directory> [--strict] [--mode authored|migration] [--on-invalid fail|error-page] [--report <file>]');
    return 2;
  }
  const abs = resolve(process.cwd(), file);
  if (!(await exists(abs))) {
    console.error(`File not found: ${file}`);
    return 1;
  }
  const strict = Boolean(args.flags.strict);
  const modeValue = String(args.flags.mode ?? (strict ? 'authored' : 'migration'));
  if (modeValue !== 'authored' && modeValue !== 'migration') {
    console.error('Invalid --mode. Use authored or migration.');
    return 2;
  }
  const onInvalid = String(args.flags['on-invalid'] ?? 'fail');
  if (onInvalid !== 'fail' && onInvalid !== 'error-page') {
    console.error('Invalid --on-invalid. Use fail or error-page.');
    return 2;
  }
  const isDirectory = (await stat(abs)).isDirectory();
  const target = isDirectory ? abs : resolve(abs, '..');
  const report = typeof args.flags.report === 'string' ? String(args.flags.report) : undefined;
  const result = await validateCorpus({
    root: target,
    files: isDirectory ? undefined : [abs],
    mode: modeValue as 'authored' | 'migration',
    onInvalid: onInvalid as 'fail' | 'error-page',
    strict,
    report
  });
  const documents = isDirectory
    ? result.documents
    : result.documents.filter((document) => document.file === abs);
  for (const document of documents) {
    for (const diagnostic of document.diagnostics) {
      console.error(formatValidationDiagnostic(diagnostic, result.root));
    }
  }
  const { discovered, ready, normalized, rejected } = result.summary;
  console.log(`${discovered} discovered · ${ready} ready · ${normalized} normalized · ${rejected} rejected`);
  return validationExitCode(result, onInvalid as 'fail' | 'error-page', {
    mode: modeValue as 'authored' | 'migration',
    strict
  });
}

async function cmdStatus() {
  const host = await detectHost(process.cwd());
  console.log(`acrolls ${VERSION}`);
  console.log(`cwd: ${process.cwd()}`);
  console.log(`host: ${host.kind}`);
  if ('hasKit' in host) {
    console.log(`sveltekit: ${host.hasKit}`);
    console.log(`mdsvex: ${host.hasMdsvex}`);
    console.log(`acrolls deps: ${host.hasAcrolls}`);
    console.log(`svelte config: ${host.svelteConfig ?? 'none'}`);
    console.log(`layout: ${host.layout ?? 'none'}`);
  }
  console.log('Run `acrolls --help` for commands.');
  return 0;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.flags.help || args.flags.h) {
    help();
    process.exit(0);
  }
  if (args.flags.version || args.flags.v) {
    console.log(VERSION);
    process.exit(0);
  }

  if (args.flags.cwd !== undefined) {
    if (typeof args.flags.cwd !== 'string' || !args.flags.cwd.trim()) {
      console.error('Invalid --cwd. Provide a host project directory.');
      process.exit(2);
    }
    try {
      process.chdir(resolve(String(args.flags.cwd)));
    } catch {
      console.error(`Directory not found: ${args.flags.cwd}`);
      process.exit(2);
    }
  }

  const cmd = args._[0];
  let code = 0;
  try {
    if (!cmd) code = await cmdStatus();
    else if (cmd === 'init') code = await cmdInit(args);
    else if (cmd === 'integrate') code = await cmdIntegrate(args);
    else if (cmd === 'onboard') code = await cmdOnboard(args);
    else if (cmd === 'validate') code = await cmdValidate(args);
    else if (cmd === 'studio') code = await cmdStudio(args);
    else {
      console.error(`Unknown command: ${cmd}`);
      help();
      code = 2;
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    code = 1;
  }
  process.exit(code);
}

main();
