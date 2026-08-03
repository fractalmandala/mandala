<script lang="ts" module>
	import { AspectRatio as AspectRatioPrimitive } from "bits-ui";

	export type AspectRatioProps = AspectRatioPrimitive.RootProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: AspectRatioProps = $props();
</script>

<AspectRatioPrimitive.Root bind:ref data-slot="aspect-ratio" {...restProps} />
