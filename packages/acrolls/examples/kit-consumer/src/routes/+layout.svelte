<script lang="ts">
	import '@acrolls/styles/default.css';
	import '@acrolls/docs/styles.css';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="shell">
	<header class="shell__header">
		<a href="/">Acrolls</a>
		<span>kit-consumer example</span>
	</header>
	<main class="shell__main">
		{@render children()}
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family:
			ui-sans-serif,
			system-ui,
			-apple-system,
			Segoe UI,
			Roboto,
			Helvetica,
			Arial,
			sans-serif;
		background: #f7f6f2;
		color: #171714;
	}

	:global(:root) {
		--font-body: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;
		--font-heading: ui-sans-serif, system-ui, sans-serif;
		--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		--background: transparent;
		--foreground: #171714;
		--muted-foreground: #5c5c56;
		--border: #deded8;
		--accent: #6d28d9;
		--card: #fffcf5;
		--muted: #f0efe8;
		--radius: 0.75rem;
	}

	@media (prefers-color-scheme: dark) {
		:global(body) {
			background: #121211;
			color: #f4f3ee;
		}
		:global(:root) {
			--foreground: #f4f3ee;
			--muted-foreground: #a8a89e;
			--border: #2e2e2a;
			--accent: #a78bfa;
			--card: #1a1a17;
			--muted: #22221e;
		}
	}

	.shell__header {
		display: flex;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--border);
		font-family: var(--font-heading);
		font-size: 0.95rem;
	}

	.shell__header a {
		color: inherit;
		font-weight: 650;
		text-decoration: none;
	}

	.shell__main {
		padding: 2rem 1rem 4rem;
	}
</style>
