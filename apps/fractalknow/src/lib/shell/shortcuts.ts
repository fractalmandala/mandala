export type ShortcutTargetLike = {
	isContentEditable?: boolean;
};

export type ShortcutKeyboardEventLike = {
	key: string;
	metaKey?: boolean;
	ctrlKey?: boolean;
	altKey?: boolean;
	shiftKey?: boolean;
	target?: EventTarget | ShortcutTargetLike | null;
};

/**
 * Resolves a keydown event to a shell command id.
 *
 * Single-owner rule: when the native menu bar is active (Tauri runtime),
 * every chord that has a native menu accelerator is owned by the native
 * menu and this resolver must return null for it — otherwise the chord is
 * double-registered and the web layer becomes unreachable dead code. In
 * the browser preview there is no native menu, so the web layer owns all
 * chords.
 *
 * Chords with no native accelerator anywhere (⌘`, ⇧⌘J, ⇧⌘E) are owned by
 * this layer in every runtime.
 */
export function resolveShellShortcutCommand(
	event: ShortcutKeyboardEventLike,
	overlayOpen = false,
	nativeMenuActive = false,
): string | null {
	const mod = Boolean(event.metaKey || event.ctrlKey);
	const key = event.key.toLowerCase();
	const targetOwnsTyping = shortcutTargetOwnsTyping(event.target);
	const globalKeys = new Set(['k', ',']);
	const editorSafeKeys = new Set(['k', ',', 's']);

	if (overlayOpen && !(mod && globalKeys.has(key))) return null;
	if (targetOwnsTyping && !(mod && editorSafeKeys.has(key))) return null;

	// null when the native menu owns the chord (Tauri runtime).
	const web = (commandId: string): string | null => (nativeMenuActive ? null : commandId);

	if (mod && key === 'k') return web('focus-command-palette');
	if (mod && key === 'f') return web('focus-search');
	if (mod && event.altKey && key === 's') return web('toggle-sidebar');
	if (mod && event.altKey && key === 'b') return web('toggle-doc-panel');
	if (mod && key === 'j') {
		// ⇧⌘J (new terminal) has no native accelerator; the web layer owns it.
		if (event.shiftKey) return 'new-terminal';
		return web('toggle-terminal');
	}
	if (mod && event.key === ',') return web('settings');
	if (mod && key === 'n') {
		if (event.altKey) return web('new-project');
		return web(event.shiftKey ? 'new-folder' : 'new-doc');
	}
	if (mod && key === 's') return web('save-version');
	if (mod && event.key === '`') return 'toggle-right-panel';
	if (mod && key === 'o') return web(event.shiftKey ? 'open-file' : 'open-folder');
	if (mod && event.shiftKey && key === 'p') return web('switch-project');
	if (mod && event.shiftKey && (event.key === '.' || event.key === '>'))
		return web('toggle-show-hidden-files');
	if (event.altKey && key === 'arrowleft') return web('navigate-back');
	if (event.altKey && key === 'arrowright') return web('navigate-forward');
	if (mod && event.key === '[') return web('navigate-back');
	if (mod && event.key === ']') return web('navigate-forward');
	if (mod && event.shiftKey && key === 'h') return web('version-history');
	if (mod && key === 'w') return web('close-active-tab-or-window');
	// ⇧⌘E (toggle source) is web-only; the native menu carries ⌘E instead.
	if (mod && event.shiftKey && key === 'e') return 'toggle-source';

	return null;
}

// ---------------------------------------------------------------------------
// Shortcut registry
//
// The resolver above is the runtime source of truth for chord → command
// mapping. The registry below is its declarative twin: it lists every command
// the shell shortcut layer owns, its default chord, and display metadata, so
// the Settings → Hotkeys section can render, rebind, and conflict-check them.
// A parity unit test pins each command's default chord against the resolver.
// ---------------------------------------------------------------------------

/** A normalized keyboard chord. `mod` is Cmd on macOS / Ctrl elsewhere. */
export type Chord = {
	mod?: boolean;
	alt?: boolean;
	shift?: boolean;
	/** The non-modifier key, lower-cased (e.g. `k`, `,`, `` ` ``, `[`, `arrowleft`). */
	key: string;
};

export type ShortcutCategory = 'general' | 'navigation' | 'workspace' | 'search';

export const SHORTCUT_CATEGORY_LABELS: Record<ShortcutCategory, string> = {
	general: 'General',
	navigation: 'Navigation',
	workspace: 'Workspace',
	search: 'Search',
};

export const SHORTCUT_CATEGORY_ORDER: ShortcutCategory[] = [
	'general',
	'navigation',
	'workspace',
	'search',
];

export type ShortcutCommand = {
	id: string;
	title: string;
	description: string;
	category: ShortcutCategory;
	scope: string;
	defaultChord: Chord;
};

/**
 * Every command the shell shortcut resolver owns, in display order. Default
 * chords mirror `resolveShellShortcutCommand`; `shortcuts.unit.test.ts` asserts
 * the two never drift.
 */
export const SHORTCUT_COMMANDS: ShortcutCommand[] = [
	{
		id: 'focus-command-palette',
		title: 'Command palette',
		description: 'Search files, commands, and projects.',
		category: 'general',
		scope: 'Global',
		defaultChord: { mod: true, key: 'k' },
	},
	{
		id: 'settings',
		title: 'Settings',
		description: 'Open the settings dialog.',
		category: 'general',
		scope: 'Global outside text fields',
		defaultChord: { mod: true, key: ',' },
	},
	{
		id: 'new-doc',
		title: 'New file',
		description: 'Create a document in the current folder context.',
		category: 'general',
		scope: 'Global outside text fields',
		defaultChord: { mod: true, key: 'n' },
	},
	{
		id: 'new-folder',
		title: 'New folder',
		description: 'Create a folder in the current context.',
		category: 'general',
		scope: 'Global outside text fields',
		defaultChord: { mod: true, shift: true, key: 'n' },
	},
	{
		id: 'new-project',
		title: 'New project',
		description: 'Scaffold a new project.',
		category: 'general',
		scope: 'Global outside text fields',
		defaultChord: { mod: true, alt: true, key: 'n' },
	},
	{
		id: 'open-folder',
		title: 'Open folder',
		description: 'Open a project folder.',
		category: 'general',
		scope: 'Global outside text fields',
		defaultChord: { mod: true, key: 'o' },
	},
	{
		id: 'open-file',
		title: 'Open file',
		description: 'Open a single file.',
		category: 'general',
		scope: 'Global outside text fields',
		defaultChord: { mod: true, shift: true, key: 'o' },
	},
	{
		id: 'switch-project',
		title: 'Switch project',
		description: 'Switch to another recent project.',
		category: 'general',
		scope: 'Global outside text fields',
		defaultChord: { mod: true, shift: true, key: 'p' },
	},
	{
		id: 'navigate-back',
		title: 'Back',
		description: 'Navigate to the previous document.',
		category: 'navigation',
		scope: 'Global outside text fields',
		defaultChord: { mod: true, key: '[' },
	},
	{
		id: 'navigate-forward',
		title: 'Forward',
		description: 'Navigate to the next document.',
		category: 'navigation',
		scope: 'Global outside text fields',
		defaultChord: { mod: true, key: ']' },
	},
	{
		id: 'toggle-sidebar',
		title: 'Toggle sidebar',
		description: 'Show or hide the file sidebar.',
		category: 'workspace',
		scope: 'Global',
		defaultChord: { mod: true, alt: true, key: 's' },
	},
	{
		id: 'toggle-doc-panel',
		title: 'Toggle document panel',
		description: 'Show or hide the document outline panel.',
		category: 'workspace',
		scope: 'Global',
		defaultChord: { mod: true, alt: true, key: 'b' },
	},
	{
		id: 'toggle-right-panel',
		title: 'Toggle right panel',
		description: 'Show or hide the right activity panel.',
		category: 'workspace',
		scope: 'Global',
		defaultChord: { mod: true, key: '`' },
	},
	{
		id: 'toggle-terminal',
		title: 'Toggle terminal',
		description: 'Show or hide the integrated terminal.',
		category: 'workspace',
		scope: 'Global',
		defaultChord: { mod: true, key: 'j' },
	},
	{
		id: 'new-terminal',
		title: 'New terminal',
		description: 'Open an additional terminal tab.',
		category: 'workspace',
		scope: 'Global',
		defaultChord: { mod: true, shift: true, key: 'j' },
	},
	{
		id: 'save-version',
		title: 'Save version',
		description: 'Save a version snapshot of the active document.',
		category: 'workspace',
		scope: 'Global including text fields',
		defaultChord: { mod: true, key: 's' },
	},
	{
		id: 'toggle-source',
		title: 'Toggle source mode',
		description: 'Switch between rich and source editing.',
		category: 'workspace',
		scope: 'Global',
		defaultChord: { mod: true, shift: true, key: 'e' },
	},
	{
		id: 'toggle-show-hidden-files',
		title: 'Show hidden files',
		description: 'Toggle hidden files in the sidebar.',
		category: 'workspace',
		scope: 'Global',
		defaultChord: { mod: true, shift: true, key: '.' },
	},
	{
		id: 'version-history',
		title: 'Version history',
		description: 'Open the version history panel.',
		category: 'workspace',
		scope: 'Global',
		defaultChord: { mod: true, shift: true, key: 'h' },
	},
	{
		id: 'close-active-tab-or-window',
		title: 'Close tab or window',
		description: 'Close the active tab, or the window when none remain.',
		category: 'workspace',
		scope: 'Global',
		defaultChord: { mod: true, key: 'w' },
	},
	{
		id: 'focus-search',
		title: 'Search',
		description: 'Focus the search input.',
		category: 'search',
		scope: 'Global',
		defaultChord: { mod: true, key: 'f' },
	},
];

/**
 * A canonical, comparable id for a chord (e.g. `mod+shift+k`). Two chords with
 * the same id collide; this is the key both serialization and conflict
 * detection use.
 */
export function chordId(chord: Chord): string {
	const parts: string[] = [];
	if (chord.mod) parts.push('mod');
	if (chord.alt) parts.push('alt');
	if (chord.shift) parts.push('shift');
	parts.push(chord.key.toLowerCase());
	return parts.join('+');
}

/** Parse a canonical chord id back into a {@link Chord}. */
export function parseChordId(id: string): Chord {
	const parts = id.split('+');
	const key = parts.pop() ?? '';
	return {
		mod: parts.includes('mod'),
		alt: parts.includes('alt'),
		shift: parts.includes('shift'),
		key,
	};
}

const KEY_DISPLAY: Record<string, string> = {
	arrowleft: '←',
	arrowright: '→',
	arrowup: '↑',
	arrowdown: '↓',
	' ': 'Space',
	escape: 'Esc',
	enter: 'Enter',
	backspace: '⌫',
};

function keyLabel(key: string): string {
	const lower = key.toLowerCase();
	if (KEY_DISPLAY[lower]) return KEY_DISPLAY[lower];
	return key.length === 1 ? key.toUpperCase() : key;
}

/** Format a chord for display. `platform` picks the symbol vocabulary. */
export function formatChord(chord: Chord, platform: 'mac' | 'other' = 'mac'): string {
	if (platform === 'mac') {
		let out = '';
		if (chord.alt) out += '⌥';
		if (chord.shift) out += '⇧';
		if (chord.mod) out += '⌘';
		return `${out}${keyLabel(chord.key)}`;
	}
	const parts: string[] = [];
	if (chord.mod) parts.push('Ctrl');
	if (chord.alt) parts.push('Alt');
	if (chord.shift) parts.push('Shift');
	parts.push(keyLabel(chord.key));
	return parts.join('+');
}

/** Single-sourced shortcut formatter for command palette and menus. */
export function formatShortcut(commandId: string, platform: 'mac' | 'other' = 'mac'): string | null {
	const command = SHORTCUT_COMMANDS.find((item) => item.id === commandId);
	if (!command) return null;
	return formatChord(command.defaultChord, platform);
}

/**
 * Build a chord from a keydown event during rebind capture. Returns `null`
 * while only modifier keys are held (nothing to bind yet).
 */
export function chordFromEvent(event: ShortcutKeyboardEventLike): Chord | null {
	const rawKey = event.key;
	if (rawKey === 'Meta' || rawKey === 'Control' || rawKey === 'Alt' || rawKey === 'Shift') {
		return null;
	}
	return {
		mod: Boolean(event.metaKey || event.ctrlKey),
		alt: Boolean(event.altKey),
		shift: Boolean(event.shiftKey),
		key: rawKey.toLowerCase(),
	};
}

/**
 * Detect chords bound to more than one command. Returns a map of chord id →
 * the command ids sharing it, containing only genuinely conflicting chords.
 */
export function detectShortcutConflicts(
	bindings: Record<string, Chord>,
): Map<string, string[]> {
	const byChord = new Map<string, string[]>();
	for (const [commandId, chord] of Object.entries(bindings)) {
		const id = chordId(chord);
		const existing = byChord.get(id);
		if (existing) existing.push(commandId);
		else byChord.set(id, [commandId]);
	}
	const conflicts = new Map<string, string[]>();
	for (const [id, commandIds] of byChord) {
		if (commandIds.length > 1) conflicts.set(id, commandIds);
	}
	return conflicts;
}

function shortcutTargetOwnsTyping(target: ShortcutKeyboardEventLike['target']): boolean {
	if (!target) return false;
	if (
		target instanceof HTMLInputElement ||
		target instanceof HTMLTextAreaElement ||
		target instanceof HTMLSelectElement
	) {
		return true;
	}
	return target instanceof HTMLElement && target.isContentEditable;
}
