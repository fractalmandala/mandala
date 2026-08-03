<script lang="ts">
	import type { Credit } from '$lib/content';

	interface Props {
		credit: Credit | null | undefined;
	}

	let { credit }: Props = $props();
</script>

{#if credit}
	<p class="detail-head__credit">
		<span class="detail-head__credit-label">Credit</span>
		<span class="detail-head__credit-name">{credit.name}</span>
		<span class="detail-head__credit-sep" aria-hidden="true">·</span>
		<a
			class="detail-head__credit-link"
			href={credit.source}
			target="_blank"
			rel="noopener noreferrer"
		>
			Source
			<span class="detail-head__credit-ext" aria-hidden="true">↗</span>
		</a>
	</p>
{/if}
