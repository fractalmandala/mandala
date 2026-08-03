<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SidebarProviderProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		/**
		 * Embed the shell in a sized parent (previews, panels). Switches the
		 * desktop container from `position: fixed` to `absolute` and drops
		 * the full-viewport min-height.
		 */
		contained?: boolean;
	};
</script>

<script lang="ts">
	import * as Tooltip from "../tooltip/index.js";
	import {
		SIDEBAR_COOKIE_MAX_AGE,
		SIDEBAR_COOKIE_NAME,
		SIDEBAR_WIDTH,
		SIDEBAR_WIDTH_ICON,
	} from "./constants.js";
	import { setSidebar } from "./context.svelte.js";

	let {
		ref = $bindable(null),
		open = $bindable(true),
		onOpenChange = () => {},
		contained = false,
		style,
		children,
		...restProps
	}: SidebarProviderProps = $props();

	const sidebar = setSidebar({
		open: () => open,
		setOpen: (value: boolean) => {
			open = value;
			onOpenChange(value);

			// This sets the cookie to keep the sidebar state.
			document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
		},
	});
</script>

<svelte:window onkeydown={sidebar.handleShortcutKeydown} />

<Tooltip.Provider delayDuration={0}>
	<div
		bind:this={ref}
		data-slot="sidebar-wrapper"
		data-contained={contained || undefined}
		style="--sidebar-width: {SIDEBAR_WIDTH}; --sidebar-width-icon: {SIDEBAR_WIDTH_ICON}; {style ?? ''}"
		{...restProps}
	>
		{@render children?.()}
	</div>
</Tooltip.Provider>
