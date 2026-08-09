import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import {
	chordId,
	detectShortcutConflicts,
	resolveShellShortcutCommand,
	SHORTCUT_COMMANDS,
	type Chord,
} from './shortcuts';
import {
	rebindShortcut,
	resetAllShortcuts,
	resetShortcut,
	shortcutBindings,
	shortcutConflicts,
	shortcutOverrides,
} from './shortcut-store';

beforeEach(() => {
	resetAllShortcuts();
	window.localStorage.clear();
});

describe('registry ↔ resolver parity', () => {
	// The Hotkeys section trusts SHORTCUT_COMMANDS to describe the real chords.
	// Each default chord must resolve back to its own command in the browser
	// preview (no native menu), or the section would show lies.
	it('every default chord resolves to its command', () => {
		for (const command of SHORTCUT_COMMANDS) {
			const { defaultChord } = command;
			const resolved = resolveShellShortcutCommand(
				{
					key: defaultChord.key,
					metaKey: defaultChord.mod,
					altKey: defaultChord.alt,
					shiftKey: defaultChord.shift,
				},
				false,
				false,
			);
			expect(resolved, `chord for ${command.id}`).toBe(command.id);
		}
	});

	it('assigns a unique default chord to every command', () => {
		const ids = SHORTCUT_COMMANDS.map((command) => chordId(command.defaultChord));
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('detectShortcutConflicts', () => {
	it('returns nothing when every chord is unique', () => {
		const bindings: Record<string, Chord> = {
			a: { mod: true, key: 'k' },
			b: { mod: true, key: 'j' },
		};
		expect(detectShortcutConflicts(bindings).size).toBe(0);
	});

	it('groups the commands that share a chord', () => {
		const bindings: Record<string, Chord> = {
			a: { mod: true, shift: true, key: 'p' },
			b: { mod: true, shift: true, key: 'p' },
			c: { mod: true, key: 'k' },
		};
		const conflicts = detectShortcutConflicts(bindings);
		expect(conflicts.size).toBe(1);
		expect(conflicts.get('mod+shift+p')).toEqual(['a', 'b']);
	});

	it('treats modifier order as irrelevant to the chord identity', () => {
		expect(chordId({ mod: true, shift: true, key: 'p' })).toBe(
			chordId({ shift: true, mod: true, key: 'P' }),
		);
	});
});

describe('rebind round-trip', () => {
	it('applies an override and surfaces it in the effective bindings', () => {
		const next: Chord = { mod: true, alt: true, shift: true, key: 'g' };
		rebindShortcut('focus-search', next);

		expect(get(shortcutOverrides)['focus-search']).toBe('mod+alt+shift+g');
		expect(chordId(get(shortcutBindings)['focus-search'])).toBe('mod+alt+shift+g');
	});

	it('resets an override back to the registry default', () => {
		const original = SHORTCUT_COMMANDS.find((c) => c.id === 'focus-search')!.defaultChord;
		rebindShortcut('focus-search', { mod: true, key: 'g' });
		expect(chordId(get(shortcutBindings)['focus-search'])).toBe('mod+g');

		resetShortcut('focus-search');
		expect('focus-search' in get(shortcutOverrides)).toBe(false);
		expect(chordId(get(shortcutBindings)['focus-search'])).toBe(chordId(original));
	});

	it('clears the override when rebinding back to the default chord', () => {
		const original = SHORTCUT_COMMANDS.find((c) => c.id === 'settings')!.defaultChord;
		rebindShortcut('settings', { mod: true, key: 'g' });
		expect('settings' in get(shortcutOverrides)).toBe(true);

		rebindShortcut('settings', original);
		expect('settings' in get(shortcutOverrides)).toBe(false);
	});

	it('flags a conflict once two commands share a chord', () => {
		// Rebind Search onto the command-palette chord (⌘K).
		rebindShortcut('focus-search', { mod: true, key: 'k' });
		const conflicts = get(shortcutConflicts);
		const collision = conflicts.get('mod+k');
		expect(collision).toBeDefined();
		expect(collision).toContain('focus-search');
		expect(collision).toContain('focus-command-palette');
	});
});
