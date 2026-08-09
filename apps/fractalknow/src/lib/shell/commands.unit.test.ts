import { describe, expect, it, vi } from 'vitest';
import { createCommandItems, filterCommands, runCommandById } from './commands';
import type { CommandItem } from './types';
import type { OkDesktopBridge } from '$lib/desktop';

const commands: CommandItem[] = [
	{
		id: 'open-editor',
		title: 'Open editor surface',
		group: 'VIEW',
		keywords: ['document', 'welcome'],
		tags: ['navigation'],
		run: vi.fn(),
	},
	{
		id: 'settings',
		title: 'Open settings',
		group: 'SETTINGS',
		shortcut: 'Cmd+,',
		keywords: ['preferences'],
		tags: ['settings'],
		run: vi.fn(),
	},
	{
		id: 'disabled',
		title: 'Disabled command',
		group: 'FILE',
		disabledReason: 'Needs a document.',
		tags: ['files'],
		run: vi.fn(),
	},
	{
		id: 'worktree',
		title: 'Switch worktree',
		group: 'FILE',
		tags: ['worktree', 'git'],
		desktopOnly: true,
		run: vi.fn(),
	},
];

describe('command services', () => {
	it('filters commands by title, group, shortcut, and recent boost', () => {
		expect(filterCommands(commands, 'preferences').map((command) => command.id)).toEqual(['settings']);
		expect(filterCommands(commands, 'settings').map((command) => command.id)).toEqual(['settings']);
		expect(filterCommands(commands, '', ['settings']).at(0)?.id).toBe('settings');
	});

	it('filters commands by tag', () => {
		expect(filterCommands(commands, '', [], 'settings').map((c) => c.id)).toEqual(['settings']);
		expect(filterCommands(commands, 'switch', [], 'git').map((c) => c.id)).toEqual(['worktree']);
	});

	it('runs enabled commands and reports disabled or unknown commands', async () => {
		await expect(runCommandById(commands, 'open-editor')).resolves.toEqual({ ok: true });
		await expect(runCommandById(commands, 'disabled')).resolves.toEqual({
			ok: false,
			reason: 'Needs a document.',
		});
		await expect(runCommandById(commands, 'missing')).resolves.toEqual({
			ok: false,
			reason: 'Unknown command: missing',
		});
	});

	it('gates desktop-only commands when runtime is not tauri', () => {
		const browserBridge = { runtime: 'browser-preview' } as OkDesktopBridge;
		const browserItems = createCommandItems(browserBridge);
		const openFolder = browserItems.find((item) => item.id === 'open-folder');
		const history = browserItems.find((item) => item.id === 'bug-report-history');
		expect(openFolder?.desktopOnly).toBe(true);
		expect(openFolder?.disabledReason).toMatch(/desktop app only/i);
		expect(history?.desktopOnly).toBe(true);
		expect(history?.disabledReason).toMatch(/desktop app only/i);

		const tauriBridge = { runtime: 'tauri' } as OkDesktopBridge;
		const tauriItems = createCommandItems(tauriBridge);
		// Deferred git worktree stubs and the fake send-to-ai command were removed.
		expect(tauriItems.find((item) => item.id === 'switch-worktree')).toBeUndefined();
		expect(tauriItems.find((item) => item.id === 'new-worktree')).toBeUndefined();
		expect(tauriItems.find((item) => item.id === 'send-to-ai')).toBeUndefined();
		expect(tauriItems.find((item) => item.id === 'open-folder')).toBeDefined();
		expect(tauriItems.find((item) => item.id === 'switch-project')).toBeDefined();
		expect(tauriItems.find((item) => item.id === 'bug-report-history')?.disabledReason).toBeUndefined();
	});
});
