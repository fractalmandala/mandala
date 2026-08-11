#!/usr/bin/env node
// cli.ts — zero-runtime-dependency scaffold CLI.
// Usage: fractal-svelte <project-name> [--template default] [--no-git] [--no-install]

import { existsSync, cpSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { renderName, renderString, type Tokens } from './render.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface Args {
	name: string;
	template: string;
	git: boolean;
	install: boolean;
}

function parseArgs(argv: string[]): Args {
	const rest = argv.slice(2);
	if (rest.length === 0) {
		printUsage();
		process.exit(1);
	}
	const name = rest[0];
	const flags = rest.slice(1);
	let template = 'default';
	let git = true;
	let install = true;
	for (let i = 0; i < flags.length; i++) {
		const f = flags[i];
		if (f === '--template' || f === '-t') template = flags[++i];
		else if (f === '--no-git') git = false;
		else if (f === '--no-install') install = false;
		else if (f === '--help' || f === '-h') { printUsage(); process.exit(0); }
		else { console.error(`unknown flag: ${f}`); process.exit(1); }
	}
	return { name, template, git, install };
}

function printUsage(): void {
	console.log(`fractal-svelte — scaffold a mature SvelteKit + Svelte 5 + CUBE CSS project

Usage:
  fractal-svelte <project-name> [options]

Options:
  -t, --template <name>   template to use (default: default)
  --no-git                skip git init
  --no-install            skip pnpm install
  -h, --help              show this help

Example:
  npx fractal-svelte my-app
  pnpm dlx fractal-svelte my-app --no-install
`);
}

function isTemplateTextFile(path: string): boolean {
	return /\.(svelte|ts|js|json|sass|css|html|md|txt|yaml|yml|env|gitignore|npmrc|prettierrc|eslintignore)$/.test(path);
}

function copyTemplate(src: string, dest: string, tokens: Tokens): void {
	const entries = readdirSync(src, { withFileTypes: true });
	for (const entry of entries) {
		const from = join(src, entry.name);
		const to = join(dest, entry.name);
		if (entry.isDirectory()) {
			mkdirSync(to, { recursive: true });
			copyTemplate(from, to, tokens);
		} else {
			const content = readFileSync(from);
			if (isTemplateTextFile(entry.name)) {
				writeFileSync(to, renderString(content.toString('utf8'), tokens));
			} else {
				writeFileSync(to, content);
			}
		}
	}
}

// The armory is bundled into the npm package under armory/ so the scaffold
// works standalone via npx without the monorepo. The CLI copies armory/ →
// <project>/.fractal-agentic/ verbatim.
function copyArmory(armorySrc: string, dest: string): void {
	mkdirSync(dest, { recursive: true });
	cpSync(armorySrc, dest, { recursive: true });
}

function main(): void {
	const { name, template, git, install } = parseArgs(process.argv);

	if (!/^[a-z0-9][a-z0-9._-]*$/i.test(name)) {
		console.error(`invalid project name: "${name}" (use lowercase, digits, hyphens, underscores)`);
		process.exit(1);
	}

	const target = resolve(name);
	if (existsSync(target)) {
		console.error(`target already exists: ${target}`);
		process.exit(1);
	}

	const templateDir = resolve(__dirname, '..', 'templates', template);
	if (!existsSync(templateDir)) {
		console.error(`template not found: ${template} (looked in ${templateDir})`);
		process.exit(1);
	}

	const tokens = renderName(name);
	console.log(`scaffolding ${name} ...`);
	mkdirSync(target, { recursive: true });
	copyTemplate(templateDir, target, tokens);

	console.log('copying fractal-agentic armory ...');
	const armorySrc = resolve(__dirname, '..', 'armory');
	const armoryDest = join(target, '.fractal-agentic');
	if (existsSync(armorySrc)) {
		copyArmory(armorySrc, armoryDest);
	} else {
		console.warn('warning: bundled armory not found; skipping .fractal-agentic copy.');
		console.warn('         the scaffold package is incomplete; reinstall fractal-svelte.');
	}

	if (install) {
		console.log('installing dependencies ...');
		try {
			execSync('pnpm install', { cwd: target, stdio: 'inherit' });
		} catch {
			console.warn('pnpm install failed — run "pnpm install" manually in the project.');
		}
	}

	if (git) {
		console.log('initializing git ...');
		try {
			execSync('git init', { cwd: target, stdio: 'ignore' });
			execSync('git add -A', { cwd: target, stdio: 'ignore' });
			execSync('git commit -m "chore: scaffold with fractal-svelte"', { cwd: target, stdio: 'ignore' });
		} catch {
			console.warn('git init failed — run "git init" manually.');
		}
	}

	console.log(`\ndone. next steps:`);
	console.log(`  cd ${name}`);
	console.log(`  pnpm dev`);
	console.log(`\nagent-ready: see AGENTS.md and .fractal-agentic/ for the Svelte Boss contract.`);
}

main();
