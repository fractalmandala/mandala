<script lang="ts" module>
	import type { ComponentProps, Snippet } from "svelte";
	import { Root as CollapsibleRoot } from "$lib/components/collapsible/index.js";
	import type { LogEntry } from "./web-preview-context.svelte.js";

	export type WebPreviewConsoleProps = ComponentProps<typeof CollapsibleRoot> & {
		logs?: LogEntry[];
		children?: Snippet;
	};
</script>

<script lang="ts">
	import {
		CollapsibleContent,
		CollapsibleTrigger,
	} from "$lib/components/collapsible/index.js";
	import { Button } from "$lib/components/button/index.js";
	import { getWebPreviewContext } from "./web-preview-context.svelte.js";

	let {
		logs = [],
		children,
		ref = $bindable(null),
		...restProps
	}: WebPreviewConsoleProps = $props();

	let context = getWebPreviewContext();

	let logsWithIds = $derived(
		logs.map((log, i) => ({
			...log,
			id: `${log.level}-${log.timestamp.getTime()}-${i}`,
		}))
	);
</script>

<CollapsibleRoot
	bind:ref
	data-slot="web-preview-console"
	onOpenChange={context.setConsoleOpen.bind(context)}
	open={context.consoleOpen}
	{...restProps}
>
	<CollapsibleTrigger>
		<Button variant="ghost" data-web-preview-console-trigger type="button">
			Console
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
				data-slot="web-preview-console-chevron"
				data-open={context.consoleOpen}
				aria-hidden="true"
			>
				<path d="m6 9 6 6 6-6" />
			</svg>
		</Button>
	</CollapsibleTrigger>
	<CollapsibleContent>
		<div data-slot="web-preview-console-logs">
			{#if logsWithIds.length === 0}
				<p data-slot="console-empty">No console output</p>
			{:else}
				{#each logsWithIds as log (log.id)}
					<div data-slot="console-log-entry" data-level={log.level}>
						<span data-slot="console-log-time">
							{log.timestamp.toLocaleTimeString()}
						</span>
						{log.message}
					</div>
				{/each}
			{/if}
			{#if children}
				{@render children()}
			{/if}
		</div>
	</CollapsibleContent>
</CollapsibleRoot>
