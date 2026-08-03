<script lang="ts">
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	let { ref = $bindable(null), ...restProps }: DrawerPrimitive.TitleProps = $props();
</script>

<DrawerPrimitive.Title bind:ref data-slot="drawer-title" {...restProps} />
