<script lang="ts" module>
	import type { HTMLImgAttributes } from "svelte/elements";

	/** Provider slug for https://models.dev/logos/{provider}.svg */
	export type ModelProvider =
		| "openai"
		| "anthropic"
		| "google"
		| "google-vertex"
		| "mistral"
		| "xai"
		| "groq"
		| "deepseek"
		| "perplexity"
		| "cohere"
		| "amazon-bedrock"
		| "azure"
		| "alibaba"
		| "moonshotai"
		| "meta"
		| "v0"
		| "vercel"
		| "openrouter"
		| "huggingface"
		| "togetherai"
		| "fireworks-ai"
		| "cerebras"
		| (string & {});

	export type ModelSelectorLogoProps = Omit<HTMLImgAttributes, "src" | "alt"> & {
		provider: ModelProvider;
		ref?: HTMLImageElement | null;
	};
</script>

<script lang="ts">
	let {
		provider,
		ref = $bindable(null),
		...restProps
	}: ModelSelectorLogoProps = $props();
</script>

<img
	bind:this={ref}
	data-slot="model-selector-logo"
	data-provider={provider}
	alt="{provider} logo"
	height={12}
	width={12}
	src={`https://models.dev/logos/${provider}.svg`}
	{...restProps}
/>
