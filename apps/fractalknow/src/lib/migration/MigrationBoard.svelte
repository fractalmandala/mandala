<script lang="ts">
	import type { MigrationGroup } from './tasks';

	type Props = {
		groups: MigrationGroup[];
	};

	let { groups }: Props = $props();
</script>

<section class="migration-board" aria-label="Migration task groups">
	{#each groups as group}
		<article class="group" data-status={group.status}>
			<div class="group__header">
				<div>
					<h2>{group.title}</h2>
					<p>{group.summary}</p>
				</div>
				<span>{group.status}</span>
			</div>

			<ol>
				{#each group.subtasks as subtask}
					<li data-status={subtask.status}>
						<div>
							<strong>{subtask.title}</strong>
							<p>{subtask.outcome}</p>
						</div>
						<span>{subtask.status}</span>
					</li>
				{/each}
			</ol>
		</article>
	{/each}
</section>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.migration-board
		display: flex
		flex-direction: column
		gap: 14px

	.group
		border: 1px solid var(--ok-line)
		border-radius: 8px
		background: var(--ok-panel)
		overflow: hidden

		&[data-status='active']
			border-color: var(--ok-accent)

		&__header
			padding: 18px
			display: flex
			align-items: flex-start
			justify-content: space-between
			gap: 18px
			border-bottom: 1px solid var(--ok-line)

			h2
				margin: 0
				color: var(--ok-ink)
				font-size: 17px

			p
				margin: 6px 0 0
				color: var(--ok-muted)
				font-size: 14px

			span
				border-radius: 999px
				padding: 5px 8px
				background: var(--ok-surface)
				color: var(--ok-accent)
				font-size: 12px
				font-weight: 700

		ol
			margin: 0
			padding: 0
			list-style: none

		li
			padding: 14px 18px
			display: grid
			grid-template-columns: 1fr auto
			gap: 16px
			border-top: 1px solid var(--fk-line)

			&:first-child
				border-top: 0

			&[data-status='done']
				background: var(--fk-line)

			&[data-status='active']
				background: var(--fk-line)

			strong
				color: var(--ok-ink)
				font-size: 14px

			p
				margin: 4px 0 0
				color: var(--ok-muted)
				font-size: 13px

			> span
				color: var(--ok-muted)
				font-size: 12px
				font-weight: 700

	@media (max-width: 720px)
		.group__header
			flex-direction: column

		.group li
			grid-template-columns: 1fr
</style>
