<script lang="ts">
	import { aiWorkspace } from '../state/ai.svelte';
	import AIChat from '$lib/modules/ai/components/AiChatMain.svelte';
</script>

<div class="central-carrier">
	<!-- Session tab strip — uses divs for tabs with close button siblings -->
	<div class="central-tabstrip">
		{#each aiWorkspace.openTabIds as tabId (tabId)}
			{@const meta = aiWorkspace.sessions.find((s) => s.id === tabId)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="btn-icon-text"
				class:active={tabId === aiWorkspace.activeTabId}
				role="tab"
				tabindex="0"
				onclick={() => aiWorkspace.openSession(tabId)}
				onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); aiWorkspace.openSession(tabId); } }}
			>
				<span class="text-sm">{meta?.title ?? tabId.slice(0, 8)}</span>
					<button
						type="button"
						class="btn-icon"
						aria-label="Close session tab"
						onclick={(e) => { e.stopPropagation(); aiWorkspace.closeTab(tabId); }}
					>
						<img src="/iconset/closeSmall.svg" alt="close" class="icon-svg"/>
					</button>
			</div>
		{/each}
	</div>

	<!-- Chat conversation -->
	<div class="ai-chat-body h100">
		<AIChat/>
	</div>
</div>
