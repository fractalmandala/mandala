<script lang="ts">
	import type { WorkspaceDocument } from '$lib/shell';
	import { renderMarkdownResult } from './markdown';

	let { document }: { document: WorkspaceDocument } = $props();

	function parseSkill(content: string): {
		name: string;
		description: string;
		frontmatter: Record<string, string>;
		body: string;
	} {
		const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
		const frontmatter: Record<string, string> = {};
		let body = content;
		if (match) {
			for (const line of (match[1] ?? '').split('\n')) {
				const idx = line.indexOf(':');
				if (idx === -1) continue;
				const key = line.slice(0, idx).trim();
				const value = line.slice(idx + 1).trim();
				if (key) frontmatter[key] = value;
			}
			body = match[2] ?? '';
		}
		return {
			name: frontmatter.name || document.title.replace(/\.md$/i, ''),
			description: frontmatter.description || 'Skill definition',
			frontmatter,
			body,
		};
	}

	let skill = $derived(parseSkill(document.content));
	let preview = $derived(renderMarkdownResult(skill.body));
</script>

<section class="skill-viewer" aria-label="Skill file viewer">
	<header>
		<p>Skill</p>
		<h3>{skill.name}</h3>
		<p>{skill.description}</p>
	</header>
	<dl>
		{#each Object.entries(skill.frontmatter) as [key, value] (key)}
			<div>
				<dt>{key}</dt>
				<dd>{value}</dd>
			</div>
		{/each}
		<div>
			<dt>Path</dt>
			<dd>{document.path}</dd>
		</div>
	</dl>
	<article class="skill-viewer__body">
		{#if preview.error}
			<p role="alert">{preview.error}</p>
		{:else}
			{@html preview.html}
		{/if}
	</article>
</section>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.skill-viewer
		min-height: 320px
		border: 1px solid var(--ok-line)
		border-radius: 8px
		background: var(--ok-surface)
		color: var(--ok-ink)
		overflow: hidden

		header
			padding: 16px 18px
			border-bottom: 1px solid var(--ok-line)
			background: var(--ok-panel)

			p, h3
				margin: 0

			p:first-child
				color: var(--ok-muted)
				font-size: 11px
				font-weight: 800
				text-transform: uppercase

			h3
				margin: 6px 0

			p:last-child
				color: var(--ok-muted)

		dl
			margin: 0
			padding: 14px 18px
			display: grid
			grid-template-columns: repeat(2, minmax(0, 1fr))
			gap: 10px
			border-bottom: 1px solid var(--ok-line)

		dt
			color: var(--ok-muted)
			font-size: 11px
			font-weight: 700
			text-transform: uppercase

		dd
			margin: 4px 0 0
			overflow-wrap: anywhere

		&__body
			padding: 16px 18px
			line-height: 1.6

			:global(h1),
			:global(h2),
			:global(h3)
				margin: 0 0 10px

			:global(p)
				margin: 0 0 10px
</style>
