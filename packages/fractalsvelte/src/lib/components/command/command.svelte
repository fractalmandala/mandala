<script lang="ts" module>
	import { Command as CommandPrimitive } from "bits-ui";

	export type CommandRootApi = CommandPrimitive.Root;
	export type CommandProps = CommandPrimitive.RootProps & {
		api?: CommandRootApi | null;
	};
</script>

<script lang="ts">
	let {
		api = $bindable(null),
		ref = $bindable(null),
		value = $bindable(""),
		children,
		...restProps
	}: CommandProps = $props();
</script>

<CommandPrimitive.Root
	bind:this={api}
	bind:value
	bind:ref
	data-slot="command"
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.Root>
