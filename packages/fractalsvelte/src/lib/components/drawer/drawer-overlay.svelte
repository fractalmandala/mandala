<script lang="ts">
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	let { ref = $bindable(null), ...restProps }: DrawerPrimitive.OverlayProps = $props();
</script>

<DrawerPrimitive.Overlay bind:ref data-slot="drawer-overlay" {...restProps} />
