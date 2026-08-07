<script lang="ts">
	import { diffLines } from './diff.js';

	let {
		before,
		after,
		title,
		lineNumbers = false
	}: {
		before: string;
		after: string;
		title?: string;
		lineNumbers?: boolean;
	} = $props();

	const lines = $derived(diffLines(before, after));
	const added = $derived(lines.filter((line) => line.kind === 'added').length);
	const removed = $derived(lines.filter((line) => line.kind === 'removed').length);
	const markers = { added: '+', removed: '-', unchanged: ' ' } as const;
</script>

<figure class="docs-diff" aria-label={title ?? `Diff, ${added} added and ${removed} removed lines`}>
	{#if title}
		<figcaption class="docs-diff__title">{title}</figcaption>
	{/if}
	<pre class="docs-diff__body"><code
			>{#each lines as line, index (index)}<span
					class="docs-diff__line docs-diff__line--{line.kind}"
					>{#if lineNumbers}<span class="docs-diff__number" aria-hidden="true"
							>{line.afterLine ?? line.beforeLine ?? ''}</span
						>{/if}<span class="docs-diff__marker" aria-hidden="true">{markers[line.kind]}</span
					>{line.text}
</span>{/each}</code
		></pre>
</figure>
