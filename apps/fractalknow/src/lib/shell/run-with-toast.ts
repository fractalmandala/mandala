import { pushToast } from './toasts';

/**
 * Run an async action and surface rejections as a danger toast.
 * Mirrors OpenKnowledge's CommandPalette-scoped `runWithToast`.
 */
export async function runWithToast(
	fn: () => void | Promise<void>,
	fallback: string,
	toastApi: { error: (title: string, body?: string) => void } = defaultToastApi,
	surface = 'CommandPalette',
): Promise<void> {
	try {
		await fn();
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		const body = detail && detail !== fallback ? detail : undefined;
		toastApi.error(fallback, body ? `${surface}: ${body}` : surface);
	}
}

const defaultToastApi = {
	error(title: string, body?: string): void {
		pushToast({
			kind: 'danger',
			title,
			body,
			timeoutMs: 5200,
		});
	},
};
