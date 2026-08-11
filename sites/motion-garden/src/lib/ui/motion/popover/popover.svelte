<script lang="ts">
	import { animate, useMotionValue, useReducedMotion } from '@humanspeak/svelte-motion';
	import { untrack, type Snippet } from 'svelte';
	import { useId } from '$lib/ui/lib/use-id.js';
	import {
		setPopoverContext,
		type Align,
		type PopoverContext,
		type Side,
		type TriggerMode
	} from './popover-context.js';
	import './popover.sass';

	// This morph needs less bounce than layout motion: too much overshoot makes
	// the liquid neck balloon past the final panel edges.
	const GOO_OPEN_SPRING = { type: 'spring', visualDuration: 0.3, bounce: 0.15 } as const;
	const GOO_CLOSE_SPRING = { type: 'spring', visualDuration: 0.21, bounce: 0.15 } as const;
	const HOVER_CLOSE_DELAY = 120;

	let {
		children,
		open: controlledOpen,
		defaultOpen = false,
		onOpenChange,
		trigger = 'click',
		side = 'bottom',
		align = 'center',
		sideOffset = 14,
		panelRadius = 16,
		gooStrength = 8,
		class: className
	}: {
		children: Snippet;
		open?: boolean;
		defaultOpen?: boolean;
		onOpenChange?: (open: boolean) => void;
		trigger?: TriggerMode;
		side?: Side;
		align?: Align;
		sideOffset?: number;
		panelRadius?: number;
		gooStrength?: number;
		class?: string;
	} = $props();

	const reduce = useReducedMotion();
	const gooId = useId().replace(/:/g, '');
	const contentId = useId();
	let rootEl: HTMLDivElement | null = null;
	let triggerEl: HTMLElement | null = null;
	let contentEl: HTMLDivElement | null = null;
	let closeTimer: ReturnType<typeof setTimeout> | null = null;
	const progress = useMotionValue(untrack(() => (defaultOpen ? 1 : 0)));

	let internalOpen = $state(untrack(() => defaultOpen));
	const controlled = $derived(controlledOpen !== undefined);
	const open = $derived(controlled ? controlledOpen! : internalOpen);

	function setOpen(next: boolean) {
		if (!controlled) internalOpen = next;
		onOpenChange?.(next);
	}

	function cancelClose() {
		if (closeTimer) {
			clearTimeout(closeTimer);
			closeTimer = null;
		}
	}

	function openHover() {
		cancelClose();
		setOpen(true);
	}

	function scheduleClose() {
		cancelClose();
		closeTimer = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY);
	}

	function toggle() {
		setOpen(!open);
	}

	$effect(() => {
		const animation = animate(
			progress,
			open ? 1 : 0,
			reduce.current ? { duration: 0 } : open ? GOO_OPEN_SPRING : GOO_CLOSE_SPRING
		);
		return () => animation.stop();
	});

	$effect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		// The panel is portalled, so both trees participate in outside detection.
		const onPointer = (e: PointerEvent) => {
			const target = e.target as Node | null;
			if (target && rootEl && !rootEl.contains(target) && !contentEl?.contains(target)) {
				setOpen(false);
			}
		};
		window.addEventListener('keydown', onKey);
		if (trigger === 'click') window.addEventListener('pointerdown', onPointer);
		return () => {
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('pointerdown', onPointer);
		};
	});

	const ctx: PopoverContext = {
		get open() {
			return open;
		},
		setOpen,
		toggle,
		openHover,
		scheduleClose,
		get triggerMode() {
			return trigger;
		},
		get side() {
			return side;
		},
		get align() {
			return align;
		},
		get gap() {
			return sideOffset;
		},
		get panelRadius() {
			return panelRadius;
		},
		get gooStrength() {
			return gooStrength;
		},
		get reduce() {
			return reduce.current;
		},
		gooId,
		contentId,
		progress,
		triggerRef: {
			get current() {
				return triggerEl;
			},
			set current(node) {
				triggerEl = node;
			}
		},
		contentRef: {
			get current() {
				return contentEl;
			},
			set current(node) {
				contentEl = node;
			}
		}
	};
	setPopoverContext(ctx);
</script>

<div
	bind:this={rootEl}
	data-slot="popover"
	role="none"
	class={className}
	onmouseenter={trigger === 'hover' ? openHover : undefined}
	onmouseleave={trigger === 'hover' ? scheduleClose : undefined}
>
	{@render children()}
</div>
