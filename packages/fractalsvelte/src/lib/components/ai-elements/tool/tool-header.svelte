<script lang="ts" module>
	export type ToolUIPartState =
		| "input-streaming"
		| "input-available"
		| "output-available"
		| "output-error";

	export type ToolHeaderProps = {
		type: string;
		state: ToolUIPartState;
		class?: string;
		[key: string]: unknown;
	};
</script>

<script lang="ts">
	import { CollapsibleTrigger } from "$lib/components/collapsible/index.js";
	import { Badge } from "$lib/components/badge/index.js";

	let { type, state, ...restProps }: ToolHeaderProps = $props();

	const labels = {
		"input-streaming": "Pending",
		"input-available": "Running",
		"output-available": "Completed",
		"output-error": "Error",
	} as const;
</script>

{#snippet statusIcon()}
	{#if state === "input-streaming"}
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-slot="tool-status-icon" data-tool-state={state} aria-hidden="true">
			<circle cx="12" cy="12" r="10" />
		</svg>
	{:else if state === "input-available"}
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-slot="tool-status-icon" data-tool-state={state} aria-hidden="true">
			<circle cx="12" cy="12" r="10" />
			<polyline points="12 6 12 12 16 14" />
		</svg>
	{:else if state === "output-available"}
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-slot="tool-status-icon" data-tool-state={state} aria-hidden="true">
			<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
			<path d="m9 11 3 3L22 4" />
		</svg>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-slot="tool-status-icon" data-tool-state={state} aria-hidden="true">
			<circle cx="12" cy="12" r="10" />
			<path d="m15 9-6 6" />
			<path d="m9 9 6 6" />
		</svg>
	{/if}
{/snippet}

<CollapsibleTrigger data-slot="tool-header" type="button" {...restProps}>
	<div data-slot="tool-header-info">
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
			data-slot="tool-wrench"
			aria-hidden="true"
		>
			<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
		</svg>
		<span data-slot="tool-name">{type}</span>
		<Badge variant="secondary" data-tool-badge>
			{@render statusIcon()}
			{labels[state]}
		</Badge>
	</div>
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
		data-slot="tool-chevron"
		aria-hidden="true"
	>
		<path d="m6 9 6 6 6-6" />
	</svg>
</CollapsibleTrigger>
