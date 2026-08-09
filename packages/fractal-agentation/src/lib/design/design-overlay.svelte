<script lang="ts">
	import { onMount } from 'svelte';
	import { COMPONENT_MAP, DEFAULT_SIZES, type ComponentType, type DesignPlacement, type SnapRect } from './design-types';
	import { computeSnap, generateId, MIN_SIZE } from './design-snap';
	import { renderSkeleton } from './design-skeletons';

	// ── Types ──

	type HandleDir = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
	type Guide = { axis: 'x' | 'y'; pos: number };

	interface Props {
		placements: DesignPlacement[];
		activeComponent: ComponentType | null;
		isDarkMode?: boolean;
		exiting?: boolean;
		passthrough?: boolean;
		extraSnapRects?: SnapRect[];
		deselectSignal?: number;
		clearSignal?: number;
		wireframe?: boolean;
		class?: string;
		onActiveComponentChange?: (type: ComponentType | null) => void;
		onInteractionChange?: (active: boolean) => void;
		onSelectionChange?: (selectedIds: Set<string>, isShift: boolean) => void;
		onDragMove?: (dx: number, dy: number) => void;
		onDragEnd?: (dx: number, dy: number, committed: boolean) => void;
		onChange?: (placements: DesignPlacement[]) => void;
	}

	let {
		placements = $bindable([]),
		activeComponent = null,
		isDarkMode = true,
		exiting = false,
		passthrough = false,
		extraSnapRects = [],
		deselectSignal = 0,
		clearSignal,
		wireframe = false,
		class: extraClassName = '',
		onActiveComponentChange,
		onInteractionChange,
		onSelectionChange,
		onDragMove,
		onDragEnd,
		onChange
	}: Props = $props();

	// ── Reactive State ──

	let selectedIds = $state<Set<string>>(new Set());
	let drawBox = $state<{ x: number; y: number; w: number; h: number } | null>(null);
	let selectBox = $state<{ x: number; y: number; w: number; h: number } | null>(null);
	let sizeIndicator = $state<{ x: number; y: number; text: string } | null>(null);
	let guides = $state<Guide[]>([]);
	let editingId = $state<string | null>(null);
	let editExiting = $state(false);
	let editHadText = $state(false);
	let exitingIds = $state<Set<string>>(new Set());
	let scrollY = $state(0);
	let interactionType = $state<string | null>(null);
	let editText = $state('');
	let overlayRef = $state<HTMLElement | null>(null);

	const lastAnnotationTextMap = new Map<string, string>();
	const TEXT_PLACEHOLDERS: Partial<Record<ComponentType, string>> = {
		hero: 'Headline text', button: 'Button label', card: 'Card title',
		modal: 'Dialog title', navigation: 'Brand / nav items', tabs: 'Tab labels',
		input: 'Placeholder text', search: 'Search placeholder', toast: 'Notification message',
		alert: 'Alert message', section: 'Section heading', header: 'Header text',
		form: 'Form description', text: 'Content text'
	};

	function updatePlacements(next: DesignPlacement[]) {
		placements = next;
		onChange?.(next);
	}

	// ── Scroll Sync ──

	onMount(() => {
		const handleScroll = () => { scrollY = window.scrollY; };
		handleScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});

	// ── Signal Tracking ──

	let prevDeselectSignal = deselectSignal;
	$effect(() => {
		if (deselectSignal !== prevDeselectSignal) {
			prevDeselectSignal = deselectSignal;
			selectedIds = new Set();
		}
	});

	let prevClearSignal = clearSignal;
	$effect(() => {
		if (clearSignal !== undefined && clearSignal !== prevClearSignal) {
			prevClearSignal = clearSignal;
			const allIds = new Set(placements.map((p) => p.id));
			if (allIds.size > 0) {
				exitingIds = allIds;
				selectedIds = new Set();
				interactionType = null;
				setTimeout(() => {
					updatePlacements([]);
					exitingIds = new Set();
				}, 180);
			}
		}
	});

	$effect(() => {
		if (exiting && editingId) dismissEdit();
	});

	// ── Keyboard ──

	function handleKeyDown(e: KeyboardEvent) {
		const target = e.target as HTMLElement;
		const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
		if (isTyping) return;

		if ((e.key === 'Backspace' || e.key === 'Delete') && selectedIds.size > 0) {
			e.preventDefault();
			const toDelete = new Set(selectedIds);
			exitingIds = toDelete;
			selectedIds = new Set();
			setTimeout(() => {
				updatePlacements(placements.filter((p) => !toDelete.has(p.id)));
				exitingIds = new Set();
			}, 180);
			return;
		}

		if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedIds.size > 0) {
			e.preventDefault();
			const step = e.shiftKey ? 20 : 1;
			const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
			const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
			updatePlacements(
				placements.map((p) =>
					selectedIds.has(p.id)
						? { ...p, x: Math.max(0, p.x + dx), y: Math.max(0, p.y + dy) }
						: p
				)
			);
			return;
		}

		if (e.key === 'Escape') {
			if (activeComponent) {
				onActiveComponentChange?.(null);
			} else if (selectedIds.size > 0) {
				selectedIds = new Set();
			}
			return;
		}
	}

	// ── Overlay Interaction ──

	function handleOverlayMouseDown(e: MouseEvent) {
		if (e.button !== 0 || passthrough) return;
		const target = e.target as HTMLElement;
		if (target.closest('.dp-placement')) return;

		e.preventDefault();
		e.stopPropagation();

		const currentScrollY = window.scrollY;
		const startX = e.clientX;
		const startY = e.clientY;

		if (activeComponent) {
			interactionType = 'place';
			onInteractionChange?.(true);
			let isDrag = false;
			let endX = startX;
			let endY = startY;

			const onMove = (ev: MouseEvent) => {
				endX = ev.clientX;
				endY = ev.clientY;
				if (Math.abs(endX - startX) > 5 || Math.abs(endY - startY) > 5) isDrag = true;
				if (isDrag) {
					const x = Math.min(startX, endX);
					const y = Math.min(startY, endY);
					drawBox = { x, y, w: Math.abs(endX - startX), h: Math.abs(endY - startY) };
					sizeIndicator = { x: ev.clientX + 12, y: ev.clientY + 12, text: `${Math.round(drawBox.w)} × ${Math.round(drawBox.h)}` };
				}
			};

			const onUp = () => {
				window.removeEventListener('mousemove', onMove);
				window.removeEventListener('mouseup', onUp);
				drawBox = null;
				sizeIndicator = null;
				interactionType = null;
				onInteractionChange?.(false);

				const def = DEFAULT_SIZES[activeComponent!];
				let x: number, y: number, w: number, h: number;
				if (isDrag) {
					x = Math.min(startX, endX); y = Math.min(startY, endY) + currentScrollY;
					w = Math.max(MIN_SIZE, Math.abs(endX - startX));
					h = Math.max(MIN_SIZE, Math.abs(endY - startY));
				} else {
					w = def.width; h = def.height;
					x = startX - w / 2; y = startY + currentScrollY - h / 2;
				}

				const placement: DesignPlacement = {
					id: generateId(), type: activeComponent!,
					x: Math.max(0, x), y: Math.max(0, y), width: w, height: h,
					scrollY: currentScrollY, timestamp: Date.now()
				};
				updatePlacements([...placements, placement]);
				selectedIds = new Set([placement.id]);
				onActiveComponentChange?.(null);
			};

			window.addEventListener('mousemove', onMove);
			window.addEventListener('mouseup', onUp);
		} else {
			if (!e.shiftKey) selectedIds = new Set();

			interactionType = 'select';
			let isDrag = false;

			const onMove = (ev: MouseEvent) => {
				const dx = Math.abs(ev.clientX - startX);
				const dy = Math.abs(ev.clientY - startY);
				if (dx > 4 || dy > 4) isDrag = true;
				if (isDrag) {
					const x = Math.min(startX, ev.clientX);
					const y = Math.min(startY, ev.clientY);
					selectBox = { x, y, w: Math.abs(ev.clientX - startX), h: Math.abs(ev.clientY - startY) };
				}
			};

			const onUp = (ev: MouseEvent) => {
				window.removeEventListener('mousemove', onMove);
				window.removeEventListener('mouseup', onUp);
				interactionType = null;

				if (isDrag) {
					const boxX = Math.min(startX, ev.clientX);
					const boxY = Math.min(startY, ev.clientY) + currentScrollY;
					const boxW = Math.abs(ev.clientX - startX);
					const boxH = Math.abs(ev.clientY - startY);
					const newSelected = new Set(e.shiftKey ? selectedIds : new Set<string>());
					for (const p of placements) {
						if (p.x + p.width > boxX && p.x < boxX + boxW && p.y + p.height > boxY && p.y < boxY + boxH) {
							newSelected.add(p.id);
						}
					}
					selectedIds = newSelected;
				}
				selectBox = null;
			};

			window.addEventListener('mousemove', onMove);
			window.addEventListener('mouseup', onUp);
		}
	}

	// ── Placement Interaction ──

	function handlePlacementMouseDown(e: MouseEvent, id: string) {
		if (e.button !== 0) return;
		const target = e.target as HTMLElement;
		if (target.closest('.dp-handle') || target.closest('.dp-delete')) return;

		e.preventDefault();
		e.stopPropagation();

		let newSelected: Set<string>;
		if (e.shiftKey) {
			newSelected = new Set(selectedIds);
			if (newSelected.has(id)) newSelected.delete(id); else newSelected.add(id);
		} else if (!selectedIds.has(id)) {
			newSelected = new Set([id]);
		} else {
			newSelected = new Set(selectedIds);
		}

		const changed = newSelected.size !== selectedIds.size || [...newSelected].some((x) => !selectedIds.has(x));
		selectedIds = newSelected;
		if (changed) onSelectionChange?.(newSelected, e.shiftKey);

		const startX = e.clientX;
		const startY = e.clientY;
		const startPositions = new Map<string, { x: number; y: number }>();
		for (const p of placements) {
			if (newSelected.has(p.id)) startPositions.set(p.id, { x: p.x, y: p.y });
		}

		interactionType = 'move';
		onInteractionChange?.(true);
		let moved = false;
		let duplicated = false;
		let basePlacements = placements;
		let lastSnappedDx = 0, lastSnappedDy = 0;

		const selSizes = new Map<string, { w: number; h: number }>();
		for (const p of placements) {
			if (startPositions.has(p.id)) selSizes.set(p.id, { w: p.width, h: p.height });
		}

		const onMove = (ev: MouseEvent) => {
			const dx = ev.clientX - startX;
			const dy = ev.clientY - startY;
			if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;
			if (!moved) return;

			if (ev.altKey && !duplicated) {
				duplicated = true;
				const clones: DesignPlacement[] = [];
				for (const p of placements) {
					if (startPositions.has(p.id)) {
						clones.push({ ...p, id: generateId(), timestamp: Date.now() });
					}
				}
				basePlacements = [...placements, ...clones];
			}

			let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
			for (const [sId, start] of startPositions) {
				const sz = selSizes.get(sId);
				if (!sz) continue;
				minX = Math.min(minX, start.x + dx); minY = Math.min(minY, start.y + dy);
				maxX = Math.max(maxX, start.x + dx + sz.w); maxY = Math.max(maxY, start.y + dy + sz.h);
			}
			const selRect = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
			const { dx: snapDx, dy: snapDy, guides: newGuides } = computeSnap(
				selRect, basePlacements, new Set(startPositions.keys()), undefined, extraSnapRects
			);
			guides = newGuides;
			const snappedDx = dx + snapDx;
			const snappedDy = dy + snapDy;
			lastSnappedDx = snappedDx; lastSnappedDy = snappedDy;

			updatePlacements(
				basePlacements.map((p) => {
					const start = startPositions.get(p.id);
					if (!start) return p;
					return { ...p, x: Math.max(0, start.x + snappedDx), y: Math.max(0, start.y + snappedDy) };
				})
			);
			onDragMove?.(snappedDx, snappedDy);
		};

		const onUp = () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
			interactionType = null;
			onInteractionChange?.(false);
			guides = [];
			onDragEnd?.(lastSnappedDx, lastSnappedDy, moved);
		};

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
	}

	// ── Resize ──

	function handleResizeMouseDown(e: MouseEvent, id: string, dir: HandleDir) {
		e.preventDefault();
		e.stopPropagation();

		const comp = placements.find((p) => p.id === id);
		if (!comp) return;

		selectedIds = new Set([id]);
		interactionType = 'resize';
		onInteractionChange?.(true);

		const startX = e.clientX, startY = e.clientY;
		const startW = comp.width, startH = comp.height;
		const startLeft = comp.x, startTop = comp.y;
		const activeEdges = {
			left: dir.includes('w'), right: dir.includes('e'),
			top: dir.includes('n'), bottom: dir.includes('s')
		};

		const onMove = (ev: MouseEvent) => {
			const dx = ev.clientX - startX, dy = ev.clientY - startY;
			let nw = startW, nh = startH, nx = startLeft, ny = startTop;

			if (dir.includes('e')) nw = Math.max(MIN_SIZE, startW + dx);
			if (dir.includes('w')) { nw = Math.max(MIN_SIZE, startW - dx); nx = startLeft + startW - nw; }
			if (dir.includes('s')) nh = Math.max(MIN_SIZE, startH + dy);
			if (dir.includes('n')) { nh = Math.max(MIN_SIZE, startH - dy); ny = startTop + startH - nh; }

			const rect = { x: nx, y: ny, width: nw, height: nh };
			const { dx: snapDx, dy: snapDy, guides: newGuides } = computeSnap(
				rect, placements, new Set([id]), activeEdges, extraSnapRects
			);
			guides = newGuides;

			if (snapDx !== 0) {
				if (activeEdges.right) nw += snapDx;
				else if (activeEdges.left) { nx += snapDx; nw -= snapDx; }
			}
			if (snapDy !== 0) {
				if (activeEdges.bottom) nh += snapDy;
				else if (activeEdges.top) { ny += snapDy; nh -= snapDy; }
			}

			updatePlacements(
				placements.map((p) => p.id === id ? { ...p, x: nx, y: ny, width: nw, height: nh } : p)
			);
			sizeIndicator = { x: ev.clientX + 12, y: ev.clientY + 12, text: `${Math.round(nw)} × ${Math.round(nh)}` };
		};

		const onUp = () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
			sizeIndicator = null;
			interactionType = null;
			onInteractionChange?.(false);
			guides = [];
		};

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
	}

	// ── Delete ──

	function handleDelete(id: string) {
		interactionType = null;
		const nextExiting = new Set(exitingIds); nextExiting.add(id);
		exitingIds = nextExiting;
		const nextSelected = new Set(selectedIds); nextSelected.delete(id);
		selectedIds = nextSelected;

		setTimeout(() => {
			updatePlacements(placements.filter((p) => p.id !== id));
			const postExit = new Set(exitingIds);
			postExit.delete(id);
			exitingIds = postExit;
		}, 180);
	}

	// ── Text Editing ──

	function handleDoubleClick(id: string) {
		const p = placements.find((pl) => pl.id === id);
		if (!p) return;
		editHadText = !!p.text;
		editingId = id;
		editText = p.text || '';
		editExiting = false;
	}

	function dismissEdit() {
		if (!editingId) return;
		editExiting = true;
		setTimeout(() => { editingId = null; editExiting = false; }, 150);
	}

	function submitEdit() {
		if (!editingId) return;
		updatePlacements(
			placements.map((p) => p.id === editingId ? { ...p, text: editText.trim() || undefined } : p)
		);
		dismissEdit();
	}

	function getAnnotationText(id: string, text?: string): string {
		if (text) { lastAnnotationTextMap.set(id, text); return text; }
		return lastAnnotationTextMap.get(id) || '';
	}

	// ── Derived ──

	const cornerHandles: HandleDir[] = ['nw', 'ne', 'se', 'sw'];
	const arrowColor = $derived(wireframe ? '#f97316' : '#3c82f7');
	const editingPlacement = $derived(placements.find((p) => p.id === editingId));

	const popupStyle = $derived.by(() => {
		if (!editingPlacement || typeof window === 'undefined') return '';
		const ep = editingPlacement;
		const ey = ep.y - scrollY;
		const centerX = ep.x + ep.width / 2;
		const aboveY = ey - 8;
		const belowY = ey + ep.height + 8;
		const fitsAbove = aboveY > 200;
		const fitsBelow = belowY < window.innerHeight - 100;
		const popupLeft = Math.max(160, Math.min(window.innerWidth - 160, centerX));
		if (fitsAbove) return `left: ${popupLeft}px; bottom: ${window.innerHeight - aboveY}px;`;
		if (fitsBelow) return `left: ${popupLeft}px; top: ${belowY}px;`;
		return `left: ${popupLeft}px; top: ${Math.max(80, window.innerHeight / 2 - 80)}px;`;
	});
</script>

<svelte:window onkeydown={handleKeyDown} />

<div
	bind:this={overlayRef}
	class="dp-overlay {extraClassName}"
	class:dp-light={!isDarkMode}
	class:dp-placing={!!activeComponent}
	class:dp-passthrough={passthrough}
	class:dp-exiting={exiting}
	class:dp-wireframe={wireframe}
	data-feedback-toolbar
	onmousedown={handleOverlayMouseDown}
	role="presentation"
>
	{#each placements as p (p.id)}
		{@const isSelected = selectedIds.has(p.id)}
		{@const label = COMPONENT_MAP[p.type]?.label || p.type}
		{@const screenY = p.y - scrollY}

		<div
			data-design-placement={p.id}
			class="dp-placement"
			class:dp-selected={isSelected}
			class:dp-exiting-item={exitingIds.has(p.id)}
			style="left: {p.x}px; top: {screenY}px; width: {p.width}px; height: {p.height}px; position: fixed;"
			onmousedown={(e) => handlePlacementMouseDown(e, p.id)}
			ondblclick={() => handleDoubleClick(p.id)}
			role="button"
			tabindex="0"
		>
			<span class="dp-label">{label}</span>
			<span class="dp-annotation" class:dp-annotation-visible={!!p.text}>
				{getAnnotationText(p.id, p.text)}
			</span>
			<div class="dp-content" style="pointer-events: none;">
				{@html renderSkeleton(p.type, p.width, p.height, p.text)}
			</div>

			<!-- Delete -->
			<div class="dp-delete" onmousedown={(e) => e.stopPropagation()} onclick={() => handleDelete(p.id)} role="button" tabindex="0">✕</div>

			<!-- Corner handles -->
			{#each cornerHandles as dir}
				<div class="dp-handle dp-handle-{dir}" onmousedown={(e) => handleResizeMouseDown(e, p.id, dir)} role="slider" tabindex="0"></div>
			{/each}

			<!-- Edge handles -->
			<div class="dp-edge dp-edge-n" onmousedown={(e) => handleResizeMouseDown(e, p.id, 'n')} role="slider" tabindex="0">
				<svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M4 0.5L1 4.5h6z" fill={arrowColor}/></svg>
			</div>
			<div class="dp-edge dp-edge-e" onmousedown={(e) => handleResizeMouseDown(e, p.id, 'e')} role="slider" tabindex="0">
				<svg width="6" height="8" viewBox="0 0 6 8" fill="none"><path d="M5.5 4L1.5 1v6z" fill={arrowColor}/></svg>
			</div>
			<div class="dp-edge dp-edge-s" onmousedown={(e) => handleResizeMouseDown(e, p.id, 's')} role="slider" tabindex="0">
				<svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M4 5.5L1 1.5h6z" fill={arrowColor}/></svg>
			</div>
			<div class="dp-edge dp-edge-w" onmousedown={(e) => handleResizeMouseDown(e, p.id, 'w')} role="slider" tabindex="0">
				<svg width="6" height="8" viewBox="0 0 6 8" fill="none"><path d="M0.5 4L4.5 1v6z" fill={arrowColor}/></svg>
			</div>
		</div>
	{/each}
</div>

<!-- Text Editing Popup -->
{#if editingId && editingPlacement}
	<div class="dp-popup" style={popupStyle} class:dp-popup-exiting={editExiting} data-feedback-toolbar>
		<div class="dp-popup-header">
			<span class="dp-popup-type">{COMPONENT_MAP[editingPlacement.type]?.label || editingPlacement.type}</span>
		</div>
		<input
			class="dp-popup-input"
			type="text"
			bind:value={editText}
			placeholder={TEXT_PLACEHOLDERS[editingPlacement.type] || 'Label or content text'}
			onkeydown={(e) => { if (e.key === 'Enter') submitEdit(); if (e.key === 'Escape') dismissEdit(); }}
		/>
		<div class="dp-popup-actions">
			{#if editHadText}
				<button class="dp-popup-btn dp-popup-btn-delete" onclick={() => { editText = ''; submitEdit(); }}>Delete</button>
			{/if}
			<button class="dp-popup-btn dp-popup-btn-cancel" onclick={dismissEdit}>Cancel</button>
			<button class="dp-popup-btn dp-popup-btn-submit" onclick={submitEdit}>{editHadText ? 'Save' : 'Set'}</button>
		</div>
	</div>
{/if}

<!-- Draw box -->
{#if drawBox}
	<div class="dp-drawbox" style="left: {drawBox.x}px; top: {drawBox.y}px; width: {drawBox.w}px; height: {drawBox.h}px;" data-feedback-toolbar></div>
{/if}

<!-- Select box -->
{#if selectBox}
	<div class="dp-selectbox" style="left: {selectBox.x}px; top: {selectBox.y}px; width: {selectBox.w}px; height: {selectBox.h}px;" data-feedback-toolbar></div>
{/if}

<!-- Size indicator -->
{#if sizeIndicator}
	<div class="dp-size" style="left: {sizeIndicator.x}px; top: {sizeIndicator.y}px;" data-feedback-toolbar>{sizeIndicator.text}</div>
{/if}

<!-- Snap guides -->
{#each guides as g, i (`${g.axis}-${g.pos}-${i}`)}
	<div
		class="dp-guide"
		style={g.axis === 'x'
			? `position: fixed; left: ${g.pos}px; top: 0; width: 1px; bottom: 0;`
			: `position: fixed; left: 0; top: ${g.pos - scrollY}px; right: 0; height: 1px;`}
		data-feedback-toolbar
	></div>
{/each}

<style>
	.dp-overlay {
		position: fixed; inset: 0; pointer-events: auto; z-index: 9999;
	}
	.dp-overlay.dp-placing { cursor: crosshair; }
	.dp-overlay.dp-passthrough { pointer-events: none; }
	.dp-overlay.dp-passthrough .dp-placement { pointer-events: auto; }
	.dp-overlay.dp-exiting { opacity: 0; transition: opacity 0.18s ease; }

	.dp-placement {
		box-sizing: border-box; user-select: none; cursor: move;
	}
	.dp-placement.dp-selected {
		outline: 2px solid #3b82f6; outline-offset: -1px;
	}
	.dp-placement.dp-exiting-item {
		opacity: 0; transform: scale(0.95); transition: all 0.18s ease;
	}

	.dp-label {
		position: absolute; top: -20px; left: 0; font-size: 11px;
		background: rgba(0,0,0,0.75); color: #fff; padding: 2px 6px;
		border-radius: 3px; pointer-events: none; white-space: nowrap;
	}
	.dp-annotation {
		position: absolute; bottom: -20px; left: 0; font-size: 11px;
		color: #6b7280; display: none; white-space: nowrap;
	}
	.dp-annotation.dp-annotation-visible { display: block; }

	.dp-content { position: absolute; inset: 0; overflow: hidden; }

	.dp-delete {
		position: absolute; top: -8px; right: -8px; width: 18px; height: 18px;
		background: #ef4444; color: #fff; border-radius: 50%;
		display: flex; align-items: center; justify-content: center;
		font-size: 10px; cursor: pointer; z-index: 1;
	}

	.dp-handle {
		position: absolute; width: 8px; height: 8px; background: #3b82f6; border-radius: 1px; z-index: 1;
	}
	.dp-handle-nw { top: -4px; left: -4px; cursor: nwse-resize; }
	.dp-handle-ne { top: -4px; right: -4px; cursor: nesw-resize; }
	.dp-handle-se { bottom: -4px; right: -4px; cursor: nwse-resize; }
	.dp-handle-sw { bottom: -4px; left: -4px; cursor: nesw-resize; }

	.dp-edge { position: absolute; display: flex; align-items: center; justify-content: center; z-index: 1; }
	.dp-edge-n { top: -4px; left: 0; right: 0; height: 8px; cursor: ns-resize; }
	.dp-edge-e { top: 0; right: -4px; bottom: 0; width: 8px; cursor: ew-resize; }
	.dp-edge-s { bottom: -4px; left: 0; right: 0; height: 8px; cursor: ns-resize; }
	.dp-edge-w { top: 0; left: -4px; bottom: 0; width: 8px; cursor: ew-resize; }

	.dp-drawbox, .dp-selectbox {
		position: fixed; border: 1px dashed #3b82f6;
		background: rgba(59,130,246,0.1); pointer-events: none;
	}
	.dp-size {
		position: fixed; background: #1f2937; color: #fff;
		padding: 2px 6px; border-radius: 4px; font-size: 11px;
		pointer-events: none; z-index: 10000;
	}
	.dp-guide { background: #ef4444; z-index: 9999; pointer-events: none; }

	/* Popup */
	.dp-popup {
		position: fixed; transform: translateX(-50%); z-index: 10001;
		background: #1f2937; border: 1px solid #374151; border-radius: 8px;
		padding: 8px; min-width: 240px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
		transition: opacity 0.15s ease, transform 0.15s ease;
	}
	.dp-popup.dp-popup-exiting { opacity: 0; transform: translateX(-50%) scale(0.96); }
	.dp-popup-header { margin-bottom: 6px; }
	.dp-popup-type { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
	.dp-popup-input {
		width: 100%; background: #111827; border: 1px solid #374151; border-radius: 4px;
		padding: 6px 8px; color: #e5e7eb; font-size: 13px; outline: none; margin-bottom: 6px;
	}
	.dp-popup-input:focus { border-color: #3b82f6; }
	.dp-popup-actions { display: flex; gap: 6px; justify-content: flex-end; }
	.dp-popup-btn {
		padding: 4px 10px; border-radius: 4px; border: none; font-size: 12px; cursor: pointer;
	}
	.dp-popup-btn-cancel { background: transparent; color: #9ca3af; }
	.dp-popup-btn-cancel:hover { color: #e5e7eb; }
	.dp-popup-btn-submit { background: #3b82f6; color: #fff; }
	.dp-popup-btn-submit:hover { background: #2563eb; }
	.dp-popup-btn-delete { background: transparent; color: #ef4444; margin-right: auto; }
	.dp-popup-btn-delete:hover { background: rgba(239,68,68,0.1); }

	/* Wireframe theme */
	.dp-overlay.dp-wireframe .dp-handle { background: #f97316; }
	.dp-overlay.dp-wireframe .dp-drawbox,
	.dp-overlay.dp-wireframe .dp-selectbox { border-color: #f97316; background: rgba(249,115,22,0.1); }
	.dp-overlay.dp-wireframe .dp-size { background: #f97316; }

	/* Light mode */
	.dp-overlay.dp-light .dp-label { background: rgba(255,255,255,0.9); color: #17181c; }
	.dp-overlay.dp-light .dp-popup { background: #fff; border-color: #e2e8f0; }
	.dp-overlay.dp-light .dp-popup-input { background: #f8fafc; border-color: #e2e8f0; color: #17181c; }
</style>
