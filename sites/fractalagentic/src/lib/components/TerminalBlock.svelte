<script lang="ts">
	let { code }: { code: string } = $props();

	let copied = $state(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			setTimeout(() => (copied = false), 1600);
		} catch {
			// Clipboard unavailable (permissions or insecure context) — no-op.
		}
	}
</script>

<div class="terminal">
	<div class="terminal-bar">
		<i></i>
		<i></i>
		<i></i>
		<button class="copy" type="button" onclick={copy}>{copied ? 'copied' : 'copy'}</button>
	</div>
	<pre><code>{code}</code></pre>
</div>
