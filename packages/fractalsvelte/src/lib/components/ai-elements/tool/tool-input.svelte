<script lang="ts" module>
	export type ToolInputProps = {
		class?: string;
		input: unknown;
		[key: string]: unknown;
	};
</script>

<script lang="ts">
	import * as Code from "$lib/components/ai-elements/code/index.js";
	let { input, ...restProps }: ToolInputProps = $props();
	const formattedInput = $derived(JSON.stringify(input, null, 2));
</script>

<div data-slot="tool-input" {...restProps}>
	<h4 data-slot="tool-section-label">Parameters</h4>
	<div data-slot="tool-code-frame">
		<Code.Root code={formattedInput} lang="json" hideLines>
			<Code.CopyButton />
		</Code.Root>
	</div>
</div>
