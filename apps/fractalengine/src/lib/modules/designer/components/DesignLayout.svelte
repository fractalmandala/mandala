<script lang="ts">
	import WorkspaceShell from '$lib/components/shell/WorkspaceShell.svelte';
	import { findTemplate } from '$lib/modules/designer/data/designtemplates';
	import { CanvasViewport } from "$lib/modules/designer/engine/CanvasViewport.svelte";
	import { DragEngine } from "$lib/modules/designer/engine/DragEngine.svelte";
	import { ResizeEngine } from "$lib/modules/designer/engine/ResizeEngine.svelte";
	import { RotateEngine } from "$lib/modules/designer/engine/RotateEngine.svelte";
	import { SelectionEngine } from "$lib/modules/designer/engine/SelectionEngine.svelte";
	import DesignBlock from "$lib/modules/designer/components/DesignBlock.svelte";
	import Layers from "$lib/modules/designer/components/Layers.svelte";
	import ComponentLibrary from "$lib/modules/designer/components/ComponentLibrary.svelte";
	import DesignInspector from "$lib/modules/designer/components/DesignInspector.svelte";
	import ExportPanel from "$lib/modules/designer/components/ExportPanel.svelte";
	import type { DesignBlock as Block } from "$lib/modules/designer/engine/designtypes";
	import { designcanvas } from "$lib/modules/designer/state/designcanvas.svelte";
	import { gridPatterns, patternToStyle } from "$lib/modules/designer/engine/patterns";
	import { activePatternId } from "$lib/globalstores.svelte";
	import { slide } from "svelte/transition";
	import { quadIn, quadOut } from "svelte/easing";
	import AIChat from "$lib/components/AIChat.svelte";
	import { onDestroy, onMount, untrack } from "svelte";


	let viewportEl = $state<HTMLDivElement | null>(null);
	let rulerH = $state<HTMLCanvasElement | null>(null);
	let rulerV = $state<HTMLCanvasElement | null>(null);


	// ── Engine instances ────────────────────────────────────────────────────
	const vp = new CanvasViewport({ containerQuery: ".design-viewport" });
	vp.state = { ...designcanvas.viewport };
	let viewportCommitTimer: ReturnType<typeof setTimeout> | null = null;
	const drag = new DragEngine({ gridSize: 24, snapping: designcanvas.snapToObjects, snapToGrid: designcanvas.snapToGrid });
	const resize = new ResizeEngine({ minSize: 20 });
	const rotate = new RotateEngine({ snapAngle: 15 });
	const sel = new SelectionEngine();
	drag.viewport = vp;
	resize.viewport = vp;
	$effect(() => { resize.constrainProportions = designcanvas.constrainProportions; });
	rotate.viewport = vp;
	sel.viewport = vp;


	// ── Tool state (dock) ───────────────────────────────────────────────────
	type ToolMode = 'arrow' | 'hand' | 'scale';
	type DrawTool = 'frame' | 'rectangle' | 'ellipse' | 'line' | 'vector' | 'text' | null;
	type ShapeType = 'rectangle' | 'ellipse' | 'line';

	let toolMode = $state<ToolMode>('arrow');
	let drawTool = $state<DrawTool>(null);
	let activeShapeType = $state<ShapeType>('rectangle');
	let shapeMenuOpen = $state(false);
	let viewMenuOpen = $state(false);
	let zoomMenuOpen = $state(false);
	let canvasColorPickerOpen = $state(false);
	let canvasColorHue = $state(210);
	let canvasColorSaturation = $state(10);
	let canvasColorLightness = $state(18);
	let scaleGesture = $state<{ x: number; y: number; diagonal: number } | null>(null);

	let isDrawing = $state(false);
	let drawStartPos = $state<{ x: number; y: number } | null>(null);
	let drawCurrentPos = $state<{ x: number; y: number } | null>(null);

	function activateDrawTool(tool: DrawTool) {
		drawTool = tool;
		toolMode = 'arrow';
		setSelectedIds([]);
		shapeMenuOpen = false;
	}

	function canvasBackgroundValue() {
		return `hsl(${canvasColorHue} ${canvasColorSaturation}% ${canvasColorLightness}%)`;
	}

	function updateCanvasSpectrum(event: PointerEvent) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		canvasColorSaturation = Math.round(Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)));
		canvasColorLightness = Math.round(Math.min(100, Math.max(0, (1 - (event.clientY - rect.top) / rect.height) * 100)));
		designcanvas.setCanvasBackground(canvasBackgroundValue());
	}

	function startScaleGesture(event: PointerEvent) {
		const selected = blocks.filter((block) => selectedIds.includes(block.id));
		if (selected.length === 0) return;
		const minX = Math.min(...selected.map((block) => block.x));
		const minY = Math.min(...selected.map((block) => block.y));
		const maxX = Math.max(...selected.map((block) => block.x + block.w));
		const maxY = Math.max(...selected.map((block) => block.y + block.h));
		scaleGesture = { x: event.clientX, y: event.clientY, diagonal: Math.max(1, Math.hypot(maxX - minX, maxY - minY) * vp.zoom) };
		designcanvas.recordGestureStart();
		const pointerId = event.pointerId;
		const move = (next: PointerEvent) => {
			if (next.pointerId !== pointerId || !scaleGesture) return;
			const delta = Math.hypot(next.clientX - scaleGesture.x, next.clientY - scaleGesture.y);
			const direction = next.clientX - scaleGesture.x + next.clientY - scaleGesture.y >= 0 ? 1 : -1;
			const factor = Math.max(0.05, 1 + (direction * delta) / scaleGesture.diagonal);
			designcanvas.scaleSelected(factor, true);
			scaleGesture = { ...scaleGesture, x: next.clientX, y: next.clientY };
		};
		const end = (next: PointerEvent) => {
			if (next.pointerId !== pointerId) return;
			window.removeEventListener('pointermove', move, true);
			window.removeEventListener('pointerup', end, true);
			window.removeEventListener('pointercancel', end, true);
			scaleGesture = null;
			designcanvas.commitGesture();
		};
		window.addEventListener('pointermove', move, true);
		window.addEventListener('pointerup', end, true);
		window.addEventListener('pointercancel', end, true);
	}

	// ── Scene graph ─────────────────────────────────────────────────────────
	// `designcanvas` owns persistence and the canonical scene. DesignLayout keeps
	// a local editable copy for its current renderer and commits changes back
	// through designcanvas so there is only one storage path.
	const blocks = $derived(designcanvas.items);
	const selectedIds = $derived(designcanvas.selectedIds);
	let multiDragStarts = new Map<string, { x: number; y: number }>();
	let duplicateDragOrigins = new Map<string, { x: number; y: number }>();

	const rootBlocks = $derived(blocks.filter((b) => b.parentId === (designcanvas.deepSelectParentId ?? null) && !b.hidden));

	function sameIds(a: string[], b: string[]): boolean {
		return a.length === b.length && a.every((id, index) => id === b[index]);
	}

	function setSelectedIds(ids: string[]) {
		if (!sameIds(designcanvas.selectedIds, ids)) {
			designcanvas.selectedIds = [...ids];
		}
	}

	function syncViewport() {
		designcanvas.viewport = { x: vp.x, y: vp.y, zoom: vp.zoom };
	}

	function finishViewportGesture() {
		if (viewportCommitTimer) clearTimeout(viewportCommitTimer);
		viewportCommitTimer = null;
		vp.settleAnimation();
		syncViewport();
		designcanvas.commitGesture();
	}

	function handleViewportWheel(event: WheelEvent) {
		if (!viewportCommitTimer) designcanvas.recordGestureStart();
		vp.onWheel(event);
		if (viewportCommitTimer) clearTimeout(viewportCommitTimer);
		viewportCommitTimer = setTimeout(finishViewportGesture, 180);
	}

	function applyViewportAction(action: () => void, settleMs = 0) {
		designcanvas.recordGestureStart();
		action();
		if (settleMs > 0) {
			if (viewportCommitTimer) clearTimeout(viewportCommitTimer);
			viewportCommitTimer = setTimeout(finishViewportGesture, settleMs);
		} else {
			finishViewportGesture();
		}
	}

	// Keep the drag engine's snapping in sync with the View-menu toggles so
	// free drag is pixel-fluid by default (grid off) while object/edge snapping
	// stays on. Previously the engine hard-coded grid snapping, quantizing every
	// drag to 24px — the source of the "steppy" drag.
	$effect(() => {
		drag.isSnapping = designcanvas.snapToObjects;
		drag.snapToGrid = designcanvas.snapToGrid;
	});



	function handleSelect(block: Block, event: PointerEvent): boolean {
		if (toolMode === 'scale') {
			if (!selectedIds.includes(block.id)) setSelectedIds([block.id]);
			startScaleGesture(event);
			return false;
		}
		designcanvas.recordGestureStart();
		if (event.shiftKey) {
			if (selectedIds.includes(block.id)) {
				setSelectedIds(selectedIds.filter((id) => id !== block.id));
				designcanvas.commitGesture();
				return false;
			}
			setSelectedIds([...selectedIds, block.id]);
		} else {
			if (!selectedIds.includes(block.id)) setSelectedIds([block.id]);
		}
		multiDragStarts = new Map(
			blocks
				.filter((candidate) => selectedIds.includes(candidate.id))
				.map((candidate) => [candidate.id, { x: candidate.x, y: candidate.y }])
		);
		if (event.altKey && selectedIds.length > 0) {
			designcanvas.duplicateSelected();
			setSelectedIds([...designcanvas.selectedIds]);
			duplicateDragOrigins = new Map(blocks.filter((candidate) => selectedIds.includes(candidate.id)).map((candidate) => [candidate.id, { x: candidate.x, y: candidate.y }]));
		}
		const draggedBlock = blocks.find((b) => b.id === (event.altKey ? selectedIds[0] : block.id));
		if (draggedBlock) {
			drag.siblings = blocks.filter((b) => b.parentId === draggedBlock.parentId && b.id !== block.id);
		}
		return true;
	}

	/** Reparent a dropped block into the target frame/container, converting its
	 *  position so it stays visually in place. */
	function handleDrop(target: Block, data: unknown) {
		// Re-parenting drag from the Layers panel uses `{ id: 'blockId' }`.
		// Library drag payloads use `{ kind, ... }` and are routed through
		// `handleLibraryDrop` at the canvas-world level; ignore them here.
		const droppedId = (data as { id?: string } | null)?.id;
		if (!droppedId || droppedId === target.id) return;
		const dropped = designcanvas.items.find((b) => b.id === droppedId);
		if (!dropped) return;
		if (designcanvas.isDescendantOf(target.id, droppedId)) return;

		designcanvas.recordGestureStart();
		designcanvas.reparentBlock(droppedId, target.id);
		designcanvas.commitGesture();
	}

	// ── Library drag-drop ──────────────────────────────────────────────────
	// The ComponentLibrary sidebar serializes one of three payloads into
	// `text/plain` on dragstart:
	//
	//   { kind: 'template',        templateId:   string }
	//   { kind: 'user-component',  componentId:  string }
	//   { kind: 'layout-primitive', className:    string, name?: string }
	//
	// This handler lives on `.canvas-world` so it catches every drop inside
	// the canvas, regardless of which DesignBlock the pointer is over. The
	// re-parent `handleDrop` above safely ignores library payloads (no
	// `data.id`), so both handlers can coexist.
	type LibraryPayload =
		| { kind: 'template'; templateId: string }
		| { kind: 'user-component'; componentId: string }
		| { kind: 'layout-primitive'; className: string; name?: string };

	function isLibraryPayload(data: unknown): data is LibraryPayload {
		return (
			!!data &&
			typeof data === 'object' &&
			'kind' in (data as Record<string, unknown>) &&
			typeof (data as { kind: unknown }).kind === 'string' &&
			['template', 'user-component', 'layout-primitive'].includes(
				(data as { kind: string }).kind
			)
		);
	}

	function handleLibraryDrop(event: DragEvent) {
		// Always suppress the browser's default drop behaviour (text-paste,
		// navigation, etc.) on the canvas. We only proceed if the payload
		// is actually a library entry — non-library drops are simply no-ops.
		event.preventDefault();
		event.stopPropagation();
		const raw = event.dataTransfer?.getData('text/plain');
		if (!raw) return;
		let parsed: unknown;
		try {
			parsed = JSON.parse(raw);
		} catch {
			return;
		}
		if (!isLibraryPayload(parsed)) return;
		const target = vp.screenToCanvas(event.clientX, event.clientY);

		if (parsed.kind === 'template') {
			const tpl = findTemplate(parsed.templateId);
			if (tpl) designcanvas.insertTemplate(tpl.blocks, { target });
		} else if (parsed.kind === 'user-component') {
			designcanvas.insertUserComponent(parsed.componentId, { target });
		} else if (parsed.kind === 'layout-primitive') {
			designcanvas.createBlockFromPrimitive({
				className: parsed.className,
				name: parsed.name,
				x: target.x,
				y: target.y
			});
		}
	}

	function allowLibraryDragOver(event: DragEvent) {
		// Without preventDefault the browser won't fire `drop` on this node.
		// We only allow it for library payloads — re-parent drags already
		// reach the per-block `dropZone` handler.
		const types = event.dataTransfer?.types;
		if (types && Array.from(types).includes('text/plain')) {
			event.preventDefault();
		}
	}

	// ── Draw tools: frame / shapes / text ───────────────────────────────────
	function commitDrawBlock() {
		if (!drawStartPos || !drawCurrentPos || !drawTool || drawTool === 'text') return;
		const x = Math.min(drawStartPos.x, drawCurrentPos.x);
		const y = Math.min(drawStartPos.y, drawCurrentPos.y);
		const w = Math.max(20, Math.abs(drawCurrentPos.x - drawStartPos.x));
		const h = Math.max(20, Math.abs(drawCurrentPos.y - drawStartPos.y));

		designcanvas.createBlockAt(drawTool, x, y, {
			w,
			h: drawTool === 'line' ? 4 : h
		});
		drawTool = null;
	}

	function createTextBlock(x: number, y: number) {
		designcanvas.createBlockAt('text', x, y, {
			w: 200,
			h: 30,
			props: { text: 'Text' },
			enterTextEdit: true
		});
		drawTool = null;
	}

	function centerView() {
		applyViewportAction(
			() => vp.zoomToFit(rootBlocks.map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h }))),
			450,
		);
	}

	function getSelectionCenterPoint(): { x: number; y: number } | undefined {
		const selected = blocks.filter((b) => selectedIds.includes(b.id));
		if (selected.length === 0) return undefined;
		const minX = Math.min(...selected.map((b) => b.x));
		const minY = Math.min(...selected.map((b) => b.y));
		const maxX = Math.max(...selected.map((b) => b.x + b.w));
		const maxY = Math.max(...selected.map((b) => b.y + b.h));
		return { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 };
	}

	onMount(() => {
		const handleCenterCommand = () => centerView();
		const handleToolCommand = (event: Event) => {
			const tool = (event as CustomEvent<'move' | 'scale'>).detail;
			if (tool === 'move') { toolMode = 'arrow'; drawTool = null; }
			if (tool === 'scale') { toolMode = 'scale'; drawTool = null; }
		};
		const handleZoomCommand = (event: Event) => {
			const action = (event as CustomEvent<string>).detail;
			if (action === '100') applyViewportAction(() => vp.resetZoom(), 300);
			else if (action === 'fit') centerView();
			else if (action === 'selection') applyViewportAction(() => designcanvas.zoomToSelection(), 450);
			else if (action === 'in') applyViewportAction(() => vp.zoomAroundCanvasPoint(vp.zoom * 1.2, getSelectionCenterPoint()), 300);
			else if (action === 'out') applyViewportAction(() => vp.zoomAroundCanvasPoint(vp.zoom / 1.2, getSelectionCenterPoint()), 300);
		};
		const handleBeforeHistory = () => {
			if (viewportCommitTimer) finishViewportGesture();
		};
		window.addEventListener('fractaldesign:center-view', handleCenterCommand);
		window.addEventListener('fractaldesign:tool', handleToolCommand);
		window.addEventListener('fractaldesign:zoom', handleZoomCommand);
		window.addEventListener('fractalengine:before-undo', handleBeforeHistory);
		window.addEventListener('fractalengine:before-redo', handleBeforeHistory);
		window.addEventListener('fractalengine:before-persist', handleBeforeHistory);
		return () => {
			window.removeEventListener('fractaldesign:center-view', handleCenterCommand);
			window.removeEventListener('fractaldesign:tool', handleToolCommand);
			window.removeEventListener('fractaldesign:zoom', handleZoomCommand);
			window.removeEventListener('fractalengine:before-undo', handleBeforeHistory);
			window.removeEventListener('fractalengine:before-redo', handleBeforeHistory);
			window.removeEventListener('fractalengine:before-persist', handleBeforeHistory);
		};
	});

	// ── Panel resize state ──────────────────────────────────────────────────
	type Resizing = "sidebar" | "rightbar" | "aichat" | null;
	let resizing = $state<Resizing>(null);

	const SIDEBAR = { min: 160, max: 400 };
	const AICHATBAR = { min: 200, max: 700 };


	// ── Viewport pointer events ─────────────────────────────────────────────
	function viewportPointerDown(e: PointerEvent) {
		if (drawTool && e.button === 0) {
			const point = vp.screenToCanvas(e.clientX, e.clientY);
			if (drawTool === 'text') {
				createTextBlock(point.x, point.y);
				return;
			}
			isDrawing = true;
			drawStartPos = point;
			drawCurrentPos = point;
			return;
		}
		if (toolMode === 'hand' || e.button === 1) {
			designcanvas.recordGestureStart();
			vp.panStart(e.clientX, e.clientY);
			return;
		}
		// Start marquee on empty canvas area (Shift-held = additive)
		if (designcanvas.deepSelectParentId) designcanvas.exitDeepSelect();
		sel.onCanvasPointerDown(e, e.shiftKey);
		setSelectedIds([]);
	}

	function viewportDoubleClick() {
		const selected = designcanvas.selectedIds[0];
		if (selected) {
			designcanvas.enterDeepSelect(selected);
			setSelectedIds([...designcanvas.selectedIds]);
		}
	}

	function viewportPointerMove(e: PointerEvent) {
		if (isDrawing) {
			drawCurrentPos = vp.screenToCanvas(e.clientX, e.clientY);
			return;
		}
		if (vp.isPanning) {
			vp.panMove(e.clientX, e.clientY);
			return;
		}
		if (sel.hasMarquee) {
			sel.onPointerMove(e, blocks);
			setSelectedIds(sel.selectedIds);
		}
		if (drag.active) {
			drag.onPointerMove(e);
			if (drag.id) {
				const hoveredTarget = designcanvas.findTargetParentAt(e.clientX, e.clientY, drag.id);
				designcanvas.dropTargetId = hoveredTarget ? hoveredTarget.id : null;
			}
			const moved = blocks.find((block) => block.id === drag.id);
			if (moved) {
				const siblings = blocks.filter((block) => block.parentId === moved.parentId && block.id !== moved.id && !selectedIds.includes(block.id));
				let nearest: { axis: 'x' | 'y'; value: number; x: number; y: number } | null = null;
				for (const sibling of siblings) {
					const horizontal = sibling.x <= moved.x ? moved.x - (sibling.x + sibling.w) : sibling.x - (moved.x + moved.w);
					const vertical = sibling.y <= moved.y ? moved.y - (sibling.y + sibling.h) : sibling.y - (moved.y + moved.h);
					for (const candidate of [
						{ axis: 'x' as const, value: horizontal, x: Math.min(moved.x, sibling.x + sibling.w) + Math.abs(horizontal) / 2, y: Math.max(moved.y, sibling.y) },
						{ axis: 'y' as const, value: vertical, x: Math.max(moved.x, sibling.x), y: Math.min(moved.y, sibling.y + sibling.h) + Math.abs(vertical) / 2 }
					]) {
						if (candidate.value >= 0 && candidate.value <= 150 && (!nearest || candidate.value < nearest.value)) nearest = candidate;
					}
				}
				const nextGuides = nearest ? { spacing: nearest } : null;
				if (JSON.stringify(designcanvas.activeGuides) !== JSON.stringify(nextGuides)) {
					designcanvas.activeGuides = nextGuides;
				}
			}
			for (const [id, start] of multiDragStarts) {
				if (id === drag.id) continue;
				const block = blocks.find((candidate) => candidate.id === id);
				if (block) {
					block.x = Math.round(start.x + drag.deltaX);
					block.y = Math.round(start.y + drag.deltaY);
				}
			}
		}
		if (resize.active) resize.onPointerMove(e);
		if (rotate.active) rotate.onPointerMove(e);
	}

	function viewportPointerUp(e: PointerEvent) {
		if (isDrawing) {
			commitDrawBlock();
			isDrawing = false;
			drawStartPos = null;
			drawCurrentPos = null;
			return;
		}
		if (vp.isPanning) {
			vp.panEnd();
			finishViewportGesture();
			return;
		}
		sel.onPointerUp(e);
		const draggedId = drag.id;
		if (draggedId && duplicateDragOrigins.has(draggedId)) {
			const start = duplicateDragOrigins.get(draggedId)!;
			const moved = blocks.find((block) => block.id === draggedId);
			if (moved) designcanvas.lastDuplicateOffset = { x: Math.round(moved.x - start.x), y: Math.round(moved.y - start.y) };
		}
		if (draggedId) {
			const targetParent = designcanvas.findTargetParentAt(e.clientX, e.clientY, draggedId);
			const targetParentId = targetParent ? targetParent.id : null;
			const draggedBlock = designcanvas.items.find((b) => b.id === draggedId);
			if (draggedBlock && draggedBlock.parentId !== targetParentId) {
				if (!targetParentId || !designcanvas.isDescendantOf(targetParentId, draggedId)) {
					designcanvas.reparentBlock(draggedId, targetParentId);
					for (const sbId of selectedIds) {
						if (sbId !== draggedId && !designcanvas.isDescendantOf(targetParentId ?? '', sbId)) {
							designcanvas.reparentBlock(sbId, targetParentId);
						}
					}
				}
			}
		}
		drag.onPointerUp(e);
		multiDragStarts.clear();
		duplicateDragOrigins.clear();
		resize.onPointerUp(e);
		rotate.onPointerUp(e);
		designcanvas.dropTargetId = null;
		designcanvas.activeGuides = null;
		designcanvas.commitGesture();
	}

	// ── Tab state ───────────────────────────────────────────────────────────
	let activeTab = $state<"layers" | "components">("layers");
	function selectTab(tab: "layers" | "components") {
		activeTab = tab;
	}

	let activeTabR = $state<"style" | "export" | "aichat">("style");
	function selectTabR(tab: "style" | "export" | "aichat") {
		activeTabR = tab;
	}

	function isEditableTarget(target: EventTarget | null): boolean {
		if (!(target instanceof HTMLElement)) return false;
		return !!target.closest('input, textarea, select, [contenteditable="true"]');
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (isEditableTarget(event.target)) return;
		const mod = event.metaKey || event.ctrlKey;
		const key = event.key.toLowerCase();

		if (mod && key === 'c' && selectedIds.length > 0) {
			event.preventDefault();
			if (event.altKey) {
				const block = designcanvas.items.find((b) => b.id === selectedIds[0]);
				if (block) designcanvas.copyStyle(block.id);
			} else {
				designcanvas.copySelected();
			}
			return;
		}
		if (mod && key === 'x' && selectedIds.length > 0) {
			event.preventDefault();
			designcanvas.cutSelected();
			return;
		}
		if (mod && key === 'v') {
			event.preventDefault();
			if (event.shiftKey) {
				designcanvas.pasteInPlace();
			} else if (event.altKey && selectedIds.length > 0 && designcanvas.styleClipboard) {
				designcanvas.pasteStyle(selectedIds[0]);
			} else {
				designcanvas.pasteBlock(null);
			}
			return;
		}
		if (mod && key === 'a') { event.preventDefault(); designcanvas.selectAll(); return; }
		if (mod && key === '0') { event.preventDefault(); applyViewportAction(() => vp.resetZoom(), 300); return; }
		if (mod && key === '1') { event.preventDefault(); applyViewportAction(() => vp.zoomToFit(rootBlocks.map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h }))), 300); return; }
		if (mod && key === '2') { event.preventDefault(); applyViewportAction(() => designcanvas.zoomToSelection(), 450); return; }
		if (mod && (key === '=' || key === '+')) { event.preventDefault(); applyViewportAction(() => vp.zoomIn(), 300); return; }
		if (mod && key === '-') { event.preventDefault(); applyViewportAction(() => vp.zoomOut(), 300); return; }
		if (mod && key === 'd' && selectedIds.length > 0) {
			event.preventDefault();
			designcanvas.repeatDuplicate();
			return;
		}
		if (!mod && key === 'v') { toolMode = 'arrow'; drawTool = null; return; }
		if (!mod && key === 'h') { toolMode = 'hand'; drawTool = null; return; }
		if (!mod && key === 'k') { toolMode = 'scale'; drawTool = null; return; }
		if (!mod && key === 'r') { activateDrawTool('rectangle'); return; }
		if (!mod && key === 'o') { activateDrawTool('ellipse'); return; }
		if (!mod && key === 'l') { activateDrawTool('line'); return; }
		if (!mod && key === 'p') { activateDrawTool('vector'); return; }
		if (!mod && key === 't') { activateDrawTool('text'); return; }
		if (!mod && key === 'f') { activateDrawTool('frame'); return; }
		if (!mod && key === '[' && selectedIds.length > 0) { event.preventDefault(); designcanvas.moveBackward(selectedIds[0]); return; }
		if (!mod && key === ']' && selectedIds.length > 0) { event.preventDefault(); designcanvas.moveForward(selectedIds[0]); return; }
		if (mod && key === 'g' && selectedIds.length > 0) {
			event.preventDefault();
			if (event.shiftKey) designcanvas.ungroupSelected();
			else designcanvas.groupSelected();
			return;
		}
		if (event.key.startsWith('Arrow') && selectedIds.length > 0) {
			event.preventDefault();
			const amount = event.shiftKey ? designcanvas.bigNudgeAmount : designcanvas.nudgeAmount;
			const dx = event.key === 'ArrowLeft' ? -amount : event.key === 'ArrowRight' ? amount : 0;
			const dy = event.key === 'ArrowUp' ? -amount : event.key === 'ArrowDown' ? amount : 0;
			designcanvas.nudgeSelected(dx, dy);
			return;
		}
		if ((event.key === 'Delete' || event.key === 'Backspace') && selectedIds.length > 0) {
			event.preventDefault();
			designcanvas.deleteSelected();
			return;
		}
		if (event.key === 'Escape') {
			if (designcanvas.deepSelectParentId) designcanvas.exitDeepSelect();
			else designcanvas.escapeSelection();
			setSelectedIds([...designcanvas.selectedIds]);
			designcanvas.closeContextMenu();
			drawTool = null;
			isDrawing = false;
			return;
		}
	}

	// ── Zoom display ────────────────────────────────────────────────────────
	let zoomDisplay = $derived(Math.round(vp.zoom * 100) + "%");

	$effect(() => {
		if (!rulerH || !rulerV || !viewportEl) return;

		const drawRulers = () => {
			const rect = viewportEl!.getBoundingClientRect();
			const width = rect.width - 16;
			const height = rect.height - 16;

			const dpr = window.devicePixelRatio || 1;

			// Update canvas logical sizes
			if (rulerH!.width !== width * dpr || rulerH!.height !== 16 * dpr) {
				rulerH!.width = width * dpr;
				rulerH!.height = 16 * dpr;
				rulerH!.style.width = `${width}px`;
				rulerH!.style.height = `16px`;
			}

			if (rulerV!.width !== 16 * dpr || rulerV!.height !== height * dpr) {
				rulerV!.width = 16 * dpr;
				rulerV!.height = height * dpr;
				rulerV!.style.width = `16px`;
				rulerV!.style.height = `${height}px`;
			}

			const ctxH = rulerH!.getContext("2d");
			const ctxV = rulerV!.getContext("2d");

			const styles = getComputedStyle(viewportEl!);
			const border = styles.getPropertyValue("--border-primary").trim();
			const textCol = styles.getPropertyValue("--text-secondary").trim();
			const themeColor = styles.getPropertyValue("--theme-color").trim();
			const guideColor = styles.getPropertyValue("--feedback-error").trim();

			if (ctxH) {
				ctxH.save();
				ctxH.scale(dpr, dpr);
				ctxH.clearRect(0, 0, width, 24);

				const zoom = designcanvas.viewport.zoom;
				const panX = designcanvas.viewport.x;

				// Find best interval
				const targetSpacing = 60;
				const INTERVALS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
				let interval = 100;
				for (const inv of INTERVALS) {
					if (inv * zoom >= targetSpacing) {
						interval = inv;
						break;
					}
				}

				let subdivisions = 10;
				if (interval === 5 || interval === 50 || interval === 500 || interval === 5000) {
					subdivisions = 5;
				} else if (
					interval === 2 ||
					interval === 20 ||
					interval === 200 ||
					interval === 2000
				) {
					subdivisions = 4;
				}

				const subStep = interval / subdivisions;
				const canvasStart = (24 - panX) / zoom;
				const canvasEnd = (rect.width - panX) / zoom;
				const startTick = Math.ceil(canvasStart / subStep) * subStep;

				ctxH.strokeStyle = border;
				ctxH.lineWidth = 1;
				ctxH.fillStyle = textCol;
				ctxH.font = "9px sans-serif";

				for (let val = startTick; val <= canvasEnd; val += subStep) {
					const isMajor =
						Math.abs(val % interval) < subStep / 2 ||
						Math.abs((val % interval) - interval) < subStep / 2;
					const screenX = val * zoom + panX - 24;

					ctxH.beginPath();
					if (isMajor) {
						ctxH.moveTo(screenX, 10);
						ctxH.lineTo(screenX, 24);
						ctxH.stroke();

						ctxH.textAlign = "center";
						ctxH.textBaseline = "middle";
						ctxH.fillText(Math.round(val).toString(), screenX, 6);
					} else {
						ctxH.moveTo(screenX, 17);
						ctxH.lineTo(screenX, 24);
						ctxH.stroke();
					}
				}

				// Draw vertical guide markers on horizontal ruler
				for (const guide of designcanvas.userGuides) {
					if (guide.type === "v") {
						const screenX = guide.value * zoom + panX - 24;
						if (screenX >= 0 && screenX <= width) {
							const isSelected =
								designcanvas.selectedGuideId === guide.id ||
								designcanvas.rulerDrag?.id === guide.id;
							ctxH.fillStyle = isSelected ? themeColor : guideColor;
							ctxH.strokeStyle = isSelected ? themeColor : guideColor;
							ctxH.lineWidth = 1.5;
							ctxH.beginPath();
							ctxH.moveTo(screenX, 12);
							ctxH.lineTo(screenX, 24);
							ctxH.stroke();
							ctxH.font = "bold 9px sans-serif";
							ctxH.textAlign = "center";
							ctxH.textBaseline = "bottom";
							ctxH.fillText(Math.round(guide.value).toString(), screenX, 10);
						}
					}
				}

				ctxH.restore();
			}

			if (ctxV) {
				ctxV.save();
				ctxV.scale(dpr, dpr);
				ctxV.clearRect(0, 0, 24, height);

				const zoom = designcanvas.viewport.zoom;
				const panY = designcanvas.viewport.y;

				// Find best interval
				const targetSpacing = 60;
				const INTERVALS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
				let interval = 100;
				for (const inv of INTERVALS) {
					if (inv * zoom >= targetSpacing) {
						interval = inv;
						break;
					}
				}

				let subdivisions = 10;
				if (interval === 5 || interval === 50 || interval === 500 || interval === 5000) {
					subdivisions = 5;
				} else if (
					interval === 2 ||
					interval === 20 ||
					interval === 200 ||
					interval === 2000
				) {
					subdivisions = 4;
				}

				const subStep = interval / subdivisions;
				const canvasStart = (24 - panY) / zoom;
				const canvasEnd = (rect.height - panY) / zoom;
				const startTick = Math.ceil(canvasStart / subStep) * subStep;

				ctxV.strokeStyle = border;
				ctxV.lineWidth = 1;
				ctxV.fillStyle = textCol;
				ctxV.font = "9px sans-serif";

				for (let val = startTick; val <= canvasEnd; val += subStep) {
					const isMajor =
						Math.abs(val % interval) < subStep / 2 ||
						Math.abs((val % interval) - interval) < subStep / 2;
					const screenY = val * zoom + panY - 24;

					ctxV.beginPath();
					if (isMajor) {
						ctxV.moveTo(10, screenY);
						ctxV.lineTo(24, screenY);
						ctxV.stroke();

						ctxV.save();
						ctxV.translate(6, screenY);
						ctxV.rotate(-Math.PI / 2);
						ctxV.textAlign = "center";
						ctxV.textBaseline = "middle";
						ctxV.fillText(Math.round(val).toString(), 0, 0);
						ctxV.restore();
					} else {
						ctxV.moveTo(17, screenY);
						ctxV.lineTo(24, screenY);
						ctxV.stroke();
					}
				}

				// Draw horizontal guide markers on vertical ruler
				for (const guide of designcanvas.userGuides) {
					if (guide.type === "h") {
						const screenY = guide.value * zoom + panY - 24;
						if (screenY >= 0 && screenY <= height) {
							const isSelected =
								designcanvas.selectedGuideId === guide.id ||
								designcanvas.rulerDrag?.id === guide.id;
							ctxV.fillStyle = isSelected ? themeColor : guideColor;
							ctxV.strokeStyle = isSelected ? themeColor : guideColor;
							ctxV.lineWidth = 1.5;
							ctxV.beginPath();
							ctxV.moveTo(12, screenY);
							ctxV.lineTo(24, screenY);
							ctxV.stroke();
							ctxV.save();
							ctxV.translate(10, screenY);
							ctxV.rotate(-Math.PI / 2);
							ctxV.font = "bold 9px sans-serif";
							ctxV.textAlign = "center";
							ctxV.textBaseline = "bottom";
							ctxV.fillText(Math.round(guide.value).toString(), 0, 0);
							ctxV.restore();
						}
					}
				}

				ctxV.restore();
			}
		};

		// Initial drawing
		drawRulers();

		const resizeObserver = new ResizeObserver(() => {
			drawRulers();
		});
		resizeObserver.observe(viewportEl);

		// Dependencies for reactivity
		const _ = [
			designcanvas.viewport.x,
			designcanvas.viewport.y,
			designcanvas.viewport.zoom,
			designcanvas.userGuides,
			...designcanvas.userGuides.map((g) => g.value),
			designcanvas.selectedGuideId,
			designcanvas.rulerDrag?.id,
		];

		return () => {
			resizeObserver.disconnect();
		};
	});
</script>

<svelte:window onclick={() => (shapeMenuOpen = false)} onkeydown={handleWindowKeydown} />
<WorkspaceShell profile="design">
	{#snippet left()}
		<div class="sidebar-carrier">
			<div class="sidebar-content">
				<div class="sidebar-header row ycenter gap16" role="tablist">
					<button
						type="button"
						class="sidebar-tab-item"
						class:active={activeTab === "layers"}
						role="tab"
						aria-selected={activeTab === "layers"}
						onclick={() => selectTab("layers")}
					>
						<img src="/iconset/changeset.svg" alt="AI" class="icon-svg-sm" />
						<span class="sidebar-tab-item-text truncate">Layers</span>
					</button>
					<button
						type="button"
						class="sidebar-tab-item"
						class:active={activeTab === "components"}
						role="tab"
						aria-selected={activeTab === "components"}
						onclick={() => selectTab("components")}
					>
						<img src="/iconset/groups.svg" alt="Components" class="icon-svg-sm" />
						<span class="sidebar-tab-item-text truncate">Components</span>
					</button>
				</div>
				<div class="sidebar-content-box">
				{#if activeTab === 'components'}
					<ComponentLibrary />
				{:else if activeTab === 'layers'}
					<Layers />
				{/if}
				</div>
			</div>
		</div>
	{/snippet}
	{#snippet center()}
	<div
		class="design-viewport"
		style:background={designcanvas.canvasBackground}
		class:space-pan={toolMode === 'hand'}
		class:draw-active={!!drawTool}
		role="application"
		onwheel={handleViewportWheel}
		onpointerdown={viewportPointerDown}
		ondblclick={viewportDoubleClick}
		onpointermove={viewportPointerMove}
		onpointerup={viewportPointerUp}
		onpointercancel={viewportPointerUp}
		oncontextmenu={(e) => designcanvas.onCanvasContextMenu(e)}
		ondragover={allowLibraryDragOver}
		ondrop={handleLibraryDrop}
	>
		<!-- Ruler corner -->
		<div class="canvas-ruler-corner">
			<img src="/iconset/add.svg" alt="" class="icon-svg-xs" />
		</div>
		<canvas
			bind:this={rulerH}
			class="canvas-ruler-h"
			onpointerdown={(e) => designcanvas.onRulerPointerDown(e, "h")}
		></canvas>
		<canvas
			bind:this={rulerV}
			class="canvas-ruler-v"
			onpointerdown={(e) => designcanvas.onRulerPointerDown(e, "v")}
		></canvas>

		<!-- Canvas world (transform container) -->
		<div
			class="canvas-world"
			style="transform: translate({vp.x}px, {vp.y}px) scale({vp.zoom});"
			role="presentation"
		>
			{#if designcanvas.pixelGridVisible && vp.zoom >= 4}
				<div class="canvas-pixel-grid" aria-hidden="true"></div>
			{/if}
			<div
				class="canvas-grid"
				style={patternToStyle(gridPatterns.find((p) => p.id === activePatternId.value) ?? gridPatterns[0])}
			></div>
			{#each rootBlocks as block (block.id)}
				<DesignBlock
					{block}
					allBlocks={blocks}
					{selectedIds}
					{drag}
					{resize}
					{rotate}
					onselect={handleSelect}
					oncontextmenu={(targetBlock, event) => {
						setSelectedIds(
							selectedIds.includes(targetBlock.id) ? selectedIds : [targetBlock.id]
						);
						designcanvas.onBlockContextMenu(event, targetBlock);
					}}
					ondrop={handleDrop}
					ongesturemove={viewportPointerMove}
					ongestureend={viewportPointerUp}
				/>
			{/each}
		</div>

		{#if designcanvas.contextMenu}
			{@const menu = designcanvas.contextMenu}
			{@const menuBlock = menu.blockId ? blocks.find((b) => b.id === menu.blockId) : null}
			<div
				class="layer-context-backdrop"
				role="presentation"
				onpointerdown={(e) => {
					e.stopPropagation();
					designcanvas.closeContextMenu();
				}}
				oncontextmenu={(e) => {
					e.preventDefault();
					e.stopPropagation();
					designcanvas.closeContextMenu();
				}}
			>
				<div
					class="layer-context-menu"
					role="menu"
					tabindex="-1"
					style="left: {menu.x}px; top: {menu.y}px"
					onpointerdown={(e) => e.stopPropagation()}
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => e.stopPropagation()}
				>
					{#if menuBlock}
						<button type="button" onclick={() => designcanvas.renameBlock(menuBlock.id)}>Rename</button>
						<button type="button" onclick={() => designcanvas.copyBlock(menuBlock.id)}>Copy</button>
						<button type="button" onclick={() => designcanvas.cutBlock(menuBlock.id)}>Cut</button>
						<button type="button" onclick={() => designcanvas.deleteBlock(menuBlock.id)}>Delete</button>
						<div class="layer-context-sep"></div>
						<button type="button" onclick={() => designcanvas.moveForward(menuBlock.id)}>Bring Forward</button>
						<button type="button" onclick={() => designcanvas.moveBackward(menuBlock.id)}>Send Backward</button>
					{:else}
						<button type="button" onclick={() => designcanvas.pasteBlock(null)} disabled={!designcanvas.clipboard}>Paste</button>
						<button type="button" onclick={() => designcanvas.insertBlock('frame', menu.x, menu.y)}>Insert Frame</button>
						<button type="button" onclick={() => designcanvas.insertBlock('text', menu.x, menu.y)}>Insert Text</button>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Marquee selection box -->
		{#if sel.marquee}
			<div
				class="marquee-box"
				style="
					left: {Math.min(sel.marquee.x0, sel.marquee.x1)}px;
					top: {Math.min(sel.marquee.y0, sel.marquee.y1)}px;
					width: {Math.abs(sel.marquee.x1 - sel.marquee.x0)}px;
					height: {Math.abs(sel.marquee.y1 - sel.marquee.y0)}px;
				"
			></div>
		{/if}

		{#if designcanvas.activeGuides?.spacing}
			{@const badge = designcanvas.activeGuides.spacing}
			<div class="canvas-spacing-badge" style="left: {vp.x + badge.x * vp.zoom}px; top: {vp.y + badge.y * vp.zoom}px">{Math.round(badge.value)} px</div>
		{/if}

		<!-- Drag-to-draw preview (frame / shape tools) -->
		{#if isDrawing && drawStartPos && drawCurrentPos}
			{@const px = Math.min(drawStartPos.x, drawCurrentPos.x)}
			{@const py = Math.min(drawStartPos.y, drawCurrentPos.y)}
			{@const pw = Math.abs(drawCurrentPos.x - drawStartPos.x)}
			{@const ph = Math.abs(drawCurrentPos.y - drawStartPos.y)}
			<div
				class="canvas-draw-preview"
				style="left: {px}px; top: {py}px; width: {pw}px; height: {ph}px; transform: translate({vp.x}px, {vp.y}px) scale({vp.zoom}); transform-origin: 0 0;"
			></div>
		{/if}

		<!-- Canvas dock (tool selection) -->
		{#if designcanvas.deepSelectBreadcrumb.length > 0}
			<nav class="canvas-breadcrumb" aria-label="Selection path">
				<button type="button" class="btn-text" onclick={() => { designcanvas.deepSelectParentId = null; setSelectedIds([]); }}>Page</button>
				{#each designcanvas.deepSelectBreadcrumb as crumb (crumb.id)}
					<span aria-hidden="true">/</span>
					<button type="button" class="btn-text" onclick={() => { designcanvas.deepSelectParentId = crumb.id; setSelectedIds([crumb.id]); }}>{crumb.name}</button>
				{/each}
			</nav>
		{/if}
		<div class="canvas-view-controls" role="presentation" onpointerdown={(event) => event.stopPropagation()}>
			<button type="button" class="dock-btn" aria-expanded={viewMenuOpen} onclick={() => viewMenuOpen = !viewMenuOpen}>View</button>
			<button type="button" class="canvas-background-swatch" aria-label="Canvas background" aria-expanded={canvasColorPickerOpen} style:background={designcanvas.canvasBackground} onclick={() => canvasColorPickerOpen = !canvasColorPickerOpen}></button>
			{#if canvasColorPickerOpen}
				<div class="canvas-color-popover" role="dialog" aria-label="Canvas background color">
					<div class="canvas-spectrum" style:background={`linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${canvasColorHue} 100% 50%))`} role="slider" tabindex="0" aria-label="Saturation and lightness" aria-valuemin="0" aria-valuemax="100" aria-valuenow={canvasColorSaturation} onpointerdown={updateCanvasSpectrum} onpointermove={(event) => { if (event.buttons === 1) updateCanvasSpectrum(event); }}></div>
					<input class="canvas-hue" type="range" min="0" max="360" value={canvasColorHue} aria-label="Hue" oninput={(event) => { canvasColorHue = Number(event.currentTarget.value); designcanvas.setCanvasBackground(canvasBackgroundValue()); }} />
					<label class="text-meta">HEX <input value={designcanvas.canvasBackground} aria-label="Canvas background hex" onkeydown={(event) => { if (event.key === 'Enter') designcanvas.setCanvasBackground(event.currentTarget.value); }} /></label>
				</div>
			{/if}
			{#if viewMenuOpen}
				<div class="canvas-view-menu">
					<label><input type="checkbox" checked={designcanvas.snapToGrid} onchange={(event) => designcanvas.setViewOption('snapToGrid', event.currentTarget.checked)} /> Snap to grid</label>
					<label><input type="checkbox" checked={designcanvas.snapToObjects} onchange={(event) => designcanvas.setViewOption('snapToObjects', event.currentTarget.checked)} /> Snap to objects</label>
					<label><input type="checkbox" checked={designcanvas.snapToGuides} onchange={(event) => designcanvas.setViewOption('snapToGuides', event.currentTarget.checked)} /> Snap to guides</label>
					<label><input type="checkbox" checked={designcanvas.pixelGridVisible} onchange={(event) => designcanvas.setViewOption('pixelGridVisible', event.currentTarget.checked)} /> Pixel grid</label>
					<label><input type="checkbox" checked={designcanvas.constrainProportions} onchange={(event) => designcanvas.setConstrainProportions(event.currentTarget.checked)} /> Constrain proportions</label>
				</div>
			{/if}
		</div>
		<div
			class="canvas-dock"
			role="presentation"
			onpointerdown={(e) => e.stopPropagation()}
			onwheel={(e) => e.stopPropagation()}
		>
			<button type="button" class="dock-btn" class:active={toolMode === 'arrow' && !drawTool} title="Move (V)" onclick={() => { toolMode = 'arrow'; drawTool = null; }}>
				<img src="/iconset/runCursor.svg" alt="" class="icon-svg-sm" />
			</button>
			<div class="dock-separator"></div>
			<button type="button" class="dock-btn" class:active={toolMode === 'hand'} title="Hand (H)" onclick={() => { toolMode = 'hand'; drawTool = null; }}>
				<img src="/iconset/cursorPointingHand.svg" alt="" class="icon-svg-sm" />
			</button>
			<div class="dock-separator"></div>
			<button type="button" class="dock-btn" class:active={toolMode === 'scale'} title="Scale (K)" onclick={() => { toolMode = 'scale'; drawTool = null; }}>
				<img src="/iconset/moveToRightBottom.svg" alt="" class="icon-svg-sm" />
			</button>
			<div class="dock-separator"></div>
			<button type="button" class="dock-btn" class:active={drawTool === 'frame'} title="Frame (F)" onclick={() => activateDrawTool('frame')}>
				<img src="/iconset/frame.svg" alt="" class="icon-svg-sm" />
			</button>
			<div class="dock-separator"></div>
			<div class="dock-tool-group">
				<button
					type="button"
					class="dock-btn dock-shape-btn"
					class:active={drawTool === activeShapeType}
					title="{activeShapeType.charAt(0).toUpperCase()}{activeShapeType.slice(1)}"
					onclick={() => activateDrawTool(activeShapeType)}
				>
					{#if activeShapeType === 'rectangle'}
						<img src="/iconset/frame.svg" alt="" class="icon-svg-sm" />
					{:else if activeShapeType === 'ellipse'}
						<img src="/iconset/target.svg" alt="" class="icon-svg-sm" />
					{:else}
						<img src="/iconset/newLine.svg" alt="" class="icon-svg-sm" />
					{/if}
				</button>
				<button type="button" class="dock-chevron" title="More shapes" onclick={(e) => { e.stopPropagation(); shapeMenuOpen = !shapeMenuOpen; }}>
					<img src="/iconset/chevronDown.svg" alt="" class="icon-svg-xs" />
				</button>
				{#if shapeMenuOpen}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="canvas-shape-dropdown" onpointerdown={(e) => e.stopPropagation()}>
						{#each ['rectangle', 'ellipse', 'line'] as const as shapeType (shapeType)}
							<button
								type="button"
								class="shape-option"
								class:active={activeShapeType === shapeType}
								onclick={() => { activeShapeType = shapeType; shapeMenuOpen = false; activateDrawTool(shapeType); }}
							>
								<span class="shape-icon">
									{#if shapeType === 'rectangle'}
										<img src="/iconset/frame.svg" alt="" class="icon-svg-sm" />
									{:else if shapeType === 'ellipse'}
										<img src="/iconset/target.svg" alt="" class="icon-svg-sm" />
									{:else}
										<img src="/iconset/newLine.svg" alt="" class="icon-svg-sm" />
									{/if}
								</span>
								<span class="shape-label">{shapeType.charAt(0).toUpperCase()}{shapeType.slice(1)}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
			<div class="dock-separator"></div>
			<button type="button" class="dock-btn" class:active={drawTool === 'text'} title="Text (T)" onclick={() => activateDrawTool('text')}>
				<img src="/iconset/text.svg" alt="" class="icon-svg-sm" />
			</button>
			<div class="dock-separator"></div>
		<div
			class="row"
			role="presentation"
			onpointerdown={(e) => e.stopPropagation()}
			onwheel={(e) => e.stopPropagation()}
		>
			<button type="button" class="dock-btn" disabled>{Math.round(vp.x)}px, {Math.round(vp.y)}px</button>
			<div class="dock-separator"></div>
			<button type="button" class="dock-btn" onclick={() => applyViewportAction(() => vp.zoomAroundCanvasPoint(vp.zoom / 1.2, getSelectionCenterPoint()), 300)} title="Zoom out">
				<img src="/iconset/zoomOut.svg" alt="" class="icon-svg-sm" />
			</button>
			<button type="button" class="dock-btn" aria-expanded={zoomMenuOpen} onclick={() => zoomMenuOpen = !zoomMenuOpen} title="Zoom presets">{zoomDisplay}</button>
			{#if zoomMenuOpen}
				<div class="canvas-zoom-menu">
					{#each [25, 50, 100, 200, 400] as preset}
						<button type="button" onclick={() => { applyViewportAction(() => vp.setZoom(preset / 100), 300); zoomMenuOpen = false; }}>{preset}%</button>
					{/each}
					<button type="button" onclick={() => { applyViewportAction(() => vp.zoomToFit(rootBlocks.map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h }))), 300); zoomMenuOpen = false; }}>Fit</button>
					<button type="button" onclick={() => { applyViewportAction(() => designcanvas.zoomToSelection(), 450); zoomMenuOpen = false; }}>Selection</button>
				</div>
			{/if}
			<div class="dock-separator"></div>
			<button type="button" class="dock-btn" onclick={() => applyViewportAction(() => vp.zoomAroundCanvasPoint(vp.zoom * 1.2, getSelectionCenterPoint()), 300)} title="Zoom in">
				<img src="/iconset/zoomIn.svg" alt="" class="icon-svg-sm" />
			</button>
			<div class="dock-separator"></div>
			<button type="button" class="dock-btn" onclick={centerView} title="Center view">
				<img src="/iconset/target.svg" alt="" class="icon-svg-sm" />
			</button>
		</div>

		</div>
		</div>
	{/snippet}
	{#snippet right()}
		<div class="sidebar-carrier">
				<div class="sidebar-content">
				<div class="sidebar-header row ycenter gap16" role="tablist">
					<button
						type="button"
						class="sidebar-tab-item"
						class:active={activeTabR === "style"}
						role="tab"
						aria-selected={activeTabR === "style"}
						onclick={() => selectTabR("style")}
					>
						<img src="/iconset/designGrid.svg" alt="" class="icon-svg-sm" />
						<span class="sidebar-tab-item-text truncate">Style</span>
					</button>
					<button
						type="button"
						class="sidebar-tab-item"
						class:active={activeTabR === "export"}
						role="tab"
						aria-selected={activeTabR === "export"}
						onclick={() => selectTabR("export")}
					>
						<img src="/iconset/export.svg" alt="" class="icon-svg-sm" />
						<span class="sidebar-tab-item-text truncate">Export</span>
					</button>
					<button
						type="button"
						class="sidebar-tab-item"
						class:active={activeTabR === "aichat"}
						role="tab"
						aria-selected={activeTabR === "aichat"}
						onclick={() => selectTabR("aichat")}
					>
						<img src="/iconset/changeset.svg" alt="" class="icon-svg-sm" />
						<span class="sidebar-tab-item-text truncate">AI</span>
					</button>
				</div>
				<div class="sidebar-content-box">
				{#if activeTabR === "style"}
					<DesignInspector />
				{:else if activeTabR === "export"}
					<ExportPanel />
				{:else}
					<AIChat showHeader={false} />
				{/if}
				</div>
				</div>
			</div>
	{/snippet}
</WorkspaceShell>
