<script lang="ts">
	import { progress } from '$lib/docshell/registry.js';
	import { aiProgress } from '$lib/docshell/ai-registry.js';
	import { blocksProgress } from '$lib/docshell/blocks-registry.js';

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
</div>

