// Programmatic confirm dialog — replaces window.confirm() in the browser module.
//
// Usage:
//   import { showConfirm } from './showConfirm';
//   if (await showConfirm('Delete this entry?')) { ... }
//
// Each call creates a temporary mount, resolves the promise, then destroys.
// The overlay coordinator is incremented while the dialog is open, which
// raises the chrome above the native webview content.

import { mount, unmount } from 'svelte';
import BrowserConfirm from './BrowserConfirm.svelte';

export function showConfirm(message: string): Promise<boolean> {
	return new Promise<boolean>((resolve) => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		const component = mount(BrowserConfirm, {
			target,
			props: {
				message,
				onResolve: (value: boolean) => {
					resolve(value);
					unmount(component);
					target.remove();
				},
			},
		});
	});
}
