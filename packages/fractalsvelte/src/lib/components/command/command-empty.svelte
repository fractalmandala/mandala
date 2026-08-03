<script lang="ts" module>
	import { Command as CommandPrimitive } from "bits-ui";

	export type CommandEmptyProps = CommandPrimitive.EmptyProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: CommandEmptyProps = $props();
</script>

<CommandPrimitive.Empty
	bind:ref
	data-slot="command-empty"
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.Empty>
