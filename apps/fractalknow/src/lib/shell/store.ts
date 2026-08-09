import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';
import {
	setPreferredActivePanel,
	setPreferredActiveTarget,
	setPreferredEditorMode,
	setPreferredRightPanelOpen,
	setPreferredRightPanelView,
	setPreferredRightPanelWidth,
	setPreferredSidebarOpen,
	setPreferredSidebarPinned,
	setPreferredTerminalOpen,
	shellPreferences,
} from './preferences';
import { openDocument } from './documents';
import { setProjectFromFolder } from './projects';
import {
	applyToggle as applySidebarPinToggle,
	readPins as readSidebarPins,
	resolveEffectiveState as resolveSidebarEffectiveState,
	resolvePartition as resolveSidebarPartition,
	type SidebarPartition,
	type StoredSidebarPins,
} from './sidebar-pins';
import type {
	DialogKind,
	DocumentTarget,
	DocumentTargetKind,
	EditorMode,
	RightPanelView,
	ShellPanel,
	ShellState,
} from './types';

export type NavigationState = {
	backStack: DocumentTarget[];
	forwardStack: DocumentTarget[];
	lastAction: 'open' | 'back' | 'forward' | 'replace' | null;
};

export const initialTarget: DocumentTarget = {
	kind: 'migration',
	path: '/migration',
	title: 'Migration Plan',
};

const preferences = get(shellPreferences);

// Partition-aware sidebar state (port of the reference app's
// sidebar-pin-store resolveEffectiveState): the viewport is split at 1024px
// into 'above'/'below' partitions, each with its own persisted pin.
let currentSidebarPartition: SidebarPartition = browser
	? resolveSidebarPartition(window.innerWidth, 'left')
	: 'above';

let sidebarPins: StoredSidebarPins = readSidebarPins();
// Migration: before the partition-aware pin store existed, the open state
// lived in shellPreferences.sidebarOpen. Seed the 'above' partition from it
// so existing users keep their persisted layout.
if (!sidebarPins.left?.above && !sidebarPins.left?.below) {
	sidebarPins = {
		...sidebarPins,
		left: { ...sidebarPins.left, above: preferences.sidebarOpen ? 'open' : 'collapsed' },
	};
}

function resolveSidebarOpen(pinned: boolean): boolean {
	if (pinned) return true;
	return resolveSidebarEffectiveState('left', currentSidebarPartition, sidebarPins) === 'open';
}

const preferredTarget = targetFromHash(browser ? window.location.hash : '') ?? preferences.activeTarget ?? initialTarget;
const preferredPanel: ShellPanel =
	preferredTarget.kind === 'migration' ? 'migration' : preferences.activePanel;

if (preferredTarget.path !== initialTarget.path) {
	openDocument(preferredTarget);
}

const initialState: ShellState = {
	sidebarOpen: resolveSidebarOpen(preferences.sidebarPinned),
	commandPaletteOpen: false,
	activeDialog: 'none',
	activePanel: preferredPanel,
	activeTarget: preferredTarget,
	editorMode: preferences.editorMode,
	terminalOpen: preferences.terminalOpen,
	searchQuery: '',
	rightPanelOpen: preferences.rightPanelOpen,
	rightPanelView: preferences.rightPanelView,
	rightPanelWidth: preferences.rightPanelWidth,
};

export const shellState = writable<ShellState>(initialState);
export const navigationState = writable<NavigationState>({
	backStack: [],
	forwardStack: [],
	lastAction: null,
});

export const activeTarget = derived(shellState, ($state) => $state.activeTarget);
export const activePanel = derived(shellState, ($state) => $state.activePanel);
export const activeDialog = derived(shellState, ($state) => $state.activeDialog);
export const rightPanelOpen = derived(shellState, ($state) => $state.rightPanelOpen);
export const rightPanelView = derived(shellState, ($state) => $state.rightPanelView);
export const rightPanelWidth = derived(shellState, ($state) => $state.rightPanelWidth);

export function toggleSidebar(): void {
	const preferences = get(shellPreferences);
	if (preferences.sidebarPinned) {
		// Pinned sidebar is always visible; the toggle is a no-op so that
		// "collapse" can only happen by unpinning or by an explicit close call.
		setPreferredSidebarOpen(true);
		shellState.update((state) => ({ ...state, sidebarOpen: true }));
		return;
	}
	const nextOpen = !get(shellState).sidebarOpen;
	sidebarPins = applySidebarPinToggle('left', currentSidebarPartition, nextOpen ? 'open' : 'collapsed');
	if (currentSidebarPartition === 'above') setPreferredSidebarOpen(nextOpen);
	shellState.update((state) => ({ ...state, sidebarOpen: nextOpen }));
}

/** Set the sidebar open/closed state explicitly. */
export function setSidebarOpen(sidebarOpen: boolean): void {
	const preferences = get(shellPreferences);
	if (preferences.sidebarPinned) {
		setPreferredSidebarOpen(true);
		shellState.update((state) => ({ ...state, sidebarOpen: true }));
		return;
	}
	sidebarPins = applySidebarPinToggle('left', currentSidebarPartition, sidebarOpen ? 'open' : 'collapsed');
	if (currentSidebarPartition === 'above') setPreferredSidebarOpen(sidebarOpen);
	shellState.update((state) => ({ ...state, sidebarOpen }));
}

/** Re-resolve the effective sidebar state when the viewport crosses the
 *  collapse threshold — mirrors the reference sidebar.tsx partition watcher
 *  (`resolveEffectiveState` on partition change). */
export function setSidebarPartition(partition: SidebarPartition): void {
	if (partition === currentSidebarPartition) return;
	currentSidebarPartition = partition;
	const preferences = get(shellPreferences);
	shellState.update((state) => ({ ...state, sidebarOpen: resolveSidebarOpen(preferences.sidebarPinned) }));
}

/** Toggle the sidebar's pinned state. Pinning forces the sidebar to remain
 *  visible regardless of any other close triggers; unpinning re-resolves the
 *  partition-pinned effective state. */
export function setSidebarPinned(sidebarPinned: boolean): void {
	setPreferredSidebarPinned(sidebarPinned);
	shellState.update((state) => ({
		...state,
		sidebarOpen: sidebarPinned ? true : resolveSidebarOpen(false),
	}));
}

export function openCommandPalette(): void {
	shellState.update((state) => ({ ...state, commandPaletteOpen: true, searchQuery: '' }));
}

export function closeCommandPalette(): void {
	shellState.update((state) => ({ ...state, commandPaletteOpen: false, searchQuery: '' }));
}

export function setCommandSearch(searchQuery: string): void {
	shellState.update((state) => ({ ...state, searchQuery }));
}

export function openDialog(activeDialog: Exclude<DialogKind, 'none'>): void {
	shellState.update((state) => ({ ...state, activeDialog }));
}

export function closeDialog(): void {
	shellState.update((state) => ({ ...state, activeDialog: 'none' }));
}

export function setActivePanel(activePanel: ShellPanel): void {
	setPreferredActivePanel(activePanel);
	shellState.update((state) => ({ ...state, activePanel }));
}

export function openTarget(
	activeTarget: DocumentTarget,
	opts: { recordHistory?: boolean; syncHash?: boolean } = {},
): void {
	const currentTarget = get(shellState).activeTarget;
	const recordHistory = opts.recordHistory ?? true;

	if (sameTarget(currentTarget, activeTarget)) {
		activateTarget(activeTarget, opts.syncHash ?? true);
		return;
	}

	if (!activateTarget(activeTarget, opts.syncHash ?? true)) return;

	if (recordHistory) {
		navigationState.update((state) => ({
			backStack: [...state.backStack, currentTarget].slice(-50),
			forwardStack: [],
			lastAction: 'open',
		}));
	}
}

export function navigateBack(): boolean {
	const navigation = get(navigationState);
	const previous = navigation.backStack.at(-1);
	if (!previous) return false;

	const currentTarget = get(shellState).activeTarget;
	if (!activateTarget(previous, true)) return false;

	navigationState.set({
		backStack: navigation.backStack.slice(0, -1),
		forwardStack: [currentTarget, ...navigation.forwardStack].slice(0, 50),
		lastAction: 'back',
	});
	return true;
}

export function navigateForward(): boolean {
	const navigation = get(navigationState);
	const next = navigation.forwardStack[0];
	if (!next) return false;

	const currentTarget = get(shellState).activeTarget;
	if (!activateTarget(next, true)) return false;

	navigationState.set({
		backStack: [...navigation.backStack, currentTarget].slice(-50),
		forwardStack: navigation.forwardStack.slice(1),
		lastAction: 'forward',
	});
	return true;
}

export function navigateToHash(hash: string): boolean {
	const target = targetFromHash(hash);
	if (!target) return false;

	openTarget(target);
	return true;
}

export function navigateToInitialDocument(path: string | null): boolean {
	if (!path) return false;

	openTarget(targetFromPath(path), { recordHistory: false, syncHash: true });
	navigationState.update((state) => ({ ...state, lastAction: 'replace' }));
	return true;
}

export function navigateToDeepLink(url: string): boolean {
	const link = parseDeepLink(url);
	if (!link) return false;

	if (link.projectPath) {
		// Deep links into a project switch the active project first so the
		// document target resolves against project-backed file loading.
		setProjectFromFolder(link.projectPath);
		void import('$lib/editor/project-files').then(async ({ getFilesBridge, refreshProjectDocumentsFromDisk }) => {
			const files = getFilesBridge();
			if (files.setProjectPath) {
				await files.setProjectPath(link.projectPath!);
			}
			await refreshProjectDocumentsFromDisk();
		});
	}
	if (!link.target) return true;

	// Navigate immediately so hash/menu/deep-link consumers see the target
	// without waiting for async project hydration (which preserves selection).
	openTarget(link.target);
	return true;
}

function activateTarget(activeTarget: DocumentTarget, syncHash: boolean): boolean {
	if (!openDocument(activeTarget)) return false;
	const activePanel = activeTarget.kind === 'migration' ? 'migration' : 'editor';
	setPreferredActiveTarget(activeTarget);
	setPreferredActivePanel(activePanel);
	shellState.update((state) => ({
		...state,
		activeTarget,
		activePanel,
	}));
	if (syncHash) writeTargetHash(activeTarget);
	return true;
}

export function setEditorMode(editorMode: EditorMode): void {
	setPreferredEditorMode(editorMode);
	shellState.update((state) => ({ ...state, editorMode }));
}

export function toggleEditorMode(): void {
	const mode = get(shellState).editorMode;
	const order: EditorMode[] = ['rich', 'source', 'preview', 'diff'];
	const index = order.indexOf(mode);
	const next = order[(index + 1) % order.length] ?? 'rich';
	setEditorMode(next);
}

export function toggleTerminal(): void {
	shellState.update((state) => {
		const terminalOpen = !state.terminalOpen;
		setPreferredTerminalOpen(terminalOpen);
		return { ...state, terminalOpen };
	});
}

export function setTerminalOpen(terminalOpen: boolean): void {
	setPreferredTerminalOpen(terminalOpen);
	shellState.update((state) => ({ ...state, terminalOpen }));
}

export function closeAllOverlays(): void {
	shellState.update((state) => ({
		...state,
		commandPaletteOpen: false,
		activeDialog: 'none',
	}));
}

/** Open the right panel with the given view. */
export function openRightPanel(view: RightPanelView = get(shellState).rightPanelView): void {
	setPreferredRightPanelView(view);
	setPreferredRightPanelOpen(true);
	shellState.update((state) => ({ ...state, rightPanelOpen: true, rightPanelView: view }));
}

/** Toggle the right panel. If opening, the previous view (or 'activity') is restored. */
export function toggleRightPanel(view?: RightPanelView): void {
	const state = get(shellState);
	const nextOpen = !state.rightPanelOpen;
	setPreferredRightPanelOpen(nextOpen);
	if (view) setPreferredRightPanelView(view);
	shellState.update((current) => ({
		...current,
		rightPanelOpen: nextOpen,
		rightPanelView: view ?? current.rightPanelView,
	}));
}

/** Close the right panel without changing the persisted view. */
export function closeRightPanel(): void {
	setPreferredRightPanelOpen(false);
	shellState.update((state) => ({ ...state, rightPanelOpen: false }));
}

/** Switch the active view inside an already-open right panel. */
export function setRightPanelView(view: RightPanelView): void {
	setPreferredRightPanelView(view);
	shellState.update((state) => ({ ...state, rightPanelView: view }));
}

/** Resize the right panel; values are clamped to the supported bounds. */
export function setRightPanelWidth(rightPanelWidth: number): void {
	setPreferredRightPanelWidth(rightPanelWidth);
	shellState.update((state) => ({ ...state, rightPanelWidth }));
}

function sameTarget(left: DocumentTarget, right: DocumentTarget): boolean {
	return left.kind === right.kind && left.path === right.path;
}

function targetFromHash(hash: string): DocumentTarget | null {
	if (!hash) return null;
	const value = hash.startsWith('#') ? hash.slice(1) : hash;
	if (!value || value === '/') return null;

	if (value.startsWith('/document?')) {
		const params = new URLSearchParams(value.slice('/document?'.length));
		const path = params.get('path');
		if (!path) return null;
		return {
			kind: normalizeKind(params.get('kind'), path),
			path,
			title: params.get('title') || titleFromPath(path),
		};
	}

	return targetFromPath(value);
}

type ParsedDeepLink = {
	projectPath: string | null;
	target: DocumentTarget | null;
};

function parseDeepLink(url: string): ParsedDeepLink | null {
	try {
		const parsed = new URL(url);
		const projectPath = normalizeProjectPath(
			parsed.searchParams.get('project') ??
				(parsed.pathname.startsWith('/project/')
					? decodeURIComponent(parsed.pathname.slice('/project'.length))
					: null),
		);
		const docPath = parsed.searchParams.get('doc') ?? parsed.searchParams.get('path');
		if (projectPath || docPath) {
			return {
				projectPath,
				target: docPath ? targetFromPath(decodeURIComponent(docPath)) : null,
			};
		}
		const routeTarget = targetFromHash(parsed.hash);
		if (routeTarget) return { projectPath: null, target: routeTarget };
		const pathname = decodeURIComponent(parsed.pathname);
		return pathname && pathname !== '/'
			? { projectPath: null, target: targetFromPath(pathname) }
			: null;
	} catch {
		const target = targetFromHash(url) ?? (url.startsWith('/') ? targetFromPath(url) : null);
		return target ? { projectPath: null, target } : null;
	}
}

function normalizeProjectPath(path: string | null): string | null {
	if (!path) return null;
	const decoded = decodeURIComponent(path).trim();
	return decoded.length > 0 ? decoded : null;
}

function targetFromPath(path: string): DocumentTarget {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return {
		kind: normalizeKind(null, normalizedPath),
		path: normalizedPath,
		title: titleFromPath(normalizedPath),
	};
}

function normalizeKind(kind: string | null, path: string): DocumentTargetKind {
	if (kind === 'doc' || kind === 'folder' || kind === 'asset' || kind === 'migration') return kind;
	if (path === '/migration') return 'migration';
	if (path.startsWith('/assets/')) return 'asset';
	if (!path.includes('.')) return 'folder';
	return 'doc';
}

function titleFromPath(path: string): string {
	return path.split('/').filter(Boolean).at(-1) ?? path;
}

function writeTargetHash(target: DocumentTarget): void {
	if (!browser) return;

	const params = new URLSearchParams({
		path: target.path,
		kind: target.kind,
		title: target.title,
	});
	const nextHash = `/document?${params.toString()}`;
	if (window.location.hash.slice(1) === nextHash) return;
	window.history.replaceState(null, '', `#${nextHash}`);
}
