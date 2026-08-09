#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const HOME = os.homedir();

const PLUGIN_EXCLUDE = new Set([
	'node_modules', '.git', '.repograph', '.fractal-agentic',
	'.DS_Store', 'bin', 'package.json', 'pnpm-lock.yaml',
	'LAYOUT.md', 'credits.json'
]);
const pluginCopyFilter = (src) => {
	const base = path.basename(src);
	return !PLUGIN_EXCLUDE.has(base) && base !== '__pycache__' && !base.endsWith('.pyc');
};

// ── Root resolution ────────────────────────────────────────────────

function resolveRoot(cwd) {
	// 1. Project marker
	const markerPath = path.join(cwd, '.fractal-agentic', 'project.json');
	if (fs.existsSync(markerPath)) {
		try {
			const marker = JSON.parse(fs.readFileSync(markerPath, 'utf8'));
			if (marker.root && fs.existsSync(path.join(marker.root, 'plugin.json'))) {
				return marker.root;
			}
		} catch (_) {}
	}
	// 2. Walk up from cwd
	let dir = cwd;
	while (dir !== path.dirname(dir)) {
		const pj = path.join(dir, 'plugin.json');
		if (fs.existsSync(pj)) {
			try {
				const p = JSON.parse(fs.readFileSync(pj, 'utf8'));
				if (p.name === 'fractal-agentic' || p.name === 'fractal_agentic') return dir;
			} catch (_) {}
		}
		dir = path.dirname(dir);
	}
	// 3. __dirname fallback (CLI lives at bin/cli.js)
	const fromDirname = path.resolve(__dirname, '..');
	if (fs.existsSync(path.join(fromDirname, 'plugin.json'))) return fromDirname;
	return null;
}

// ── Frontmatter parsers ────────────────────────────────────────────

function parseFrontmatter(text) {
	const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!m) return {};
	const result = {};
	for (const line of m[1].split('\n')) {
		const ci = line.indexOf(':');
		if (ci < 1) continue;
		const key = line.slice(0, ci).trim();
		let val = line.slice(ci + 1).trim();
		if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
			val = val.slice(1, -1);
		}
		result[key] = val;
	}
	return result;
}

function parseTomlMeta(text) {
	const result = {};
	for (const line of text.split('\n')) {
		const eq = line.indexOf('=');
		if (eq < 1) continue;
		const key = line.slice(0, eq).trim();
		let val = line.slice(eq + 1).trim();
		if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
			val = val.slice(1, -1);
		}
		if (['name', 'description', 'model', 'model_reasoning_effort', 'sandbox_mode'].includes(key)) {
			result[key] = val;
		}
	}
	return result;
}

// ── Inventory ──────────────────────────────────────────────────────

function listInventory(rootDir, type, opts) {
	const dirMap = { agent: 'agents', command: 'commands', skill: 'skills' };
	const baseDir = path.join(rootDir, dirMap[type]);
	if (!fs.existsSync(baseDir)) {
		console.error(`Error: ${dirMap[type]}/ directory not found at ${rootDir}`);
		process.exit(1);
	}

	let entries = [];

	if (type === 'skill') {
		for (const name of fs.readdirSync(baseDir)) {
			const full = path.join(baseDir, name);
			if (name.startsWith('.') || name === 'INDEX.md') continue;
			if (!fs.statSync(full).isDirectory()) continue;
			const skillMd = path.join(full, 'SKILL.md');
			if (!fs.existsSync(skillMd)) continue;
			const fm = parseFrontmatter(fs.readFileSync(skillMd, 'utf8'));
			entries.push({ id: name, name: fm.name || name, description: fm.description || '' });
		}
	} else if (type === 'agent') {
		const idMap = new Map();
		for (const file of fs.readdirSync(baseDir)) {
			if (file === 'INDEX.md') continue;
			const ext = path.extname(file);
			if (ext !== '.md' && ext !== '.toml') continue;
			const fp = path.join(baseDir, file);
			if (!fs.statSync(fp).isFile()) continue;
			const id = path.basename(file, ext);
			const content = fs.readFileSync(fp, 'utf8');
			const meta = ext === '.toml' ? parseTomlMeta(content) : parseFrontmatter(content);
			const existing = idMap.get(id);
			const isToml = ext === '.toml';
			if (!existing || isToml) {
				idMap.set(id, {
					id, file,
					name: meta.name || id,
					description: meta.description || '',
					_type: isToml ? 'toml' : 'md',
					_hasBoth: !!existing // if there was already an entry, we have both
				});
			} else if (existing) {
				idMap.get(id)._hasBoth = true;
			}
		}
		entries = Array.from(idMap.values());
		for (const e of entries) {
			if (e._hasBoth) e.description = e.description ? e.description + ' (md + toml)' : '(md + toml)';
		}
	} else if (type === 'command') {
		for (const file of fs.readdirSync(baseDir)) {
			if (file === 'INDEX.md' || !file.endsWith('.md')) continue;
			const fp = path.join(baseDir, file);
			if (!fs.statSync(fp).isFile()) continue;
			const id = path.basename(file, '.md');
			const fm = parseFrontmatter(fs.readFileSync(fp, 'utf8'));
			entries.push({ id, description: fm.description || '' });
		}
	}

	if (opts.type && type === 'agent') {
		entries = entries.filter(e => e._type === opts.type);
	}

	if (opts.filter) {
		const f = opts.filter.toLowerCase();
		entries = entries.filter(e =>
			e.id.toLowerCase().includes(f) ||
			(e.description || '').toLowerCase().includes(f) ||
			(e.name || '').toLowerCase().includes(f)
		);
	}

	entries.sort((a, b) => a.id.localeCompare(b.id));

	if (opts.json) {
		const out = entries.map(e => {
			const o = { id: e.id };
			if (opts.verbose) {
				o.description = e.description || '';
				if (e._type) o.type = e._type;
			}
			return o;
		});
		console.log(JSON.stringify(out, null, 2));
		return;
	}

	for (const e of entries) {
		if (opts.verbose) {
			const desc = e.description ? ` — ${e.description.slice(0, 90)}` : '';
			const tag = e._type ? ` [${e._type}]` : '';
			console.log(`${e.id}${tag}${desc}`);
		} else {
			console.log(e.id);
		}
	}
}

function showItem(rootDir, type, id, opts) {
	const dirMap = { agent: 'agents', command: 'commands', skill: 'skills' };
	const baseDir = path.join(rootDir, dirMap[type]);

	let filePath;

	if (type === 'skill') {
		filePath = path.join(baseDir, id, 'SKILL.md');
	} else if (type === 'agent') {
		const toml = path.join(baseDir, id + '.toml');
		const md = path.join(baseDir, id + '.md');
		if (fs.existsSync(toml)) filePath = toml;
		else if (fs.existsSync(md)) filePath = md;
		else {
			console.error(`Error: agent '${id}' not found`);
			process.exit(1);
		}
	} else if (type === 'command') {
		filePath = path.join(baseDir, id + '.md');
	}

	if (!filePath || !fs.existsSync(filePath)) {
		console.error(`Error: ${type} '${id}' not found`);
		process.exit(1);
	}

	const content = fs.readFileSync(filePath, 'utf8');

	if (opts.frontmatter) {
		const ext = path.extname(filePath);
		const fm = ext === '.toml' ? parseTomlMeta(content) : parseFrontmatter(content);
		console.log(JSON.stringify(fm, null, 2));
	} else {
		process.stdout.write(content);
	}
}

// ── Script helpers ─────────────────────────────────────────────────

function scriptsDir(rootDir) {
	return path.join(rootDir, 'scripts');
}

function runScript(scriptName, rootDir, ...extraArgs) {
	const sp = path.join(scriptsDir(rootDir), scriptName);
	if (!fs.existsSync(sp)) {
		console.error(`Error: script not found: ${sp}`);
		process.exit(1);
	}
	try {
		execSync(`sh "${sp}" ${extraArgs.join(' ')}`, { stdio: 'inherit' });
	} catch (err) {
		process.exit(err.status || 1);
	}
}

function runCaptured(scriptName, rootDir, ...extraArgs) {
	const sp = path.join(scriptsDir(rootDir), scriptName);
	if (!fs.existsSync(sp)) return { ok: false, error: `script not found: ${scriptName}` };
	try {
		const stdout = execSync(`sh "${sp}" ${extraArgs.join(' ')}`, {
			stdio: 'pipe', encoding: 'utf8'
		});
		return { ok: true, output: stdout.trim() };
	} catch (err) {
		return {
			ok: false,
			error: err.stderr ? err.stderr.toString().trim() : err.message,
			code: err.status
		};
	}
}

// ── Install helpers ────────────────────────────────────────────────

function installAntigravity(pluginSrc) {
	const dest = path.join(HOME, '.gemini', 'config', 'plugins', 'fractal-agentic');
	try {
		fs.mkdirSync(path.dirname(dest), { recursive: true });
		fs.cpSync(pluginSrc, dest, { recursive: true, filter: pluginCopyFilter });
		console.log(`[Antigravity] Installed plugin to: ${dest}`);
	} catch (err) {
		console.error(`[Antigravity] Failed to install: ${err.message}`);
	}
}

function installClaude(pluginSrc, rootDir) {
	try {
		execSync(`claude plugin marketplace add "${rootDir}"`, { stdio: 'pipe' });
		execSync(`claude plugin install fractal-agentic@fractal-agentic`, { stdio: 'pipe' });
		console.log(`[Claude Code] Installed via Marketplace.`);
	} catch (err) {
		const dest = path.join(HOME, '.claude', 'plugins', 'cache', 'fractal-agentic');
		try {
			fs.mkdirSync(path.dirname(dest), { recursive: true });
			fs.cpSync(pluginSrc, dest, { recursive: true, filter: pluginCopyFilter });
			console.log(`[Claude Code] Installed to cache: ${dest}`);
		} catch (e2) {
			console.error(`[Claude Code] Failed: ${e2.message}`);
		}
	}
}

function installCodex(pluginSrc) {
	const dest = path.join(HOME, '.codex', 'plugins', 'cache', 'fractal-agentic');
	try {
		fs.mkdirSync(path.dirname(dest), { recursive: true });
		fs.cpSync(pluginSrc, dest, { recursive: true, filter: pluginCopyFilter });
		console.log(`[Codex] Installed to cache: ${dest}`);
	} catch (err) {
		console.error(`[Codex] Failed: ${err.message}`);
	}
}

function injectProjectSnippet(pluginSrc, cwd) {
	const snippetPath = path.join(pluginSrc, 'project-integration', 'AGENTS-SNIPPET.md');
	const target = path.join(cwd, 'AGENTS.md');
	if (!fs.existsSync(snippetPath)) {
		console.log('[Project] Snippet file not found.');
		return;
	}
	const snippet = fs.readFileSync(snippetPath, 'utf8');
	if (fs.existsSync(target)) {
		const existing = fs.readFileSync(target, 'utf8');
		if (existing.includes('Fractal Agentic')) {
			console.log(`[Project] AGENTS snippet already present in: ${target}`);
			return;
		}
		fs.writeFileSync(target, snippet + '\n\n' + existing);
	} else {
		fs.writeFileSync(target, snippet);
	}
	console.log(`[Project] AGENTS snippet: ${target}`);
}

function doInstall(rootDir, pluginSrc, rawArgs) {
	const targetArg = rawArgs.find(a => a.startsWith('--target='));
	const target = targetArg ? targetArg.split('=')[1] : 'all';
	const isProject = rawArgs.includes('--project');

	console.log('Fractal Agentic — Installer\n');

	if (target === 'all' || target === 'antigravity') installAntigravity(pluginSrc);
	if (target === 'all' || target === 'claude') installClaude(pluginSrc, rootDir);
	if (target === 'all' || target === 'codex') installCodex(pluginSrc);
	if (isProject) injectProjectSnippet(pluginSrc, process.cwd());

	console.log('\nInstallation finished. Restart your AI coding assistant session.');
}

// ── Health & sync ───────────────────────────────────────────────────

const HOST_COPIES = [
	{ host: 'antigravity', label: 'Antigravity', dir: path.join(HOME, '.gemini', 'config', 'plugins', 'fractal-agentic') },
	{ host: 'claude', label: 'Claude Code', dir: path.join(HOME, '.claude', 'plugins', 'cache', 'fractal-agentic'), nested: 'fractal-agentic' },
	{ host: 'codex', label: 'Codex', dir: path.join(HOME, '.codex', 'plugins', 'cache', 'fractal-agentic') },
	{ host: 'agents', label: 'Agents', dir: path.join(HOME, '.agents', 'plugins', 'fractal-agentic') }
];

function readPluginMeta(dir) {
	try {
		return JSON.parse(fs.readFileSync(path.join(dir, 'plugin.json'), 'utf8'));
	} catch (_) {
		return null;
	}
}

function compareSemver(a, b) {
	const pa = String(a || '0').split('.').map(n => parseInt(n, 10) || 0);
	const pb = String(b || '0').split('.').map(n => parseInt(n, 10) || 0);
	for (let i = 0; i < 3; i++) {
		if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
	}
	return 0;
}

function detectHostCopies() {
	return HOST_COPIES.map(entry => {
		const result = {
			host: entry.host, label: entry.label, dir: entry.dir, nested: entry.nested || null,
			status: 'missing', pluginDir: null, version: null, symlink: false
		};
		if (!fs.existsSync(entry.dir)) return result;
		try {
			result.symlink = fs.lstatSync(entry.dir).isSymbolicLink();
		} catch (_) { /* keep false */ }
		const flat = readPluginMeta(entry.dir);
		if (flat && flat.name === 'fractal-agentic') {
			result.pluginDir = entry.dir;
			result.version = flat.version || null;
			result.status = 'ok';
			return result;
		}
		// Marketplace-nested layout: <dir>/<plugin-name>/<semver>/plugin.json
		const nestedBase = entry.nested ? path.join(entry.dir, entry.nested) : entry.dir;
		if (fs.existsSync(nestedBase) && fs.statSync(nestedBase).isDirectory()) {
			let newest = null;
			for (const name of fs.readdirSync(nestedBase)) {
				const meta = readPluginMeta(path.join(nestedBase, name));
				if (meta && (!newest || compareSemver(meta.version, newest.version) > 0)) {
					newest = { dir: path.join(nestedBase, name), version: meta.version || null };
				}
			}
			if (newest) {
				result.pluginDir = newest.dir;
				result.version = newest.version;
				result.status = 'ok';
			}
		}
		return result;
	});
}

function rootVersion(rootDir) {
	const meta = readPluginMeta(rootDir);
	return meta ? meta.version : null;
}

function doctorHostStatus(rootVer, copy) {
	if (!copy.pluginDir) return 'missing';
	if (copy.symlink) return 'symlink';
	if (!copy.version || !rootVer) return 'fail';
	return compareSemver(copy.version, rootVer) < 0 ? 'drift' : 'ok';
}

function doDoctor(rootDir, flags) {
	const jsonOut = !!flags.json;
	const rootVer = rootVersion(rootDir);
	const armory = runCaptured('check-armory.sh', rootDir);
	const marker = path.join(process.cwd(), '.fractal-agentic', 'project.json');
	const markerOk = fs.existsSync(marker);
	const hosts = detectHostCopies().map(c => ({
		host: c.host, label: c.label, dir: c.dir, pluginDir: c.pluginDir,
		version: c.version, symlink: c.symlink, status: doctorHostStatus(rootVer, c)
	}));
	const healthy = armory.ok && hosts.every(h => ['ok', 'symlink', 'missing'].includes(h.status));

	if (jsonOut) {
		console.log(JSON.stringify({
			root: rootDir,
			version: rootVer,
			armory: { ok: armory.ok, error: armory.error || null },
			project_marker: { path: marker, present: markerOk },
			hosts,
			healthy
		}, null, 2));
	} else {
		console.log('Fractal Agentic — Doctor\n');
		console.log(`Root:    ${rootDir} (v${rootVer || 'unknown'})`);
		console.log(`Armory:  ${armory.ok ? 'PASS' : 'FAIL'}${armory.ok ? '' : ` — ${armory.error}`}`);
		console.log(`Marker:  ${markerOk ? marker : 'not found (run "fractal-agentic init" in your project)'}`);
		console.log('\nHost copies:');
		for (const h of hosts) {
			const detail = h.version ? `v${h.version}` : (h.status === 'missing' ? 'not installed' : 'no version');
			console.log(`  ${h.status.padEnd(8)} ${h.label.padEnd(12)} ${detail.padEnd(14)} ${h.dir}`);
		}
		console.log(`\n${healthy ? 'Doctor: healthy' : 'Doctor: issues found — run "fractal-agentic update" to sync host copies.'}`);
	}
	if (!healthy) process.exit(1);
}

function doUpdate(rootDir, flags) {
	const target = typeof flags.target === 'string' ? flags.target : 'all';
	const dryRun = !!flags['dry-run'];
	const force = !!flags.force;
	const rootVer = rootVersion(rootDir);
	const wanted = detectHostCopies().filter(c => target === 'all' || c.host === target);
	if (target !== 'all' && wanted.length === 0) {
		console.error(`Unknown target: ${target} (expected all|antigravity|claude|codex|agents)`);
		process.exit(1);
	}

	console.log('Fractal Agentic — Update\n');
	console.log(`Source: ${rootDir} (v${rootVer || 'unknown'})\n`);

	let changed = 0;
	for (const copy of wanted) {
		const status = doctorHostStatus(rootVer, copy);
		if (status === 'symlink') {
			console.log(`skip: ${copy.label} — symlink (managed externally)`);
			continue;
		}
		if (status === 'ok' && !force) {
			console.log(`skip: ${copy.label} — up to date (v${copy.version})`);
			continue;
		}
		let dest;
		if (copy.nested && rootVer) {
			// Marketplace layout: write a fresh <semver> dir, never overwrite old versions.
			dest = path.join(copy.dir, copy.nested, rootVer);
		} else if (status === 'drift' && copy.pluginDir) {
			dest = copy.pluginDir;
		} else {
			dest = copy.dir;
		}
		const from = copy.version ? `v${copy.version}` : 'not installed';
		console.log(`${dryRun ? 'would update' : 'update'}: ${copy.label} ${from} -> v${rootVer || '?'} at ${dest}`);
		if (dryRun) { changed++; continue; }
		try {
			fs.rmSync(dest, { recursive: true, force: true });
			fs.mkdirSync(path.dirname(dest), { recursive: true });
			fs.cpSync(rootDir, dest, { recursive: true, filter: pluginCopyFilter });
			console.log(`  done: ${dest}`);
			changed++;
		} catch (err) {
			console.error(`  failed: ${err.message}`);
			process.exit(1);
		}
	}
	if (!changed) console.log('Nothing to update.');
}

// ── Init ────────────────────────────────────────────────────────────

function doInit(rootDir, cwd) {
	console.log('Fractal Agentic — Init\n');

	injectProjectSnippet(rootDir, cwd);

	const markerDir = path.join(cwd, '.fractal-agentic');
	fs.mkdirSync(markerDir, { recursive: true });
	fs.writeFileSync(path.join(markerDir, 'project.json'), JSON.stringify({
		version: 1,
		root: rootDir,
		installed_at: new Date().toISOString()
	}, null, 2));
	console.log(`[Init] Wrote project marker: ${path.join(markerDir, 'project.json')}`);

	console.log(`\n[Init] Installing agent templates...`);
	runScript('install-agents.sh', rootDir);

	console.log(`\nInit complete. Set FRACTAL_AGENTIC_ROOT:`);
	console.log(`  export FRACTAL_AGENTIC_ROOT="${rootDir}"`);
}

// ── Help ────────────────────────────────────────────────────────────

function printHelp() {
	console.log(`
fractal-agentic — CLI for the Fractal Agentic plugin

Usage:
  fractal-agentic <verb> [options]

Bootstrap:
  init                           Full project bootstrap (snippet + agents + marker)

Install & Verify:
  install [--target=<host>] [--project]  Plugin host install (deprecated alias)
  verify                         Verification suite (deprecated alias)
  fa-install [--target=<host>] [--project]    Plugin host install
  fa-verify                                   Run full verification suite

Setup:
  fa-setup agents [--target-dir <path>]       Install capability agent templates
  fa-setup hooks [--target <host>] [--profile <name>]  Install optional hooks
  fa-setup improve [--profile <name>]         Enable self-improvement plane
  fa-setup project                            Inject AGENTS snippet into cwd

Check (read-only):
  fa-check armory [--json]       Core files + critical skill path health
  fa-check agents [--json]       Verify capability agent templates match
  fa-check hooks [--json]        Check whether optional hooks are installed
  fa-check improve [--json]      Check self-improvement config + data dirs
  fa-check policy [--json]       Verify non-blocking policy compliance
  fa-check all [--json]          Run all checks

Health & sync:
  doctor [--json]                Root + armory health, host copy drift report
  update [--target=<host>] [--dry-run] [--force]   Sync host copies to this root

Info:
  fa-info root [--json]                  Print resolved plugin root path
  fa-info runtime <uuid> [--json]        Allowlisted routing metadata from subagent

Inventory:
  fa-agent <list|show> [id] [--filter <term>] [--verbose] [--type toml|md] [--frontmatter] [--json]
  fa-command <list|show> [id] [--filter <term>] [--verbose] [--frontmatter] [--json]
  fa-skill <list|show> [id] [--filter <term>] [--verbose] [--frontmatter] [--json]

General:
  --help, -h        Show this help
  --version, -v     Print version from plugin.json
`);
}

function printVersion() {
	try {
		const pj = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'plugin.json'), 'utf8'));
		console.log(`fractal-agentic v${pj.version}`);
	} catch (_) {
		console.log('fractal-agentic (version unknown)');
	}
}

// ── Flag parsing ───────────────────────────────────────────────────

function parseFlags(rawArgs) {
	const flags = {};
	const positional = [];
	for (let i = 0; i < rawArgs.length; i++) {
		const a = rawArgs[i];
		if (a.startsWith('--')) {
			const eqi = a.indexOf('=');
			if (eqi > -1) {
				flags[a.slice(2, eqi)] = a.slice(eqi + 1);
			} else {
				const key = a.slice(2);
				if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
					flags[key] = rawArgs[i + 1];
					i++;
				} else {
					flags[key] = true;
				}
			}
		} else {
			positional.push(a);
		}
	}
	return { flags, positional };
}

// ── Main dispatch ──────────────────────────────────────────────────

function main() {
	const rawArgs = process.argv.slice(2);
	const verb = rawArgs[0] || '--help';

	if (verb === '--help' || verb === '-h' || verb === 'help') {
		printHelp();
		return;
	}
	if (verb === '--version' || verb === '-v') {
		printVersion();
		return;
	}

	const rootDir = resolveRoot(process.cwd());
	if (!rootDir) {
		console.error('Error: Cannot find Fractal Agentic plugin root.');
		console.error('  Run "fractal-agentic init" from the package directory first,');
		console.error('  or set FRACTAL_AGENTIC_ROOT in your environment.');
		process.exit(1);
	}

	const cwd = process.cwd();
	const rest = rawArgs.slice(1);
	const { flags, positional } = parseFlags(rest);

	switch (verb) {

		// ── Bootstrap ──
		case 'init':
			doInit(rootDir, cwd);
			break;

		// ── Backward compat aliases ──
		case 'install':
			doInstall(rootDir, rootDir, rawArgs);
			break;
		case 'verify':
			runScript('verify.sh', rootDir);
			break;

		// ── fa-install / fa-verify ──
		case 'fa-install':
			doInstall(rootDir, rootDir, rawArgs);
			break;
		case 'fa-verify':
			runScript('verify.sh', rootDir);
			break;

		// ── fa-setup ──
		case 'fa-setup': {
			const comp = positional[0];
			if (!comp) {
				console.error('Usage: fractal-agentic fa-setup <agents|hooks|improve|project>');
				process.exit(1);
			}
			switch (comp) {
				case 'agents':
					runScript('install-agents.sh', rootDir, ...positional.slice(1));
					break;
				case 'hooks':
					runScript('install-hooks.sh', rootDir, ...positional.slice(1));
					break;
				case 'improve':
					runScript('install-improve.sh', rootDir, ...positional.slice(1));
					break;
				case 'project':
					injectProjectSnippet(rootDir, cwd);
					break;
				default:
					console.error(`Unknown setup component: ${comp}`);
					process.exit(1);
			}
			break;
		}

		// ── fa-check ──
		case 'fa-check': {
			const comp = positional[0];
			if (!comp) {
				console.error('Usage: fractal-agentic fa-check <armory|agents|hooks|improve|policy|all>');
				process.exit(1);
			}
			const jsonOut = !!flags.json;
			const results = [];
			let allOk = true;

			function doCheck(label, script, ...xargs) {
				const r = runCaptured(script, rootDir, ...xargs);
				if (jsonOut) {
					results.push({ check: label, ok: r.ok, error: r.error || null });
				} else if (r.ok) {
					console.log(`PASS: ${label}`);
					console.log(r.output);
				} else {
					console.log(`FAIL: ${label}`);
					if (r.error) console.log(r.error);
				}
				return r.ok;
			}

			switch (comp) {
				case 'armory':
					allOk = doCheck('armory', 'check-armory.sh');
					break;
				case 'agents':
					allOk = doCheck('agents', 'install-agents.sh', '--check');
					break;
				case 'hooks':
					allOk = doCheck('hooks', 'install-hooks.sh', '--check');
					break;
				case 'improve':
					allOk = doCheck('improve', 'install-improve.sh', '--check');
					break;
				case 'policy':
					allOk = doCheck('policy', 'check-nonblocking-policy.sh');
					break;
				case 'all':
					allOk = doCheck('armory', 'check-armory.sh') && allOk;
					allOk = doCheck('agents', 'install-agents.sh', '--check') && allOk;
					allOk = doCheck('hooks', 'install-hooks.sh', '--check') && allOk;
					allOk = doCheck('improve', 'install-improve.sh', '--check') && allOk;
					allOk = doCheck('policy', 'check-nonblocking-policy.sh') && allOk;
					break;
				default:
					console.error(`Unknown check component: ${comp}`);
					process.exit(1);
			}

			if (jsonOut) console.log(JSON.stringify({ results, all_pass: allOk }, null, 2));
			if (!allOk) process.exit(1);
			break;
		}

		// ── fa-info ──
		case 'fa-info': {
			const target = positional[0];
			if (!target) {
				console.error('Usage: fractal-agentic fa-info <root|runtime>');
				process.exit(1);
			}
			const jsonOut = !!flags.json;
			switch (target) {
				case 'root':
					if (jsonOut) console.log(JSON.stringify({ root: rootDir }, null, 2));
					else console.log(rootDir);
					break;
				case 'runtime': {
					const threadId = positional[1];
					if (!threadId) {
						console.error('Usage: fractal-agentic fa-info runtime <uuid>');
						process.exit(1);
					}
					const r = runCaptured('inspect-agent-runtime.sh', rootDir, threadId);
					if (!r.ok) {
						console.error(r.error);
						process.exit(1);
					}
					console.log(r.output);
					break;
				}
				default:
					console.error(`Unknown info target: ${target}`);
					process.exit(1);
			}
			break;
		}

		// ── fa-agent ──
		case 'fa-agent': {
			const sub = positional[0];
			if (sub !== 'list' && sub !== 'show') {
				console.error('Usage: fractal-agentic fa-agent <list|show> [id] [--filter <t>] [--verbose] [--type toml|md] [--frontmatter] [--json]');
				process.exit(1);
			}
			if (sub === 'list') {
				listInventory(rootDir, 'agent', {
					filter: flags.filter, verbose: !!flags.verbose, type: flags.type, json: !!flags.json
				});
			} else {
				const id = positional[1];
				if (!id) { console.error('Usage: fractal-agentic fa-agent show <id> [--frontmatter]'); process.exit(1); }
				showItem(rootDir, 'agent', id, flags);
			}
			break;
		}

		// ── fa-command ──
		case 'fa-command': {
			const sub = positional[0];
			if (sub !== 'list' && sub !== 'show') {
				console.error('Usage: fractal-agentic fa-command <list|show> [id] [--filter <t>] [--verbose] [--frontmatter] [--json]');
				process.exit(1);
			}
			if (sub === 'list') {
				listInventory(rootDir, 'command', {
					filter: flags.filter, verbose: !!flags.verbose, json: !!flags.json
				});
			} else {
				const id = positional[1];
				if (!id) { console.error('Usage: fractal-agentic fa-command show <id> [--frontmatter]'); process.exit(1); }
				showItem(rootDir, 'command', id, flags);
			}
			break;
		}

		// ── fa-skill ──
		case 'fa-skill': {
			const sub = positional[0];
			if (sub !== 'list' && sub !== 'show') {
				console.error('Usage: fractal-agentic fa-skill <list|show> [id] [--filter <t>] [--verbose] [--frontmatter] [--json]');
				process.exit(1);
			}
			if (sub === 'list') {
				listInventory(rootDir, 'skill', {
					filter: flags.filter, verbose: !!flags.verbose, json: !!flags.json
				});
			} else {
				const id = positional[1];
				if (!id) { console.error('Usage: fractal-agentic fa-skill show <id> [--frontmatter]'); process.exit(1); }
				showItem(rootDir, 'skill', id, flags);
			}
			break;
		}

		// ── Health & sync ──
		case 'doctor':
		case 'fa-doctor': {
			doDoctor(rootDir, flags);
			break;
		}

		case 'update':
		case 'fa-update': {
			doUpdate(rootDir, flags);
			break;
		}

		default:
			console.error(`Unknown command: ${verb}`);
			console.error('Run "fractal-agentic --help" for usage.');
			process.exit(1);
	}
}

main();
