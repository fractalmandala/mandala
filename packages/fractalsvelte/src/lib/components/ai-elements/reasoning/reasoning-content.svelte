<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { CollapsibleContent } from '$lib/components/collapsible/index.js';

	export type ReasoningContentProps = Omit<
		ComponentProps<typeof CollapsibleContent>,
		'children'
	> & {
		/** Markdown (or plain) reasoning body rendered via Response / Streamdown. */
		content: string;
	};
</script>

<script lang="ts">
	import { Response } from '$lib/components/ai-elements/response/index.js';

	let { content, ref = $bindable(null), ...props }: ReasoningContentProps = $props();
</script>

<!-- Own data-slot so reasoning styles apply; height animation redeclared in reasoning.sass -->
<CollapsibleContent bind:ref data-slot="reasoning-content" {...props}>
	<div data-slot="reasoning-response">
		<Response {content} />
	</div>
</CollapsibleContent>
