<script lang="ts" module>
	import { Command as CommandPrimitive } from "bits-ui";

	export type CommandLinkItemProps = CommandPrimitive.LinkItemProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: CommandLinkItemProps = $props();
</script>

<CommandPrimitive.LinkItem
	bind:ref
	data-slot="command-link-item"
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.LinkItem>
