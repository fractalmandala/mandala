<script lang="ts">
	import CopyButton from './CopyButton.svelte';
	let { command = 'pnpm add @fractaldesign/fractal-svelte' }: { command?: string } = $props();
</script>

<div class="install-command">
	<span aria-hidden="true">$</span>
	<code>{command}</code>
	<CopyButton text={command} label="Copy command" />
</div>
