<script lang="ts" module>
	import { Dialog as DialogPrimitive } from 'bits-ui';

	export type DialogOverlayProps = DialogPrimitive.OverlayProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: DialogOverlayProps = $props();
</script>

<DialogPrimitive.Overlay bind:ref data-slot="dialog-overlay" {...restProps} />
