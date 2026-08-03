<script lang="ts" module>
	import { Collapsible as CollapsiblePrimitive } from 'bits-ui';

	export type CollapsibleProps = CollapsiblePrimitive.RootProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		open = $bindable(false),
		...restProps
	}: CollapsibleProps = $props();
</script>

<CollapsiblePrimitive.Root bind:ref bind:open data-slot="collapsible" {...restProps} />
