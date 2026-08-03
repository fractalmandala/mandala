<script lang="ts">
	import CodeBlock from './CodeBlock.svelte';
	import PreviewFrame from './PreviewFrame.svelte';
	import ExplicitPreview from './ExplicitPreview.svelte';
	let { slug, code }: { slug: string; code: string } = $props();
	let active = $state<'preview' | 'code'>('preview');
	function keydown(event: KeyboardEvent) {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		active = active === 'preview' ? 'code' : 'preview';
		document.getElementById(`example-${active}`)?.focus();
	}
</script>

<div class="examples-tabs">
	<div class="tabs-list" role="tablist" aria-label="Example view" tabindex="-1" onkeydown={keydown}>
		<button id="example-preview" type="button" role="tab" aria-selected={active === 'preview'} aria-controls="example-panel-preview" tabindex={active === 'preview' ? 0 : -1} onclick={() => (active = 'preview')}>Preview</button>
		<button id="example-code" type="button" role="tab" aria-selected={active === 'code'} aria-controls="example-panel-code" tabindex={active === 'code' ? 0 : -1} onclick={() => (active = 'code')}>Code</button>
	</div>
	{#if active === 'preview'}<div id="example-panel-preview" role="tabpanel" aria-labelledby="example-preview"><PreviewFrame><ExplicitPreview {slug} /></PreviewFrame></div>{:else}<div id="example-panel-code" role="tabpanel" aria-labelledby="example-code"><CodeBlock {code} label="Example source" /></div>{/if}
</div>
