<script lang="ts">
	import { FeedbackWidget } from '$lib/components/blocks/feedback-widget/index.js';

	let sentMessage = $state('');
	async function submit({ message }: { message: string }) {
		sentMessage = `Feedback received: ${message}`;
	}
</script>

<div class="fixture-preview">
	<FeedbackWidget
		title="Share feedback"
		placeholder="Tell us what would help"
		onSubmit={submit}
	/>
	{#if sentMessage}<span class="sr-only" role="status">{sentMessage}</span>{/if}
</div>
