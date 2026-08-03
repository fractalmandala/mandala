<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type TaskItemFileProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: TaskItemFileProps = $props();
</script>

<div bind:this={ref} data-slot="task-item-file" {...restProps}>
	{@render children?.()}
</div>
