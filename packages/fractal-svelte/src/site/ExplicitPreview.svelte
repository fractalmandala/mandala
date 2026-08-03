<script lang="ts">
	import { onMount } from 'svelte';
	import { previewLoaders, type PreviewSlug } from './preview-registry.js';

	let { slug }: { slug: string } = $props();
	let Preview = $state<any>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			if (!(slug in previewLoaders)) throw new Error(`No preview registered for ${slug}`);
			Preview = (await previewLoaders[slug as PreviewSlug]()).default;
		} catch (cause) {
			error = cause instanceof Error ? cause.message : String(cause);
			console.error(`Failed to load preview: ${slug}`, cause);
		} finally {
			loading = false;
		}
	});
</script>

{#if Preview}
	<Preview />
{:else if loading}
	<p class="preview-loading">Loading preview…</p>
{:else}
	<p class="preview-error" role="alert">Preview failed to load: {error}</p>
{/if}
