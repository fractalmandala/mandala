<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		items,
		rowHeight = 32,
		row,
		onItemSelect,
		class: className = '',
		containerClass = '',
	}: {
		items: unknown[];
		rowHeight?: number;
		row: Snippet<[unknown, number]>;
		onItemSelect?: (item: unknown, index: number) => void;
		class?: string;
		containerClass?: string;
	} = $props();

	let container = $state<HTMLDivElement | null>(null);
	let scrollTop = $state(0);
	let viewportHeight = $state(400);

	let focusedIndex = $state(-1);

	const totalHeight = $derived(items.length * rowHeight);

	const overscan = 10;

	const visibleStart = $derived(Math.max(0, Math.floor(scrollTop / rowHeight) - overscan));
	const visibleEnd = $derived(Math.min(items.length, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan));

	const visibleItems = $derived(
		items.slice(visibleStart, visibleEnd).map((item, i) => ({
			item,
			index: visibleStart + i,
			style: `position:absolute;top:${(visibleStart + i) * rowHeight}px;left:0;right:0;height:${rowHeight}px;`,
		}))
	);

	function onScroll() {
		if (!container) return;
		scrollTop = container.scrollTop;
		viewportHeight = container.clientHeight;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (items.length === 0) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				focusedIndex = Math.min(focusedIndex + 1, items.length - 1);
				scrollIntoView(focusedIndex);
				break;
			case 'ArrowUp':
				e.preventDefault();
				focusedIndex = Math.max(focusedIndex - 1, 0);
				scrollIntoView(focusedIndex);
				break;
			case 'Enter':
				e.preventDefault();
				if (focusedIndex >= 0 && focusedIndex < items.length && onItemSelect) {
					onItemSelect(items[focusedIndex], focusedIndex);
				}
				break;
			case 'Home':
				e.preventDefault();
				focusedIndex = 0;
				scrollIntoView(focusedIndex);
				break;
			case 'End':
				e.preventDefault();
				focusedIndex = items.length - 1;
				scrollIntoView(focusedIndex);
				break;
		}
	}

	function scrollIntoView(index: number) {
		if (!container) return;
		const top = index * rowHeight;
		const bottom = top + rowHeight;
		if (top < container.scrollTop) {
			container.scrollTop = top;
		} else if (bottom > container.scrollTop + container.clientHeight) {
			container.scrollTop = bottom - container.clientHeight;
		}
	}
</script>

<div
	bind:this={container}
	class={containerClass}
	role="listbox"
	tabindex="0"
	onscroll={onScroll}
	onkeydown={handleKeydown}
	style="overflow-y:auto;position:relative;flex:1;"
>
	<div style="height:{totalHeight}px;position:relative;width:100%;">
		{#each visibleItems as { item, index, style } (index)}
			<div
				role="option"
				tabindex="0"
				class={className}
				style={style}
				aria-selected={index === focusedIndex}
				onclick={() => onItemSelect?.(item, index)}
				onkeydown={(event) => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						onItemSelect?.(item, index);
					}
				}}
				onmouseenter={() => { focusedIndex = index; }}
			>
				{@render row(item, index)}
			</div>
		{/each}
	</div>
	{#if items.length === 0}
		<div class="virtual-list-empty">No results</div>
	{/if}
</div>
