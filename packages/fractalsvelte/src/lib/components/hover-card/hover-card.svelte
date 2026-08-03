<script lang="ts" module>
	import { LinkPreview as HoverCardPrimitive } from 'bits-ui';

	export type HoverCardProps = HoverCardPrimitive.RootProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: HoverCardProps = $props();
</script>

<HoverCardPrimitive.Root bind:open {...restProps} />
