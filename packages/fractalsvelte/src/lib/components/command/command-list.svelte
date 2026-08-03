<script lang="ts" module>
	import { Command as CommandPrimitive } from "bits-ui";

	export type CommandListProps = CommandPrimitive.ListProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: CommandListProps = $props();
</script>

<CommandPrimitive.List
	bind:ref
	data-slot="command-list"
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.List>
