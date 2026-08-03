<script lang="ts">
	import { ActionSwap } from '$lib/components/blocks/action-swap/index.js';
	const items = [
		{ id: 'grid', label: 'Grid view' },
		{ id: 'list', label: 'List view' }
	];
	let value = $state('grid');
</script>

<div class="fixture-preview">
	<ActionSwap {items} bind:value animation="cascade" />
	<p>Showing a {value} of your projects.</p>
</div>
