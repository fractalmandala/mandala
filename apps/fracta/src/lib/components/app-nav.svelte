<script lang="ts">
	import { ui } from '$lib/state/ui.svelte';
	import { entries } from '$lib/state/entries.svelte';
</script>

<nav class="app-nav" aria-label="Workspace controls">
	<div class="app-nav__modes row gap24 ycenter">
		<span class="app-nav__brand">Fracta</span>
		<span class="app-nav__workspace-label">Local knowledge workspace</span>
		<button
			type="button"
			class="app-nav__mode"
			class:app-nav__mode--on={ui.askOpen}
			onclick={() => ui.toggleAsk()}
			title="Ask about this note (⌘.)"
		>
			Ask
		</button>
	</div>
	<div class="app-nav__meta row gap16 ycenter">
		<button
			type="button"
			class="app-nav__ghost"
			onclick={() => ui.toggleSettings()}
			title="Application settings"
		>
			Settings
		</button>
		<button
			type="button"
			class="app-nav__ghost"
			onclick={() => entries.openDaily()}
			title="Open today's daily note"
		>
			Daily
		</button>
		<button
			type="button"
			class="app-nav__ghost"
			onclick={() => ui.toggleRules()}
			title="Auto-tag rules"
		>
			Rules
		</button>
	</div>
</nav>
