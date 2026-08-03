<script lang="ts" module>
	import { Command as CommandPrimitive } from "bits-ui";

	export type CommandSeparatorProps = CommandPrimitive.SeparatorProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		...restProps
	}: CommandSeparatorProps = $props();
</script>

<CommandPrimitive.Separator
	bind:ref
	data-slot="command-separator"
	{...restProps}
/>
