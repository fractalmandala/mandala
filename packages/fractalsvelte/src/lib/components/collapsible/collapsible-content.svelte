<script lang="ts" module>
	import { Collapsible as CollapsiblePrimitive } from 'bits-ui';

	export type CollapsibleContentProps = CollapsiblePrimitive.ContentProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: CollapsibleContentProps = $props();
</script>

<CollapsiblePrimitive.Content bind:ref data-slot="collapsible-content" {...restProps} />
