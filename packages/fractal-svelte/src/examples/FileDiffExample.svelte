<script lang="ts">
	import { FileDiff } from '$lib/index.js';
	let status = $state<'streaming' | 'complete'>('complete');
	const lines = [
		{
			id: '1',
			type: 'context' as const,
			oldLine: 12,
			newLine: 12,
			content: 'export const greeting = "Hello";'
		},
		{ id: '2', type: 'removed' as const, oldLine: 13, content: 'return greeting + name;' },
		{
			id: '3',
			type: 'added' as const,
			newLine: 13,
			content: 'return `${greeting}, ${name}!`; '
		},
		{ id: '4', type: 'context' as const, oldLine: 14, newLine: 14, content: '}' }
	];
</script>

<div class="fixture-preview">
	<FileDiff
		file="src/greeting.ts"
		language="typescript"
		{lines}
		{status}
		copyText={lines.map((line) => line.content).join('\n')}
		onOpenChange={() => undefined}
	/>
	<button
		type="button"
		onclick={() => (status = status === 'complete' ? 'streaming' : 'complete')}
		>{status === 'complete' ? 'Simulate streaming' : 'Mark complete'}</button
	>
</div>
