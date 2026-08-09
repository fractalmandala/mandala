import { fireEvent, render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it, vi } from 'vitest';
import { appConfig } from '$lib/shell/config';
import AiToolsSection from './AiToolsSection.svelte';

const desktopBridgeStore = vi.hoisted(() => {
	type Subscriber = (value: unknown) => void;
	let value: unknown = { status: 'loading', bridge: null };
	const subscribers = new Set<Subscriber>();

	return {
		reset() {
			value = { status: 'loading', bridge: null };
			subscribers.clear();
		},
		set(next: unknown) {
			value = next;
			for (const subscriber of subscribers) subscriber(value);
		},
		subscribe(subscriber: Subscriber) {
			subscribers.add(subscriber);
			subscriber(value);
			return () => subscribers.delete(subscriber);
		},
	};
});

vi.mock('$lib/desktop', () => ({
	desktopBridge: desktopBridgeStore,
}));

describe('AiToolsSection component', () => {
	it('renders agent tools cards and updates config overrides when interacted with', async () => {
		desktopBridgeStore.set({ status: 'ready', bridge: null });
		const { getByTestId } = render(AiToolsSection);

		const claudeCard = getByTestId('ai-tool-card-claude');
		expect(claudeCard).toBeTruthy();

		const claudeToggle = getByTestId('ai-tool-toggle-claude') as HTMLInputElement;
		const claudeCommand = getByTestId('ai-tool-command-claude') as HTMLInputElement;

		await fireEvent.change(claudeCommand, { target: { value: 'claude --verbose' } });
		const current = get(appConfig);
		expect(current.agentTools.overrides?.claude?.launchCommand).toBe('claude --verbose');
	});
});
