<script lang="ts">
	import { progress } from '$lib/docs/registry.js';
	import { aiProgress } from '$lib/docs/ai-registry.js';
	import { blocksProgress } from '$lib/docs/blocks-registry.js';

	const { ready, total } = progress();
	const { aiReady, aiTotal } = aiProgress();
	const { blocksReady, blocksTotal } = blocksProgress();
</script>

<svelte:head>
	<title>fractalsvelte — a Svelte 5 + SASS component system</title>
</svelte:head>

<div class="landing min-fit box gap32 cushioned-left cushioned-top">
	<div class="box gap16">
	<p class="text-bs min-fit">
		Fractalsvelte is a featured Sveltekit component system. No Tailwind, no class-string merging — every component
		is customised through typed props and CSS custom properties, themed by a two-axis palette that follows light and dark mode. The inspiration here is <emphasis>shadcn</emphasis>, except we don't like nor want to use tailwind!
	</p>
	<p class="text-bs">
		Everything is copy-paste friendly and npm-installable. Pick a component, read its props,
		drop it in — styling stays in indented SASS keyed on <code>data-slot</code>, colours come
		from tokens, and nothing depends on a class-string merger.
	</p>
	</div>
	<div class="grid grid-cols-3 sections">
		<a class="gap8 box pad32" href="/components">
			<span class="text-bs fw600">Components</span>
			<span class="text-sm sectext"
				>{ready} of {total} core primitives — buttons, forms, overlays, navigation, data.</span
			>
		</a>
		<a class="gap8 box pad32" href="/ai">
			<span class="text-bs fw600">AI Elements</span>
			<span class="text-sm sectext"
				>{aiReady} of {aiTotal} chat-UI components — messages, reasoning, tools, prompt input,
				code.</span
			>
		</a>
		<a class="gap8 box pad32" href="/blocks">
			<span class="text-bs fw600">Blocks</span>
			<span class="text-sm sectext"
				>{blocksReady} of {blocksTotal} layout shells — page frames, sidebars, accordion nav.</span
			>
		</a>
	</div>
</div>

