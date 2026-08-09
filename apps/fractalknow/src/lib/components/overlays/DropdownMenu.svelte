<script lang="ts">
	import { untrack } from 'svelte';
	import type { Snippet } from 'svelte';

	export type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

	export type DropdownItem =
		| {
				id: string;
				type?: 'item';
				label: string;
				shortcut?: string;
				disabled?: boolean;
				danger?: boolean;
				onSelect?: () => void;
		  }
		| {
				id: string;
				type: 'checkbox';
				label: string;
				checked: boolean;
				disabled?: boolean;
				onSelect?: (next: boolean) => void;
		  }
		| {
				id: string;
				type: 'radio';
				label: string;
				checked: boolean;
				disabled?: boolean;
				onSelect?: () => void;
		  }
		| {
				id: string;
				type: 'separator';
		  };

	type Props = {
		open?: boolean;
		anchor?: HTMLElement | null;
		placement?: DropdownPlacement;
		closeOnSelect?: boolean;
		ariaLabel?: string;
		items?: DropdownItem[];
		class?: string;
		children?: Snippet;
	};

	let {
		open = $bindable(false),
		anchor = null,
		placement = 'bottom-start',
		closeOnSelect = true,
		ariaLabel = 'Menu',
		items,
		class: extraClass = '',
		children,
	}: Props = $props();

	let menuEl = $state<HTMLDivElement | null>(null);
	let popoverX = $state(0);
	let popoverY = $state(0);
	let popoverWidth = $state(280);
	let popoverHeight = $state(0);
	let activeIndex = $state(-1);

	const actionableIndexes = $derived(
		(items ?? [])
			.map((item, index) => ({ item, index }))
			.filter(({ item }) => item.type !== 'separator' && !('disabled' in item && item.disabled))
			.map(({ index }) => index),
	);

	function closeMenu(): void {
		open = false;
		anchor?.focus();
	}

	$effect(() => {
		if (!open) return;
		// Reposition once per open. Untracked: the anchor/measurement reads must
		// not resubscribe this effect (anchor/geometry writes feed back into the
		// popover state this effect writes, which can loop the effect graph).
		untrack(reposition);
		// Focus the first actionable row so keyboard users land inside the menu.
		activeIndex = actionableIndexes[0] ?? -1;
		queueMicrotask(() => {
			if (items && activeIndex >= 0) {
				focusItem(activeIndex);
			} else if (!items) {
				menuEl?.querySelector<HTMLElement>('[data-dropdown-item]:not([disabled])')?.focus();
			}
		});
	});

	$effect(() => {
		if (!open) return;
		const handlePointerDown = (event: PointerEvent) => {
			if (!menuEl) return;
			if (event.target instanceof Node && (menuEl.contains(event.target) || anchor?.contains(event.target))) {
				return;
			}
			open = false;
		};
		document.addEventListener('pointerdown', handlePointerDown, true);
		return () => {
			document.removeEventListener('pointerdown', handlePointerDown, true);
		};
	});

	function reposition(): void {
		if (!anchor) return;
		const anchorRect = anchor.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		popoverWidth = menuEl?.offsetWidth ?? 280;
		popoverHeight = menuEl?.offsetHeight ?? 0;

		switch (placement) {
			case 'bottom-start':
				popoverX = anchorRect.left;
				popoverY = anchorRect.bottom + 6;
				break;
			case 'bottom-end':
				popoverX = anchorRect.right - popoverWidth;
				popoverY = anchorRect.bottom + 6;
				break;
			case 'top-start':
				popoverX = anchorRect.left;
				popoverY = anchorRect.top - popoverHeight - 6;
				break;
			case 'top-end':
				popoverX = anchorRect.right - popoverWidth;
				popoverY = anchorRect.top - popoverHeight - 6;
				break;
		}

		// Clamp inside the viewport with a small gutter so the menu never
		// sits flush against the edge.
		const gutter = 8;
		popoverX = Math.min(Math.max(popoverX, gutter), viewportWidth - popoverWidth - gutter);
		popoverY = Math.min(Math.max(popoverY, gutter), viewportHeight - popoverHeight - gutter);
	}

	function focusItem(index: number): void {
		menuEl?.querySelector<HTMLElement>(`[data-menu-index="${index}"]`)?.focus();
	}

	function move(delta: number): void {
		if (actionableIndexes.length === 0) return;
		const currentPos = actionableIndexes.indexOf(activeIndex);
		const nextPos = (currentPos + delta + actionableIndexes.length) % actionableIndexes.length;
		activeIndex = actionableIndexes[nextPos] ?? actionableIndexes[0] ?? -1;
		queueMicrotask(() => focusItem(activeIndex));
	}

	function activate(index: number): void {
		const entry = items?.[index];
		if (!entry || entry.type === 'separator') return;
		if ('disabled' in entry && entry.disabled) return;
		if (entry.type === 'checkbox') {
			entry.onSelect?.(!entry.checked);
		} else {
			entry.onSelect?.();
		}
		if (closeOnSelect) closeMenu();
	}

	function handleItemsKeydown(event: KeyboardEvent): void {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			move(1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			move(-1);
		} else if (event.key === 'Home') {
			event.preventDefault();
			activeIndex = actionableIndexes[0] ?? -1;
			queueMicrotask(() => focusItem(activeIndex));
		} else if (event.key === 'End') {
			event.preventDefault();
			activeIndex = actionableIndexes.at(-1) ?? -1;
			queueMicrotask(() => focusItem(activeIndex));
		} else if (event.key === 'Enter' || event.key === ' ') {
			if (activeIndex >= 0) {
				event.preventDefault();
				activate(activeIndex);
			}
		} else if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			closeMenu();
		}
	}

	function handleSlottedKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			closeMenu();
			return;
		}
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') {
			return;
		}
		const rows = Array.from(
			menuEl?.querySelectorAll<HTMLElement>('[data-dropdown-item]:not([disabled])') ?? [],
		);
		if (rows.length === 0) return;
		event.preventDefault();
		const current = rows.findIndex((row) => row === document.activeElement);
		let next: number;
		if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = rows.length - 1;
		else if (event.key === 'ArrowDown') next = (current + 1) % rows.length;
		else next = (current - 1 + rows.length) % rows.length;
		rows[next]?.focus();
	}

	function handleMenuClick(event: MouseEvent): void {
		if (!closeOnSelect) return;
		const target = event.target;
		if (target instanceof HTMLElement && target.closest('button[data-dropdown-item], [data-dropdown-close]')) {
			closeMenu();
		}
	}
</script>

{#if open}
	<div
		bind:this={menuEl}
		class={`dropdown ${extraClass}`}
		role="menu"
		tabindex={-1}
		aria-label={ariaLabel}
		style={`left: ${popoverX}px; top: ${popoverY}px; min-width: ${Math.max(popoverWidth, 220)}px`}
		onclick={handleMenuClick}
		onkeydown={items ? handleItemsKeydown : handleSlottedKeydown}
	>
		{#if items}
			{#each items as item, index (item.id)}
				{#if item.type === 'separator'}
					<div class="dropdown__separator" role="separator"></div>
				{:else}
					<button
						type="button"
						class="dropdown__item"
						class:danger={item.type !== 'checkbox' && item.type !== 'radio' && item.danger}
						class:active={index === activeIndex}
						role={item.type === 'checkbox' || item.type === 'radio' ? 'menuitemcheckbox' : 'menuitem'}
						aria-checked={item.type === 'checkbox' || item.type === 'radio' ? item.checked : undefined}
						data-menu-index={index}
						data-dropdown-item
						disabled={item.disabled}
						tabindex={index === activeIndex ? 0 : -1}
						onclick={() => activate(index)}
						onmousemove={() => (activeIndex = index)}
					>
						<span class="dropdown__marker" aria-hidden="true">
							{#if item.type === 'checkbox' || item.type === 'radio'}
								{item.checked ? '✓' : ''}
							{/if}
						</span>
						<span class="dropdown__label">{item.label}</span>
						{#if item.type !== 'checkbox' && item.type !== 'radio' && item.shortcut}
							<kbd>{item.shortcut}</kbd>
						{/if}
					</button>
				{/if}
			{/each}
		{:else}
			{@render children?.()}
		{/if}
	</div>
{/if}

<style lang="sass">
	@use '$lib/styles/tokens' as t
	@use '$lib/styles/mixins' as m

	.dropdown
		position: fixed
		z-index: t.$z-popover
		min-width: 220px
		max-width: 360px
		max-height: 80dvh
		overflow: auto
		background: var(--ok-panel)
		color: var(--ok-ink)
		border: 1px solid var(--ok-line)
		border-radius: t.$radius-md
		box-shadow: var(--ok-shadow-lg)
		padding: t.$space-1
		animation: dropdown-enter t.$duration-fast t.$ease-out
		isolation: isolate

		&__separator
			height: 1px
			margin: t.$space-1 t.$space-2
			background: var(--ok-line)

		&__item
			display: grid
			grid-template-columns: 18px minmax(0, 1fr) auto
			align-items: center
			gap: t.$space-2
			width: 100%
			border: 0
			border-radius: t.$radius-md
			padding: t.$space-2 t.$space-3
			background: transparent
			color: var(--ok-ink)
			font-size: t.$font-size-sm
			text-align: left
			cursor: pointer
			@include m.hover-transition(background-color)

			&:hover,
			&.active
				background: var(--ok-highlight)

			&:focus-visible
				@include m.focus-ring(1px, 1px)

			&:disabled
				opacity: 0.45
				cursor: not-allowed

			&.danger
				color: var(--ok-danger)

		&__marker
			width: 14px
			font-size: t.$font-size-xs
			font-weight: 800
			color: var(--ok-accent)

		&__label
			overflow: hidden
			text-overflow: ellipsis
			white-space: nowrap

		kbd
			@include m.kbd-chip

	@keyframes dropdown-enter
		from
			opacity: 0
			transform: translateY(-4px)
		to
			opacity: 1
			transform: translateY(0)

	@media (prefers-reduced-motion: reduce)
		.dropdown
			animation: none
</style>
