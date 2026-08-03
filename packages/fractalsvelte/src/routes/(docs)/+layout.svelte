<script lang="ts">
	import { page } from '$app/state';
	import Sidebar from '$lib/docs/Sidebar.svelte';
	import Toc from '$lib/docs/Toc.svelte';
	import { nav } from '$lib/docs/nav.svelte.js';

	let { children } = $props();
	const section = $derived(
		page.url.pathname.startsWith('/ai')
			? 'ai'
			: page.url.pathname.startsWith('/blocks')
				? 'blocks'
				: 'components'
	);

	$effect(() => {
		page.url.pathname;
		nav.open = false;
	});
</script>

<div class="the-grid-three">
	<div class="aside-left asider" data-open={nav.open}>
		<div class="inside-asider">
			<Sidebar {section} onnavigate={() => (nav.open = false)} />
		</div>
	</div>
	{#if nav.open}
		<button
			type="button"
			class="doc-scrim"
			aria-label="Close navigation"
			onclick={() => (nav.open = false)}
		></button>
	{/if}
	<main class="the-grid-center">
		<div class="fitted-box">
			{@render children()}
		</div>
	</main>
	<div class="aside-right asider">
		<div class="inside-asider">
			<Toc key={page.url.pathname} />
		</div>
	</div>
</div>
