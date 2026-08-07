// fractalMedia shared domain types — FROZEN Phase 0 contract.
// Both the UI stream and the data/engine stream build against these shapes.
// A needed change here is a blocker to report, not an edit to make.
// See docs/plans/media-module-plan.md §4.

export type MediaKind = 'image' | 'video' | 'gif';

// Single source of truth for media classification (D5). The Rust walker mirrors
// this table; tests/unit/media-engine.test.ts asserts against this constant.
export const MEDIA_EXTENSIONS: Record<MediaKind, string[]> = {
	image: ['png', 'jpg', 'jpeg', 'webp', 'avif', 'heic', 'svg', 'ico', 'bmp', 'tiff'],
	gif: ['gif'],
	video: ['mp4', 'mov', 'webm', 'mkv', 'm4v'],
};

export function mediaKindForExtension(ext: string): MediaKind | null {
	const lower = ext.toLowerCase();
	for (const kind of Object.keys(MEDIA_EXTENSIONS) as MediaKind[]) {
		if (MEDIA_EXTENSIONS[kind].includes(lower)) return kind;
	}
	return null;
}

export interface MediaLibraryInfo {
	basePath: string;        // absolute path of the library root
}

export interface MediaFolder {
	path: string;            // library-relative ('' = root)
	name: string;
	children: MediaFolder[];
	mediaCount: number;      // direct children only
}

export interface MediaItem {
	id: string;              // app-assigned ULID; permanent identity
	relPath: string;         // library-relative current location
	name: string;
	kind: MediaKind;
	ext: string;
	size: number;            // bytes
	addedMs: number;
	modifiedMs: number;
	width?: number;
	height?: number;
	durationMs?: number;     // video only, filled lazily via D4
	thumbnail?: string;      // asset/cache URL, filled lazily
	tags: string[];
	pinned: boolean;
}

export type MediaSmartSection = 'all' | 'recent' | 'untagged' | 'pinned';

export type MediaScope =
	| { type: 'folder'; path: string }            // library-relative
	| { type: 'section'; section: MediaSmartSection }
	| { type: 'tag'; tag: string };

export type MediaSort = 'name' | 'added' | 'modified' | 'size' | 'kind';

export interface MediaQuery {
	scope: MediaScope;
	sort: MediaSort;
	descending: boolean;
	kinds?: MediaKind[];     // filter; undefined = all
}

export type MediaImportMode = 'copy' | 'move';

export interface MediaImportProgress {
	importId: string;
	done: number;            // files completed
	total: number;           // media files discovered
	skipped: number;         // non-media files ignored
	currentName: string;
	finished: boolean;
	error?: string;          // e.g. 'insufficient-disk-space', 'cancelled'
}

export interface MediaTag {
	tag: string;
	count: number;
}

export type MediaFsEventKind = 'created' | 'removed' | 'renamed' | 'modified';

export interface MediaFsEvent {
	kind: MediaFsEventKind;
	relPath: string;
	newRelPath?: string;     // renamed only
	isDirectory: boolean;
}
