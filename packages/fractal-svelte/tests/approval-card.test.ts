import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import ApprovalCard from '../src/lib/components/agents/approval-card/approval-card.svelte';
describe('ApprovalCard', () => {
	it('walks a question flow and submits answers', async () => {
		const submit = vi.fn();
		render(ApprovalCard, {
			props: {
				questions: [
					{
						id: 'scope',
						title: 'Scope?',
						options: [{ value: 'small', label: 'Small' }],
						autoAdvance: false
					}
				],
				onSubmit: submit
			}
		});
		await fireEvent.click(screen.getByLabelText('Small'));
		await fireEvent.click(screen.getByLabelText('Submit response'));
		expect(submit).toHaveBeenCalledWith({ scope: { selected: ['small'], custom: '' } });
	});
	it('offers review decisions', async () => {
		const approve = vi.fn();
		render(ApprovalCard, { props: { onApprove: approve, onReject: vi.fn() } });
		await fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
		expect(approve).toHaveBeenCalled();
	});
});
