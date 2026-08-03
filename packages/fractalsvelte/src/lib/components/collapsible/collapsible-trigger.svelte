<script lang="ts" module>
	import { Collapsible as CollapsiblePrimitive } from 'bits-ui';

	export type CollapsibleTriggerProps = CollapsiblePrimitive.TriggerProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: CollapsibleTriggerProps = $props();
</script>

<CollapsiblePrimitive.Trigger bind:ref data-slot="collapsible-trigger" {...restProps} />
