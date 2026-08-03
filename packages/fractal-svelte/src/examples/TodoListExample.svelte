<script lang="ts">
	import { TodoList } from '$lib/index.js';
	import type { TodoItem } from '$lib/components/agents/todo-list/index.js';
	let items = $state<TodoItem[]>([
		{ id: 'inspect', title: 'Inspect onboarding screens', status: 'completed' as const },
		{
			id: 'copy',
			title: 'Rewrite confusing labels',
			status: 'in-progress' as const,
			detail: 'Reviewing empty states'
		},
		{ id: 'test', title: 'Run keyboard checks', status: 'pending' as const }
	]);
	function advance() {
		items = items.map((item, index) =>
			index === 1
				? { ...item, status: 'completed' as const }
				: index === 2
					? { ...item, status: 'in-progress' as const }
					: item
		);
	}
</script>

<div class="fixture-preview">
	<TodoList {items} onOpenChange={() => undefined} />
	<button type="button" onclick={advance}>Advance task</button>
</div>
