import { describe, expect, it } from 'vitest';
import { formatShortcut, resolveShellShortcutCommand } from './shortcuts';

describe('shell shortcut resolver', () => {
	it('maps the command inventory shortcuts to command ids in the browser preview', () => {
		expect(resolveShellShortcutCommand({ key: 'k', metaKey: true })).toBe('focus-command-palette');
		expect(resolveShellShortcutCommand({ key: 'f', metaKey: true })).toBe('focus-search');
		expect(resolveShellShortcutCommand({ key: 's', metaKey: true, altKey: true })).toBe('toggle-sidebar');
		expect(resolveShellShortcutCommand({ key: 'b', metaKey: true, altKey: true })).toBe('toggle-doc-panel');
		expect(resolveShellShortcutCommand({ key: 'j', metaKey: true })).toBe('toggle-terminal');
		expect(resolveShellShortcutCommand({ key: 'j', metaKey: true, shiftKey: true })).toBe('new-terminal');
		expect(resolveShellShortcutCommand({ key: ',', metaKey: true })).toBe('settings');
		expect(resolveShellShortcutCommand({ key: 'n', metaKey: true })).toBe('new-doc');
		expect(resolveShellShortcutCommand({ key: 'n', metaKey: true, shiftKey: true })).toBe('new-folder');
		expect(resolveShellShortcutCommand({ key: 'n', metaKey: true, altKey: true })).toBe('new-project');
		expect(resolveShellShortcutCommand({ key: 'o', metaKey: true })).toBe('open-folder');
		expect(resolveShellShortcutCommand({ key: 'o', metaKey: true, shiftKey: true })).toBe('open-file');
		expect(resolveShellShortcutCommand({ key: 'p', metaKey: true, shiftKey: true })).toBe('switch-project');
		expect(resolveShellShortcutCommand({ key: 's', metaKey: true })).toBe('save-version');
		expect(resolveShellShortcutCommand({ key: '`', metaKey: true })).toBe('toggle-right-panel');
		expect(resolveShellShortcutCommand({ key: 'ArrowLeft', altKey: true })).toBe('navigate-back');
		expect(resolveShellShortcutCommand({ key: 'ArrowRight', altKey: true })).toBe('navigate-forward');
		expect(resolveShellShortcutCommand({ key: '[', metaKey: true })).toBe('navigate-back');
		expect(resolveShellShortcutCommand({ key: ']', metaKey: true })).toBe('navigate-forward');
		expect(resolveShellShortcutCommand({ key: 'h', metaKey: true, shiftKey: true })).toBe('version-history');
		expect(resolveShellShortcutCommand({ key: 'w', metaKey: true })).toBe('close-active-tab-or-window');
		expect(resolveShellShortcutCommand({ key: 'e', metaKey: true, shiftKey: true })).toBe('toggle-source');
	});

	it('never claims ⌘B so the editor keeps Bold', () => {
		expect(resolveShellShortcutCommand({ key: 'b', metaKey: true })).toBeNull();
		expect(resolveShellShortcutCommand({ key: 'b', ctrlKey: true })).toBeNull();
	});

	it('stays silent for natively owned chords when the native menu is active', () => {
		const native = true;
		// Native menu owns these: web layer must not double-register.
		expect(resolveShellShortcutCommand({ key: 'k', metaKey: true }, false, native)).toBeNull();
		expect(resolveShellShortcutCommand({ key: ',', metaKey: true }, false, native)).toBeNull();
		expect(resolveShellShortcutCommand({ key: 'n', metaKey: true }, false, native)).toBeNull();
		expect(resolveShellShortcutCommand({ key: 'n', metaKey: true, shiftKey: true }, false, native)).toBeNull();
		expect(resolveShellShortcutCommand({ key: 's', metaKey: true }, false, native)).toBeNull();
		expect(resolveShellShortcutCommand({ key: 's', metaKey: true, altKey: true }, false, native)).toBeNull();
		expect(resolveShellShortcutCommand({ key: 'b', metaKey: true, altKey: true }, false, native)).toBeNull();
		expect(resolveShellShortcutCommand({ key: 'j', metaKey: true }, false, native)).toBeNull();
		expect(resolveShellShortcutCommand({ key: 'w', metaKey: true }, false, native)).toBeNull();
		expect(resolveShellShortcutCommand({ key: 'o', metaKey: true }, false, native)).toBeNull();
		expect(resolveShellShortcutCommand({ key: '[', metaKey: true }, false, native)).toBeNull();
		expect(resolveShellShortcutCommand({ key: 'ArrowLeft', altKey: true }, false, native)).toBeNull();
		expect(resolveShellShortcutCommand({ key: 'h', metaKey: true, shiftKey: true }, false, native)).toBeNull();
		// Chords with no native accelerator stay web-owned in every runtime.
		expect(resolveShellShortcutCommand({ key: 'j', metaKey: true, shiftKey: true }, false, native)).toBe('new-terminal');
		expect(resolveShellShortcutCommand({ key: '`', metaKey: true }, false, native)).toBe('toggle-right-panel');
		expect(resolveShellShortcutCommand({ key: 'e', metaKey: true, shiftKey: true }, false, native)).toBe('toggle-source');
	});

	it('keeps typing targets scoped except global and editor-safe commands', () => {
		const target = document.createElement('input');

		expect(resolveShellShortcutCommand({ key: 'b', metaKey: true, target })).toBeNull();
		expect(resolveShellShortcutCommand({ key: 'k', metaKey: true, target })).toBe('focus-command-palette');
		expect(resolveShellShortcutCommand({ key: 's', metaKey: true, target })).toBe('save-version');
	});

	it('formats shortcut chips from command id correctly', () => {
		expect(formatShortcut('focus-command-palette')).toBe('⌘K');
		expect(formatShortcut('settings')).toBe('⌘,');
		expect(formatShortcut('open-folder')).toBe('⌘O');
		expect(formatShortcut('non-existent-id')).toBeNull();
	});
});
