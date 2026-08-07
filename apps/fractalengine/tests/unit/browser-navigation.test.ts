import { describe, expect, it } from 'vitest';
import { BrowserWindowState } from '../../src/lib/modules/browser/state/browser.svelte';
import { browserTabClose, browserWindowState } from '../../src/lib/ipc-mock';

describe('BrowserWindowState address navigation', () => {
	it('creates a native-tab equivalent when the window has no active tab', async () => {
		const windowId = 'empty-address-navigation';
		const initial = await browserWindowState(windowId);
		expect(initial?.active_tab_id).toBeTruthy();

		await browserTabClose({ windowId, tabId: initial!.active_tab_id });
		expect((await browserWindowState(windowId))?.active_tab_id).toBe('');

		const state = new BrowserWindowState(windowId);
		await state.navigateActive('https://example.com');

		const result = await browserWindowState(windowId);
		expect(result?.active_tab_id).toBeTruthy();
		expect(result?.tabs).toEqual(expect.arrayContaining([
			expect.objectContaining({ url: 'https://example.com' })
		]));
	});
});
