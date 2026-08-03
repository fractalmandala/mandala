<script lang="ts" module>
	export type { CodeRootProps } from "./types.js";
</script>

<script lang="ts">
	import { box } from "svelte-toolbelt";
	import { useCode } from "./code.svelte.js";
	import type { CodeRootProps } from "./types.js";

	let {
		ref = $bindable(null),
		variant = "default",
		lang = "typescript",
		code,
		hideLines = false,
		highlight = [],
		children,
		...rest
	}: CodeRootProps = $props();

	const codeState = useCode({
		code: box.with(() => code),
		hideLines: box.with(() => hideLines),
		highlight: box.with(() => highlight),
		lang: box.with(() => lang),
	});
</script>

<div {...rest} bind:this={ref} data-slot="code" data-variant={variant}>
	<div data-slot="code-wrapper">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized via DOMPurify in code.svelte.ts -->
		{@html codeState.highlighted}
		{@render children?.()}
	</div>
</div>
