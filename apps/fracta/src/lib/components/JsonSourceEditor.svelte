<script lang="ts">
	import { highlightJsonSource } from '$lib/utils/json-source';

	let { content, onChange }: { content: string; onChange: (content: string) => void } = $props();
	let scrollTop = $state(0);
	let scrollLeft = $state(0);
</script>

<div class="json-source">
	<pre aria-hidden="true" style:transform={`translate(${-scrollLeft}px, ${-scrollTop}px)`}>{@html highlightJsonSource(content)}<span class="json-source__line-end">\n</span></pre>
	<textarea value={content} wrap="off" onscroll={(event) => { scrollTop = event.currentTarget.scrollTop; scrollLeft = event.currentTarget.scrollLeft; }} oninput={(event) => onChange(event.currentTarget.value)} spellcheck="false" aria-label="JSON source"></textarea>
</div>
