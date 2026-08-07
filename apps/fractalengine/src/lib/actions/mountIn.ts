export function mountIn(node: HTMLElement, host: HTMLElement | null | undefined) {
	const placeholder = document.createComment('mounted-inspector');

	function move(nextHost: HTMLElement | null | undefined): void {
		if (nextHost) {
			if (!placeholder.parentNode && node.parentNode) node.parentNode.insertBefore(placeholder, node);
			nextHost.appendChild(node);
			return;
		}
		if (placeholder.parentNode) {
			placeholder.parentNode.insertBefore(node, placeholder);
			placeholder.remove();
		}
	}

	move(host);
	return { update: move, destroy: () => move(null) };
}
