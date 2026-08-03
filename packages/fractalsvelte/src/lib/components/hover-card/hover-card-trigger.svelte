<script lang="ts" module>
	import { LinkPreview as HoverCardPrimitive } from 'bits-ui';

	export type HoverCardTriggerProps = HoverCardPrimitive.TriggerProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: HoverCardTriggerProps = $props();
</script>

<HoverCardPrimitive.Trigger bind:ref data-slot="hover-card-trigger" {...restProps} />
