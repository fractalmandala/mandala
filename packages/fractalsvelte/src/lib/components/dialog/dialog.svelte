<script lang="ts" module>
	import { Dialog as DialogPrimitive } from 'bits-ui';

	export type DialogProps = DialogPrimitive.RootProps;
</script>

<script lang="ts">
	let { open = $bindable(false), ...restProps }: DialogProps = $props();
</script>

<DialogPrimitive.Root bind:open {...restProps} />
