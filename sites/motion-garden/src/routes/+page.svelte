<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Motion Garden — SvelteKit component showcase</title>
</svelte:head>

<main>
	<h1>Motion Garden</h1>
	<p>Svelte 5 ports of the vendored ui-components motion set.</p>
	<p>Route: {page.url.pathname}</p>
</main>
