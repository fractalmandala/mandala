<script lang="ts">
	// designcanvas/DesignBlock
	//
	// One node in the design canvas scene graph, rendered recursively. Movement,
	// resizing, and rotation are driven by shared Engine instances owned by the
	// host canvas (same pattern DesignLayout.svelte already uses for Tiles) —
	// this component just forwards pointer events to them and renders the
	// 8 resize handles + rotate handle when selected.
	//
	// "Droppable" is the one capability this component owns directly: frame and
	// container blocks listen for the custom 'pointerdrop-on-container' event
	// that the `draggable` action (designblock.ts) dispatches on drop, so
	// anything wired up with `use:draggable` elsewhere (dock items, layer rows)
	// can be dropped into this block without DesignBlock needing to know who's
	// dragging. The block's own grip handle uses the same action to act as a
	// drag *source*, on a small dedicated element so it doesn't fight with the
	// free-move pointerdown on the body (HTML5 dragstart and continuous pointer
	// dragging can't both own the same element's gesture).
	import type { Snippet } from 'svelte';
	import type { DesignBlock as Block, VectorPath } from '$lib/modules/designer/engine/designtypes';
	import { draggable } from '$lib/modules/designer/engine/designblock';
	import { dndState } from '$lib/modules/designer/engine/designstores.svelte';
	import { pathsToD } from '$lib/modules/designer/engine/svgpath';
	import { DragEngine } from '$lib/modules/designer/engine/DragEngine.svelte';
	import { ResizeEngine, type ResizeHandle } from '$lib/modules/designer/engine/ResizeEngine.svelte';
	import { RotateEngine } from '$lib/modules/designer/engine/RotateEngine.svelte';
	import { designcanvas } from '$lib/modules/designer/state/designcanvas.svelte';
	import { readTypography } from '$lib/modules/designer/engine/typography';
	import DesignBlockSelf from './DesignBlock.svelte';
	import { onDestroy, tick } from 'svelte';

	const RESIZE_HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
	const DROP_CONTAINER = 'design-canvas';

	let {
		block,
		allBlocks,
		selectedIds,
		drag,
		resize,
		rotate,
		absX = 0,
		absY = 0,
		onselect,
		oncontextmenu,
		ondrop,
		ongesturemove,
		ongestureend,
		body,
	}: {
		block: Block;
		allBlocks: Block[];
		selectedIds: string[];
		drag: DragEngine;
		resize: ResizeEngine;
		rotate: RotateEngine;
		/** Absolute canvas-space position of this block's parent origin. */
		absX?: number;
		absY?: number;
		onselect?: (block: Block, event: PointerEvent) => boolean;
		oncontextmenu?: (block: Block, event: MouseEvent) => void;
		/** Fired when something is dropped onto this block (only wired for
		 *  frame/container types). `data` is whatever `dragData` the source
		 *  passed to `use:draggable`. */
		ondrop?: (block: Block, data: unknown) => void;
		ongesturemove?: (event: PointerEvent) => void;
		ongestureend?: (event: PointerEvent) => void;
		/** Optional custom body renderer. Falls back to type-based rendering
		 *  (text/image/vector/nested children) when omitted. */
		body?: Snippet<[Block]>;
	} = $props();

	const selected = $derived(selectedIds.includes(block.id));
	const childBlocks = $derived(allBlocks.filter((b) => b.parentId === block.id && !b.hidden));
	const canAcceptDrops = $derived(block.type === 'frame' || block.type === 'container');
	const parentBlock = $derived(block.parentId ? allBlocks.find((b) => b.id === block.parentId) : undefined);
	// A block is flow-positioned (laid out by its parent's flex/grid) only when
	// its parent has an explicit layout mode — those children get `position:
	// relative; left/top: auto` in CSS, so they must NOT be transform-translated
	// by their own (stale) x/y. Every other block is absolutely positioned and is
	// moved via a GPU-composited transform so dragging recomposites instead of
	// triggering a layout + repaint of the whole subtree every frame.
	const isFlowChild = $derived(
		!!parentBlock && ['row', 'column', 'grid'].includes(parentBlock.props.layout as string)
	);
	const positionStyle = $derived(
		isFlowChild
			? `width: ${block.w}px; height: ${block.h}px; transform: rotate(${block.rotation || 0}deg); z-index: ${selected ? 999 : 1};`
			: `left: 0; top: 0; width: ${block.w}px; height: ${block.h}px; transform: translate3d(${block.x}px, ${block.y}px, 0) rotate(${block.rotation || 0}deg); z-index: ${selected ? 999 : 1};`
	);
	const layoutMode = $derived(block.props.layout as string | undefined);
	const layoutClass = $derived(
		layoutMode === 'row'
			? 'layout-row'
			: layoutMode === 'column'
				? 'layout-column'
				: layoutMode === 'grid'
					? 'layout-grid'
					: null
	);
	const vectorD = $derived(
		block.type === 'vector' ? pathsToD((block.props.paths as VectorPath[] | undefined) ?? []) : ''
	);
	const editingText = $derived(designcanvas.editingTextId === block.id);
	const textTypography = $derived(readTypography(block.style));

	let dropHover = $state(false);
	const isDropTarget = $derived(
		dropHover || (canAcceptDrops && drag.active && drag.id !== block.id && designcanvas.dropTargetId === block.id)
	);
	let textElement = $state<HTMLElement | null>(null);
	let activePointerId: number | null = null;
	let engineGestureCleanup: (() => void) | null = null;

	function removeWindowGestureListeners() {
		window.removeEventListener('pointermove', windowGestureMove, true);
		window.removeEventListener('pointerup', windowGestureEnd, true);
		window.removeEventListener('pointercancel', windowGestureEnd, true);
		activePointerId = null;
	}

	function windowGestureMove(event: PointerEvent) {
		if (event.pointerId !== activePointerId) return;
		ongesturemove?.(event);
	}

	function windowGestureEnd(event: PointerEvent) {
		if (event.pointerId !== activePointerId) return;
		removeWindowGestureListeners();
		ongestureend?.(event);
	}

	function beginWindowGesture(pointerId: number) {
		removeWindowGestureListeners();
		activePointerId = pointerId;
		window.addEventListener('pointermove', windowGestureMove, true);
		window.addEventListener('pointerup', windowGestureEnd, true);
		window.addEventListener('pointercancel', windowGestureEnd, true);
	}

	onDestroy(() => {
		removeWindowGestureListeners();
		engineGestureCleanup?.();
	});

	async function enterTextEdit() {
		designcanvas.startEditingText(block.id);
		await tick();
		textElement?.focus();
	}

	function pointerDown(event: PointerEvent) {
		if (block.locked || event.button !== 0) return;
		event.stopPropagation();
		if (onselect?.(block, event) === false) return;
		drag.onPointerDown(event, block as unknown as { id: string; x: number; y: number; w: number; h: number; parentId: string | null });
		beginWindowGesture(event.pointerId);
	}

	function resizeDown(event: PointerEvent, handle: ResizeHandle) {
		event.stopPropagation();
		designcanvas.recordGestureStart();
		resize.onPointerDown(event, block, handle);
		const pointerId = event.pointerId;
		const move = (next: PointerEvent) => {
			if (next.pointerId === pointerId) resize.onPointerMove(next);
		};
		const end = (next: PointerEvent) => {
			if (next.pointerId !== pointerId) return;
			engineGestureCleanup?.();
			resize.onPointerUp(next);
			ongestureend?.(next);
		};
		engineGestureCleanup?.();
		window.addEventListener('pointermove', move, true);
		window.addEventListener('pointerup', end, true);
		window.addEventListener('pointercancel', end, true);
		engineGestureCleanup = () => {
			window.removeEventListener('pointermove', move, true);
			window.removeEventListener('pointerup', end, true);
			window.removeEventListener('pointercancel', end, true);
			engineGestureCleanup = null;
		};
	}

	function rotateDown(event: PointerEvent) {
		event.stopPropagation();
		designcanvas.recordGestureStart();
		const absPos = designcanvas.getAbsolutePosition(block);
		rotate.onPointerDown(event, block, absPos.x + block.w / 2, absPos.y + block.h / 2);
		const pointerId = event.pointerId;
		const move = (next: PointerEvent) => {
			if (next.pointerId === pointerId) rotate.onPointerMove(next);
		};
		const end = (next: PointerEvent) => {
			if (next.pointerId !== pointerId) return;
			engineGestureCleanup?.();
			rotate.onPointerUp(next);
			ongestureend?.(next);
		};
		engineGestureCleanup?.();
		window.addEventListener('pointermove', move, true);
		window.addEventListener('pointerup', end, true);
		window.addEventListener('pointercancel', end, true);
		engineGestureCleanup = () => {
			window.removeEventListener('pointermove', move, true);
			window.removeEventListener('pointerup', end, true);
			window.removeEventListener('pointercancel', end, true);
			engineGestureCleanup = null;
		};
	}

	function gestureMove(event: PointerEvent) {
		if (!drag.active && !resize.active && !rotate.active) return;
		event.stopPropagation();
		ongesturemove?.(event);
	}

	function gestureEnd(event: PointerEvent) {
		if (!drag.active && !resize.active && !rotate.active) return;
		event.stopPropagation();
		ongestureend?.(event);
	}

	// Drop target: listen for the bubbling custom events the `draggable` action
	// dispatches (covers both its HTML5 and pointer-fallback drag paths). Only
	// attached when this block can actually accept drops.
	function dropZone(node: HTMLElement) {
		if (!canAcceptDrops) return {};

		function onDragStartOnContainer() {
			dropHover = false; // reset; real hover tracked via pointerenter/dragenter below
		}
		function onPointerDropOnContainer(event: Event) {
			const detail = (event as CustomEvent).detail;
			event.stopPropagation();
			dropHover = false;
			ondrop?.(block, detail?.dragData);
		}
		function onNativeDragOver(event: DragEvent) {
			// Don't stop propagation — the canvas-world dragover handler
			// needs to see the event so it can call preventDefault and let
			// `drop` fire on .canvas-world for library insertions. Only
			// reparent drags (which carry an `id` payload) should be
			// swallowed by this block; those are discriminated in
			// `onNativeDrop` below.
			event.preventDefault();
			dropHover = true;
		}
		function onNativeDragLeave(event: DragEvent) {
			dropHover = false;
		}
		function onNativeDrop(event: DragEvent) {
			event.preventDefault();
			dropHover = false;
			const raw = event.dataTransfer?.getData('text/plain');
			if (!raw) return;
			let parsed: unknown;
			try {
				parsed = JSON.parse(raw);
			} catch {
				return;
			}
			// Only swallow reparent drops here. Library payloads
			// (`{ kind: 'template' | 'user-component' | 'layout-primitive' }`)
			// must bubble to .canvas-world's `handleLibraryDrop`.
			const isReparent = !!parsed && typeof parsed === 'object' && 'id' in (parsed as Record<string, unknown>);
			if (!isReparent) return;
			event.stopPropagation();
			ondrop?.(block, parsed);
		}
		function onPointerEnter() {
			if (dndState.isDragging) dropHover = true;
		}
		function onPointerLeave() {
			dropHover = false;
		}

		node.addEventListener('dragstart-on-container', onDragStartOnContainer);
		node.addEventListener('pointerdrop-on-container', onPointerDropOnContainer);
		node.addEventListener('dragover', onNativeDragOver);
		node.addEventListener('dragleave', onNativeDragLeave);
		node.addEventListener('drop', onNativeDrop);
		node.addEventListener('pointerenter', onPointerEnter);
		node.addEventListener('pointerleave', onPointerLeave);

		return {
			destroy() {
				node.removeEventListener('dragstart-on-container', onDragStartOnContainer);
				node.removeEventListener('pointerdrop-on-container', onPointerDropOnContainer);
				node.removeEventListener('dragover', onNativeDragOver);
				node.removeEventListener('dragleave', onNativeDragLeave);
				node.removeEventListener('drop', onNativeDrop);
				node.removeEventListener('pointerenter', onPointerEnter);
				node.removeEventListener('pointerleave', onPointerLeave);
			}
		};
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- `class` takes an array and dedupes / trims entries — no more
     trailing space when `layoutClass` is undefined. -->
<div
	class={['design-block', block.props.layoutClass, layoutClass, block.type === 'text' && `text-vertical-${textTypography.verticalAlign}`, block.type === 'text' && `text-sizing-${textTypography.sizingMode}`]}
	class:selected
	class:locked={block.locked}
	class:drop-hover={isDropTarget}
	style={positionStyle}
	style:background={block.style.background as string | undefined}
	style:border={block.style.border as string | undefined}
	style:overflow={(block.style.overflow as string | undefined) ?? 'visible'}
	style:opacity={(block.style.opacity as string | number | undefined) ?? 1}
	style:mix-blend-mode={(block.style['mix-blend-mode'] as string | undefined)}
	style:box-shadow={(block.style['box-shadow'] as string | undefined) ?? 'none'}
	style:border-radius={block.type === 'ellipse'
		? '50%'
		: (block.style['border-radius'] as string | number | undefined)}
	use:dropZone
	onpointerdown={pointerDown}
	onpointerup={gestureEnd}
	onpointercancel={gestureEnd}
	oncontextmenu={(e) => {
		e.preventDefault();
		e.stopPropagation();
		oncontextmenu?.(block, e);
	}}
>
	{#if body}
		{@render body(block)}
	{:else if block.type === 'text'}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span
			bind:this={textElement}
			class="design-block-text"
			contenteditable={editingText}
			spellcheck="false"
			style:color={block.style.color as string | undefined}
			style:font-size={block.style['font-size'] as string | undefined}
			style:font-weight={block.style['font-weight'] as string | number | undefined}
			style:font-style={block.style['font-style'] as string | undefined}
			style:font-family={block.style['font-family'] as string | undefined}
			style:line-height={block.style['line-height'] as string | number | undefined}
			style:letter-spacing={block.style['letter-spacing'] as string | undefined}
			style:text-align={block.style['text-align'] as string | undefined}
			style:text-decoration={block.style['text-decoration'] as string | undefined}
			style:text-transform={block.style['text-transform'] as string | undefined}
			style:text-overflow={block.style['text-overflow'] as string | undefined}
			style:white-space={block.style['white-space'] as string | undefined}
			style:margin-bottom={block.style['margin-bottom'] as string | undefined}
			onpointerdown={(e) => {
				if (editingText) e.stopPropagation();
				else pointerDown(e);
			}}
			onpointerup={gestureEnd}
			onpointercancel={gestureEnd}
			ondblclick={enterTextEdit}
			onfocus={() => designcanvas.startEditingText(block.id)}
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					e.preventDefault();
					(e.currentTarget as HTMLElement).blur();
				}
				e.stopPropagation();
			}}
			onblur={(e) => designcanvas.finishEditingText(block.id, (e.currentTarget as HTMLElement).textContent ?? '')}
		>{block.props.text as string ?? ''}</span>
	{:else if block.type === 'image'}
		{#if typeof block.props.src === 'string' && block.props.src.trim()}
		<img
			class="design-block-image"
			src={block.props.src as string}
			alt={(block.props.alt as string | undefined) ?? block.name}
			style:object-fit={(block.style['object-fit'] as string | undefined) ?? 'cover'}
			draggable="false"
		/>
		{:else}
			<div class="design-block-image-empty">
				<img src="/iconset/image.svg" alt="" class="icon-svg-large" />
				<span>Choose an image</span>
			</div>
		{/if}
	{:else if block.type === 'vector'}
		<svg class="design-block-svg" viewBox="0 0 {block.w} {block.h}" preserveAspectRatio="none">
			<path
				d={vectorD}
				fill={(block.style.background as string | undefined) ?? 'none'}
				stroke={(block.style.stroke as string | undefined) ?? 'none'}
				stroke-width={block.style.strokeWidth ?? 1}
			/>
		</svg>
	{:else if typeof block.props.text === 'string' && block.props.text.trim()}
		<span
			class="design-block-text"
			style:color={block.style.color as string | undefined}
			style:font-size={block.style['font-size'] as string | undefined}
			style:font-weight={block.style['font-weight'] as string | number | undefined}
			style:font-style={block.style['font-style'] as string | undefined}
			style:font-family={block.style['font-family'] as string | undefined}
			style:line-height={block.style['line-height'] as string | number | undefined}
			style:letter-spacing={block.style['letter-spacing'] as string | undefined}
			style:text-align={block.style['text-align'] as string | undefined}
			style:text-decoration={block.style['text-decoration'] as string | undefined}
			style:text-transform={block.style['text-transform'] as string | undefined}
			style:text-overflow={block.style['text-overflow'] as string | undefined}
			style:white-space={block.style['white-space'] as string | undefined}
			style:margin-bottom={block.style['margin-bottom'] as string | undefined}
		>{block.props.text}</span>
	{/if}

	{#each childBlocks as child (child.id)}
		<DesignBlockSelf
			block={child}
			{allBlocks}
			{selectedIds}
			{drag}
			{resize}
			{rotate}
			{onselect}
			{oncontextmenu}
			{ondrop}
			{ongesturemove}
			{ongestureend}
			{body}
		/>
	{/each}

	{#if !block.locked}
		<button
			type="button"
			class="design-block-grip"
			title="Drag to reorder; use Arrow Up or Arrow Down for keyboard reordering"
			aria-label="Drag to reorder"
			use:draggable={{ dragData: block, container: DROP_CONTAINER }}
			onpointerdown={(e) => e.stopPropagation()}
			onkeydown={(event) => {
				if (event.key === 'ArrowUp') {
					event.preventDefault();
					designcanvas.moveForward(block.id);
				} else if (event.key === 'ArrowDown') {
					event.preventDefault();
					designcanvas.moveBackward(block.id);
				}
			}}
		><img src="/iconset/drag.svg" alt="" class="icon-svg-xs" /></button>
	{/if}

	{#if selected && !block.locked}
		{#each RESIZE_HANDLES as handle (handle)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span
				class="resize-handle handle-{handle}"
				onpointerdown={(e) => resizeDown(e, handle)}
				onpointermove={gestureMove}
				onpointerup={gestureEnd}
				onpointercancel={gestureEnd}
			></span>
		{/each}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span
			class="rotate-handle"
			onpointerdown={rotateDown}
			onpointermove={gestureMove}
			onpointerup={gestureEnd}
			onpointercancel={gestureEnd}
		></span>
	{/if}
</div>
