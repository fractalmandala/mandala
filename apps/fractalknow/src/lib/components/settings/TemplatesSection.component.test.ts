import { fireEvent, render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it, vi } from 'vitest';
import { projectTemplates } from '$lib/shell/templates';
import TemplatesSection from './TemplatesSection.svelte';

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

describe('TemplatesSection component', () => {
	it('renders templates list, creates a new template, and handles template actions', async () => {
		desktopBridgeStore.set({ status: 'ready', bridge: null });
		projectTemplates.set([
			{
				id: 'custom-template.md',
				name: 'custom-template.md',
				title: 'Custom Template',
				description: 'A custom starter template',
				path: '.ok/templates/custom-template.md',
				content: '# Custom\n',
			},
		]);

		const { getByTestId, queryByTestId } = render(TemplatesSection);

		expect(getByTestId('settings-project-templates-section')).toBeTruthy();
		expect(getByTestId('template-row-custom-template.md')).toBeTruthy();

		// Open creation form
		const newBtn = getByTestId('settings-project-templates-new-button');
		await fireEvent.click(newBtn);

		expect(getByTestId('settings-templates-create-form')).toBeTruthy();

		const titleInput = getByTestId('new-template-title-input');
		const descInput = getByTestId('new-template-desc-input');
		const contentInput = getByTestId('new-template-content-input');
		const saveBtn = getByTestId('save-new-template-btn');

		await fireEvent.input(titleInput, { target: { value: 'Bug Report' } });
		await fireEvent.input(descInput, { target: { value: 'Bug template' } });
		await fireEvent.input(contentInput, { target: { value: '# Bug Report\n' } });
		await fireEvent.click(saveBtn);

		const updated = get(projectTemplates);
		expect(updated.some((t) => t.title === 'Bug Report')).toBe(true);
	});
});
