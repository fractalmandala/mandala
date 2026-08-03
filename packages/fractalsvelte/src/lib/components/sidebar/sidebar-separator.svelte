<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Separator } from "../separator/index.js";

	export type SidebarSeparatorProps = ComponentProps<typeof Separator>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		...restProps
	}: SidebarSeparatorProps = $props();
</script>

<!-- Keep Separator's own data-slot so its base styling applies; layer the sidebar tweaks
     via a data-sidebar marker. -->
<Separator bind:ref data-sidebar="separator" {...restProps} />
