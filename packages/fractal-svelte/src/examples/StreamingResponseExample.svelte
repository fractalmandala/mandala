<script lang="ts">
	import { StreamingResponse } from '$lib/index.js';
	let status = $state<'streaming' | 'complete' | 'error'>('complete');
	let feedback = $state<'up' | 'down' | null>(null);
</script>

<div class="fixture-preview">
	<StreamingResponse
		{status}
		{feedback}
		onFeedbackChange={(value) => (feedback = value)}
		copyText="The onboarding flow is ready for review."
		onRetry={() => (status = 'streaming')}
		sources={[
			{
				id: 'design',
				title: 'Onboarding brief',
				domain: 'docs.example.test',
				url: 'https://docs.example.test/onboarding'
			}
		]}
	>
		<p>
			The onboarding flow is ready for review. I recommend testing the new empty state with
			three first-time users.
		</p>
	</StreamingResponse>
	<button type="button" onclick={() => (status = status === 'complete' ? 'error' : 'complete')}
		>{status === 'complete' ? 'Show error state' : 'Resolve response'}</button
	>
</div>
