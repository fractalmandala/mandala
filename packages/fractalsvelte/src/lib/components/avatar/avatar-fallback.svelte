<script lang="ts" module>
	import { Avatar as AvatarPrimitive } from "bits-ui";

	export type AvatarFallbackProps = AvatarPrimitive.FallbackProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: AvatarFallbackProps = $props();
</script>

<AvatarPrimitive.Fallback
	bind:ref
	data-slot="avatar-fallback"
	{...restProps}
>
	{@render children?.()}
</AvatarPrimitive.Fallback>
