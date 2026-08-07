<script lang="ts">
	import type { DocsNavigationNode } from '@docs-kit/core';

	import NavigationList from './NavigationList.svelte';

	let {
		navigation,
		pathname,
		label = 'Documentation'
	}: { navigation: DocsNavigationNode[]; pathname: string; label?: string } = $props();

	let open = $state(false);
	let dialog = $state<HTMLDialogElement>();
	let trigger = $state<HTMLButtonElement>();

	/**
	 * A modal `<dialog>` renders in the top layer, so the drawer is not confined by the
	 * header's stacking context, and the browser supplies focus trapping and Escape.
	 */
	$effect(() => {
		if (!dialog) {
			return;
		}

		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});
</script>

<div class="docs-mobile-nav">
	<button
		type="button"
		class="docs-button"
		bind:this={trigger}
		aria-expanded={open}
		aria-haspopup="dialog"
		onclick={() => (open = true)}
	>
		Menu
	</button>

	<dialog
		class="docs-mobile-nav__dialog"
		bind:this={dialog}
		aria-label={label}
		onclose={() => {
			open = false;
			trigger?.focus();
		}}
		onclick={(event) => {
			// Clicking the backdrop closes the drawer; clicks inside the panel do not.
			if (event.target === dialog) {
				open = false;
			}
		}}
	>
		<div class="docs-mobile-nav__panel">
			<button type="button" class="docs-button" onclick={() => (open = false)}>Close</button>
			<nav aria-label={label}>
				<NavigationList nodes={navigation} {pathname} />
			</nav>
		</div>
	</dialog>
</div>
