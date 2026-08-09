const FOCUSABLE =
	'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusableElements(root: HTMLElement): HTMLElement[] {
	return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
		(el) => !el.hasAttribute('disabled') && el.tabIndex !== -1 && el.offsetParent !== null,
	);
}

/**
 * Trap Tab focus inside `root`. Returns a cleanup that removes the listener.
 * Callers should restore focus to the previously active element themselves.
 */
export function trapFocus(root: HTMLElement): () => void {
	const onKeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Tab') return;
		const focusable = getFocusableElements(root);
		if (focusable.length === 0) {
			event.preventDefault();
			root.focus();
			return;
		}
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement as HTMLElement | null;
		if (event.shiftKey) {
			if (!active || active === first || !root.contains(active)) {
				event.preventDefault();
				last?.focus();
			}
			return;
		}
		if (!active || active === last || !root.contains(active)) {
			event.preventDefault();
			first?.focus();
		}
	};

	root.addEventListener('keydown', onKeydown);
	const focusable = getFocusableElements(root);
	(focusable[0] ?? root).focus();

	return () => {
		root.removeEventListener('keydown', onKeydown);
	};
}

export function restoreFocus(element: Element | null): void {
	if (element instanceof HTMLElement) {
		try {
			element.focus();
		} catch {
			// Element may have been detached.
		}
	}
}
