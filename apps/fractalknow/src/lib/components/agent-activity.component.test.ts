import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AgentActivity from './AgentActivity.svelte';
import { connectActivityBridge, type ActivityBridge } from '$lib/shell/agent-sessions';

function mockBridge(): ActivityBridge {
	return {
		listActivitySessions: vi.fn(async () => [
			{
				sessionId: 'sess-1',
				agent: 'claude-code',
				startedAt: '2026-07-30T10:00:00.000Z',
				lastEventAt: '2026-07-30T10:05:00.000Z',
				eventCount: 2,
				sizeBytes: 512,
			},
		]),
		readActivitySession: vi.fn(async (sessionId: string, offset: number, limit: number) => ({
			sessionId,
			offset,
			limit,
			total: 2,
			events: [
				{
					ts: '2026-07-30T10:00:00.000Z',
					sessionId,
					agent: 'claude-code',
					kind: 'prompt',
					summary: 'Fix the sidebar',
					paths: [],
					meta: {},
				},
				{
					ts: '2026-07-30T10:05:00.000Z',
					sessionId,
					agent: 'claude-code',
					kind: 'edit',
					summary: 'Edited ShellSidebar.svelte',
					paths: ['src/lib/components/ShellSidebar.svelte'],
					meta: {},
				},
			],
		})),
		appendActivityEvent: vi.fn(),
		pruneActivitySessions: vi.fn(async () => ({ removedSessions: 0, freedBytes: 0 })),
	};
}

describe('AgentActivity', () => {
	beforeEach(() => {
		connectActivityBridge(mockBridge());
	});

	it('lists agent sessions from the activity bridge', async () => {
		render(AgentActivity);
		await waitFor(() => expect(screen.getByText('claude-code')).toBeTruthy());
		expect(screen.getByText('sess-1')).toBeTruthy();
		expect(screen.getByText(/2 events/)).toBeTruthy();
	});

	it('drills into a session timeline and navigates back', async () => {
		render(AgentActivity);
		await waitFor(() => expect(screen.getByText('sess-1')).toBeTruthy());

		await fireEvent.click(screen.getByText('sess-1'));
		await waitFor(() => expect(screen.getByText('Fix the sidebar')).toBeTruthy());
		expect(screen.getByText('Edited ShellSidebar.svelte')).toBeTruthy();
		expect(screen.getByText('src/lib/components/ShellSidebar.svelte')).toBeTruthy();

		await fireEvent.click(screen.getByText('← Sessions'));
		await waitFor(() => expect(screen.getByText('sess-1')).toBeTruthy());
	});

	it('shows an empty state when no sessions are recorded', async () => {
		const bridge = mockBridge();
		bridge.listActivitySessions = vi.fn(async () => []);
		connectActivityBridge(bridge);
		render(AgentActivity);
		await waitFor(() => expect(screen.getByText('No agent sessions recorded yet.')).toBeTruthy());
	});
});
