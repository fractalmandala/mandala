import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import StreamingResponse from '../src/lib/components/agents/streaming-response/streaming-response.svelte';
describe('StreamingResponse', () => {
	it('hides completion actions during streaming', () => {
		render(StreamingResponse, {
			props: { children: undefined as any, status: 'streaming', copyText: 'x' }
		});
		expect(screen.queryByLabelText('Copy response')).toBeNull();
	});
	it('supports feedback and source disclosure', async () => {
		const feedback = vi.fn();
		render(StreamingResponse, {
			props: {
				children: undefined as any,
				status: 'complete',
				sources: [{ id: 'one', title: 'One', url: 'https://example.com' }],
				onFeedbackChange: feedback
			}
		});
		await fireEvent.click(screen.getByLabelText('Helpful'));
		expect(feedback).toHaveBeenCalledWith('up');
		const source = screen.getByRole('button', { name: /1 source/ });
		await fireEvent.click(source);
		expect(source.getAttribute('aria-expanded')).toBe('true');
	});
});
