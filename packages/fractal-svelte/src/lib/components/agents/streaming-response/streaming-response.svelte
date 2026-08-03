<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import './streaming-response.sass';
	export type StreamingResponseStatus = 'streaming' | 'complete' | 'error';
	export type StreamingResponseFeedback = 'up' | 'down' | null;
	export type CitationItem = { id: string; title: string; domain?: string; url?: string };
	let {
		children,
		status = 'streaming',
		copyText,
		onCopy,
		onRetry,
		sources = [],
		sourcesOpen,
		defaultSourcesOpen = false,
		onSourcesOpenChange,
		sourceIdPrefix = 'response-source',
		feedback,
		defaultFeedback = null,
		onFeedbackChange,
		announce = true,
		showActions = true
	}: {
		children: Snippet;
		status?: StreamingResponseStatus;
		copyText?: string;
		onCopy?: () => void | Promise<void>;
		onRetry?: () => void;
		sources?: CitationItem[];
		sourcesOpen?: boolean;
		defaultSourcesOpen?: boolean;
		onSourcesOpenChange?: (v: boolean) => void;
		sourceIdPrefix?: string;
		feedback?: StreamingResponseFeedback;
		defaultFeedback?: StreamingResponseFeedback;
		onFeedbackChange?: (v: StreamingResponseFeedback) => void;
		announce?: boolean;
		showActions?: boolean;
	} = $props();
	let copied = $state(false),
		internalFeedback = $state(untrack(() => defaultFeedback)),
		internalSources = $state(untrack(() => defaultSourcesOpen)),
		timer: ReturnType<typeof setTimeout>;
	let currentFeedback = $derived(feedback ?? internalFeedback),
		currentSources = $derived(sourcesOpen ?? internalSources),
		complete = $derived(status === 'complete'),
		actions = $derived(
			showActions &&
				status !== 'streaming' &&
				(!!copyText || !!onCopy || !!onRetry || complete || sources.length > 0)
		);
	const id = `sources-${Math.random().toString(36).slice(2)}`;
	async function copy() {
		if (onCopy) await onCopy();
		else if (copyText) await navigator.clipboard?.writeText(copyText);
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 1600);
	}
	function vote(v: 'up' | 'down') {
		const next = currentFeedback === v ? null : v;
		if (feedback === undefined) internalFeedback = next;
		onFeedbackChange?.(next);
	}
	function toggleSources() {
		const next = !currentSources;
		if (sourcesOpen === undefined) internalSources = next;
		onSourcesOpenChange?.(next);
	}
	$effect(() => () => clearTimeout(timer));
</script>

<div data-slot="streaming-response" data-state={status} aria-busy={status === 'streaming'}>
	<div data-slot="streaming-response-content" aria-live={announce ? 'polite' : 'off'}>
		{@render children()}
	</div>
	{#if actions}<div data-slot="streaming-response-actions">
			{#if copyText || onCopy}<button
					type="button"
					aria-label={copied ? 'Copied' : 'Copy response'}
					onclick={copy}>{copied ? '✓' : '⧉'}</button
				>{/if}{#if onRetry}<button
					type="button"
					aria-label="Retry response"
					onclick={onRetry}>↻</button
				>{/if}{#if complete}<button
					type="button"
					aria-label="Helpful"
					aria-pressed={currentFeedback === 'up'}
					onclick={() => vote('up')}>↑</button
				><button
					type="button"
					aria-label="Not helpful"
					aria-pressed={currentFeedback === 'down'}
					onclick={() => vote('down')}>↓</button
				>{/if}{#if sources.length}<button
					type="button"
					data-slot="streaming-response-sources-trigger"
					aria-expanded={currentSources}
					aria-controls={id}
					onclick={toggleSources}
					>{sources.length}
					{sources.length === 1 ? 'source' : 'sources'}
					<span aria-hidden="true">⌄</span></button
				>{/if}
		</div>
		{#if sources.length}<div
				{id}
				data-slot="streaming-response-sources"
				aria-hidden={!currentSources}
				inert={!currentSources}
			>
				{#each sources as source, i (source.id)}{#if source.url}<a
							id={`${sourceIdPrefix}-${source.id}`}
							href={source.url}
							target="_blank"
							rel="noreferrer noopener"
							><span>{source.title}</span><small>{source.domain}</small><span
								>{i + 1}</span
							></a
						>{:else}<div id={`${sourceIdPrefix}-${source.id}`}>
							<span>{source.title}</span><small>{source.domain}</small><span
								>{i + 1}</span
							>
						</div>{/if}{/each}
			</div>{/if}{/if}
</div>
