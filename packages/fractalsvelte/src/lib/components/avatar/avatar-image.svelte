<script lang="ts" module>
	import { Avatar as AvatarPrimitive } from "bits-ui";

	export type AvatarImageProps = AvatarPrimitive.ImageProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		...restProps
	}: AvatarImageProps = $props();
</script>

<AvatarPrimitive.Image
	bind:ref
	data-slot="avatar-image"
	{...restProps}
/>
