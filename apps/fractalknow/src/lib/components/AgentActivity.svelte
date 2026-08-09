<script lang="ts">
	import {
		agentSessions,
		agentSessionsState,
		closeAgentSession,
		openAgentSession,
		refreshAgentSessions,
		sessionDetailState,
		type ActivitySessionSummary,
	} from '$lib/shell/agent-sessions';

	/**
	 * Agent activity (T045b B2): local AI agent sessions recorded by the
	 * project activity log (.ok/activity/*.jsonl). Session list → drill into
	 * an event timeline. Read-only viewer; agent execution is separate scope.
	 */

	const state = $derived($agentSessionsState);
	const sessions = $derived($agentSessions);
	const detail = $derived($sessionDetailState);

	$effect(() => {
		// Refresh whenever this view is mounted (right-panel Activity tab open).
		void refreshAgentSessions();
	});

	function relativeTime(iso: string | null): string {
		if (!iso) return '—';
		const then = new Date(iso).getTime();
		if (Number.isNaN(then)) return iso;
		const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
		if (seconds < 60) return `${seconds}s ago`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		return `${Math.floor(hours / 24)}d ago`;
	}

	function kindTone(kind: string): string {
		switch (kind) {
			case 'error': return 'error';
			case 'edit': return 'edit';
			case 'command': return 'command';
			case 'prompt': return 'prompt';
			default: return 'note';
		}
	}

	function openSession(session: ActivitySessionSummary): void {
		void openAgentSession(session.sessionId);
	}

	function loadMore(): void {
		if (!detail.sessionId || !detail.page) return;
		void openAgentSession(detail.sessionId, detail.page.offset + detail.page.limit, detail.page.limit);
	}
</script>

<section class="agent-activity" aria-label="Agent sessions">
	<header class="agent-activity__header">
		<h3>Agent sessions</h3>
		<button type="button" class="agent-activity__refresh" onclick={() => void refreshAgentSessions()} aria-label="Refresh agent sessions">↻</button>
	</header>

	{#if state.status === 'unavailable'}
		<p class="agent-activity__empty">Agent activity is recorded in the desktop app.</p>
	{:else if state.status === 'error'}
		<p class="agent-activity__empty" role="alert">Could not load agent sessions: {state.error}</p>
	{:else if sessions.length === 0}
		<p class="agent-activity__empty">No agent sessions recorded yet.</p>
	{:else if !detail.sessionId}
		<ul class="agent-activity__sessions">
			{#each sessions as session (session.sessionId)}
				<li>
					<button type="button" class="session-row" onclick={() => openSession(session)} data-session={session.sessionId}>
						<span class="session-row__agent">{session.agent}</span>
						<span class="session-row__id">{session.sessionId}</span>
						<span class="session-row__meta">{session.eventCount} events · {relativeTime(session.lastEventAt)}</span>
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<div class="agent-activity__detail">
			<button type="button" class="agent-activity__back" onclick={closeAgentSession}>← Sessions</button>
			<h4>{detail.sessionId}</h4>
			{#if detail.loading}
				<p class="agent-activity__empty">Loading events…</p>
			{:else if detail.error}
				<p class="agent-activity__empty" role="alert">{detail.error}</p>
			{:else if detail.page}
				<ol class="agent-activity__events" aria-live="polite">
					{#each detail.page.events as event, index (index)}
						<li>
							<span class="event__kind event__kind--{kindTone(event.kind)}">{event.kind}</span>
							<span class="event__summary">{event.summary}</span>
							{#if event.paths.length > 0}
								<span class="event__paths">{event.paths.join(', ')}</span>
							{/if}
							<time datetime={event.ts}>{relativeTime(event.ts)}</time>
						</li>
					{/each}
				</ol>
				{#if detail.page.offset + detail.page.events.length < detail.page.total}
					<button type="button" class="agent-activity__more" onclick={loadMore}>
						Load more ({detail.page.total - detail.page.offset - detail.page.events.length} remaining)
					</button>
				{/if}
			{/if}
		</div>
	{/if}
</section>

<style lang="sass">
	@use '$lib/styles/tokens' as t
	@use '$lib/styles/mixins' as m

	.agent-activity
		display: grid
		gap: t.$space-2

		&__header
			display: flex
			align-items: center
			justify-content: space-between

			h3
				margin: 0
				font-size: t.$font-size-sm
				font-weight: 700
				color: var(--ok-ink)

		&__refresh
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-md
			background: var(--ok-panel)
			color: var(--ok-muted)
			cursor: pointer
			padding: t.$space-1 t.$space-2
			@include m.press-feedback

			&:hover
				color: var(--ok-ink)

		&__empty
			margin: 0
			font-size: t.$font-size-sm
			color: var(--ok-muted)

		&__sessions
			list-style: none
			margin: 0
			padding: 0
			display: grid
			gap: t.$space-1

	.session-row
		width: 100%
		display: grid
		grid-template-columns: auto 1fr
		gap: t.$space-1 t.$space-2
		text-align: left
		border: 1px solid var(--ok-line)
		border-radius: t.$radius-md
		background: var(--ok-surface)
		padding: t.$space-2 t.$space-3
		cursor: pointer
		@include m.hover-transition(background-color)

		&:hover
			background: var(--ok-highlight)

		&__agent
			font-weight: 700
			font-size: t.$font-size-sm
			color: var(--ok-accent)

		&__id
			font-size: t.$font-size-xs
			color: var(--ok-muted)
			overflow: hidden
			text-overflow: ellipsis
			white-space: nowrap

		&__meta
			grid-column: 1 / -1
			font-size: t.$font-size-xs
			color: var(--ok-muted)

	.agent-activity__detail
		display: grid
		gap: t.$space-2

		h4
			margin: 0
			font-size: t.$font-size-sm
			color: var(--ok-ink)
			overflow-wrap: anywhere

	.agent-activity__back,
	.agent-activity__more
		border: 1px solid var(--ok-line)
		border-radius: t.$radius-md
		background: var(--ok-panel)
		color: var(--ok-ink)
		padding: t.$space-1 t.$space-2
		font-size: t.$font-size-xs
		cursor: pointer
		justify-self: start
		@include m.press-feedback

	.agent-activity__events
		list-style: none
		margin: 0
		padding: 0
		display: grid
		gap: t.$space-2

		li
			display: grid
			gap: t.$space-1
			border-bottom: 1px solid var(--ok-line)
			padding-bottom: t.$space-2

			time
				font-size: t.$font-size-xs
				color: var(--ok-muted)

	.event__kind
		justify-self: start
		font-size: t.$font-size-xs
		font-weight: 700
		padding: 0 t.$space-2
		border-radius: t.$radius-sm
		border: 1px solid var(--ok-line)
		color: var(--ok-muted)

		&--error
			color: var(--ok-danger)
			border-color: var(--ok-danger)

		&--edit,
		&--command
			color: var(--ok-accent)
			border-color: var(--ok-accent)

	.event__summary
		font-size: t.$font-size-sm
		color: var(--ok-ink)

	.event__paths
		font-size: t.$font-size-xs
		color: var(--ok-muted)
		overflow-wrap: anywhere
</style>
