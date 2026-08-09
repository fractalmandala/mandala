import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearToasts, currentToasts } from './toasts';
import { runWithToast } from './run-with-toast';

describe('runWithToast', () => {
	beforeEach(() => {
		clearToasts();
	});

	it('resolves without toast when the action succeeds', async () => {
		const action = vi.fn().mockResolvedValue(undefined);
		await runWithToast(action, 'fallback');
		expect(action).toHaveBeenCalledOnce();
		expect(currentToasts()).toHaveLength(0);
	});

	it('pushes a danger toast when the action rejects', async () => {
		await runWithToast(async () => {
			throw new Error('boom');
		}, 'Command failed');
		const toasts = currentToasts();
		expect(toasts).toHaveLength(1);
		expect(toasts[0]?.kind).toBe('danger');
		expect(toasts[0]?.title).toBe('Command failed');
		expect(toasts[0]?.body).toContain('boom');
	});
});
