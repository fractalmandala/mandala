<script lang="ts">
	import { untrack } from 'svelte';
	import './ai-sidebar.sass';
	export type SidebarResourceKind = 'folder' | 'project' | 'file' | 'bookmark';
	export type SidebarResource = {
		id: string;
		label: string;
		kind: SidebarResourceKind;
		children?: SidebarResource[];
		disabled?: boolean;
	};
	export type SidebarResourceMove = {
		itemId: string;
		targetId: string | null;
		position: 'before' | 'inside' | 'after';
	};
	let {
		items,
		defaultItems = [],
		onItemsChange,
		onMove,
		onMoveError,
		onRename,
		activeId,
		defaultActiveId = null,
		onActiveChange,
		defaultExpandedIds = [],
		ariaLabel = 'Resources'
	}: {
		items?: SidebarResource[];
		defaultItems?: SidebarResource[];
		onItemsChange?: (v: SidebarResource[]) => void;
		onMove?: (v: SidebarResourceMove) => void | Promise<void>;
		onMoveError?: (e: unknown, m: SidebarResourceMove) => void;
		onRename?: (i: SidebarResource, l: string) => void | Promise<void>;
		activeId?: string | null;
		defaultActiveId?: string | null;
		onActiveChange?: (id: string) => void;
		defaultExpandedIds?: string[];
		ariaLabel?: string;
	} = $props();
	let internalItems = $state(untrack(() => items ?? defaultItems)),
		internalActive = $state(untrack(() => defaultActiveId)),
		expanded = $state(untrack(() => new Set(defaultExpandedIds))),
		focused = $state(untrack(() => activeId ?? defaultActiveId)),
		renaming = $state<string | null>(null),
		announcement = $state('');
	let rendered = $derived(items ?? internalItems),
		selected = $derived(activeId ?? internalActive);
	type Row = { item: SidebarResource; depth: number; parent: string | null };
	function flat(list: SidebarResource[], depth = 0, parent: string | null = null): Row[] {
		return list.flatMap((item) => [
			{ item, depth, parent },
			...(item.children?.length && expanded.has(item.id)
				? flat(item.children, depth + 1, item.id)
				: [])
		]);
	}
	let rows = $derived(flat(rendered));
	$effect(() => {
		if (items === undefined) internalItems = defaultItems;
		if (activeId === undefined) internalActive = defaultActiveId;
		focused = activeId ?? defaultActiveId;
		expanded = new Set(defaultExpandedIds);
	});
	function update(v: SidebarResource[]) {
		internalItems = v;
		onItemsChange?.(v);
	}
	function select(id: string) {
		if (activeId === undefined) internalActive = id;
		onActiveChange?.(id);
	}
	function toggle(id: string) {
		const n = new Set(expanded);
		n.has(id) ? n.delete(id) : n.add(id);
		expanded = n;
	}
	function focus(id: string) {
		focused = id;
		requestAnimationFrame(() =>
			document.querySelector<HTMLElement>(`[data-resource-id="${CSS.escape(id)}"]`)?.focus()
		);
	}
	function rename(list: SidebarResource[], id: string, label: string): SidebarResource[] {
		return list.map((x) => ({
			...x,
			label: x.id === id ? label : x.label,
			children: x.children ? rename(x.children, id, label) : undefined
		}));
	}
	async function commit(item: SidebarResource, label: string) {
		const v = label.trim();
		renaming = null;
		if (!v || v === item.label) return;
		const before = rendered;
		update(rename(before, item.id, v));
		try {
			await onRename?.(item, v);
		} catch {
			update(before);
			announcement = `Rename failed. ${item.label} was restored.`;
		}
	}
	function key(e: KeyboardEvent, row: Row) {
		const i = rows.findIndex((x) => x.item.id === row.item.id),
			prev = rows[i - 1],
			next = rows[i + 1];
		if (e.key === 'ArrowDown' && next) {
			e.preventDefault();
			focus(next.item.id);
		} else if (e.key === 'ArrowUp' && prev) {
			e.preventDefault();
			focus(prev.item.id);
		} else if (e.key === 'Home' && rows[0]) {
			e.preventDefault();
			focus(rows[0].item.id);
		} else if (e.key === 'End' && rows.at(-1)) {
			e.preventDefault();
			focus(rows.at(-1)!.item.id);
		} else if (e.key === 'ArrowRight' && ['folder', 'project'].includes(row.item.kind)) {
			e.preventDefault();
			if (!expanded.has(row.item.id)) toggle(row.item.id);
			else if (next?.parent === row.item.id) focus(next.item.id);
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			if (expanded.has(row.item.id)) toggle(row.item.id);
			else if (row.parent) focus(row.parent);
		} else if ((e.key === 'Enter' || e.key === ' ') && !row.item.disabled) {
			e.preventDefault();
			['folder', 'project'].includes(row.item.kind)
				? toggle(row.item.id)
				: select(row.item.id);
		} else if (e.key === 'F2' && !row.item.disabled) {
			e.preventDefault();
			renaming = row.item.id;
		}
	}
</script>

<div data-slot="ai-sidebar" role="tree" aria-label={ariaLabel} aria-multiselectable="false">
	{#each rows as row (row.item.id)}<div
			data-slot="ai-sidebar-item"
			data-resource-id={row.item.id}
			role="treeitem"
			aria-level={row.depth + 1}
			aria-selected={['file', 'bookmark'].includes(row.item.kind)
				? selected === row.item.id
				: undefined}
			aria-expanded={['folder', 'project'].includes(row.item.kind)
				? expanded.has(row.item.id)
				: undefined}
			aria-disabled={row.item.disabled || undefined}
			tabindex={focused === row.item.id ? 0 : -1}
			style={`--depth:${row.depth}`}
			onfocus={() => (focused = row.item.id)}
			onkeydown={(e) => key(e, row)}
			onclick={() => {
				if (row.item.disabled || renaming === row.item.id) return;
				['folder', 'project'].includes(row.item.kind)
					? toggle(row.item.id)
					: select(row.item.id);
			}}
		>
			<span aria-hidden="true"
				>{row.item.kind === 'bookmark'
					? '◆'
					: row.item.kind === 'file'
						? '▤'
						: expanded.has(row.item.id)
							? '▾'
							: '▸'}</span
			>{#if renaming === row.item.id}<input
					aria-label={`Rename ${row.item.label}`}
					value={row.item.label}
					onkeydown={(e) => {
						e.stopPropagation();
						if (e.key === 'Enter') commit(row.item, e.currentTarget.value);
						if (e.key === 'Escape') renaming = null;
					}}
					onblur={(e) => commit(row.item, e.currentTarget.value)}
					onclick={(e) => e.stopPropagation()}
				/>{:else}<span data-slot="ai-sidebar-label" title={row.item.label}
					>{row.item.label}</span
				><button
					type="button"
					tabindex="-1"
					aria-label={`Rename ${row.item.label}`}
					onclick={(e) => {
						e.stopPropagation();
						renaming = row.item.id;
					}}>✎</button
				>{/if}
		</div>{/each}
</div>
<span data-slot="sr-only" aria-live="polite">{announcement}</span>
