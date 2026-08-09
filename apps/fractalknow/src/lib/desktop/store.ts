import { readable } from 'svelte/store';
import { createDesktopBridge } from './bridge';
import type { OkDesktopBridge } from './types';

export type DesktopBridgeState =
	| { status: 'loading'; bridge: null }
	| { status: 'ready'; bridge: OkDesktopBridge }
	| { status: 'error'; bridge: null; error: string };

export const desktopBridge = readable<DesktopBridgeState>({ status: 'loading', bridge: null }, (set) => {
	let cancelled = false;

	void createDesktopBridge()
		.then((bridge) => {
			if (!cancelled) set({ status: 'ready', bridge });
		})
		.catch((error: unknown) => {
			if (!cancelled) {
				set({
					status: 'error',
					bridge: null,
					error: error instanceof Error ? error.message : String(error),
				});
			}
		});

	return () => {
		cancelled = true;
	};
});
