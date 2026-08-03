<script lang="ts">
	import { onMount } from 'svelte';
	import { rules } from '$lib/state/rules.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import type { AppRule } from '$lib/ipc';

	// Manager for source-app auto-tag rules. Lists every app the clipboard watcher has
	// seen; the user names the tag(s) and flips each rule active. An active rule adds its
	// tags to any entry pasted from that app.

	onMount(() => {
		void rules.load();
		// Refresh the "last copied from" hint while the panel is open.
		const timer = setInterval(() => void rules.refreshSource(), 1000);
		return () => clearInterval(timer);
	});

	function commitTags(rule: AppRule, value: string) {
		const tags = value
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);
		void rules.setTags(rule, tags);
	}

	function close() {
		ui.rulesOpen = false;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div
	class="rules-overlay"
	role="button"
	tabindex="-1"
	onclick={close}
	onkeydown={(e) => e.key === 'Enter' && close()}
></div>

<div class="rules-modal" role="dialog" aria-label="Auto-tag rules" aria-modal="true">
	<header class="rules-modal__head">
		<div>
			<h2 class="rules-modal__title">Auto-tag by source app</h2>
			<p class="rules-modal__sub">
				When you paste, fracta adds the active tag for the app you copied from.
			</p>
		</div>
		<button class="rules-modal__close" onclick={close} aria-label="Close">✕</button>
	</header>

	{#if rules.source}
		<p class="rules-modal__hint">
			Clipboard last copied from <strong>{rules.source.appName || rules.source.bundleId}</strong>
		</p>
	{/if}

	<div class="rules-list">
		<div class="rules-list__header">
			<span>App</span>
			<span>Tags (comma-separated)</span>
			<span>Active</span>
			<span></span>
		</div>
		{#each rules.list as rule (rule.bundleId)}
			<div class="rule-row" class:rule-row--on={rule.active}>
				<div class="rule-row__app">
					<span class="rule-row__name">{rule.appName || '—'}</span>
					<span class="rule-row__bundle">{rule.bundleId}</span>
				</div>
				<input
					class="rule-row__tags"
					value={rule.tags.join(', ')}
					onchange={(e) => commitTags(rule, e.currentTarget.value)}
					placeholder="tag"
				/>
				<label class="rule-row__toggle">
					<input
						type="checkbox"
						checked={rule.active}
						onchange={(e) => rules.setActive(rule, e.currentTarget.checked)}
					/>
					<span></span>
				</label>
				<button
					class="rule-row__delete"
					onclick={() => rules.remove(rule.bundleId)}
					aria-label="Remove rule"
					title="Remove"
				>
					✕
				</button>
			</div>
		{:else}
			<p class="rules-list__empty">
				No apps seen yet. Copy something from another app, then come back — it will appear here.
			</p>
		{/each}
	</div>
</div>
