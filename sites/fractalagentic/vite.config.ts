import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { defineConfig, type Plugin } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import fractalsStyler from 'fractals-styler';

const execFileAsync = promisify(execFile);

/**
 * "Last updated" dates come from git history, not file mtimes — mtimes reset
 * to "now" on every fresh clone and Docker build. One `git log` walk maps
 * each content file to its most recent commit date; without git history
 * (new scaffolds, tarball checkouts) the map stays empty and pages simply
 * don't show a date.
 *
 * Async and memoized: `load()` can run more than once for the same virtual
 * module (dev-server warm reloads, multiple entry points resolving it), and
 * a sync `execFileSync` call would otherwise block Vite's single thread on
 * every one of those. The promise itself is cached, not just its result, so
 * concurrent callers share one in-flight git process instead of racing.
 */
let datesPromise: Promise<Record<string, string>> | undefined;

async function resolveContentDates(): Promise<Record<string, string>> {
	const dates: Record<string, string> = {};
	try {
		// content/ (legacy site docs) and packages/fractal-agentic (the docs + armory
		// source of truth) are walked relative to the repo root (not cwd) so this
		// still works if Vite is ever invoked from a subdirectory.
		const { stdout: root } = await execFileAsync('git', ['rev-parse', '--show-toplevel'], {
			encoding: 'utf8'
		});
		const { stdout: log } = await execFileAsync(
			'git',
			[
				'log',
				'--format=%x00%cI',
				'--name-only',
				'--relative',
				'--',
				'content',
				'packages/fractal-agentic'
			],
			{ cwd: root.trim(), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
		);
		let commitDate = '';
		for (const line of log.split('\n')) {
			if (line.startsWith('\0')) {
				commitDate = line.slice(1, 11); // YYYY-MM-DD
			} else if (
				(line.startsWith('content/') || line.startsWith('packages/fractal-agentic/')) &&
				commitDate &&
				!(line in dates)
			) {
				// log is newest-first, so the first sighting wins
				dates[line] = commitDate;
			}
		}
	} catch {
		// not a git repo, or git unavailable
	}
	// Build-log diagnostic: a shallow clone (CI default) truncates history,
	// so most pages resolve no date. Look for this line in your deploy logs
	// when dates are missing in production.
	let shallow = false;
	try {
		const { stdout } = await execFileAsync('git', ['rev-parse', '--is-shallow-repository'], {
			encoding: 'utf8'
		});
		shallow = stdout.trim() === 'true';
	} catch {
		// same failure modes as above
	}
	console.log(
		`svocs: "last updated" dates resolved for ${Object.keys(dates).length} content file(s)` +
			(shallow ? ' — shallow git clone detected, history is truncated' : '')
	);
	return dates;
}

function contentDatesPlugin(): Plugin {
	const virtualId = 'virtual:svocs-content-dates';
	const resolvedId = `\0${virtualId}`;
	return {
		name: 'svocs-content-dates',
		resolveId(id) {
			return id === virtualId ? resolvedId : undefined;
		},
		async load(id) {
			if (id !== resolvedId) {
				return undefined;
			}
			datesPromise ??= resolveContentDates();
			return `export default ${JSON.stringify(await datesPromise)};`;
		}
	};
}

// $env/static/public (used in src/lib/search/resolver.ts) requires this to
// be defined at build time — override it to pick a different search
// backend, see https://svocs.dev/docs/search
process.env.PUBLIC_SVOCS_SEARCH_PROVIDER ??= 'flexsearch';

export default defineConfig({
	plugins: [
		contentDatesPlugin(),
		// Bare sveltekit(): every SvelteKit option (adapter, preprocess,
		// prerender, extensions, compilerOptions) lives in svelte.config.js.
		// Passing options here makes SvelteKit ignore that file entirely.
		sveltekit(),
		fractalsStyler()
	]
});
