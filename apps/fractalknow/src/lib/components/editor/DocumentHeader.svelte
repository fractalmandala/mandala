<script lang="ts">
	import type { WorkspaceDocument } from '$lib/shell';
	import Icon from '$lib/icons/Icon.svelte';

	let { document }: { document: WorkspaceDocument } = $props();

	let crumbs = $derived(
		document.path
			.split('/')
			.filter(Boolean)
			.map((part, index, parts) => ({
				label: part,
				path: `/${parts.slice(0, index + 1).join('/')}`,
			})),
	);
	let words = $derived(
		document.content
			.trim()
			.split(/\s+/)
			.filter(Boolean).length,
	);
	let savedLabel = $derived(
		document.dirty
			? 'Unsaved'
			: document.metadata?.updatedAt
				? `Saved ${new Date(document.metadata.updatedAt).toLocaleString()}`
				: document.syncState === 'saved'
					? 'Saved'
					: document.syncState ?? 'Idle',
	);
</script>

<header class="doc-header" aria-label="Document header">
	<div class="doc-header__titles">
		<nav class="doc-header__crumbs" aria-label="Document breadcrumb">
			{#each crumbs as crumb, index (crumb.path)}
				{#if index > 0}<span aria-hidden="true">/</span>{/if}
				<span class:current={index === crumbs.length - 1}>{crumb.label}</span>
			{/each}
		</nav>
		<h2>{document.title}</h2>
	</div>
	<div class="doc-header__meta">
		<span class="doc-header__save" data-dirty={document.dirty ? 'true' : 'false'}>
			<Icon name="save" size={12} />
			{savedLabel}
		</span>
		<span>{words} words</span>
		<span>{document.syncState ?? 'idle'}</span>
	</div>
</header>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.doc-header
		display: flex
		justify-content: space-between
		gap: 16px
		align-items: flex-start
		padding: 4px 0 12px
		border-bottom: 1px solid var(--ok-line)
		margin-bottom: 12px

		h2
			margin: 4px 0 0
			font-size: t.$font-size-xl
			line-height: t.$line-height-tight
			color: var(--ok-ink)

		&__crumbs
			display: flex
			flex-wrap: wrap
			gap: 4px
			color: var(--ok-muted)
			font-size: t.$font-size-xs
			font-weight: 700

			.current
				color: var(--ok-ink)

		&__meta
			display: flex
			flex-wrap: wrap
			gap: 10px
			color: var(--ok-muted)
			font-size: t.$font-size-xs
			font-weight: 700
			text-transform: uppercase

		&__save
			display: inline-flex
			align-items: center
			gap: 4px
			color: var(--ok-success)

			&[data-dirty='true']
				color: var(--ok-warn)
</style>
