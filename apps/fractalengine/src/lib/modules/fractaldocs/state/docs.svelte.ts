import { listDirectory, readFile, type FileEntry } from '$lib/ipc';
import { ideState } from '$lib/state/ide.svelte';
import { errorMessage } from '$lib/errors';
import { registerUndoDomain } from '$lib/state/undo.svelte';
import { UndoHistory, compositeUndoDomain } from '$lib/state/undoHistory.svelte';
import { workspaceLayout } from '$lib/state/workspaceLayout.svelte';
import { sanitizeHtml } from '$lib/sanitizeHtml';
import { marked } from 'marked';

const LAYOUT_KEY = 'fractalengine:docs-layout';

export const DOCS_PANEL_LIMITS = {
	left: { min: 200, max: 600, initial: 260 },
	right: { min: 200, max: 600, initial: 240 },
} as const;

export interface TocEntry {
	depth: number;
	text: string;
	id: string;
}

export interface DocsFileEntry extends FileEntry {
	children?: DocsFileEntry[];
	title?: string;
}

interface DocsLayoutSnapshot {
	leftWidth: number;
	rightWidth: number;
}

export interface RenderedDocsMarkdown {
	html: string;
	toc: TocEntry[];
}

function clamp(value: number, range: { min: number; max: number }): number {
	return Math.min(range.max, Math.max(range.min, value));
}

function decodeHtmlEntities(value: string): string {
	return value
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");
}

export function plainTextFromInlineHtml(value: string): string {
	return decodeHtmlEntities(value.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}

export function slugifyHeading(value: string): string {
	const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
	return slug || 'section';
}

export function formatDocsFileName(name: string): string {
	const stem = name.replace(/\.md$/i, '');
	if (stem.toLowerCase() === 'index') return 'Overview';
	return stem.replace(/[-_]+/g, ' ');
}

export function renderDocsMarkdown(markdown: string): RenderedDocsMarkdown {
	const toc: TocEntry[] = [];
	const headingCounts = new Map<string, number>();
	const renderer = new marked.Renderer();

	renderer.heading = ({ tokens, depth }) => {
		const inlineHtml = renderer.parser.parseInline(tokens);
		const text = plainTextFromInlineHtml(inlineHtml);
		const baseId = slugifyHeading(text);
		const occurrence = headingCounts.get(baseId) ?? 0;
		headingCounts.set(baseId, occurrence + 1);
		const id = occurrence === 0 ? baseId : `${baseId}-${occurrence}`;
		toc.push({ depth, text, id });
		return `<h${depth} id="${id}">${inlineHtml}</h${depth}>`;
	};

	return {
		html: sanitizeHtml.markdown(marked.parse(markdown, { renderer }) as string),
		toc,
	};
}

function readLayout(): Partial<DocsLayoutSnapshot> {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = localStorage.getItem(LAYOUT_KEY);
		if (!raw) return {};
		const value: unknown = JSON.parse(raw);
		return value && typeof value === 'object' && !Array.isArray(value)
			? value as Partial<DocsLayoutSnapshot>
			: {};
	} catch {
		return {};
	}
}

function isInsidePath(path: string, root: string): boolean {
	return path === root || path.startsWith(`${root}/`);
}

class FractalDocsState {
	activeFilePath = $state<string | null>(null);
	fileTree = $state<DocsFileEntry[]>([]);
	fileContent = $state('');
	renderedHtml = $state('');
	toc = $state<TocEntry[]>([]);
	isInitializing = $state(false);
	loadingFilePath = $state<string | null>(null);
	error = $state<string | null>(null);
	docsRoot = $state<string | null>(null);
	leftWidth = $state<number>(DOCS_PANEL_LIMITS.left.initial);
	rightWidth = $state<number>(DOCS_PANEL_LIMITS.right.initial);
	private initializeRequestId = 0;
	private loadRequestId = 0;
	private history = new UndoHistory<DocsLayoutSnapshot>({
		capture: () => this.layoutSnapshot(),
		restore: (snapshot) => this.restoreLayout(snapshot),
	});

	constructor() {
		const layout = readLayout();
		this.leftWidth = typeof layout.leftWidth === 'number' && Number.isFinite(layout.leftWidth)
			? clamp(layout.leftWidth, DOCS_PANEL_LIMITS.left)
			: DOCS_PANEL_LIMITS.left.initial;
		this.rightWidth = typeof layout.rightWidth === 'number' && Number.isFinite(layout.rightWidth)
			? clamp(layout.rightWidth, DOCS_PANEL_LIMITS.right)
			: DOCS_PANEL_LIMITS.right.initial;
	}

	async init(rootPath = ideState.rootPath): Promise<void> {
		const requestId = ++this.initializeRequestId;
		this.loadRequestId++;
		this.isInitializing = true;
		this.loadingFilePath = null;
		this.error = null;
		this.fileTree = [];
		this.fileContent = '';
		this.renderedHtml = '';
		this.toc = [];
		this.activeFilePath = null;

		const normalizedRoot = rootPath.replace(/\/$/, '');
		if (!normalizedRoot) {
			this.docsRoot = null;
			this.error = 'Open a workspace to view its documentation.';
			this.isInitializing = false;
			return;
		}

		const docsRoot = `${normalizedRoot}/docs`;
		this.docsRoot = docsRoot;
		try {
			const fileTree = await this.recursiveList(docsRoot, requestId);
			if (requestId !== this.initializeRequestId) return;
			this.fileTree = fileTree;
			await this.loadFile(`${docsRoot}/INDEX.md`, requestId);
		} catch (error) {
			if (requestId !== this.initializeRequestId) return;
			this.error = `Could not load workspace documentation: ${errorMessage(error)}`;
		} finally {
			if (requestId === this.initializeRequestId) this.isInitializing = false;
		}
	}

	async loadFile(path: string, initializationRequestId?: number): Promise<void> {
		if (!this.docsRoot || !isInsidePath(path, this.docsRoot)) {
			this.error = 'That document is outside the active workspace documentation folder.';
			return;
		}

		const requestId = ++this.loadRequestId;
		this.loadingFilePath = path;
		this.error = null;
		try {
			const content = await readFile(path);
			if (requestId !== this.loadRequestId || initializationRequestId !== undefined && initializationRequestId !== this.initializeRequestId) return;
			const rendered = renderDocsMarkdown(content);
			this.activeFilePath = path;
			this.fileContent = content;
			this.renderedHtml = rendered.html;
			this.toc = rendered.toc;
		} catch (error) {
			if (requestId !== this.loadRequestId || initializationRequestId !== undefined && initializationRequestId !== this.initializeRequestId) return;
			this.error = `Could not load this document: ${errorMessage(error)}`;
		} finally {
			if (requestId === this.loadRequestId) this.loadingFilePath = null;
		}
	}

	cancelPending(): void {
		this.initializeRequestId++;
		this.loadRequestId++;
		this.isInitializing = false;
		this.loadingFilePath = null;
	}

	setPanelWidth(panel: 'left' | 'right', width: number): void {
		if (!Number.isFinite(width)) return;
		if (panel === 'left') this.leftWidth = clamp(width, DOCS_PANEL_LIMITS.left);
		else this.rightWidth = clamp(width, DOCS_PANEL_LIMITS.right);
		this.persistLayout();
	}

	beginResizeGesture(): void {
		this.history.beginGesture();
	}

	endResizeGesture(): void {
		this.history.endGesture();
	}

	pushUndo(): void {
		this.history.push();
	}

	undo(): void {
		this.history.undo();
	}

	redo(): void {
		this.history.redo();
	}

	private layoutSnapshot(): DocsLayoutSnapshot {
		return { leftWidth: this.leftWidth, rightWidth: this.rightWidth };
	}

	private restoreLayout(snapshot: DocsLayoutSnapshot): void {
		this.leftWidth = clamp(snapshot.leftWidth, DOCS_PANEL_LIMITS.left);
		this.rightWidth = clamp(snapshot.rightWidth, DOCS_PANEL_LIMITS.right);
		this.persistLayout();
	}

	private persistLayout(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(LAYOUT_KEY, JSON.stringify(this.layoutSnapshot()));
		} catch {
			// Persistence is best effort; resizing remains usable when storage is unavailable.
		}
	}

	private async recursiveList(path: string, requestId: number): Promise<DocsFileEntry[]> {
		const entries = await listDirectory(path);
		const visibleEntries = entries.filter((entry) => !entry.name.startsWith('.'));
		const mapped = await Promise.all(visibleEntries.map(async (entry): Promise<DocsFileEntry | null> => {
			if (requestId !== this.initializeRequestId) return null;
			if (entry.isDir) {
				try {
					const children = await this.recursiveList(entry.path, requestId);
					return children.length > 0
						? { ...entry, title: this.folderTitle(entry.name), children }
						: null;
				} catch {
					return null;
				}
			}
			return entry.name.toLowerCase().endsWith('.md')
				? { ...entry, title: formatDocsFileName(entry.name) }
				: null;
		}));

		return mapped
			.filter((entry): entry is DocsFileEntry => entry !== null)
			.sort((a, b) => a.isDir === b.isDir ? a.name.localeCompare(b.name) : a.isDir ? -1 : 1);
	}

	private folderTitle(name: string): string {
		const titles: Record<string, string> = {
			adr: 'Architecture',
			areas: 'Areas',
			design: 'Design',
			guides: 'Guides',
			plans: 'Plans',
		};
		return titles[name] ?? formatDocsFileName(name);
	}

	get historyForUndo(): UndoHistory<DocsLayoutSnapshot> {
		return this.history;
	}
}

export const docsState = new FractalDocsState();

registerUndoDomain(compositeUndoDomain('docs', [docsState.historyForUndo, workspaceLayout.historyForUndo('docs')], docsState.historyForUndo));
