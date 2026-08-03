<script lang="ts">
	import { Input } from '$lib/components/motion/input/index.js';
	let value = $state('');
</script>

<div class="fixture-preview">
	<Input bind:value label="Project name" placeholder="e.g. Aurora" />
	{#if value}<p>Ready to create “{value}”.</p>{/if}
</div>
