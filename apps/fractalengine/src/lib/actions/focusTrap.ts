const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(node: HTMLElement): HTMLElement[] {
	return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
		(el) => el.offsetParent !== null
	);
}

// Svelte action for modal dialogs: moves focus inside on mount, cycles Tab/Shift+Tab
// between the first and last focusable descendant so focus can't escape to the page behind
// the modal, and restores focus to whatever was focused before the modal opened once it's
// torn down. Use on the dialog panel element itself (not the backdrop).
export function trapFocus(node: HTMLElement) {
	const previouslyFocused = document.activeElement as HTMLElement | null;

	function handleKeydown(e: KeyboardEvent) {
		if (e.key !== 'Tab') return;
		const focusable = getFocusable(node);
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	const initial = getFocusable(node)[0] ?? node;
	initial.focus();

	node.addEventListener('keydown', handleKeydown);

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeydown);
			previouslyFocused?.focus();
		}
	};
}
