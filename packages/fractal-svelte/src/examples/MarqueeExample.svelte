<script lang="ts">
	import { Marquee } from '$lib/components/motion/marquee/index.js';
	const items = ['Design systems', 'Motion patterns', 'Accessible UI', 'Svelte components'];
</script>

<div class="fixture-preview">
	<Marquee speed={22} gap="2rem" aria-label="Featured topics">
		{#each items as item}<span>{item}</span>{/each}
	</Marquee>
</div>
