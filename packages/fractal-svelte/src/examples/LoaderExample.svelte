<script lang="ts">
	import { Loader } from '$lib/components/motion/loader/index.js';
	let variant = $state<'dots' | 'percent'>('dots');
</script>

<div class="fixture-preview">
	<Loader {variant} label={variant === 'dots' ? 'Loading workspace' : 'Uploading files'} />
	<button type="button" onclick={() => (variant = variant === 'dots' ? 'percent' : 'dots')}
		>Change loader</button
	>
</div>
