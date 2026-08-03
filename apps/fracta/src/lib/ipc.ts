import { invoke } from '@tauri-apps/api/core';

/** True inside the Tauri webview, false in a plain `vite dev` browser tab. */
export const isTauri = (): boolean =>
	typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export interface EntrySummary {
	id: string;
	title: string;
	category: string;
	tags: string[];
	created_at: number;
	updated_at: number;
	excerpt: string;
}

export interface Entry {
	id: string;
	title: string;
	category: string;
	tags: string[];
	body: string;
	created_at: number;
	updated_at: number;
}

export interface VaultStatus {
	configured: boolean;
	path: string | null;
}

export const vaultStatus = (): Promise<VaultStatus> => invoke('vault_status');

export const pickVault = (): Promise<string | null> => invoke('pick_vault');

export const listEntries = (): Promise<EntrySummary[]> => invoke('list_entries');

export const readEntry = (id: string): Promise<Entry> => invoke('read_entry', { id });

export const createEntry = (): Promise<string> => invoke('create_entry');

export const writeEntry = (
	id: string,
	title: string,
	category: string,
	tags: string[],
	body: string
): Promise<Entry> => invoke('write_entry', { id, title, category, tags, body });

export const deleteEntry = (id: string): Promise<void> => invoke('delete_entry', { id });

// --- Recursive workspace ------------------------------------------------------

export type WorkspaceFileKind = 'folder' | 'markdown' | 'text' | 'csv' | 'json' | 'pdf' | 'docx' | 'asset';

export interface WorkspaceItem {
	path: string;
	name: string;
	kind: WorkspaceFileKind;
	size: number;
	modified_at: number;
}

export interface WorkspaceFile {
	path: string;
	kind: WorkspaceFileKind;
	content: string | null;
	read_only: boolean;
	size: number;
	modified_at: number;
	/** Detected on-disk encoding; Fracta preserves it when saving. */
	encoding: 'utf-8' | 'utf-8-bom' | 'utf-16le' | 'utf-16be' | null;
	/** Newline convention observed in the opened file. */
	newline: 'lf' | 'crlf' | 'cr' | null;
}

export interface CsvConversion {
	content: string;
	extension: string;
}

export interface LinkReport {
	path: string;
	forward: string[];
	backlinks: string[];
	dead: string[];
	orphan: boolean;
	suggestions: string[];
}

export interface GraphNode {
	path: string;
	incoming: number;
	outgoing: number;
	orphan: boolean;
}

export interface GraphReport {
	nodes: GraphNode[];
	edges: [string, string][];
	hubs: string[];
	orphans: string[];
}

export interface DocumentBlock {
	kind: 'heading' | 'paragraph' | 'list_item' | 'table';
	level: number | null;
	text: string;
	href?: string;
	rows?: string[][];
	images?: string[];
}

export interface DocumentPreview {
	path: string;
	kind: WorkspaceFileKind;
	text: string;
	pages: number | null;
	page_texts: string[] | null;
	docx_blocks: DocumentBlock[] | null;
	warning: string | null;
}

export interface WorkspaceSearchHit {
	path: string;
	title: string;
	excerpt: string;
	kind: WorkspaceFileKind;
	score: number;
}

export interface TerminalResult {
	stdout: string;
	stderr: string;
	status: number | null;
	timed_out: boolean;
}

export interface WorkspaceImageAsset {
	mime: string;
	bytes: number[];
}

export const listWorkspace = (): Promise<WorkspaceItem[]> => invoke('list_workspace');
export const watchWorkspace = (): Promise<void> => invoke('watch_workspace');
export const runWorkspaceTerminal = (command: string): Promise<TerminalResult> =>
	invoke('run_workspace_terminal', { command });
export const printWorkspace = (): Promise<void> => invoke('print_workspace');
export const readWorkspaceFile = (path: string): Promise<WorkspaceFile> =>
	invoke('read_workspace_file', { path });
export const readWorkspacePdfBytes = (path: string): Promise<number[]> =>
	invoke('read_workspace_pdf_bytes', { path });
export const readWorkspaceImageAsset = (path: string): Promise<WorkspaceImageAsset> =>
	invoke('read_workspace_image_asset', { path });
export const readWorkspaceMediaAsset = (path: string): Promise<WorkspaceImageAsset> =>
	invoke('read_workspace_media_asset', { path });
export const readWorkspaceDocxImage = (path: string, archivePath: string): Promise<WorkspaceImageAsset> =>
	invoke('read_workspace_docx_image', { path, archivePath });
export const previewWorkspaceDocument = (path: string): Promise<DocumentPreview> =>
	invoke('preview_workspace_document', { path });
export const writeWorkspaceFile = (path: string, content: string): Promise<WorkspaceFile> =>
	invoke('write_workspace_file', { path, content });
export const createWorkspaceFolder = (path: string): Promise<void> =>
	invoke('create_workspace_folder', { path });
export const moveWorkspacePath = (from: string, to: string): Promise<void> =>
	invoke('move_workspace_path', { from, to });
export const deleteWorkspacePath = (path: string): Promise<void> =>
	invoke('delete_workspace_path', { path });
export const duplicateWorkspacePath = (path: string): Promise<string> =>
	invoke('duplicate_workspace_path', { path });
export const revealWorkspacePath = (path: string): Promise<void> =>
	invoke('reveal_workspace_path', { path });
export const openWorkspaceExternally = (path: string): Promise<void> =>
	invoke('open_workspace_externally', { path });
export const workspaceLinks = (path: string): Promise<LinkReport> =>
	invoke('workspace_links', { path });
export const workspaceGraph = (): Promise<GraphReport> => invoke('workspace_graph');
export const rebuildWorkspaceIndex = (): Promise<number> => invoke('rebuild_workspace_index');
export const searchWorkspace = (query: string): Promise<WorkspaceSearchHit[]> =>
	invoke('search_workspace', { query });
export const convertCsvToJson = (
	content: string,
	delimiter?: string,
	inferTypes = false
): Promise<CsvConversion> => invoke('convert_csv_to_json', { content, delimiter, inferTypes });
export const convertJsonToCsv = (content: string, delimiter?: string): Promise<CsvConversion> =>
	invoke('convert_json_to_csv', { content, delimiter });

// --- Auto-tag rules ---

export interface AppRule {
	bundleId: string;
	appName: string;
	tags: string[];
	active: boolean;
}

export interface ClipboardSource {
	bundleId: string;
	appName: string;
}

export const listAppRules = (): Promise<AppRule[]> => invoke('list_app_rules');

export const upsertAppRule = (rule: AppRule): Promise<AppRule[]> =>
	invoke('upsert_app_rule', { rule });

export const deleteAppRule = (bundleId: string): Promise<AppRule[]> =>
	invoke('delete_app_rule', { bundleId });

export const currentClipboardSource = (): Promise<ClipboardSource | null> =>
	invoke('current_clipboard_source');

export const autotagsNow = (): Promise<string[]> => invoke('autotags_now');

// --- Local GGUF (llama-server) ---

export interface GgufStatus {
	loaded: boolean;
	loading: boolean;
	path: string | null;
	fileName: string | null;
	baseUrl: string | null;
	port: number | null;
	error: string | null;
	serverAvailable: boolean;
	serverPath: string | null;
}

export const ggufStatus = (): Promise<GgufStatus> => invoke('gguf_status');

export const pickGguf = (): Promise<string | null> => invoke('pick_gguf');

export const ggufLoad = (path: string): Promise<GgufStatus> => invoke('gguf_load', { path });

export const ggufUnload = (): Promise<void> => invoke('gguf_unload');
