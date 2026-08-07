<script lang="ts">
	import { ideState } from '$lib/state/ide.svelte';
	import TerminalInstance from './TerminalInstance.svelte';

	function handleDragStart(e: DragEvent) {
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', 'terminal');
		}
	}

	function createTerminal(): void {
		ideState.createTerminalSession();
	}

	function closeTerminal(event: MouseEvent, id: string): void {
		event.stopPropagation();
		ideState.closeTerminalSession(id);
	}
</script>

<div
	class="terminal-panel"
	draggable="true"
	role="group"
	aria-label="Terminal panel"
	ondragstart={handleDragStart}
>
	<div class="terminal-tabs-bar">
		<div class="terminal-tabs" role="tablist" aria-label="Terminal sessions">
			{#each ideState.terminalSessions as session (session.id)}
				<div
					class="terminal-tab"
					class:is-active={session.id === ideState.activeTerminalId}
				>
					<button
						type="button"
						class="terminal-tab-label"
						role="tab"
						aria-selected={session.id === ideState.activeTerminalId}
						onclick={() => ideState.selectTerminalSession(session.id)}
					>
						<span class="terminal-tab-status" class:is-running={!!session.nativeId && !session.exited}></span>
						<span>{session.title}</span>
						{#if session.exited}
							<span class="terminal-tab-muted">exited</span>
						{/if}
					</button>
					<button
						type="button"
						class="terminal-tab-close"
						aria-label={`Close ${session.title}`}
						onclick={(event) => closeTerminal(event, session.id)}
					>
						×
					</button>
				</div>
			{/each}
		</div>
		<button type="button" class="terminal-action-btn" title="New terminal" onclick={createTerminal}>+</button>
	</div>

	<div class="terminal-body">
		{#if ideState.terminalSessions.length === 0}
			<div class="terminal-empty">
				<button type="button" class="btn-icon-text" onclick={createTerminal}>
					<span class="button-text">New Terminal</span>
				</button>
				{#if !ideState.rootPath}
					<span class="terminal-placeholder-inline">Open a workspace folder to start a terminal.</span>
				{/if}
			</div>
		{:else}
			{#each ideState.terminalSessions as session (session.id)}
				<div
					class="terminal-instance-shell"
					class:is-active={session.id === ideState.activeTerminalId}
					aria-hidden={session.id !== ideState.activeTerminalId}
				>
					<TerminalInstance {session} active={session.id === ideState.activeTerminalId} />
					{#if session.starting && !session.output}
						<span class="terminal-placeholder">Starting terminal…</span>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>
