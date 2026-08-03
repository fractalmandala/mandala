<script lang="ts">
	import { TextAnimation } from '$lib/components/motion/text-animation/index.js';
	let variant = $state<'reveal' | 'shimmer'>('reveal');
</script>

<div class="fixture-preview">
	<TextAnimation text="Make every interaction count" {variant} split="word" />
	<button type="button" onclick={() => (variant = variant === 'reveal' ? 'shimmer' : 'reveal')}
		>Change animation</button
	>
</div>
