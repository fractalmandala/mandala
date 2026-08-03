<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { Collapsible } from '$lib/components/collapsible/index.js';

	export type TaskProps = ComponentProps<typeof Collapsible>;
</script>

<script lang="ts">
	let {
		open = $bindable(true),
		children,
		ref = $bindable(null),
		...restProps
	}: TaskProps = $props();
</script>

<Collapsible bind:ref bind:open data-slot="task" {...restProps}>
	{@render children?.()}
</Collapsible>
