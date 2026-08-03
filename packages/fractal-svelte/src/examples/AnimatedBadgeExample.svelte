<script lang="ts">
	import { AnimatedBadge } from '$lib/components/motion/animated-badge/index.js';
	let status = $state<'loading' | 'success'>('loading');
	function finish() {
		status = 'success';
	}
</script>

<div class="fixture-preview">
	<AnimatedBadge {status} pulse={status === 'loading'}
		>{status === 'loading' ? 'Syncing changes' : 'All changes saved'}</AnimatedBadge
	>
	{#if status === 'loading'}<button type="button" onclick={finish}>Mark saved</button>{/if}
</div>
