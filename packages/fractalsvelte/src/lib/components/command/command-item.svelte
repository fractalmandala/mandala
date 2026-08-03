<script lang="ts" module>
	import { Command as CommandPrimitive } from "bits-ui";

	export type CommandItemProps = CommandPrimitive.ItemProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: CommandItemProps = $props();
</script>

<CommandPrimitive.Item
	bind:ref
	data-slot="command-item"
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.Item>
