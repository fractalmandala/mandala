<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	let navOpen = $state(false);
	let toggleButton: HTMLButtonElement | undefined = $state();
	let sidebarNav: HTMLElement | undefined = $state();

	function openNav() {
		navOpen = true;
	}

	function closeNav() {
		navOpen = false;
		toggleButton?.focus();
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && navOpen) closeNav();
	}

	$effect(() => {
		if (navOpen) {
			sidebarNav?.querySelector('a')?.focus();
		}
	});
</script>

<svelte:window onkeydown={onKeydown} />

<div class="docs-shell">
	<div class="docs-toolbar">
		<button
			bind:this={toggleButton}
			class="docs-nav-toggle"
			aria-expanded={navOpen}
			aria-controls="docs-sidebar"
			aria-label="Toggle documentation navigation"
			onclick={() => (navOpen ? closeNav() : openNav())}
		>
			{#if navOpen}
				<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
					<path
						d="M3 3L15 15M15 3L3 15"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</svg>
			{:else}
				<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
					<path
						d="M2 4.5H16M2 9H16M2 13.5H16"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</svg>
			{/if}
		</button>
		<span class="text-sm fw600">Documentation</span>
	</div>

	<div class="docs-body row">
		<aside class="docs-sidebar" class:open={navOpen} id="docs-sidebar">
			<nav bind:this={sidebarNav} aria-label="Documentation">
				<div class="docs-nav-heading text-xs tt-u fw600">Documentation</div>
				<ul class="docs-nav-list box gap4">
					{#each data.docs as doc (doc.slug)}
						{@const href = resolve('/docs/[doc]', { doc: doc.slug })}
						<li>
							<a
								class="docs-nav-link blank"
								class:active={page.url.pathname === href}
								aria-current={page.url.pathname === href ? 'page' : undefined}
								{href}
								onclick={closeNav}
							>
								{doc.title}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</aside>

		{#if navOpen}
			<button class="docs-scrim" aria-label="Close navigation" onclick={closeNav}></button>
		{/if}

		<main class="docs-main" inert={navOpen}>
			{@render children()}
		</main>
	</div>
</div>
