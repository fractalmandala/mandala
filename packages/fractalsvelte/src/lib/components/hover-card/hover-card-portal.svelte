<script lang="ts" module>
	import { LinkPreview as HoverCardPrimitive } from 'bits-ui';

	export type HoverCardPortalProps = HoverCardPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: HoverCardPortalProps = $props();
</script>

<HoverCardPrimitive.Portal {...restProps} />
