import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseFrontmatter } from '../../src/lib/modules/notes/frontmatter';

// TODO: Phase 3 flips GOVERNED_DIRS to include all directories in docs/
const GOVERNED_DIRS = ['adr', 'design', 'areas'];

function getMarkdownFiles(dir: string): string[] {
	let results: string[] = [];
	if (!fs.existsSync(dir)) return results;
	const list = fs.readdirSync(dir);
	list.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		if (stat && stat.isDirectory()) {
			results = results.concat(getMarkdownFiles(filePath));
		} else if (file.endsWith('.md')) {
			results.push(filePath);
		}
	});
	return results;
}

function getAllFiles(dir: string): string[] {
	let results: string[] = [];
	if (!fs.existsSync(dir)) return results;
	const list = fs.readdirSync(dir);
	list.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		if (stat && stat.isDirectory()) {
			results = results.concat(getAllFiles(filePath));
		} else {
			results.push(filePath);
		}
	});
	return results;
}

// Same mapping logic as scripts/generate-doc-filetables.mjs
function assignArea(filePath: string): string | null {
	const p = filePath.replace(/\\/g, '/');
	if (p.includes('.DS_Store') || p.includes('tsconfig.json')) return null;

	if (p.includes('src/lib/modules/designer/')) return 'designer';
	if (p.includes('src/lib/modules/browser/')) return 'browser';
	if (p.includes('src/lib/modules/notes/')) return 'notes';
	if (p.includes('src/lib/modules/ide/')) return 'ide';
	if (p.includes('src/lib/modules/ai/')) return 'ai';
	if (p.includes('src/lib/modules/annotations/')) return 'annotations';
	if (p.includes('src/lib/modules/bookmarks/')) return 'bookmarks';
	if (p.includes('src/lib/modules/fractaldocs/')) return 'fractaldocs';
	if (p.includes('src/lib/modules/media/')) return 'media';
	if (p.includes('src/lib/modules/dev/')) return 'dev';
	if (p.includes('src/lib/modules/newdesign/')) return 'newdesign';

	if (p === 'src/lib/components/AIChat.svelte' || 
		p.includes('src/lib/components/ai-elements/') || 
		p === 'src/lib/components/PromptInput.svelte') {
		return 'ai';
	}

	if (p === 'src/lib/state/ide.svelte.ts' || 
		p === 'src/lib/state/browser.svelte.ts' || 
		p === 'src/lib/state/settings.svelte.ts' ||
		p === 'src/lib/data/aiProviders.ts') {
		return 'kernel';
	}

	if (p === 'src/lib/state/undoHistory.svelte.ts' || 
		p === 'src/lib/state/undo.svelte.ts' || 
		p === 'src/lib/state/historyClock.ts') {
		return 'undo-system';
	}

	if (p === 'src/lib/state/contributions.svelte.ts' || 
		p === 'src/lib/state/coreContributions.ts') {
		return 'contributions';
	}

	if (p === 'src/lib/ipc.ts' || 
		p === 'src/lib/ipc-mock.ts') {
		return 'ipc-and-data-layer';
	}

	if (p === 'src/lib/sanitizeHtml.ts' || 
		p === 'src/lib/pathValidation.ts') {
		return 'security-boundaries';
	}

	if (p.startsWith('src/lib/styles/')) {
		return 'styling-system';
	}

	if (p === 'src/lib/editorTheme.ts') return 'ide';
	if (p === 'src/lib/errors.ts') return 'kernel';
	if (p === 'src/lib/totp.ts') return 'kernel';
	if (p === 'src/lib/state/ai.svelte.ts') return 'ai';
	if (p === 'src/lib/state/modelRegistry.svelte.ts') return 'ai';
	if (p === 'src/lib/state/modelRegistry.contract.ts') return 'ai';

	if (p.startsWith('src/routes/') || 
		p === 'src/lib/state/app.svelte.ts' ||
		p === 'src/lib/state/shell.svelte.ts' ||
		p === 'src/lib/state/canvas.svelte.ts' ||
		p.startsWith('src/lib/components/') || 
		p.startsWith('src/lib/data/') || 
		p.startsWith('src/lib/actions/')) {
		return 'shell-and-routes';
	}

	if (p.startsWith('src-tauri/src/')) {
		if (p.includes('src/browser/')) return 'browser';
		if (p.includes('storage.rs') || p.includes('memory.rs') || p.includes('annotations.rs') || p.includes('crypto.rs') || p.includes('main.rs') || p.includes('lib.rs') || p.includes('docs_index.rs')) {
			return 'ipc-and-data-layer';
		}
	}

	if (p.startsWith('tests/')) {
		if (p.includes('browser-')) return 'browser';
		if (p.includes('design.spec.ts')) return 'designer';
		if (p.includes('ide.spec.ts')) return 'ide';
		if (p.includes('bookmarks.spec.ts')) return 'bookmarks';
		if (p.includes('bookmarks-state.test.ts')) return 'bookmarks';
		if (p.includes('style-contracts.test.ts')) return 'styling-system';
		if (p.includes('ipc-contract.test.ts')) return 'ipc-and-data-layer';
		if (p.includes('data-layer-mock.test.ts')) return 'ipc-and-data-layer';
		if (p.includes('ipc-credential-history.test.ts')) return 'ipc-and-data-layer';
		if (p.includes('setup.ts')) return 'kernel';
		if (p.includes('security-config.test.ts')) return 'security-boundaries';
		if (p.includes('frontmatter.test.ts')) return 'security-boundaries';
		if (p.includes('codegen-sanitizer.test.ts')) return 'security-boundaries';
		if (p.includes('pathValidation.test.ts')) return 'security-boundaries';
		if (p.includes('html-boundary.test.ts')) return 'security-boundaries';
		if (p.includes('contribution-contracts.test.ts')) return 'contributions';
		if (p.includes('undo-history.test.ts')) return 'undo-system';
		if (p.includes('ai-workspace.test.ts')) return 'ai';
		if (p.includes('fractaldocs-state.test.ts')) return 'fractaldocs';
	}

	return null;
}

function getOneLiner(filePath: string): string {
	try {
		const content = fs.readFileSync(filePath, 'utf8');
		const lines = content.split('\n');
		for (let i = 0; i < Math.min(lines.length, 15); i++) {
			const line = lines[i].trim();
			if (!line) continue;
			let m = line.match(/^\/\/\s*(.*)$/);
			if (m) return m[1].trim();
			m = line.match(/^\/\*\s*(.*?)\s*\*\/$/);
			if (m) return m[1].trim();
			m = line.match(/^<!--\s*(.*?)\s*-->$/);
			if (m) return m[1].trim();
			m = line.match(/^\/\/\/\s*(.*)$/) || line.match(/^\/\/!\s*(.*)$/);
			if (m) return m[1].trim();
		}
	} catch (e) {
		// Ignore
	}
	return path.basename(filePath);
}

describe('Documentation Contracts Guard Tests', () => {
	it('enforces valid frontmatter and INDEX.md parity for governed docs', () => {
		const indexContent = fs.readFileSync('docs/INDEX.md', 'utf8');
		const pathRegex = /\[docs\/[^\]]+\]\((docs\/[^)]+)\)/g;
		const indexedPaths = new Set<string>();
		let match;
		while ((match = pathRegex.exec(indexContent)) !== null) {
			indexedPaths.add(match[1]);
		}

		GOVERNED_DIRS.forEach((dirName) => {
			const dirPath = path.join('docs', dirName);
			const files = getMarkdownFiles(dirPath);

			files.forEach((file) => {
				const relativePath = file.replace(/\\/g, '/');
				const content = fs.readFileSync(file, 'utf8');
				const parsed = parseFrontmatter(content);
				
				// 1. Every governed doc has valid frontmatter
				expect(parsed.frontmatter, `File '${relativePath}' is missing valid frontmatter display blocks.`).not.toBeNull();

				// 2. Every governed doc is indexed in INDEX.md
				expect(indexedPaths.has(relativePath), `File '${relativePath}' is not indexed in docs/INDEX.md.`).toBe(true);
			});
		});

		// 3. Every index row path exists on disk (if it belongs to a governed dir)
		indexedPaths.forEach((relPath) => {
			const firstSegment = relPath.split('/')[1];
			if (GOVERNED_DIRS.includes(firstSegment)) {
				expect(fs.existsSync(relPath), `docs/INDEX.md references non-existent file '${relPath}'.`).toBe(true);
			}
		});
	});

	it('enforces that every directory under src/lib/modules/ has a matching areas/ doc', () => {
		const modulesDir = 'src/lib/modules';
		if (fs.existsSync(modulesDir)) {
			const modules = fs.readdirSync(modulesDir).filter((file) => {
				return fs.statSync(path.join(modulesDir, file)).isDirectory();
			});

			modules.forEach((mod) => {
				const areaDocPath = `docs/areas/${mod}.md`;
				expect(fs.existsSync(areaDocPath), `Module '${mod}' has no corresponding area documentation at '${areaDocPath}'.`).toBe(true);
			});
		}
	});

	it('enforces file-table freshness and path existence in area docs', () => {
		const dirsToWalk = ['src/lib', 'src/routes', 'src-tauri/src', 'tests'];
		let allFiles: string[] = [];
		dirsToWalk.forEach((dir) => {
			if (fs.existsSync(dir)) {
				allFiles = allFiles.concat(getAllFiles(dir));
			}
		});

		const areaFiles: Record<string, { path: string; oneLiner: string }[]> = {};
		GOVERNED_DIRS.forEach((d) => {
			if (d === 'areas') {
				fs.readdirSync('docs/areas').forEach((file) => {
					if (file.endsWith('.md')) {
						areaFiles[file.slice(0, -3)] = [];
					}
				});
			}
		});

		allFiles.forEach((file) => {
			const relativePath = file.replace(/\\/g, '/');
			const area = assignArea(relativePath);
			if (area && areaFiles[area] !== undefined) {
				areaFiles[area].push({
					path: relativePath,
					oneLiner: getOneLiner(file)
				});
			}
		});

		Object.keys(areaFiles).forEach((area) => {
			const docPath = `docs/areas/${area}.md`;
			expect(fs.existsSync(docPath), `Area doc for '${area}' should exist at '${docPath}'.`).toBe(true);

			const docContent = fs.readFileSync(docPath, 'utf8');
			const beginMarker = '<!-- filetable:begin -->';
			const endMarker = '<!-- filetable:end -->';

			const beginIdx = docContent.indexOf(beginMarker);
			const endIdx = docContent.indexOf(endMarker);

			expect(beginIdx).not.toBe(-1);
			expect(endIdx).not.toBe(-1);

			// Re-generate the table to check freshness
			const files = areaFiles[area].sort((a, b) => a.path.localeCompare(b.path));
			let expectedTable = '\n| File | Description |\n|---|---|\n';
			files.forEach((f) => {
				const desc = f.oneLiner.replace(/\|/g, '\\|');
				expectedTable += `| [\`${path.basename(f.path)}\`](file:///${path.resolve(f.path)}) | ${desc} |\n`;
			});
			expectedTable += '\n';

			const actualTable = docContent.substring(beginIdx + beginMarker.length, endIdx);
			expect(actualTable, `File table in '${docPath}' is out of date. Run 'pnpm docs:filetables' to refresh it.`).toBe(expectedTable);
		});
	});

	it('enforces no unindexed loose files in governed dirs', () => {
		GOVERNED_DIRS.forEach((dirName) => {
			const dirPath = path.join('docs', dirName);
			if (fs.existsSync(dirPath)) {
				const files = fs.readdirSync(dirPath);
				files.forEach((file) => {
					expect(file.endsWith('.md'), `Governed directory 'docs/${dirName}' contains unindexed loose file '${file}'.`).toBe(true);
				});
			}
		});
	});
});
