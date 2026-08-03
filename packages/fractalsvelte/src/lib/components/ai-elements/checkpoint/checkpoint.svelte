<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type CheckpointProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { Separator } from '$lib/components/separator/index.js';

	let {
		children,
		ref = $bindable(null),
		...restProps
	}: CheckpointProps = $props();
</script>

<div bind:this={ref} data-slot="checkpoint" {...restProps}>
	{@render children?.()}
	<Separator data-slot="separator" data-checkpoint-separator="true" />
</div>
