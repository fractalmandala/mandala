<script lang="ts" module>
	import { Dialog as DialogPrimitive } from 'bits-ui';

	export type DialogTitleProps = DialogPrimitive.TitleProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: DialogTitleProps = $props();
</script>

<DialogPrimitive.Title bind:ref data-slot="dialog-title" {...restProps} />
