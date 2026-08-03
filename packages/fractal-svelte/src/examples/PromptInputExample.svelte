<script lang="ts">
	import { PromptInput } from '$lib/index.js';
	let submitted = $state('');
	let loading = $state(false);
	let prompt = $state('');
	function send(value: string) {
		submitted = value;
		loading = true;
		setTimeout(() => (loading = false), 900);
	}
</script>

<div class="fixture-preview">
	<PromptInput
		value={prompt}
		onValueChange={(value) => (prompt = value)}
		defaultModel="balanced"
		models={[
			{ value: 'balanced', label: 'Balanced' },
			{ value: 'fast', label: 'Fast' }
		]}
		actions={[
			{ value: 'context', label: 'Add context', description: 'Include the current page' },
			{ value: 'plan', label: 'Make a plan' }
		]}
		onAction={(action) => (prompt = `${prompt}${prompt ? ' ' : ''}[${action}]`)}
		{loading}
		onStop={() => (loading = false)}
		onSubmit={send}
		placeholder="Ask Atlas about this project"
	/>
	<p aria-live="polite">
		{loading
			? 'Atlas is preparing an answer…'
			: submitted
				? `Sent: ${submitted}`
				: 'Ready for your next request.'}
	</p>
</div>
