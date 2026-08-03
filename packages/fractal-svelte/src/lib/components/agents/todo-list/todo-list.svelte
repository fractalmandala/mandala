<script lang="ts">
	import { untrack } from 'svelte';
	import './todo-list.sass';
	export type TodoItemStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
	export type TodoItem = {
		id: string;
		title: string;
		status?: TodoItemStatus;
		progress?: number;
		detail?: string;
	};
	let {
		items,
		title = 'To-dos',
		open,
		defaultOpen = true,
		onOpenChange,
		collapseOnComplete = true,
		maxHeight = 248
	}: {
		items: TodoItem[];
		title?: string;
		open?: boolean;
		defaultOpen?: boolean;
		onOpenChange?: (v: boolean) => void;
		collapseOnComplete?: boolean;
		maxHeight?: number;
	} = $props();
	let internal = $state(untrack(() => defaultOpen)),
		wasComplete = $state(false);
	let current = $derived(open ?? internal),
		completed = $derived(items.filter((x) => x.status === 'completed').length),
		all = $derived(items.length > 0 && completed === items.length);
	const id = `todos-${Math.random().toString(36).slice(2)}`;
	function setOpen(v: boolean) {
		if (open === undefined) internal = v;
		onOpenChange?.(v);
	}
	$effect(() => {
		if (wasComplete && !all) setOpen(true);
		if (!wasComplete && all && collapseOnComplete) setOpen(false);
		wasComplete = all;
	});
</script>

<section data-slot="todo-list" aria-label="Agent task list" data-complete={all || undefined}>
	<button
		type="button"
		data-slot="todo-list-trigger"
		aria-expanded={current}
		aria-controls={id}
		onclick={() => setOpen(!current)}
		><span aria-hidden="true">{all ? '✓' : '☷'}</span><strong>{title}</strong><span
			><span data-slot="sr-only">{completed} of {items.length} tasks completed</span><span
				aria-hidden="true">{completed}/{items.length}</span
			></span
		><span aria-hidden="true">⌄</span></button
	>
	<div
		{id}
		data-slot="todo-list-content"
		role="region"
		aria-hidden={!current}
		inert={!current}
		style={`--max-height:${maxHeight}px`}
	>
		{#if items.length}<ol aria-live="polite">
				{#each items as item (item.id)}<li data-status={item.status ?? 'pending'}>
						<span data-slot="todo-status" aria-hidden="true"
							>{item.status === 'completed'
								? '✓'
								: item.status === 'cancelled'
									? '×'
									: item.status === 'in-progress'
										? '◔'
										: '○'}</span
						><span data-slot="sr-only">{item.status ?? 'pending'}: </span><span
							data-slot="todo-title">{item.title}</span
						>{#if item.detail}<span data-slot="todo-detail">{item.detail}</span>{/if}
					</li>{/each}
			</ol>{:else}<p>No tasks yet</p>{/if}
	</div>
</section>
