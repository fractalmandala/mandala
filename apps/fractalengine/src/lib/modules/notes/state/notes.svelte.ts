import {
	createFile,
	readFile,
	writeFile,
	listDirectory,
	selectDownloadDirectory,
	isFilesystemAccessDenied,
	requestDirectoryAccess,
	indexDocuments,
	type FileEntry,
	type IndexDocument,
} from '$lib/ipc';
import { errorMessage } from '$lib/errors';
import { ideState } from '$lib/state/ide.svelte';
import { registerUndoDomain } from '$lib/state/undo.svelte';
import { UndoHistory, compositeUndoDomain } from '$lib/state/undoHistory.svelte';
import { workspaceLayout } from '$lib/state/workspaceLayout.svelte';

const MAX_FILES_PER_ROOT = 500;

const STORAGE_KEY = 'fractalengine:notes';
const NOTES_OPEN_FILE_KEY = 'ide:notes-open-file';
export type NotesLayout = 'sidebar1' | 'sidebar2' | 'sidebar3'

export interface VaultRoot {
	path: string;
	label: string;
}

export interface SavedVault {
	id: string;
	name: string;
	roots: VaultRoot[];
	lastOpenedAt: number;
}

function isFileReference(value: unknown): value is { path: string; name: string } {
	if (!value || typeof value !== 'object') return false;
	const file = value as Record<string, unknown>;
	return typeof file.path === 'string' && !!file.path && typeof file.name === 'string' && !!file.name;
}

function isFileEntry(value: unknown): value is FileEntry {
	if (!isFileReference(value)) return false;
	const entry = value as unknown as Record<string, unknown>;
	return typeof entry.isDir === 'boolean' && typeof entry.size === 'number' && Number.isFinite(entry.size) && entry.size >= 0;
}

function isVaultRoot(value: unknown): value is VaultRoot {
	if (!value || typeof value !== 'object') return false;
	const root = value as Partial<VaultRoot>;
	return typeof root.path === 'string' && !!root.path && typeof root.label === 'string' && !!root.label.trim();
}

// Duplicate root paths crash NotesSidebar1's keyed each block (each_key_duplicate),
// so every path that assigns currentVaultRoots must go through this.
function dedupeRoots(roots: VaultRoot[]): VaultRoot[] {
	const seen = new Set<string>();
	return roots.filter(root => (seen.has(root.path) ? false : (seen.add(root.path), true)));
}

function isSavedVault(value: unknown): value is SavedVault {
	if (!value || typeof value !== 'object') return false;
	const vault = value as Partial<SavedVault>;
	return typeof vault.id === 'string' && !!vault.id && typeof vault.name === 'string' && !!vault.name.trim()
		&& Array.isArray(vault.roots) && vault.roots.length > 0 && vault.roots.every(isVaultRoot)
		&& typeof vault.lastOpenedAt === 'number' && Number.isFinite(vault.lastOpenedAt);
}

interface PersistedLayout {
	sidebar1Collapsed: boolean;
	sidebar2Collapsed: boolean;
	sidebar3Collapsed: boolean;
	sidebar1Expanded: number;
	sidebar2Expanded: number;
	sidebar3Expanded: number;
	editorSplitRatio: number;
}

function loadPersisted(): Partial<PersistedLayout> {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const value: unknown = JSON.parse(raw);
		return value && typeof value === 'object' ? value as Partial<PersistedLayout> : {};
	} catch {
		return {};
	}
}

class NoteState {
	sidebar1Collapsed = $state(false);
	sidebar2Collapsed = $state(false);
	sidebar3Collapsed = $state(true);
	sidebar1Expanded = $state(220);
	sidebar2Expanded = $state(280);
	sidebar3Expanded = $state(360);
	editorSplitRatio = $state(50);
	selectedFilePath = $state('');
	rawContent = $state('');
	saveStatus = $state<'idle' | 'dirty' | 'saving' | 'error'>('idle');
	saveError = $state<string | null>(null);
	loadError = $state<string | null>(null);
	private saveTimer: ReturnType<typeof setTimeout> | null = null;
	private pendingSave: { path: string; content: string } | null = null;
	private openFileRequestId = 0;
	private history = new UndoHistory<PersistedLayout>({
		capture: () => this.layoutSnapshot(),
		restore: (s) => this.restoreLayout(s),
		capacity: 100,
	});

	currentVaultName = $state<string | null>(null);
	currentVaultRoots = $state<VaultRoot[]>([]);
	currentVaultTrees = $state<Record<string, FileEntry[]>>({});
	savedVaults = $state<SavedVault[]>([]);
	vaultError = $state<string | null>(null);
	pendingVaultSavePrompt = $state(false);
	pendingVaultAccessPath = $state<string | null>(null);
	pendingVaultAccessId = $state<string | null>(null);
	vaultSelectedFolderPath = $state<string | null>(null);
	vaultExpandedFolders = $state<string[]>([]);
	vaultExpandedFolderPaths = $state<Record<string, FileEntry[]>>({});

	constructor() {
		const p = loadPersisted();
		this.sidebar1Collapsed = typeof p.sidebar1Collapsed === 'boolean' ? p.sidebar1Collapsed : false;
		this.sidebar2Collapsed = typeof p.sidebar2Collapsed === 'boolean' ? p.sidebar2Collapsed : false;
		this.sidebar3Collapsed = typeof p.sidebar3Collapsed === 'boolean' ? p.sidebar3Collapsed : true;
		if (Number.isFinite(p.sidebar1Expanded)) this.sidebar1Expanded = Math.max(50, Math.min(480, p.sidebar1Expanded!));
		if (Number.isFinite(p.sidebar2Expanded)) this.sidebar2Expanded = Math.max(120, Math.min(780, p.sidebar2Expanded!));
		if (Number.isFinite(p.sidebar3Expanded)) this.sidebar3Expanded = Math.max(200, Math.min(780, p.sidebar3Expanded!));
		if (Number.isFinite(p.editorSplitRatio)) this.editorSplitRatio = Math.max(20, Math.min(80, p.editorSplitRatio!));
		if (typeof localStorage !== 'undefined') {
			this.selectedFilePath = localStorage.getItem(NOTES_OPEN_FILE_KEY) ?? '';
		}
	}

	setCollapsed(panel: NotesLayout, collapsed: boolean): void {
		this.history.transact(() => {
			if (panel === 'sidebar1') this.sidebar1Collapsed = collapsed;
			else if (panel === 'sidebar2') this.sidebar2Collapsed = collapsed;
			else if (panel === 'sidebar3') this.sidebar3Collapsed = collapsed;
			this.persist();
		});
	}

	toggleSidebar1(): void {
		this.history.transact(() => {
			this.sidebar1Collapsed = !this.sidebar1Collapsed;
			this.persist();
		});
	}

	toggleSidebar2(): void {
		this.history.transact(() => {
			this.sidebar2Collapsed = !this.sidebar2Collapsed;
			this.persist();
		});
	}

	toggleSidebar3(): void {
		this.history.transact(() => {
			this.sidebar3Collapsed = !this.sidebar3Collapsed;
			this.persist();
		});
	}

	setSidebarWidth(panel: NotesLayout, width: number): void {
		if (!Number.isFinite(width)) return;
		if (panel === 'sidebar1') this.sidebar1Expanded = Math.max(50, Math.min(480, width));
		else if (panel === 'sidebar2') this.sidebar2Expanded = Math.max(120, Math.min(780, width));
		else if (panel === 'sidebar3') this.sidebar3Expanded = Math.max(200, Math.min(780, width));
		this.persist();
	}

	setEditorSplitRatio(ratio: number): void {
		if (!Number.isFinite(ratio)) return;
		this.editorSplitRatio = Math.max(20, Math.min(80, ratio));
		this.persist();
	}

	private layoutSnapshot(): PersistedLayout {
		return {
			sidebar1Collapsed: this.sidebar1Collapsed,
			sidebar2Collapsed: this.sidebar2Collapsed,
			sidebar3Collapsed: this.sidebar3Collapsed,
			sidebar1Expanded: this.sidebar1Expanded,
			sidebar2Expanded: this.sidebar2Expanded,
			sidebar3Expanded: this.sidebar3Expanded,
			editorSplitRatio: this.editorSplitRatio,
		};
	}

	private restoreLayout(snapshot: PersistedLayout): void {
		Object.assign(this, snapshot);
		this.persist();
	}

	pushUndo(): void {
		this.history.push();
	}

	beginLayoutGesture(): void {
		this.history.beginGesture();
	}

	endLayoutGesture(): void {
		this.history.endGesture();
	}

	undo(): void {
		this.history.undo();
	}

	redo(): void {
		this.history.redo();
	}

	get historyForUndo(): UndoHistory<PersistedLayout> {
		return this.history;
	}

	/**
	 * Compute the vault-relative docId for a note file path.
	 * Returns the relative path from the first matching vault root, or the basename if no root matches.
	 */
	private vaultRelativePath(filePath: string): string {
		for (const root of this.currentVaultRoots) {
			const prefix = root.path.replace(/\/$/, '') + '/';
			if (filePath.startsWith(prefix)) {
				return filePath.substring(prefix.length);
			}
		}
		return filePath.split('/').filter(Boolean).pop() || filePath;
	}

	private async indexNote(filePath: string, content: string): Promise<void> {
		try {
			const docId = this.vaultRelativePath(filePath);
			const title = docId.split('/').pop()?.replace(/\.md$/i, '') || docId;
			const doc: IndexDocument = {
				source: 'note',
				docId,
				title,
				body: content,
				path: filePath,
				updatedAt: Date.now(),
			};
			await indexDocuments([doc]);
		} catch {
			// Indexing failures must never break saving — log once per session at most.
			ideState.addLog('Note indexing failed (search may be stale).', 'info');
		}
	}

	private indexLogThrottle = false;

	private async bulkIndexVaultRoot(rootPath: string): Promise<void> {
		try {
			const docs: IndexDocument[] = [];
			let count = 0;
			const walk = async (dir: string): Promise<void> => {
				if (count >= MAX_FILES_PER_ROOT) return;
				let entries: FileEntry[];
				try {
					entries = await listDirectory(dir);
				} catch {
					return;
				}
				for (const entry of entries) {
					if (count >= MAX_FILES_PER_ROOT) break;
					if (entry.isDir) {
						await walk(entry.path);
					} else if (entry.name.endsWith('.md')) {
						try {
							const content = await readFile(entry.path);
							const docId = this.vaultRelativePath(entry.path);
							const title = entry.name.replace(/\.md$/i, '');
							docs.push({
								source: 'note',
								docId,
								title,
								body: content,
								path: entry.path,
								updatedAt: Date.now(),
							});
							count++;
						} catch {
							// Skip files that can't be read
						}
					}
				}
			};
			await walk(rootPath);
			if (count >= MAX_FILES_PER_ROOT && !this.indexLogThrottle) {
				this.indexLogThrottle = true;
				ideState.addLog(`Note indexing capped at ${MAX_FILES_PER_ROOT} files per vault root.`, 'info');
			}
			if (docs.length > 0) {
				await indexDocuments(docs);
			}
		} catch {
			if (!this.indexLogThrottle) {
				this.indexLogThrottle = true;
				ideState.addLog('Bulk note indexing failed.', 'info');
			}
		}
	}

	async openFile(filePath: string): Promise<boolean> {
		const requestId = ++this.openFileRequestId;
		// Flush any pending edit to the file we're leaving *before* switching, so it
		// (a) never lands on the new file's path and (b) doesn't just get dropped.
		if (!(await this.flushPendingSave()) || requestId !== this.openFileRequestId) return false;
		try {
			const content = await readFile(filePath);
			if (requestId !== this.openFileRequestId) return false;
			this.selectedFilePath = filePath;
			this.rawContent = content;
			this.loadError = null;
			this.persistOpenFilePath();
			return true;
		} catch (e) {
			if (requestId !== this.openFileRequestId) return false;
			this.loadError = `Could not open ${filePath.split('/').pop() ?? 'note'}: ${e instanceof Error ? e.message : String(e)}`;
			return false;
		}
	}

	async createNote(folderPath: string, requestedName: string): Promise<void> {
		const leaf = requestedName.trim().replace(/\.md$/i, '');
		if (!leaf || leaf === '.' || leaf === '..' || /[\\/:]/.test(leaf)) {
			throw new Error('Enter a note name without slashes or path separators.');
		}
		if (!(await this.flushPendingSave())) throw new Error(this.saveError ?? 'Could not save the current note.');
		const path = `${folderPath.replace(/\/$/, '')}/${leaf}.md`;
		await createFile(path, `# ${leaf}\n\n`);
		await this.refreshVaultFolder(folderPath);
		if (!(await this.openFile(path))) throw new Error(this.loadError ?? 'Could not open the new note.');
	}

	handleContentUpdate(md: string): void {
		this.rawContent = md;
		this.saveStatus = 'dirty';
		this.saveError = null;
		if (this.saveTimer) clearTimeout(this.saveTimer);
		// Capture path+content together now, not read live when the timer fires — otherwise
		// a file switch inside the debounce window writes the old content to the new path.
		this.pendingSave = { path: this.selectedFilePath, content: md };
		this.saveTimer = setTimeout(() => {
			void this.flushPendingSave();
		}, 800);
	}

	private async flushPendingSave(): Promise<boolean> {
		if (this.saveTimer) {
			clearTimeout(this.saveTimer);
			this.saveTimer = null;
		}
		const pending = this.pendingSave;
		if (!pending || !pending.path) return true;
		this.saveStatus = 'saving';
		try {
			await writeFile(pending.path, pending.content);
			if (this.pendingSave === pending) this.pendingSave = null;
			this.saveStatus = this.pendingSave ? 'dirty' : 'idle';
			this.saveError = null;
			// Index the saved note for search (must never break saving)
			void this.indexNote(pending.path, pending.content);
			return true;
		} catch (e) {
			// Typing may have queued a newer, cumulative snapshot while this write was
			// in flight. Never replace that newer content with the older failed payload.
			if (this.pendingSave === pending || this.pendingSave === null) this.pendingSave = pending;
			this.saveStatus = 'error';
			this.saveError = `Could not save ${pending.path.split('/').pop() ?? 'note'}: ${e instanceof Error ? e.message : String(e)}`;
			return false;
		}
	}

	async retryPendingSave(): Promise<void> {
		await this.flushPendingSave();
	}

	get hasPendingChanges(): boolean {
		return this.pendingSave !== null || this.saveStatus === 'dirty' || this.saveStatus === 'saving' || this.saveStatus === 'error';
	}

	async flushPendingChanges(): Promise<boolean> {
		return this.flushPendingSave();
	}

	persistOpenFilePath(): void {
		if (typeof localStorage === 'undefined') return;
		if (this.selectedFilePath) {
			localStorage.setItem(NOTES_OPEN_FILE_KEY, this.selectedFilePath);
		} else {
			localStorage.removeItem(NOTES_OPEN_FILE_KEY);
		}
	}

	requestSaveVaultFromMenu(): void {
		if (this.currentVaultRoots.length === 0) {
			ideState.addLog('Open a vault folder before saving.', 'error');
			return;
		}
		this.pendingVaultSavePrompt = true;
	}

	async openVaultFromFolder(): Promise<void> {
		const path = await selectDownloadDirectory();
		if (!path) {
			ideState.addLog('Vault folder selection requires desktop mode.', 'info');
			return;
		}
		const before = ideState.captureSnapshot();
		ideState.pushUndo();
		try {
			this.vaultError = null;
			const label = path.split('/').filter(Boolean).pop() || path;
			this.currentVaultName = null;
			this.currentVaultRoots = [{ path, label }];
			await this.loadVaultTree(path);
			this.persistCurrentVault();
			void this.bulkIndexVaultRoot(path);
			ideState.addLog(`Opened vault: ${label}`, 'success');
		} catch (error) {
			ideState.rollbackToSnapshot(before);
			ideState.addLog(`Failed to open vault: ${errorMessage(error)}`, 'error');
		}
	}

	async addFolderToVault(): Promise<void> {
		const path = await selectDownloadDirectory();
		if (!path) {
			ideState.addLog('Vault folder selection requires desktop mode.', 'info');
			return;
		}
		if (this.currentVaultRoots.some(r => r.path === path)) {
			ideState.addLog('That folder is already part of the current vault.', 'info');
			return;
		}
		const before = ideState.captureSnapshot();
		ideState.pushUndo();
		try {
			this.vaultError = null;
			const label = path.split('/').filter(Boolean).pop() || path;
			const isFirstRoot = this.currentVaultRoots.length === 0;
			// If no vault is open, behave like openVaultFromFolder.
			if (isFirstRoot) this.currentVaultName = null;
			this.currentVaultRoots = [...this.currentVaultRoots, { path, label }];
			await this.loadVaultTree(path);
			if (isFirstRoot) await this.autoExpandAndSelect(this.currentVaultRoots);
			this.persistCurrentVault();
			void this.bulkIndexVaultRoot(path);
			ideState.addLog(`Added folder to vault: ${label}`, 'success');
		} catch (error) {
			ideState.rollbackToSnapshot(before);
			ideState.addLog(`Failed to add vault folder: ${errorMessage(error)}`, 'error');
		}
	}

	saveCurrentAsVault(name: string): void {
		const trimmed = name.trim();
		if (!trimmed) {
			ideState.addLog('Vault name cannot be empty.', 'error');
			return;
		}
		if (this.currentVaultRoots.length === 0) {
			ideState.addLog('Open a vault folder before saving.', 'error');
			return;
		}
		if (this.savedVaults.some(v => v.name === trimmed)) {
			ideState.addLog(`Vault name "${trimmed}" is already taken.`, 'error');
			return;
		}
		ideState.pushUndo();
		const newVault: SavedVault = {
			id: crypto.randomUUID(),
			name: trimmed,
			roots: this.currentVaultRoots.map(r => ({ ...r })),
			lastOpenedAt: Date.now()
		};
		this.savedVaults = [...this.savedVaults, newVault];
		this.currentVaultName = trimmed;
		this.persistSavedVaults();
		this.persistCurrentVault();
		ideState.addLog(`Vault "${trimmed}" saved.`, 'success');
	}

	async loadSavedVault(id: string): Promise<void> {
		const vault = this.savedVaults.find(v => v.id === id);
		if (!vault) {
			ideState.addLog('Vault not found.', 'error');
			return;
		}
		ideState.pushUndo();
		this.vaultError = null;
		this.currentVaultName = vault.name;
		this.currentVaultRoots = dedupeRoots(vault.roots.map(r => ({ ...r })));
		vault.lastOpenedAt = Date.now();
		this.persistSavedVaults();
		this.persistCurrentVault();

		const loadResults = await Promise.all(
			vault.roots.map(r =>
				this.loadVaultTree(r.path).then(
					() => ({ path: r.path, error: null as unknown }),
					error => ({ path: r.path, error })
				)
			)
		);
		const denied = loadResults.find(result => result.error && isFilesystemAccessDenied(result.error));
		if (denied) {
			this.pendingVaultAccessId = id;
			this.pendingVaultAccessPath = denied.path;
			return;
		}
		const failures = loadResults.filter((result): result is { path: string; error: unknown } => result.error !== null);
		if (failures.length > 0) {
			this.vaultError = `Could not open folder: ${failures.map(result => `${result.path} (${errorMessage(result.error)})`).join(', ')}`;
			return;
		}
		await this.autoExpandAndSelect(this.currentVaultRoots);
		// Bulk-index all vault roots
		for (const root of vault.roots) {
			void this.bulkIndexVaultRoot(root.path);
		}
		ideState.addLog(`Loaded vault: ${vault.name}`, 'success');
	}

	async grantPendingVaultAccess(): Promise<void> {
		const vaultId = this.pendingVaultAccessId;
		const requestedPath = this.pendingVaultAccessPath;
		if (!vaultId || !requestedPath) return;
		try {
			const selectedPath = await requestDirectoryAccess(requestedPath);
			if (!selectedPath) return;
			if (selectedPath !== requestedPath && !requestedPath.startsWith(`${selectedPath}/`)) {
				this.vaultError = `Access was granted to "${selectedPath}", which does not include "${requestedPath}". Choose the saved vault folder or one of its parent folders.`;
				return;
			}
			this.pendingVaultAccessId = null;
			this.pendingVaultAccessPath = null;
			await this.loadSavedVault(vaultId);
		} catch (error) {
			this.vaultError = `Could not grant folder access: ${errorMessage(error)}`;
		}
	}

	cancelPendingVaultAccess(): void {
		this.pendingVaultAccessId = null;
		this.pendingVaultAccessPath = null;
	}

	deleteSavedVault(id: string): void {
		const vault = this.savedVaults.find(v => v.id === id);
		if (!vault) return;
		ideState.pushUndo();
		this.savedVaults = this.savedVaults.filter(v => v.id !== id);
		this.persistSavedVaults();
		ideState.addLog(`Removed saved vault "${vault.name}".`, 'info');
	}

	clearSavedVaults(): void {
		if (this.savedVaults.length === 0) return;
		ideState.pushUndo();
		this.savedVaults = [];
		this.persistSavedVaults();
		ideState.addLog('Cleared all saved vaults.', 'info');
	}

	async loadVaultTree(path: string): Promise<void> {
		try {
			const entries = await listDirectory(path);
			this.currentVaultTrees = { ...this.currentVaultTrees, [path]: entries };
			this.vaultError = null;
		} catch (error: unknown) {
			this.vaultError = `Could not read "${path}": ${errorMessage(error)}`;
			const { [path]: _stale, ...rest } = this.currentVaultTrees;
			void _stale;
			this.currentVaultTrees = rest;
			throw error;
		}
	}

	async toggleVaultFolderExpanded(path: string): Promise<void> {
		if (this.vaultExpandedFolders.includes(path)) {
			this.vaultExpandedFolders = this.vaultExpandedFolders.filter(p => p !== path);
			this.persistVaultTreeState();
			return;
		}
		const roots = this.currentVaultRoots.map(root => root.path).join('\n');
		if (!this.vaultExpandedFolderPaths[path]) {
			try {
				const children = await listDirectory(path);
				if (roots !== this.currentVaultRoots.map(root => root.path).join('\n')) return;
				this.vaultExpandedFolderPaths = { ...this.vaultExpandedFolderPaths, [path]: children };
			} catch (error: unknown) {
				this.vaultError = `Could not read "${path}": ${errorMessage(error)}`;
				return;
			}
		}
		if (!this.vaultExpandedFolders.includes(path)) this.vaultExpandedFolders = [...this.vaultExpandedFolders, path];
		this.persistVaultTreeState();
	}

	async refreshVaultFolder(path: string): Promise<void> {
		const children = await listDirectory(path);
		this.vaultExpandedFolderPaths = { ...this.vaultExpandedFolderPaths, [path]: children };
		this.currentVaultTrees = { ...this.currentVaultTrees, [path]: children };
	}

	selectVaultFolder(path: string | null): void {
		this.vaultSelectedFolderPath = path;
		this.persistVaultTreeState();
	}

	private async autoSelectFirstLeafFolder(rootPath: string, visited: Set<string> = new Set(), depth = 0): Promise<void> {
		if (depth > 8 || visited.has(rootPath)) {
			this.selectVaultFolder(rootPath);
			return;
		}
		visited.add(rootPath);
		let entries: FileEntry[];
		try {
			entries = await listDirectory(rootPath);
		} catch {
			this.selectVaultFolder(rootPath);
			return;
		}
		this.currentVaultTrees = { ...this.currentVaultTrees, [rootPath]: entries };
		const subdirs = entries.filter(e => e.isDir);
		if (subdirs.length === 0) {
			this.selectVaultFolder(rootPath);
			return;
		}
		if (!this.vaultExpandedFolders.includes(rootPath)) this.vaultExpandedFolders = [...this.vaultExpandedFolders, rootPath];
		this.vaultExpandedFolderPaths = { ...this.vaultExpandedFolderPaths, [rootPath]: entries };
		await this.autoSelectFirstLeafFolder(subdirs[0].path, visited, depth + 1);
	}

	async autoExpandAndSelect(roots: VaultRoot[]): Promise<void> {
		this.vaultExpandedFolders = [];
		this.vaultExpandedFolderPaths = {};
		this.vaultSelectedFolderPath = null;
		if (roots.length === 0) return;
		for (const root of roots) await this.autoSelectFirstLeafFolder(root.path);
		this.persistVaultTreeState();
	}

	persistVaultTreeState(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const payload = {
				selectedFolderPath: this.vaultSelectedFolderPath,
				expandedFolders: this.vaultExpandedFolders,
				expandedFolderPaths: this.vaultExpandedFolderPaths
			};
			localStorage.setItem('ide:vault-tree-state', JSON.stringify(payload));
		} catch {
			// Quota exceeded or storage unavailable — view-state persistence is best-effort.
		}
	}

	restoreVaultTreeState(): void {
		if (typeof localStorage === 'undefined') return;
		const raw = localStorage.getItem('ide:vault-tree-state');
		if (!raw) return;
		try {
			const parsed = JSON.parse(raw);
			this.vaultSelectedFolderPath = typeof parsed?.selectedFolderPath === 'string' ? parsed.selectedFolderPath : null;
			this.vaultExpandedFolders = Array.isArray(parsed?.expandedFolders)
				? parsed.expandedFolders.filter((p: unknown) => typeof p === 'string')
				: [];
			this.vaultExpandedFolderPaths = {};
			if (parsed?.expandedFolderPaths && typeof parsed.expandedFolderPaths === 'object') {
				for (const [path, entries] of Object.entries(parsed.expandedFolderPaths)) {
					if (Array.isArray(entries) && entries.every(isFileEntry)) this.vaultExpandedFolderPaths[path] = entries;
				}
			}
		} catch {
			this.vaultSelectedFolderPath = null;
			this.vaultExpandedFolders = [];
			this.vaultExpandedFolderPaths = {};
		}
	}

	persistCurrentVault(): void {
		if (typeof localStorage === 'undefined') return;
		if (this.currentVaultRoots.length === 0) {
			localStorage.removeItem('ide:current-vault');
			return;
		}
		localStorage.setItem('ide:current-vault', JSON.stringify({ name: this.currentVaultName, roots: this.currentVaultRoots }));
	}

	persistSavedVaults(): void {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem('ide:saved-vaults', JSON.stringify(this.savedVaults));
	}

	loadSavedVaults(): void {
		if (typeof localStorage === 'undefined') return;
		const saved = localStorage.getItem('ide:saved-vaults');
		if (saved) {
			try {
				const parsed: unknown = JSON.parse(saved);
				this.savedVaults = Array.isArray(parsed) ? parsed.filter(isSavedVault) : [];
			} catch {
				this.savedVaults = [];
			}
		}
	}

	async restoreCurrentVault(): Promise<void> {
		if (typeof localStorage === 'undefined') return;
		const raw = localStorage.getItem('ide:current-vault');
		if (!raw) {
			this.restoreVaultTreeState();
			return;
		}
		try {
			const parsed: unknown = JSON.parse(raw);
			if (!parsed || typeof parsed !== 'object') throw new Error('Invalid current vault record.');
			const record = parsed as Record<string, unknown>;
			const roots = Array.isArray(record.roots) ? dedupeRoots(record.roots.filter(isVaultRoot)) : [];
			if (roots.length === 0) throw new Error('Current vault has no valid roots.');
			this.currentVaultName = typeof record.name === 'string' ? record.name : null;
			this.currentVaultRoots = roots;
			this.restoreVaultTreeState();
			const loadResults = await Promise.all(roots.map((r: VaultRoot) => this.loadVaultTree(r.path).then(() => null as string | null, () => r.path as string | null)));
			const missing = loadResults.filter((p: string | null): p is string => p !== null);
			if (missing.length > 0) {
				this.vaultError = `Folder no longer exists: ${missing.join(', ')}`;
				if (this.vaultSelectedFolderPath && missing.includes(this.vaultSelectedFolderPath)) {
					this.vaultSelectedFolderPath = null;
					this.persistVaultTreeState();
				}
			}
			// Bulk-index all vault roots
			for (const root of roots) {
				void this.bulkIndexVaultRoot(root.path);
			}
		} catch (error: unknown) {
			ideState.addLog(`Failed to restore vault: ${errorMessage(error)}`, 'error');
			localStorage.removeItem('ide:current-vault');
		}
	}

	restoreFromWorkspaceSnapshot(fields: { currentVaultName: string | null; currentVaultRoots: string; savedVaults: string }): void {
		this.currentVaultName = fields.currentVaultName ?? null;
		try {
			const parsedRoots = JSON.parse(fields.currentVaultRoots || '[]');
			this.currentVaultRoots = Array.isArray(parsedRoots) ? dedupeRoots(parsedRoots.filter(isVaultRoot)) : [];
		} catch {
			this.currentVaultRoots = [];
		}
		try {
			const parsedSaved = JSON.parse(fields.savedVaults || '[]');
			this.savedVaults = Array.isArray(parsedSaved) ? parsedSaved : [];
		} catch {
			this.savedVaults = [];
		}
		this.persistSavedVaults();
		this.persistCurrentVault();
	}

	persist(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const snapshot = this.layoutSnapshot();
			localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
		} catch {
			// Ignore storage failures.
		}
	}
}

export const notes = new NoteState();

ideState.registerVaultBridge({
	capture: () => ({
		currentVaultName: notes.currentVaultName,
		currentVaultRoots: JSON.stringify(notes.currentVaultRoots),
		savedVaults: JSON.stringify(notes.savedVaults),
	}),
	restore: (fields) => notes.restoreFromWorkspaceSnapshot(fields),
	loadSavedVaults: () => notes.loadSavedVaults(),
	restoreCurrentVault: () => notes.restoreCurrentVault(),
});

registerUndoDomain(compositeUndoDomain('notes', [notes.historyForUndo, workspaceLayout.historyForUndo('notes')], notes.historyForUndo));
