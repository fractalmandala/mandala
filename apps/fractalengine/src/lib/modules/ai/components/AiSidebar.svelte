<script lang="ts">
	import { aiWorkspace } from "../state/ai.svelte";
	import SessionRow from "./SessionRow.svelte";
	import type { AiSidebarTab } from "../types";
	import Tabber from "$lib/fractalui/tabs.svelte";

	let sessionsForTab = $derived(
		aiWorkspace.sessions.filter((s) => s.kind === aiWorkspace.sidebarTab),
	);

	let pinnedSessions = $derived(sessionsForTab.filter((s) => s.pinned));

	let recentSessions = $derived(
		sessionsForTab
			.filter((s) => !s.pinned)
			.sort((a, b) => b.lastOpenedAt - a.lastOpenedAt),
	);
</script>

		<div class="sidebar-content ai-left">
			<div class="sidebar-tabs">
				<button
					type="button"
					class="sidebar-tab-btn"
					class:active={aiWorkspace.sidebarTab === "home"}
					role="tab"
					aria-selected={aiWorkspace.sidebarTab === "home"}
					onclick={() => aiWorkspace.setSidebarTab("home")}
				>
					<span>History</span>
				</button>
				<button
					type="button"
					class="sidebar-tab-btn"
					class:active={aiWorkspace.sidebarTab === "code"}
					role="tab"
					aria-selected={aiWorkspace.sidebarTab === "code"}
					onclick={() => aiWorkspace.setSidebarTab("code")}
				>
					<span>Code</span>
				</button>
				<button
					type="button"
					class="sidebar-tab-btn rightest"
					aria-label="New AI session"
					onclick={() => aiWorkspace.newSession()}
				>
					+ New Session
				</button>
			</div>
			<div class="sidebar-content-box pad8">
				{#if aiWorkspace.sessions.length === 0}
					<div class="ai-sidebar-empty">No sessions yet</div>
				{:else}
					{#if pinnedSessions.length > 0}
						<div class="ai-sidebar-section-label">Pinned</div>
						<div class="ai-sidebar-list">
							{#each pinnedSessions as session (session.id)}
								<SessionRow
									{session}
									isActive={session.id ===
										aiWorkspace.activeTabId}
									onClick={() =>
										aiWorkspace.openSession(session.id)}
									onPinToggle={() =>
										aiWorkspace.togglePin(session.id)}
								/>
							{/each}
						</div>
					{/if}
					<div class="box gap8">
						{#if recentSessions.length === 0}
							<div class="ai-sidebar-empty">
								{pinnedSessions.length > 0
									? "No recent sessions"
									: "No sessions yet"}
							</div>
						{:else}
							{#each recentSessions as session (session.id)}
								<SessionRow
									{session}
									isActive={session.id ===
										aiWorkspace.activeTabId}
									onClick={() =>
										aiWorkspace.openSession(session.id)}
									onPinToggle={() =>
										aiWorkspace.togglePin(session.id)}
								/>
							{/each}
						{/if}
					</div>
				{/if}
			</div>
		</div>
