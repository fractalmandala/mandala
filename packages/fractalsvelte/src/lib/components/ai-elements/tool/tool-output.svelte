<script lang="ts" module>
	import type { Snippet } from "svelte";
	export type ToolOutputProps = {
		class?: string;
		output?: unknown;
		errorText?: string;
		children?: Snippet;
		[key: string]: unknown;
	};
</script>

<script lang="ts">
	import * as Code from "$lib/components/ai-elements/code/index.js";
	let { output, errorText, children, ...restProps }: ToolOutputProps = $props();

	const shouldRender = $derived(!!(output || errorText || children));

	const outputComponent = $derived.by<{
		type: 'code' | 'text';
		content: string;
		language: string;
	} | null>(() => {
		if (!output) return null;
		if (typeof output === 'object') {
			return { type: 'code', content: JSON.stringify(output, null, 2), language: 'json' };
		}
		if (typeof output === 'string') {
			return { type: 'code', content: output, language: 'json' };
		}
		return { type: 'text', content: String(output), language: 'markdown' };
	});
</script>

{#if shouldRender}
	<div data-slot="tool-output" {...restProps}>
		<h4 data-slot="tool-section-label">{errorText ? "Error" : "Result"}</h4>
		<div data-slot="tool-output-frame" data-error={!!errorText || undefined}>
			{#if errorText}
				<div data-slot="tool-output-text">{errorText}</div>
			{:else if children}
				{@render children()}
			{:else if outputComponent}
				{#if outputComponent.type === "code"}
					<Code.Root code={outputComponent.content} lang={outputComponent.language} hideLines>
						<Code.CopyButton />
					</Code.Root>
				{:else}
					<div data-slot="tool-output-text">{outputComponent.content}</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}
