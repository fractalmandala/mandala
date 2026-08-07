import { registryVersion, type Registry } from './types.js';

const calloutComponent = `<script lang="ts">
	import type { Snippet } from 'svelte';

	type CalloutKind = 'note' | 'tip' | 'warning' | 'danger';

	let {
		kind = 'note',
		title,
		children
	}: { kind?: CalloutKind; title?: string; children: Snippet } = $props();

	const labels: Record<CalloutKind, string> = {
		note: 'Note',
		tip: 'Tip',
		warning: 'Warning',
		danger: 'Danger'
	};
</script>

<aside class="docs-callout docs-callout--{kind}" role="note" aria-label={title ?? labels[kind]}>
	<p class="docs-callout__title">{title ?? labels[kind]}</p>
	<div class="docs-callout__body">{@render children()}</div>
</aside>

<style>
	.docs-callout {
		border-inline-start: 3px solid var(--docs-callout-accent, currentColor);
		padding: 0.75rem 1rem;
		margin-block: 1.5rem;
		background: var(--docs-callout-background, transparent);
	}

	.docs-callout--tip { --docs-callout-accent: var(--docs-accent, #00d148); }
	.docs-callout--warning { --docs-callout-accent: #d18f00; }
	.docs-callout--danger { --docs-callout-accent: #d13b00; }

	.docs-callout__title {
		margin: 0 0 0.25rem;
		font-weight: 600;
	}

	.docs-callout__body :global(p:last-child) { margin-bottom: 0; }
</style>
`;

const tabsComponent = `<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		tabs,
		panel
	}: { tabs: string[]; panel: Snippet<[string]> } = $props();

	let active = $state(tabs[0] ?? '');
</script>

<div class="docs-tabs">
	<div class="docs-tabs__list" role="tablist">
		{#each tabs as tab (tab)}
			<button
				type="button"
				role="tab"
				id="tab-{tab}"
				aria-selected={active === tab}
				aria-controls="panel-{tab}"
				tabindex={active === tab ? 0 : -1}
				onclick={() => (active = tab)}
			>
				{tab}
			</button>
		{/each}
	</div>

	{#each tabs as tab (tab)}
		{#if active === tab}
			<div class="docs-tabs__panel" role="tabpanel" id="panel-{tab}" aria-labelledby="tab-{tab}">
				{@render panel(tab)}
			</div>
		{/if}
	{/each}
</div>

<style>
	.docs-tabs__list {
		display: flex;
		gap: 0.25rem;
		border-bottom: 1px solid var(--docs-border, #e5e7eb);
	}

	.docs-tabs__list button {
		background: none;
		border: 0;
		border-bottom: 2px solid transparent;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		color: inherit;
		font: inherit;
	}

	.docs-tabs__list button[aria-selected='true'] {
		border-bottom-color: var(--docs-accent, #00d148);
	}
</style>
`;

const feedbackComponent = `<script lang="ts">
	let {
		pathname,
		submit
	}: {
		pathname: string;
		submit: (feedback: { pathname: string; helpful: boolean; comment: string }) => Promise<void>;
	} = $props();

	let helpful = $state<boolean | undefined>(undefined);
	let comment = $state('');
	let status = $state<'idle' | 'sending' | 'sent' | 'error'>('idle');

	async function send(value: boolean) {
		helpful = value;
		status = 'sending';
		try {
			await submit({ pathname, helpful: value, comment });
			status = 'sent';
		} catch {
			status = 'error';
		}
	}
</script>

<section class="docs-feedback" aria-label="Page feedback">
	{#if status === 'sent'}
		<p>Thanks for the feedback.</p>
	{:else}
		<p>Was this page helpful?</p>
		<div class="docs-feedback__actions">
			<button type="button" onclick={() => send(true)} disabled={status === 'sending'}>Yes</button>
			<button type="button" onclick={() => send(false)} disabled={status === 'sending'}>No</button>
		</div>
		{#if helpful === false}
			<label>
				What was missing?
				<textarea bind:value={comment} rows="3"></textarea>
			</label>
		{/if}
		{#if status === 'error'}
			<p role="alert">Feedback could not be sent. Please try again.</p>
		{/if}
	{/if}
</section>
`;

const analyticsModule = `/**
 * Minimal analytics hook for documentation pages.
 * Swap the transport for your provider; nothing here runs during prerendering.
 */
export interface DocsPageView {
	pathname: string;
	title: string;
	version?: string;
	locale?: string;
}

export type DocsAnalyticsTransport = (event: DocsPageView) => void;

let transport: DocsAnalyticsTransport | undefined;

export function configureDocsAnalytics(next: DocsAnalyticsTransport): void {
	transport = next;
}

export function trackDocsPageView(event: DocsPageView): void {
	if (typeof window === 'undefined') {
		return;
	}

	transport?.(event);
}
`;

const feedbackEndpoint = `import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * Receives documentation feedback. Replace the storage call with your own sink.
 * Keep this endpoint server-side so provider credentials never reach the browser.
 */
export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.json();

	if (typeof payload?.pathname !== 'string' || typeof payload?.helpful !== 'boolean') {
		return json({ error: 'pathname and helpful are required' }, { status: 400 });
	}

	console.info('docs feedback', {
		pathname: payload.pathname,
		helpful: payload.helpful,
		comment: typeof payload.comment === 'string' ? payload.comment.slice(0, 2000) : ''
	});

	return json({ ok: true });
};
`;

const askProvider = `import type { DocsAskProvider } from '@docs-kit/ai';
import { createAskPrompt } from '@docs-kit/ai';

export interface OpenAiCompatibleOptions {
	baseUrl: string;
	model: string;
	/** Read the key on the server only. Never expose it to the browser. */
	apiKey: string;
}

/** Ask AI provider for any OpenAI-compatible chat completions endpoint. */
export function openAiCompatibleAskProvider(
	options: OpenAiCompatibleOptions
): DocsAskProvider {
	return {
		name: \`openai-compatible:\${options.model}\`,
		async *answer(request) {
			const response = await fetch(\`\${options.baseUrl}/chat/completions\`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					authorization: \`Bearer \${options.apiKey}\`
				},
				body: JSON.stringify({
					model: options.model,
					stream: true,
					messages: [{ role: 'user', content: createAskPrompt(request) }]
				}),
				...(request.signal ? { signal: request.signal } : {})
			});

			if (!response.ok || !response.body) {
				throw new Error(\`Ask AI request failed with HTTP \${response.status}.\`);
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\\n');
				buffer = lines.pop() ?? '';

				for (const line of lines) {
					if (!line.startsWith('data: ')) continue;
					const data = line.slice(6).trim();
					if (data === '[DONE]') return;

					try {
						const delta = JSON.parse(data)?.choices?.[0]?.delta?.content;
						if (typeof delta === 'string' && delta !== '') yield delta;
					} catch {
						// Ignore keep-alive and malformed frames.
					}
				}
			}
		}
	};
}
`;

const githubSourceRecipe = `import { githubSource } from '@docs-kit/sources';

/**
 * Pulls a documentation directory from another repository.
 * Run \`docs sync\` to refresh the local cache before building.
 */
export const partnerDocs = githubSource({
	id: 'partner-docs',
	repository: 'acme/partner-docs',
	ref: 'main',
	directory: 'docs',
	...(process.env.GITHUB_TOKEN ? { token: process.env.GITHUB_TOKEN } : {})
});
`;

/**
 * The registry shipped with the framework.
 *
 * Every item is source you own after installation: `docs add` copies the files into the
 * host project rather than adding a runtime dependency.
 */
export const builtinRegistry: Registry = {
	version: registryVersion,
	items: [
		{
			name: 'callout',
			type: 'component',
			title: 'Callout',
			description: 'Accessible note, tip, warning, and danger callouts.',
			frameworkVersion: '*',
			files: [{ path: 'components/Callout.svelte', content: calloutComponent }],
			docs: 'Import it in a `.svx` page, or map it to the `callout` directive in `markdown.components`.'
		},
		{
			name: 'tabs',
			type: 'component',
			title: 'Tabs',
			description: 'Keyboard-accessible tabbed content for alternative instructions.',
			frameworkVersion: '*',
			files: [{ path: 'components/Tabs.svelte', content: tabsComponent }],
			docs: 'Pass `tabs` labels and a `panel` snippet that renders the content for each label.'
		},
		{
			name: 'analytics',
			type: 'analytics',
			title: 'Page-view analytics',
			description: 'Provider-neutral documentation page-view tracking.',
			frameworkVersion: '*',
			files: [{ path: 'analytics.ts', content: analyticsModule }],
			docs: 'Call `configureDocsAnalytics` once in your root layout, then `trackDocsPageView` per navigation.'
		},
		{
			name: 'feedback',
			type: 'feedback',
			title: 'Page feedback',
			description: 'A "was this helpful?" widget with a server endpoint.',
			frameworkVersion: '*',
			files: [
				{ path: 'components/Feedback.svelte', content: feedbackComponent },
				{ path: 'api/docs-feedback/+server.ts', content: feedbackEndpoint, target: 'route' }
			],
			docs: 'Post to `/api/docs-feedback` from the widget and replace the console sink with your store.'
		},
		{
			name: 'ask-openai-compatible',
			type: 'provider',
			title: 'Ask AI provider (OpenAI-compatible)',
			description: 'Streaming Ask AI provider for any OpenAI-compatible endpoint.',
			frameworkVersion: '*',
			dependencies: ['@docs-kit/ai'],
			files: [{ path: 'ask/openai-compatible.ts', content: askProvider }],
			docs: 'Construct it on the server only, then pass it to `createDocsAskPipeline`.'
		},
		{
			name: 'source-github',
			type: 'source',
			title: 'GitHub content source',
			description: 'Recipe for pulling documentation from another repository.',
			frameworkVersion: '*',
			dependencies: ['@docs-kit/sources'],
			files: [{ path: 'sources/github.ts', content: githubSourceRecipe }],
			docs: 'Add the source to `docs.config` and run `docs sync` to populate the cache.'
		}
	]
};
