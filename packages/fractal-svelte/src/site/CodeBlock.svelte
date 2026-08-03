<script lang="ts">
	import CopyButton from './CopyButton.svelte';
	let { code, label = 'Source' }: { code: string; label?: string } = $props();
</script>

<div class="code-block">
	<div class="code-block__header"><span>{label}</span><CopyButton text={code} label="Copy source" /></div>
	<pre><code>{code}</code></pre>
</div>
