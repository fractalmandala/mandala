<script lang="ts">
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	let { ref = $bindable(null), ...restProps }: DrawerPrimitive.DescriptionProps = $props();
</script>

<DrawerPrimitive.Description bind:ref data-slot="drawer-description" {...restProps} />
