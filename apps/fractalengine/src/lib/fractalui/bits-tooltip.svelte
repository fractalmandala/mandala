<script lang="ts">
	// Reusable Bits UI tooltip (see docs/design + Tooltip.Provider in routes/+layout.svelte).
	//
	// The Trigger IS the button — pass the icon/label as the `trigger` snippet and the
	// click handler via `triggerProps`, don't nest your own <button> inside it.
	//
	// Simple label:   <BitsTooltip text="Open Browser" triggerProps={{ onclick: openBrowser, 'aria-label': 'Open Browser' }}>
	//                   {#snippet trigger()}<img src="/iconset/inlayGlobe.svg" alt="" />{/snippet}
	//                 </BitsTooltip>
	// Rich content:   pass children instead of `text`.
	import { Tooltip, type WithoutChild } from 'bits-ui';
	import type { Snippet } from 'svelte';

	type Props = Tooltip.RootProps & {
		text?: string;
		trigger: Snippet;
		triggerProps?: WithoutChild<Tooltip.TriggerProps>;
		contentProps?: WithoutChild<Tooltip.ContentProps>;
	};

	let {
		open = $bindable(false),
		text = '',
		children,
		trigger,
		triggerProps = {},
		contentProps = {},
		...restProps
	}: Props = $props();
</script>

<Tooltip.Root bind:open delayDuration={400} {...restProps}>
	<Tooltip.Trigger
		{...triggerProps}
		class="fui-tooltip-trigger {triggerProps.class ?? ''}"
	>
		{@render trigger()}
	</Tooltip.Trigger>
	<!-- Portal into the app shell (not body) — semantic tokens are scoped to .app-root-shell -->
	<Tooltip.Portal to=".app-root-shell">
		<Tooltip.Content
			sideOffset={8}
			{...contentProps}
			class="fui-tooltip-content {contentProps.class ?? ''}"
		>
			{#if children}
				{@render children({ open, triggerId: null, payload: null })}
			{:else}
				{text}
			{/if}
		</Tooltip.Content>
	</Tooltip.Portal>
</Tooltip.Root>
