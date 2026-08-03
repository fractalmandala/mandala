<script lang="ts">
	import { isTauri, runWorkspaceTerminal, type TerminalResult } from '$lib/ipc';

	let { onclose }: { onclose: () => void } = $props();
	let command = $state('');
	let result = $state<TerminalResult | null>(null);
	let running = $state(false);
	let error = $state('');

	async function run() {
		if (!command.trim() || running) return;
		if (!isTauri()) { error = 'Terminal commands are available in the desktop app only.'; return; }
		running = true;
		error = '';
		try { result = await runWorkspaceTerminal(command); }
		catch (reason) { error = reason instanceof Error ? reason.message : 'Terminal command failed to start.'; }
		finally { running = false; }
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); void run(); }
	}
</script>

<aside class="workspace-terminal" aria-label="Project terminal">
	<header><div><strong>Terminal</strong><span>Runs in the selected project folder</span></div><button onclick={onclose}>Close</button></header>
	<div class="workspace-terminal__output" aria-live="polite">
		{#if error}<pre class="workspace-terminal__error">{error}</pre>{/if}
		{#if result}<pre><span class:workspace-terminal__failure={result.status !== 0 || result.timed_out}>{result.timed_out ? 'stopped after 120 seconds' : `exit ${result.status ?? 'unknown'}`}</span>{result.stdout}{result.stderr ? `\n${result.stderr}` : ''}</pre>
		{:else if !error}<p>Commands are local, visible, and run only when you choose Run.</p>{/if}
	</div>
	<form onsubmit={(event) => { event.preventDefault(); void run(); }}>
		<label>Command <textarea bind:value={command} onkeydown={keydown} placeholder="e.g. rg TODO" aria-label="Terminal command"></textarea></label>
		<footer><span>⌘/Ctrl + Enter to run · 120 second limit</span><button type="button" onclick={() => { command = ''; result = null; error = ''; }}>Clear</button><button class="workspace-terminal__run" disabled={!command.trim() || running}>{running ? 'Running…' : 'Run'}</button></footer>
	</form>
</aside>
