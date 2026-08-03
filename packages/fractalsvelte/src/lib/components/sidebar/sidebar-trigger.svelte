<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Button } from "../button/index.js";

	export type SidebarTriggerProps = ComponentProps<typeof Button> & {
		onclick?: (e: MouseEvent) => void;
	};
</script>

<script lang="ts">
	import { useSidebar } from "./context.svelte.js";

	let {
		ref = $bindable(null),
		children,
		onclick,
		...restProps
	}: SidebarTriggerProps = $props();

	const sidebar = useSidebar();
</script>

<Button
	bind:ref
	data-slot="sidebar-trigger"
	variant="ghost"
	size="icon-sm"
	type="button"
	onclick={(e) => {
		onclick?.(e);
		sidebar.toggle();
	}}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<rect width="18" height="18" x="3" y="3" rx="2" />
			<path d="M9 3v18" />
		</svg>
	{/if}
	<span data-slot="sidebar-trigger-label">Toggle Sidebar</span>
</Button>
