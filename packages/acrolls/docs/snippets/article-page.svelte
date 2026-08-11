<script lang="ts">
	/**
	 * Copy to src/routes/docs/[slug]/+page.svelte
	 * Pair with +page.ts that loads the matching .md module.
	 */
	import { Publication } from '@acrolls/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const Doc = $derived(data.document);
</script>

<article>
	<Publication>
		<Doc />
	</Publication>
</article>
