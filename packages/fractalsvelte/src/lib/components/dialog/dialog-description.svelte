<script lang="ts" module>
	import { Dialog as DialogPrimitive } from 'bits-ui';

	export type DialogDescriptionProps = DialogPrimitive.DescriptionProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: DialogDescriptionProps = $props();
</script>

<DialogPrimitive.Description bind:ref data-slot="dialog-description" {...restProps} />
