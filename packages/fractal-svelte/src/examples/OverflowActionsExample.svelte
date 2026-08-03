<script lang="ts">
	import { OverflowActions } from '$lib/components/blocks/overflow-actions/index.js';

	let message = $state('No action selected');
	const items = [
		{ id: 'duplicate', label: 'Duplicate', onclick: () => (message = 'Item duplicated') },
		{ id: 'rename', label: 'Rename', onclick: () => (message = 'Rename selected') },
		{
			id: 'delete',
			label: 'Delete',
			variant: 'destructive' as const,
			onclick: () => (message = 'Delete selected')
		}
	];
</script>

<div class="fixture-preview">
	<OverflowActions {items} label="More item actions" />
	<span role="status" aria-live="polite">{message}</span>
</div>
