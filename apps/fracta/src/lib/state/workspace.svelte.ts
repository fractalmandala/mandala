import {
	convertCsvToJson,
	convertJsonToCsv,
	createWorkspaceFolder,
	deleteWorkspacePath,
	duplicateWorkspacePath,
	isTauri,
	listWorkspace,
	readWorkspaceFile,
	rebuildWorkspaceIndex,
	revealWorkspacePath,
	openWorkspaceExternally,
	moveWorkspacePath,
	searchWorkspace,
	previewWorkspaceDocument,
	writeWorkspaceFile,
	workspaceLinks,
	workspaceGraph,
	type LinkReport,
	type WorkspaceFile,
	type WorkspaceItem,
	type DocumentPreview,
	type WorkspaceSearchHit,
	type GraphReport
} from '$lib/ipc';
import { entries } from '$lib/state/entries.svelte';

const INVALID_JSON_DRAFT_PREFIX = 'fracta:invalid-json-draft:';

class Workspace {
	items = $state<WorkspaceItem[]>([]);
	active = $state<WorkspaceFile | null>(null);
	loading = $state(false);
	saving = $state(false);
	dirty = $state(false);
	error = $state<string | null>(null);
	notice = $state<string | null>(null);
	links = $state<LinkReport | null>(null);
	preview = $state<DocumentPreview | null>(null);
	query = $state('');
	searchHits = $state<WorkspaceSearchHit[]>([]);
	graph = $state<GraphReport | null>(null);

	get visibleItems() {
		const query = this.query.trim().toLowerCase();
		return query ? this.items.filter((item) => item.path.toLowerCase().includes(query)) : this.items;
	}

	get templates() {
		return this.items.filter((item) => item.kind === 'markdown' && /^templates\//i.test(item.path));
	}

	#invalidJsonDraftKey(path: string) {
		return `${INVALID_JSON_DRAFT_PREFIX}${entries.status.path ?? 'unconfigured'}:${path}`;
	}

	#invalidJsonDraft(path: string) {
		if (typeof localStorage === 'undefined') return null;
		try {
			const value = localStorage.getItem(this.#invalidJsonDraftKey(path));
			if (!value) return null;
			try { JSON.parse(value); localStorage.removeItem(this.#invalidJsonDraftKey(path)); return null; }
			catch { return value; }
		} catch { return null; }
	}

	#persistInvalidJsonDraft(path: string, content: string) {
		if (typeof localStorage === 'undefined') return;
		try { JSON.parse(content); localStorage.removeItem(this.#invalidJsonDraftKey(path)); }
		catch {
			try { localStorage.setItem(this.#invalidJsonDraftKey(path), content); }
			catch { /* local storage is a recovery aid; editing continues even if it is unavailable */ }
		}
	}

	async searchContent() {
		if (!isTauri() || !this.query.trim()) { this.searchHits = []; return; }
		try {
			this.searchHits = await searchWorkspace(this.query);
		} catch (error) {
			this.error = error instanceof Error ? error.message : 'Could not search workspace content.';
		}
	}

	async rebuildIndex() {
		if (!isTauri()) return;
		try {
			const count = await rebuildWorkspaceIndex();
			this.notice = `Search index rebuilt for ${count} files.`;
		} catch (error) { this.error = error instanceof Error ? error.message : 'Could not rebuild the workspace search index.'; }
	}

	async init() {
		if (!isTauri()) {
			this.items = [
				{ path: 'welcome.md', name: 'welcome.md', kind: 'markdown', size: 0, modified_at: Date.now() },
				{ path: 'people.csv', name: 'people.csv', kind: 'csv', size: 0, modified_at: Date.now() },
				{ path: 'settings.json', name: 'settings.json', kind: 'json', size: 0, modified_at: Date.now() }
			];
			return;
		}
		this.loading = true;
		try {
			this.items = await listWorkspace();
			this.graph = await workspaceGraph();
		} catch (error) {
			this.error = error instanceof Error ? error.message : 'Could not load this workspace.';
		} finally {
			this.loading = false;
		}
	}

	async open(path: string) {
		if (!isTauri()) return;
		this.error = null;
		try {
			const file = await readWorkspaceFile(path);
			const recovered = file.kind === 'json' ? this.#invalidJsonDraft(path) : null;
			this.active = recovered === null ? file : { ...file, content: recovered };
			this.dirty = recovered !== null;
			if (recovered !== null) this.notice = 'Recovered an invalid JSON draft saved locally. Correct it, then Save to clear the recovery copy.';
			this.links = this.active.kind === 'markdown' ? await workspaceLinks(path) : null;
			this.preview = ['pdf', 'docx'].includes(this.active.kind)
				? await previewWorkspaceDocument(path)
				: null;
		} catch (error) {
			this.error = error instanceof Error ? error.message : 'Could not open this file.';
		}
	}

	/** Resolve the ordinary `[[note]]` shorthand the same way people expect from
	 * the graph: exact relative paths win, then a unique Markdown stem. */
	async openLinked(path: string) {
		const requested = path.replace(/^\.\//, '').replace(/#.*$/, '');
		const exact = this.items.find((item) => item.path === requested);
		const candidates = this.items.filter((item) => item.kind === 'markdown' && (
			item.path.replace(/\.mdx?$/i, '') === requested.replace(/\.mdx?$/i, '') ||
			item.name.replace(/\.mdx?$/i, '') === requested.replace(/\.mdx?$/i, '')
		));
		const target = exact ?? (candidates.length === 1 ? candidates[0] : undefined);
		if (!target) { this.error = `Could not resolve linked document “${path}”.`; return; }
		await this.open(target.path);
	}

	async refreshLinks() {
		if (!isTauri() || this.active?.kind !== 'markdown') return;
		try {
			this.links = await workspaceLinks(this.active.path);
		} catch (error) {
			this.error = error instanceof Error ? error.message : 'Could not update document links.';
		}
	}

	setContent(content: string) {
		if (this.active) {
			this.active = { ...this.active, content };
			if (this.active.kind === 'json') this.#persistInvalidJsonDraft(this.active.path, content);
			this.dirty = true;
		}
	}

	async save() {
		if (!isTauri() || !this.active || this.active.read_only || this.active.content === null) return;
		this.saving = true;
		this.error = null;
		try {
			this.active = await writeWorkspaceFile(this.active.path, this.active.content);
			if (this.active.kind === 'json' && typeof localStorage !== 'undefined') localStorage.removeItem(this.#invalidJsonDraftKey(this.active.path));
			this.dirty = false;
			await this.init();
			await this.refreshLinks();
		} catch (error) {
			this.error = error instanceof Error ? error.message : 'Could not save this file.';
		} finally {
			this.saving = false;
		}
	}

	/** Polling is intentionally conservative: it refreshes the tree and an unmodified
	 * active file, but never overwrites an unsaved local edit. */
	async refreshFromDisk() {
		if (!isTauri() || this.saving) return;
		try {
			const items = await listWorkspace();
			const changed = items.length !== this.items.length || items.some((item, index) => item.path !== this.items[index]?.path || item.modified_at !== this.items[index]?.modified_at);
			if (!changed) return;
			this.items = items;
			if (this.active && !this.dirty && items.some((item) => item.path === this.active?.path)) await this.open(this.active.path);
		} catch { /* transient filesystem errors should not interrupt writing */ }
	}

	async createMarkdown() {
		if (!isTauri()) return;
		const path = `untitled-${Date.now()}.md`;
		try {
			await writeWorkspaceFile(path, '# Untitled\n\n');
			await this.init();
			await this.open(path);
		} catch (error) {
			this.error = error instanceof Error ? error.message : 'Could not create a document.';
		}
	}

	async createFolder(path: string) {
		if (!isTauri() || !path.trim()) return;
		try {
			await createWorkspaceFolder(path.trim());
			await this.init();
		} catch (error) { this.error = error instanceof Error ? error.message : 'Could not create this folder.'; }
	}

	async createFromTemplate(templatePath: string, destination: string) {
		if (!isTauri() || !destination.trim()) return;
		try {
			const template = await readWorkspaceFile(templatePath);
			if (template.content === null) throw new Error('Template could not be read.');
			const title = destination.split('/').at(-1)?.replace(/\.mdx?$/i, '').replaceAll(/[-_]/g, ' ') ?? 'Untitled';
			const content = template.content
				.replaceAll('{{title}}', title)
				.replaceAll('{{date}}', new Date().toISOString().slice(0, 10));
			await writeWorkspaceFile(destination.trim(), content);
			await this.init();
			await this.open(destination.trim());
		} catch (error) { this.error = error instanceof Error ? error.message : 'Could not create this document from its template.'; }
	}

	async saveActiveAsTemplate(path: string) {
		if (!isTauri() || this.active?.kind !== 'markdown' || this.active.content === null || !path.trim()) return;
		try {
			const destination = path.trim().startsWith('templates/') ? path.trim() : `templates/${path.trim()}`;
			await writeWorkspaceFile(destination.endsWith('.md') ? destination : `${destination}.md`, this.active.content);
			await this.init();
			this.notice = 'Template saved locally.';
		} catch (error) { this.error = error instanceof Error ? error.message : 'Could not save this template.'; }
	}

	async duplicateActive() {
		if (!isTauri() || !this.active) return;
		try {
			const path = await duplicateWorkspacePath(this.active.path);
			await this.init();
			await this.open(path);
		} catch (error) { this.error = error instanceof Error ? error.message : 'Could not duplicate this item.'; }
	}

	async renameActive(nextPath: string) {
		if (!isTauri() || !this.active || !nextPath.trim() || nextPath === this.active.path) return;
		try {
			await moveWorkspacePath(this.active.path, nextPath.trim());
			await this.init();
			await this.open(nextPath.trim());
		} catch (error) { this.error = error instanceof Error ? error.message : 'Could not rename this item.'; }
	}

	async movePath(from: string, to: string) {
		if (!isTauri() || !from.trim() || !to.trim() || from === to) return;
		try {
			await moveWorkspacePath(from, to);
			const activeWasMoved = this.active?.path === from || this.active?.path.startsWith(`${from}/`);
			await this.init();
			if (activeWasMoved && this.active) await this.open(`${to}${this.active.path.slice(from.length)}`);
		} catch (error) { this.error = error instanceof Error ? error.message : 'Could not move this item.'; }
	}

	async deleteActive() {
		if (!isTauri() || !this.active) return;
		const path = this.active.path;
		try {
			await deleteWorkspacePath(path);
			this.active = null; this.links = null; this.preview = null;
			await this.init();
		} catch (error) { this.error = error instanceof Error ? error.message : 'Could not move this item to Trash.'; }
	}

	async deletePath(path: string) {
		if (!isTauri() || !path.trim()) return;
		try {
			await deleteWorkspacePath(path);
			if (this.active?.path === path || this.active?.path.startsWith(`${path}/`)) { this.active = null; this.links = null; this.preview = null; }
			await this.init();
		} catch (error) { this.error = error instanceof Error ? error.message : 'Could not move this item to Trash.'; }
	}

	async revealActive() {
		if (!isTauri() || !this.active) return;
		try { await revealWorkspacePath(this.active.path); }
		catch (error) { this.error = error instanceof Error ? error.message : 'Could not reveal this item.'; }
	}

	async openActiveExternally() {
		if (!isTauri() || !this.active) return;
		try { await openWorkspaceExternally(this.active.path); }
		catch (error) { this.error = error instanceof Error ? error.message : 'Could not open this item.'; }
	}

	async convertActive(target: 'json' | 'csv', inferTypes = false, sourceDelimiter?: string, sourceContent?: string) {
		if (!isTauri() || !this.active || this.active.content === null) return;
		try {
			const content = sourceContent ?? this.active.content;
			const result = target === 'json'
				? await convertCsvToJson(content, sourceDelimiter ?? (this.active.path.endsWith('.tsv') ? '\t' : ','), inferTypes)
				: await convertJsonToCsv(content);
			const base = this.active.path.replace(/\.(csv|tsv|json)$/i, '');
			const preferred = `${base}.${result.extension}`;
			// A conversion is a new document. Never replace an existing sibling just
			// because someone runs the same conversion twice.
			const path = this.items.some((item) => item.path === preferred)
				? `${base}-converted-${Date.now()}.${result.extension}`
				: preferred;
			await writeWorkspaceFile(path, result.content);
			await this.init();
			await this.open(path);
			this.notice = `Created ${path}.`;
		} catch (error) {
			this.error = error instanceof Error ? error.message : 'Conversion failed.';
		}
	}
}

export const workspace = new Workspace();
