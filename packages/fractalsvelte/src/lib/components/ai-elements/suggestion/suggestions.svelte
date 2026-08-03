<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { ScrollArea } from '$lib/components/scroll-area/index.js';

	export type SuggestionsProps = ComponentProps<typeof ScrollArea>;
</script>

<script lang="ts">
	let {
		orientation = 'horizontal',
		whitespace = 'nowrap',
		children,
		ref = $bindable(null),
		...restProps
	}: SuggestionsProps = $props();
</script>

<!-- Outer shell owns data-slot=suggestions so ScrollArea keeps data-slot=scroll-area. -->
<div data-slot="suggestions">
	<ScrollArea
		bind:ref
		{orientation}
		{whitespace}
		width="100%"
		{...restProps}
	>
		<div data-slot="suggestions-list">
			{@render children?.()}
		</div>
	</ScrollArea>
</div>
