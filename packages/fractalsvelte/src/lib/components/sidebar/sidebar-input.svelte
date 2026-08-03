<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Input } from "../input/index.js";

	export type SidebarInputProps = ComponentProps<typeof Input>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(""),
		...restProps
	}: SidebarInputProps = $props();
</script>

<!-- Keep Input's own data-slot so its base styling applies; layer the sidebar tweaks
     via a data-sidebar marker. -->
<Input bind:ref bind:value data-sidebar="input" {...restProps} />
