<script lang="ts" module>
	import { Command as CommandPrimitive, useId } from "bits-ui";

	export type CommandGroupProps = CommandPrimitive.GroupProps & {
		heading?: string;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		heading,
		value,
		...restProps
	}: CommandGroupProps = $props();
</script>

<CommandPrimitive.Group
	bind:ref
	data-slot="command-group"
	value={value ?? heading ?? `----${useId()}`}
	{...restProps}
>
	{#if heading}
		<CommandPrimitive.GroupHeading data-slot="command-group-heading">
			{heading}
		</CommandPrimitive.GroupHeading>
	{/if}
	<CommandPrimitive.GroupItems {children} />
</CommandPrimitive.Group>
