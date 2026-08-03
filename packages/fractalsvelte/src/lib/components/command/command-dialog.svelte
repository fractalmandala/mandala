<script lang="ts" module>
	import type { Command as CommandPrimitive, Dialog as DialogPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { WithoutChildrenOrChild } from '$lib/utils.js';
	import * as Dialog from '../dialog/index.js';
	import Command from './command.svelte';

	export type CommandDialogProps = WithoutChildrenOrChild<DialogPrimitive.RootProps> &
		WithoutChildrenOrChild<CommandPrimitive.RootProps> & {
			portalProps?: DialogPrimitive.PortalProps;
			children?: Snippet;
			title?: string;
			description?: string;
			showCloseButton?: boolean;
		};
</script>

<script lang="ts">
	let {
		open = $bindable(false),
		ref = $bindable(null),
		value = $bindable(''),
		title = 'Command Palette',
		description = 'Search for a command to run...',
		showCloseButton = false,
		portalProps,
		children,
		...restProps
	}: CommandDialogProps = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		data-command-dialog="true"
		{showCloseButton}
		{portalProps}
		maxWidth="32rem"
	>
		<!-- Visually hidden title/description for the dialog a11y tree -->
		<Dialog.Header data-slot="dialog-header" data-command-dialog-sr="true">
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>{description}</Dialog.Description>
		</Dialog.Header>
		<Command bind:value bind:ref {...restProps}>
			{@render children?.()}
		</Command>
	</Dialog.Content>
</Dialog.Root>
