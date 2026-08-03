<script lang="ts">
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	let { open = $bindable(false), activeSnapPoint = $bindable(null), ...restProps }: DrawerPrimitive.RootProps = $props();
</script>

<DrawerPrimitive.NestedRoot bind:open bind:activeSnapPoint {...restProps} />
