import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fractalsStyler from 'fractals-styler';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const annotationsDb = join(process.cwd(), '.fractal', 'annotations.db');

function sqlText(value: string): string {
	return `'${value.replaceAll("'", "''")}'`;
}

async function sqlite(sql: string): Promise<string> {
	await mkdir(dirname(annotationsDb), { recursive: true });
	const { stdout } = await execFileAsync('/usr/bin/sqlite3', ['-json', annotationsDb, sql]);
	return stdout || '[]';
}

async function initializeAnnotationsDb(): Promise<void> {
	await sqlite(`CREATE TABLE IF NOT EXISTS annotations (
		id TEXT PRIMARY KEY,
		author TEXT NOT NULL,
		snapshot TEXT NOT NULL,
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL
	); CREATE INDEX IF NOT EXISTS idx_annotations_updated_at ON annotations(updated_at DESC);`);
}

function annotationRelay() {
	return {
		name: 'fractalengine-annotation-relay',
		configureServer(server: { middlewares: { use: (handler: (request: any, response: any, next: () => void) => void) => void } }) {
			void initializeAnnotationsDb();
			server.middlewares.use((request, response, next) => {
				void (async () => {
					if (!request.url?.startsWith('/__fractal/annotations')) return next();
					response.setHeader('content-type', 'application/json');
					if (request.method === 'GET') {
						const rows = JSON.parse(await sqlite('SELECT id, author, snapshot, created_at, updated_at FROM annotations ORDER BY updated_at DESC;')) as Array<{ id: string; author: string; snapshot: string; created_at: string; updated_at: string }>;
						response.end(JSON.stringify(rows.map(row => ({ id: row.id, author: row.author, snapshot: JSON.parse(row.snapshot), createdAt: row.created_at, updatedAt: row.updated_at }))));
						return;
					}
					if (request.method === 'DELETE') {
						const id = decodeURIComponent(request.url.split('/').at(-1) ?? '');
						await sqlite(`DELETE FROM annotations WHERE id = ${sqlText(id)};`);
						response.end(JSON.stringify({ ok: true }));
						return;
					}
					if (request.method === 'POST') {
						const chunks: Buffer[] = [];
						for await (const chunk of request) chunks.push(Buffer.from(chunk));
						const annotation = JSON.parse(Buffer.concat(chunks).toString()) as { id: string; author: string; snapshot: unknown };
						if (!annotation.id || !annotation.author || !annotation.snapshot) throw new Error('Annotation id, author, and snapshot are required');
						const now = new Date().toISOString();
						await sqlite(`INSERT INTO annotations (id, author, snapshot, created_at, updated_at) VALUES (${sqlText(annotation.id)}, ${sqlText(annotation.author)}, ${sqlText(JSON.stringify(annotation.snapshot))}, ${sqlText(now)}, ${sqlText(now)}) ON CONFLICT(id) DO UPDATE SET author = excluded.author, snapshot = excluded.snapshot, updated_at = excluded.updated_at;`);
						const [row] = JSON.parse(await sqlite(`SELECT id, author, snapshot, created_at, updated_at FROM annotations WHERE id = ${sqlText(annotation.id)};`)) as Array<{ id: string; author: string; snapshot: string; created_at: string; updated_at: string }>;
						response.end(JSON.stringify({ id: row.id, author: row.author, snapshot: JSON.parse(row.snapshot), createdAt: row.created_at, updatedAt: row.updated_at }));
						return;
					}
					response.statusCode = 405;
					response.end(JSON.stringify({ error: 'Method not allowed' }));
				})().catch((error: unknown) => {
					response.statusCode = 500;
					response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Annotation relay failed' }));
				});
			});
		}
	};
}

export default defineConfig({
	plugins: [sveltekit(), fractalsStyler(), annotationRelay()],
	build: {
		// Mermaid is already loaded behind the diagram renderer's dynamic import. Its
		// 594 kB language-runtime module is a single upstream ESM module and cannot be
		// split internally by Rolldown; keep the warning budget just above that isolated,
		// on-demand dependency while still warning on any larger application chunk.
		chunkSizeWarningLimit: 650,
		rolldownOptions: {
			output: {
				codeSplitting: {
					maxSize: 450_000
				}
			}
		}
	},
	server: {
		watch: {
			// Rust build output (~2.3GB, 50k files per the audit) isn't source — watching it
			// causes reload storms whenever `cargo build`/`tauri dev` runs alongside `pnpm dev`.
			ignored: [
				'**/src-tauri/bin/**',
				'**/src-tauri/target/**',
				'**/.svelte-kit/output/**',
				'**/.svelte-kit/generated/**',
				'**/.svelte-kit-build/**',
				'**/build/**',
				'**/playwright-report/**',
				'**/test-results/**',
				'**/audit-screenshots-*/**'
			]
		}
	}
});
