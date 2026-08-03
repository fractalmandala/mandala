<script lang="ts">
	import { ExpandableActionBar } from '$lib/components/blocks/expandable-action-bar/index.js';

	let message = $state('Choose an action');
</script>

<div class="fixture-preview">
	{#snippet editIcon()}✎{/snippet}
	{#snippet shareIcon()}↗{/snippet}
	{#snippet archiveIcon()}□{/snippet}
	<ExpandableActionBar
		items={[
			{
				id: 'edit',
				label: 'Edit',
				icon: editIcon,
				shortcut: 'E',
				onclick: () => (message = 'Edit selected')
			},
			{
				id: 'share',
				label: 'Share',
				icon: shareIcon,
				onclick: () => (message = 'Share selected')
			},
			{
				id: 'archive',
				label: 'Archive',
				icon: archiveIcon,
				onclick: () => (message = 'Archive selected'),
				badge: '2'
			}
		]}
		activeId="edit"
	/>
	<span role="status" aria-live="polite">{message}</span>
</div>
