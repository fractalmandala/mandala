import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';
import { readLocalStorage, writeLocalStorage } from './storage';
import {
	chordId,
	detectShortcutConflicts,
	parseChordId,
	SHORTCUT_COMMANDS,
	type Chord,
} from './shortcuts';

const STORAGE_KEY = 'fractalknow:shortcut-overrides';

/** Command id → canonical chord id, only for commands the user has rebound. */
export type ShortcutOverrides = Record<string, string>;

function isKnownCommand(id: string): boolean {
	return SHORTCUT_COMMANDS.some((command) => command.id === id);
}

function readOverrides(): ShortcutOverrides {
	if (!browser) return {};
	try {
		const raw = readLocalStorage(STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as unknown;
		if (typeof parsed !== 'object' || parsed === null) return {};
		const result: ShortcutOverrides = {};
		for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
			if (typeof value === 'string' && isKnownCommand(id)) result[id] = value;
		}
		return result;
	} catch {
		return {};
	}
}

export const shortcutOverrides = writable<ShortcutOverrides>(readOverrides());

if (browser) {
	shortcutOverrides.subscribe((overrides) => {
		writeLocalStorage(STORAGE_KEY, JSON.stringify(overrides));
	});
}

/**
 * The effective chord for every command: the user override when present,
 * otherwise the registry default. Keyed by command id.
 */
export const shortcutBindings = derived(shortcutOverrides, ($overrides) => {
	const bindings: Record<string, Chord> = {};
	for (const command of SHORTCUT_COMMANDS) {
		const override = $overrides[command.id];
		bindings[command.id] = override ? parseChordId(override) : command.defaultChord;
	}
	return bindings;
});

/** Chords bound to more than one command, keyed by chord id → command ids. */
export const shortcutConflicts = derived(shortcutBindings, ($bindings) =>
	detectShortcutConflicts($bindings),
);

/** Rebind a command to a new chord, persisting the override. */
export function rebindShortcut(commandId: string, chord: Chord): void {
	if (!isKnownCommand(commandId)) return;
	const command = SHORTCUT_COMMANDS.find((entry) => entry.id === commandId);
	const nextId = chordId(chord);
	shortcutOverrides.update((overrides) => {
		const next = { ...overrides };
		// Dropping back to the default clears the override rather than storing it.
		if (command && chordId(command.defaultChord) === nextId) {
			delete next[commandId];
		} else {
			next[commandId] = nextId;
		}
		return next;
	});
}

/** Clear a command's override, restoring its registry default. */
export function resetShortcut(commandId: string): void {
	shortcutOverrides.update((overrides) => {
		if (!(commandId in overrides)) return overrides;
		const next = { ...overrides };
		delete next[commandId];
		return next;
	});
}

/** Clear every override, restoring all defaults. */
export function resetAllShortcuts(): void {
	shortcutOverrides.set({});
}

/** Snapshot of the current effective bindings (non-reactive). */
export function currentShortcutBindings(): Record<string, Chord> {
	return get(shortcutBindings);
}
