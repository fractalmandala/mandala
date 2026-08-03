import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Message from '../src/lib/components/agents/message/message.svelte';
import MessageBubble from '../src/lib/components/agents/message-bubble/message-bubble.svelte';
import MessageScroller from '../src/lib/components/agents/message-scroller/message-scroller.svelte';
describe('message primitives', () => {
	it('labels message rows', () => {
		render(Message, { props: { from: 'user' } });
		expect(screen.getByLabelText('user message')).toBeTruthy();
	});
	it('exposes bubble variant/alignment', () => {
		render(MessageBubble, { props: { variant: 'outline', align: 'end' } });
		const b = document.querySelector('[data-slot="message-bubble"]');
		expect(b?.getAttribute('data-variant')).toBe('outline');
		expect(b?.getAttribute('data-align')).toBe('end');
	});
	it('creates an accessible live transcript', () => {
		render(MessageScroller, { props: { label: 'Chat', busy: true } });
		expect(screen.getByLabelText('Chat')).toBeTruthy();
		expect(screen.getByRole('log').getAttribute('aria-busy')).toBe('true');
	});
});
