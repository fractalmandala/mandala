<script lang="ts" module>
	import { Avatar as AvatarPrimitive } from "bits-ui";

	export type AvatarSize = "default" | "sm" | "lg";
	export type AvatarProps = AvatarPrimitive.RootProps & {
		size?: AvatarSize;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		loadingStatus = $bindable("loading"),
		size = "default",
		children,
		...restProps
	}: AvatarProps = $props();
</script>

<AvatarPrimitive.Root
	bind:ref
	bind:loadingStatus
	data-slot="avatar"
	data-size={size}
	{...restProps}
>
	{@render children?.()}
</AvatarPrimitive.Root>
