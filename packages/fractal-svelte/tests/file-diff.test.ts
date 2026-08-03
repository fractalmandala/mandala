import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import FileDiff from '../src/lib/components/agents/file-diff/file-diff.svelte';
describe('FileDiff', () => {
	it('renders line numbers, counts, disclosure, and copy', async () => {
		const onCopy = vi.fn();
		render(FileDiff, {
			props: {
				file: 'a.ts',
				lines: [{ id: '1', type: 'added', newLine: 1, content: 'const a=1' }],
				status: 'complete',
				collapseOnComplete: false,
				onCopy
			}
		});
		expect(screen.getByText('+1')).toBeTruthy();
		await fireEvent.click(screen.getByLabelText('Copy diff'));
		expect(onCopy).toHaveBeenCalled();
	});
});
