<script lang="ts">
	import { NotificationStack } from '$lib/components/blocks/notification-stack/index.js';

	let items = $state([
		{
			id: 'release',
			title: 'Release ready',
			description: 'Version 2.4 is ready to review.',
			actionLabel: 'Review'
		},
		{
			id: 'mention',
			title: 'You were mentioned',
			description: 'A teammate tagged you in a discussion.',
			actionLabel: 'Open'
		},
		{
			id: 'backup',
			title: 'Backup complete',
			description: 'Your workspace backup finished successfully.'
		}
	]);
	let message = $state('');

	function remove(id: string) {
		items = items.filter((item) => item.id !== id);
		message = 'Notification dismissed';
	}
</script>

<div class="fixture-preview">
	<NotificationStack
		{items}
		onAction={(item) => (message = `${item.title} selected`)}
		onDismiss={(item) => remove(item.id)}
	/>
	{#if message}<span class="sr-only" role="status">{message}</span>{/if}
</div>
