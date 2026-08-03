<script lang="ts">
	import { NotFound } from '$lib/components/blocks/not-found/index.js';

	let variant = $state<'glitch' | 'magnetic' | 'spotlight' | 'stacked' | 'terminal'>('spotlight');
	const variants = ['glitch', 'magnetic', 'spotlight', 'stacked', 'terminal'] as const;
</script>

<div class="fixture-preview">
	<label>
		<span>Visual variant</span>
		<select bind:value={variant} aria-label="Choose not-found visual variant">
			{#each variants as option}<option value={option}>{option}</option>{/each}
		</select>
	</label>
	<NotFound
		{variant}
		title="This view is unavailable"
		description="Try one of the recovery links below."
		homeHref="#preview-home"
		browseHref="#preview-components"
	/>
</div>
