<script lang="ts" module>
	import { Dialog as DialogPrimitive } from 'bits-ui';

	export type DialogPortalProps = DialogPrimitive.PortalProps;
</script>

<script lang="ts">
	let { ...restProps }: DialogPortalProps = $props();
</script>

<DialogPrimitive.Portal {...restProps} />
