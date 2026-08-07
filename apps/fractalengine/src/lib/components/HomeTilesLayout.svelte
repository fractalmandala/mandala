<script lang="ts">
	import { appState } from '../state/app.svelte';
	import { TEMPLATES } from '../data/templates';
	import Accordion from '$lib/components/homeaccordion.svelte'

	function apply(id: string) {
		const tpl = TEMPLATES.find(t => t.id === id);
		if (tpl) {
			appState.applyTemplate(tpl);
		}
	}

</script>

<section class="module-wrapper pad4">
	<Accordion>
		{#each TEMPLATES as tpl (tpl.id)}
			{#if tpl.id !== 'blank' && tpl.type ===  'module'}
			<button class="home-tiles-button {tpl.id}" onclick={() => apply(tpl.id)} style="background-image: url({tpl.hero})">
				<div class="home-tiles-screen box gap16">
				<img src="{tpl.logo}" alt={tpl.name} class="gallery-card-icon" />
				<div class="box gap4">
					<span class="home-tiles-title col-inverse">{tpl.name}</span>
					<span class="home-tiles-desc">{tpl.summary}</span>
				</div>
				</div>
			</button>
			{/if}
		{/each}	
	</Accordion>
</section>