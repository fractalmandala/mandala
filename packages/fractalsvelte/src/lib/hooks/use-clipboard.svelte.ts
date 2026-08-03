// Vendored from the ai-elements source (src/lib/hooks/use-clipboard.svelte.ts). Self-contained
// Svelte 5 runes class — no Tailwind, no external deps — so it ports verbatim. Shared by
// copy-button (and code, via copy-button).

type Options = {
	/** The time before the copied status is reset. */
	delay: number;
};

/** Copy text to the clipboard and expose a transient copied/failed status.
 *
 * ```svelte
 * <script lang="ts">
 *   import { UseClipboard } from "$lib/hooks/use-clipboard.svelte";
 *   const clipboard = new UseClipboard();
 * </script>
 * ```
 */
export class UseClipboard {
	#copiedStatus = $state<"success" | "failure">();
	private delay: number;
	private timeout: ReturnType<typeof setTimeout> | undefined = undefined;

	constructor({ delay = 800 }: Partial<Options> = {}) {
		this.delay = delay;
	}

	/** Copies the given text to the user's clipboard. */
	async copy(text: string) {
		if (this.timeout) {
			this.#copiedStatus = undefined;
			clearTimeout(this.timeout);
		}

		try {
			await navigator.clipboard.writeText(text);

			this.#copiedStatus = "success";

			this.timeout = setTimeout(() => {
				this.#copiedStatus = undefined;
			}, this.delay);
		} catch {
			// an error can occur when not in the browser or if the user hasn't given clipboard access
			this.#copiedStatus = "failure";

			this.timeout = setTimeout(() => {
				this.#copiedStatus = undefined;
			}, this.delay);
		}

		return this.#copiedStatus;
	}

	/** true when the user has just copied to the clipboard. */
	get copied() {
		return this.#copiedStatus === "success";
	}

	/** `success` | `failure` | undefined — the current transient status. */
	get status() {
		return this.#copiedStatus;
	}
}
