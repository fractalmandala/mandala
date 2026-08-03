<script lang="ts" module>
	import type { WithoutChildrenOrChild } from "$lib/utils.js";
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
	import type { ComponentProps, Snippet } from "svelte";
	import AlertDialogOverlay from "./alert-dialog-overlay.svelte";
	import AlertDialogPortal from "./alert-dialog-portal.svelte";

	export type AlertDialogContentProps = WithoutChildrenOrChild<AlertDialogPrimitive.ContentProps> & {
		size?: "default" | "sm";
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof AlertDialogPortal>>;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		size = "default",
		portalProps,
		// bits-ui defaults this to "ignore" for alert dialogs. We close on outside click
		// so demos and common app usage match Dialog; pass "ignore" for strict modal confirmations.
		interactOutsideBehavior = "close",
		children,
		...restProps
	}: AlertDialogContentProps = $props();
</script>

<AlertDialogPortal {...portalProps}>
	<AlertDialogOverlay />
	<AlertDialogPrimitive.Content
		bind:ref
		data-slot="alert-dialog-content"
		data-size={size}
		{interactOutsideBehavior}
		{...restProps}
	>
		{@render children?.()}
	</AlertDialogPrimitive.Content>
</AlertDialogPortal>
