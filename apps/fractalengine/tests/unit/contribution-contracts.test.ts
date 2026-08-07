import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contributions } from '$lib/state/contributions.svelte';

// Side-effect imports — registers stubs in Stream B's worktree; real entries post-merge.
import '$lib/state/coreContributions';
import '$lib/modules/notes/contributions';
import '$lib/modules/designer/contributions';
import '$lib/modules/ai/contributions';
import '$lib/modules/bookmarks/contributions';
import '$lib/modules/media/contributions';

const NAME_MATCHER = /^(core|notes|designer|ai|bookmarks|media)\./;

/**
 * Normalize a shortcut string to a combo for comparison.
 * 'Cmd+Alt+O' → 'cmd+alt+o', 'Shift+Cmd+P' → 'cmd+shift+p'
 */
function normalizeCombo(raw: string): string {
	return raw
		.toLowerCase()
		.split('+')
		.sort((a, b) => {
			const order: Record<string, number> = { cmd: 0, alt: 1, shift: 2 };
			const diff = (order[a] ?? 3) - (order[b] ?? 3);
			return diff !== 0 ? diff : a.localeCompare(b);
		})
		.join('+');
}

/** Round-trip check: parsed combo re-serializes to itself. */
function roundTrip(combo: string): boolean {
	const parts = combo.split('+');
	const reordered = [...parts].sort((a, b) => {
		const order: Record<string, number> = { cmd: 0, alt: 1, shift: 2 };
		const diff = (order[a] ?? 3) - (order[b] ?? 3);
		return diff !== 0 ? diff : a.localeCompare(b);
	});
	return parts.join('+') === reordered.join('+');
}

describe('contribution contracts', () => {
	const snapshot = contributions.snapshot();

	it('all command ids are unique and namespaced', () => {
		const ids = snapshot.commands.map((c) => c.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const id of ids) {
			expect(id).toMatch(NAME_MATCHER);
		}
	});

	it('every keybinding commandId resolves to a registered command', () => {
		const commandIds = new Set(snapshot.commands.map((c) => c.id));
		for (const kb of snapshot.keybindings) {
			expect(commandIds.has(kb.commandId)).toBe(true);
		}
	});

	it('every headerAction commandId resolves to a registered command', () => {
		const commandIds = new Set(snapshot.commands.map((c) => c.id));
		for (const ha of snapshot.headerActions) {
			expect(commandIds.has(ha.commandId)).toBe(true);
		}
	});

	it('every menuAction commandId resolves to a registered command', () => {
		const commandIds = new Set(snapshot.commands.map((c) => c.id));
		for (const ma of snapshot.menuActions) {
			expect(commandIds.has(ma.commandId)).toBe(true);
		}
	});

	it('every context-menu action resolves to a registered command', () => {
		const commandIds = new Set(snapshot.commands.map((c) => c.id));
		for (const action of snapshot.contextMenuActions) {
			expect(commandIds.has(action.commandId)).toBe(true);
		}
	});

	it('keybinding scope is compatible with its command scope', () => {
		const commands = new Map(snapshot.commands.map((c) => [c.id, c]));
		for (const kb of snapshot.keybindings) {
			const cmd = commands.get(kb.commandId);
			expect(cmd, `No command for keybinding ${kb.combo} → ${kb.commandId}`).toBeDefined();
			if (kb.scope !== 'global') {
				expect(cmd!.scope === 'global' || cmd!.scope === kb.scope).toBe(true);
			}
		}
	});

	it('shortcut labels and keybinding combos are consistent', () => {
		const commands = new Map(snapshot.commands.map((command) => [command.id, command]));
		const labelMap = new Map<string, string>();
		for (const cmd of snapshot.commands) {
			if (cmd.shortcutLabel && cmd.shortcutLabel.startsWith('Cmd')) {
				const labelCombo = normalizeCombo(cmd.shortcutLabel);
				expect(labelMap.has(labelCombo), `Duplicate shortcut label ${labelCombo}`).toBe(false);
				labelMap.set(labelCombo, cmd.id);
			}
		}

		const bindingMap = new Map<string, string>();
		for (const kb of snapshot.keybindings) {
			expect(bindingMap.has(kb.combo), `Duplicate keybinding ${kb.combo}`).toBe(false);
			bindingMap.set(kb.combo, kb.commandId);
		}

		for (const [labelCombo, cmdId] of labelMap) {
			expect(
				bindingMap.get(labelCombo),
				`Command ${cmdId} advertises ${labelCombo} but has no matching keybinding`,
			).toBe(cmdId);
		}

		for (const [combo, cmdId] of bindingMap) {
			const cmd = commands.get(cmdId);
			expect(cmd, `Keybinding ${combo} references unknown command ${cmdId}`).toBeDefined();
			expect(
				cmd?.shortcutLabel?.startsWith('Cmd'),
				`Keybinding ${combo} → ${cmdId} has no Cmd-style shortcutLabel`,
			).toBe(true);
			expect(
				normalizeCombo(cmd!.shortcutLabel!),
				`Keybinding ${combo} disagrees with ${cmdId}'s shortcutLabel`,
			).toBe(combo);
		}
	});

	it('every combo is normalized (lowercase, modifiers ordered cmd>alt>shift)', () => {
		for (const kb of snapshot.keybindings) {
			expect(kb.combo).toBe(kb.combo.toLowerCase());
			expect(roundTrip(kb.combo), `Combo ${kb.combo} modifiers are not in cmd>alt>shift order`).toBe(true);
			// No doubled modifiers or non-standard keys
			for (const part of kb.combo.split('+')) {
				expect(part.length).toBeGreaterThan(0);
			}
		}
	});

	it('icon paths referencing static assets exist on disk', () => {
		const root = process.cwd();
		const missing: string[] = [];
		const iconCommands = snapshot.commands.filter((c) => c.icon);
		const iconHeaders = snapshot.headerActions.filter((h) => h.icon);

		for (const cmd of iconCommands) {
			const match = cmd.icon.match(/^\/(iconset\/(?:[^"'`{}]+\.svg))/);
			if (match) {
				const absPath = join(root, 'static', match[1]);
				if (!existsSync(absPath)) missing.push(`icon ${cmd.icon} (command ${cmd.id}): not found at ${absPath}`);
			}
		}

		for (const ha of iconHeaders) {
			const match = ha.icon.match(/^\/(iconset\/(?:[^"'`{}]+\.svg))/);
			if (match) {
				const absPath = join(root, 'static', match[1]);
				if (!existsSync(absPath)) missing.push(`icon ${ha.icon} (header action ${ha.ariaLabel}): not found at ${absPath}`);
			}
		}

		expect(missing, `Missing icon assets:\n${missing.join('\n')}`).toEqual([]);
	});
});
