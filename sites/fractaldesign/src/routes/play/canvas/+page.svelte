<script lang="ts">
	import { canvas, CLIPBOARD_MARKER } from '$lib/states/canvasstate.svelte';
	import { surface } from '$lib/states/panelstate.svelte';
	import { native } from '$lib/states/nativestate.svelte';
	import { slide } from 'svelte/transition';
	import { quadIn, quadOut, quintInOut } from 'svelte/easing';
	import type { DesignBlock, ShapeType } from '$lib/utils/canvastypes';
	import ColorSpectrumPicker from '$lib/components/ColorSpectrumPicker.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import CodePanel from '$lib/components/CodePanel.svelte';

	type Command = {
		id: string;
		title: string;
		group: string;
		shortcut?: string;
		enabled?: boolean;
		run: () => void;
	};

	let sidebarREl = $state<HTMLElement | null>(null);
	let paletteOpen = $state(false);
	let activeShapeType = $state<ShapeType>('rectangle');
	let shapeMenuOpen = $state(false);
	let rightbarTabsToggled = $state(false);
	let containerEl = $state<HTMLElement | null>(null);
	let sidebarW = $state(200);
	let rightbarW = $state(320);
	let resizing = $state<'sidebar' | 'rightbar' | null>(null);

	const SIDEBAR = { min: 160, max: 240 };
	const RIGHTBAR = { min: 160, max: 580 };

	function startResize(which: 'sidebar' | 'rightbar', e: PointerEvent) {
		e.preventDefault();
		resizing = which;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onMove(e: PointerEvent) {
		if (!resizing || !containerEl) return;
		// Measure against the CONTAINER, not the window — robust to the header
		// offset and to the panels not being full-bleed.
		const rect = containerEl.getBoundingClientRect();

		if (resizing === 'sidebar') {
			// Left panel: width = distance from the container's LEFT edge.
			const w = e.clientX - rect.left;
			sidebarW = Math.min(SIDEBAR.max, Math.max(SIDEBAR.min, w));
		} else {
			// Right panel: width = distance from the container's RIGHT edge.
			const w = rect.right - e.clientX;
			rightbarW = Math.min(RIGHTBAR.max, Math.max(RIGHTBAR.min, w));
		}
	}

	function endResize(e: PointerEvent) {
		resizing = null;
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			/* capture already released */
		}
	}

	function viewportCenterScreen() {
		const el = document.querySelector('.canvas-viewport');
		const r = el?.getBoundingClientRect();
		return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: 400, y: 300 };
	}

	function insertAtCenter(type: 'text' | 'card' | 'frame' | 'container' | 'image' | ShapeType) {
		const p = viewportCenterScreen();
		canvas.insertBlock(type, p.x, p.y);
	}

	function toggleRightbarTabs(){
		rightbarTabsToggled = !rightbarTabsToggled
	}

	// Command registry for the Cmd+K palette. Rebuilds reactively so enabled
	// flags + dynamic labels track selection / panel state.
	const commands = $derived.by<Command[]>(() => {
		const hasSel = canvas.selectedIds.length > 0;
		const multi = canvas.selectedIds.length > 1;
		const hasChildren = canvas.items.some(
			(b) => canvas.selectedIds.includes(b.id) && b.children?.length > 0
		);
		return [
			{
				id: 'ins-text',
				title: 'Insert Text',
				group: 'Insert',
				shortcut: 'T',
				run: () => canvas.activateDrawTool('text')
			},
			{
				id: 'ins-card',
				title: 'Insert Card',
				group: 'Insert',
				run: () => insertAtCenter('card')
			},
			{
				id: 'ins-frame',
				title: 'Insert Frame',
				group: 'Insert',
				shortcut: 'F',
				run: () => canvas.activateDrawTool('frame')
			},
			{
				id: 'ins-container',
				title: 'Insert Container',
				group: 'Insert',
				run: () => insertAtCenter('container')
			},
			{
				id: 'ins-image',
				title: 'Insert Image',
				group: 'Insert',
				run: () => insertAtCenter('image')
			},
			{
				id: 'ins-rectangle',
				title: 'Insert Rectangle',
				group: 'Insert',
				shortcut: 'R',
				run: () => {
					activeShapeType = 'rectangle';
					canvas.activateDrawTool('rectangle');
				}
			},
			{
				id: 'ins-ellipse',
				title: 'Insert Ellipse',
				group: 'Insert',
				shortcut: 'O',
				run: () => {
					activeShapeType = 'ellipse';
					canvas.activateDrawTool('ellipse');
				}
			},
			{
				id: 'ins-line',
				title: 'Insert Line',
				group: 'Insert',
				shortcut: 'L',
				run: () => {
					activeShapeType = 'line';
					canvas.activateDrawTool('line');
				}
			},
			{
				id: 'ins-arrow',
				title: 'Insert Arrow',
				group: 'Insert',
				shortcut: '⇧L',
				run: () => {
					activeShapeType = 'arrow';
					canvas.activateDrawTool('arrow');
				}
			},
			{
				id: 'ins-polygon',
				title: 'Insert Polygon',
				group: 'Insert',
				run: () => {
					activeShapeType = 'polygon';
					canvas.activateDrawTool('polygon');
				}
			},
			{
				id: 'ins-star',
				title: 'Insert Star',
				group: 'Insert',
				run: () => {
					activeShapeType = 'star';
					canvas.activateDrawTool('star');
				}
			},
			{
				id: 'undo',
				title: 'Undo',
				group: 'Edit',
				shortcut: '⌘Z',
				enabled: canvas.canUndo,
				run: () => canvas.undo()
			},
			{
				id: 'redo',
				title: 'Redo',
				group: 'Edit',
				shortcut: '⌘⇧Z',
				enabled: canvas.canRedo,
				run: () => canvas.redo()
			},
			{
				id: 'dup',
				title: 'Duplicate',
				group: 'Edit',
				shortcut: '⌘D',
				enabled: hasSel,
				run: () => canvas.selectedId && canvas.duplicateBlock(canvas.selectedId)
			},
			{
				id: 'copy',
				title: 'Copy',
				group: 'Edit',
				shortcut: '⌘C',
				enabled: hasSel,
				run: () => canvas.copySelected()
			},
			{
				id: 'del',
				title: 'Delete',
				group: 'Edit',
				shortcut: '⌫',
				enabled: hasSel,
				run: () => canvas.deleteSelected()
			},
			{
				id: 'group',
				title: 'Group Selection',
				group: 'Edit',
				shortcut: '⌘G',
				enabled: multi,
				run: () => canvas.groupSelected()
			},
			{
				id: 'ungroup',
				title: 'Ungroup',
				group: 'Edit',
				shortcut: '⌘⇧G',
				enabled: hasChildren,
				run: () => canvas.ungroupSelected()
			},
			{
				id: 'front',
				title: 'Bring to Front',
				group: 'Arrange',
				enabled: hasSel,
				run: () => canvas.selectedId && canvas.bringToFront(canvas.selectedId)
			},
			{
				id: 'forward',
				title: 'Move Forward',
				group: 'Arrange',
				shortcut: '⌘]',
				enabled: hasSel,
				run: () => canvas.selectedId && canvas.moveForward(canvas.selectedId)
			},
			{
				id: 'backward',
				title: 'Move Backward',
				group: 'Arrange',
				shortcut: '⌘[',
				enabled: hasSel,
				run: () => canvas.selectedId && canvas.moveBackward(canvas.selectedId)
			},
			{
				id: 'back',
				title: 'Send to Back',
				group: 'Arrange',
				enabled: hasSel,
				run: () => canvas.selectedId && canvas.sendToBack(canvas.selectedId)
			},
			{
				id: 'al',
				title: 'Align Left',
				group: 'Arrange',
				enabled: hasSel,
				run: () => canvas.alignLeft()
			},
			{
				id: 'ahc',
				title: 'Align Horizontal Center',
				group: 'Arrange',
				enabled: hasSel,
				run: () => canvas.alignHorizontalCenter()
			},
			{
				id: 'ar',
				title: 'Align Right',
				group: 'Arrange',
				enabled: hasSel,
				run: () => canvas.alignRight()
			},
			{
				id: 'at',
				title: 'Align Top',
				group: 'Arrange',
				enabled: hasSel,
				run: () => canvas.alignTop()
			},
			{
				id: 'avc',
				title: 'Align Vertical Center',
				group: 'Arrange',
				enabled: hasSel,
				run: () => canvas.alignVerticalCenter()
			},
			{
				id: 'ab',
				title: 'Align Bottom',
				group: 'Arrange',
				enabled: hasSel,
				run: () => canvas.alignBottom()
			},
			{
				id: 'dh',
				title: 'Distribute Horizontally',
				group: 'Arrange',
				enabled: canvas.selectedIds.length >= 3,
				run: () => canvas.distributeHorizontally()
			},
			{
				id: 'dv',
				title: 'Distribute Vertically',
				group: 'Arrange',
				enabled: canvas.selectedIds.length >= 3,
				run: () => canvas.distributeVertically()
			},
			{ id: 'zin', title: 'Zoom In', group: 'View', run: () => canvas.zoomIn() },
			{ id: 'zout', title: 'Zoom Out', group: 'View', run: () => canvas.zoomOut() },
			{
				id: 'zreset',
				title: 'Reset Zoom to 100%',
				group: 'View',
				run: () => canvas.resetZoom()
			},
			{ id: 'center', title: 'Zoom to Fit', group: 'View', run: () => canvas.centerView() },
			{
				id: 'snap',
				title: `Snapping: ${canvas.isSnapping ? 'On' : 'Off'}`,
				group: 'View',
				run: () => (canvas.isSnapping = !canvas.isSnapping)
			},
			{
				id: 'p-layers',
				title: `${surface.sidebarLCollapsed ? 'Show' : 'Hide'} Layers Panel`,
				group: 'Panels',
				run: () => surface.toggleSidebarL()
			},
			{
				id: 'p-inspector',
				title: `${surface.sidebarRCollapsed ? 'Show' : 'Hide'} Inspector`,
				group: 'Panels',
				run: () => surface.toggleSidebarR()
			},
			{
				id: 'p-code',
				title: `${surface.agentCollapsed ? 'Show' : 'Hide'} Code Panel`,
				group: 'Panels',
				run: () => surface.toggleAgent()
			}
		];
	});

	// Floating selection toolbar position (local to .canvas-viewport).
	const selectionScreen = $derived.by(() => {
		if (canvas.selectedIds.length === 0) return null;
		if (
			canvas.drag ||
			canvas.resize ||
			canvas.rotate ||
			canvas.marquee ||
			canvas.pan ||
			canvas.rulerDrag ||
			canvas.contextMenu
		)
			return null;
		const sel = canvas.items.filter((b) => canvas.selectedIds.includes(b.id));
		if (sel.length === 0) return null;
		let minX = Infinity,
			minY = Infinity,
			maxX = -Infinity,
			maxY = -Infinity;
		for (const b of sel) {
			const a = canvas.getAbsolutePosition(b);
			minX = Math.min(minX, a.x);
			minY = Math.min(minY, a.y);
			maxX = Math.max(maxX, a.x + b.w);
			maxY = Math.max(maxY, a.y + b.h);
		}
		const z = canvas.viewport.zoom;
		const left = minX * z + canvas.viewport.x;
		const right = maxX * z + canvas.viewport.x;
		const top = minY * z + canvas.viewport.y;
		const bottom = maxY * z + canvas.viewport.y;
		const flip = top < 64; // not enough room above -> place below
		return { cx: (left + right) / 2, anchorY: flip ? bottom : top, flip };
	});

	function onViewportPointerMove(e: PointerEvent) {
		canvas.onPointerMove(e);
		if (canvas.altKey) canvas.updateMeasurement(e.clientX, e.clientY);
	}

	function readImageFile(file: File) {
		const reader = new FileReader();
		reader.onload = () => {
			const dataUrl = String(reader.result);
			const img = new Image();
			img.onload = () =>
				canvas.insertImageFromDataUrl(dataUrl, img.naturalWidth, img.naturalHeight);
			img.onerror = () => canvas.insertImageFromDataUrl(dataUrl, 240, 160);
			img.src = dataUrl;
		};
		reader.readAsDataURL(file);
	}

	function camelToDash(str: string): string {
		return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
	}

	function polygonPoints(cx: number, cy: number, r: number, sides: number): string {
		return Array.from({ length: sides }, (_, i) => {
			const a = (i * 2 * Math.PI) / sides - Math.PI / 2;
			return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
		}).join(' ');
	}

	function starPoints(
		cx: number,
		cy: number,
		outerR: number,
		innerR: number,
		numPoints: number
	): string {
		return Array.from({ length: numPoints * 2 }, (_, i) => {
			const ri = i % 2 === 0 ? outerR : innerR;
			const a = (i * Math.PI) / numPoints - Math.PI / 2;
			return `${cx + ri * Math.cos(a)},${cy + ri * Math.sin(a)}`;
		}).join(' ');
	}

	function styleProp(
		style: Record<string, string | number>,
		camelKey: string
	): string | number | undefined {
		if (style[camelKey] !== undefined) return style[camelKey];
		const dashKey = camelToDash(camelKey);
		if (style[dashKey] !== undefined) return style[dashKey];
		return undefined;
	}

	function parseBackground(bg: string | number | undefined) {
		const str = String(bg || '');
		if (str.includes('linear-gradient')) {
			const match = str.match(
				/linear-gradient\((\d+)deg,\s*(#[a-fA-F0-9]{6}),\s*(#[a-fA-F0-9]{6})\)/i
			);
			if (match) {
				return {
					mode: 'gradient',
					color: match[2],
					angle: Number(match[1]),
					colorStart: match[2],
					colorEnd: match[3]
				};
			}
		}
		return {
			mode: 'solid',
			color: str && str.startsWith('#') ? str : '#FFFFFF',
			angle: 90,
			colorStart: '#FFFFFF',
			colorEnd: '#000000'
		};
	}

	function getRadius(style: Record<string, string | number>) {
		const tl = styleProp(style, 'borderTopLeftRadius');
		const tr = styleProp(style, 'borderTopRightRadius');
		const br = styleProp(style, 'borderBottomRightRadius');
		const bl = styleProp(style, 'borderBottomLeftRadius');
		const isIndividual =
			tl !== undefined || tr !== undefined || br !== undefined || bl !== undefined;
		return {
			isIndividual,
			unified: parseInt(String(styleProp(style, 'borderRadius') || '0')),
			tl: parseInt(String(tl || '0')),
			tr: parseInt(String(tr || '0')),
			br: parseInt(String(br || '0')),
			bl: parseInt(String(bl || '0'))
		};
	}

	function parseBorderString(str: string) {
		const match = str.match(/(\d+)px\s+(solid|dashed|dotted)\s+(#[a-fA-F0-9]{6})/i);
		if (match) {
			return { width: Number(match[1]), style: match[2], color: match[3] };
		}
		return { width: 0, style: 'solid', color: '#000000' };
	}

	function getBorder(style: Record<string, string | number>) {
		const isIndividual =
			styleProp(style, 'borderTop') !== undefined ||
			styleProp(style, 'borderRight') !== undefined ||
			styleProp(style, 'borderBottom') !== undefined ||
			styleProp(style, 'borderLeft') !== undefined;

		const unified = parseBorderString(String(styleProp(style, 'border') || ''));
		const top = parseBorderString(String(styleProp(style, 'borderTop') || ''));
		const right = parseBorderString(String(styleProp(style, 'borderRight') || ''));
		const bottom = parseBorderString(String(styleProp(style, 'borderBottom') || ''));
		const left = parseBorderString(String(styleProp(style, 'borderLeft') || ''));

		return { isIndividual, unified, top, right, bottom, left };
	}

	function getPadding(style: Record<string, string | number>) {
		const isIndividual =
			styleProp(style, 'paddingTop') !== undefined ||
			styleProp(style, 'paddingRight') !== undefined ||
			styleProp(style, 'paddingBottom') !== undefined ||
			styleProp(style, 'paddingLeft') !== undefined;
		return {
			isIndividual,
			unified: parseInt(String(styleProp(style, 'padding') || '0')),
			top: parseInt(String(styleProp(style, 'paddingTop') || '0')),
			right: parseInt(String(styleProp(style, 'paddingRight') || '0')),
			bottom: parseInt(String(styleProp(style, 'paddingBottom') || '0')),
			left: parseInt(String(styleProp(style, 'paddingLeft') || '0'))
		};
	}

	function parseShadow(style: Record<string, string | number>) {
		const raw = String(styleProp(style, 'boxShadow') || '');
		if (!raw)
			return {
				enabled: false,
				inset: false,
				x: 0,
				y: 4,
				blur: 12,
				spread: 0,
				color: '#000000',
				opacity: 10
			};
		const isInset = raw.includes('inset');
		const clean = raw.replace('inset', '').trim();
		// Match: Xpx Ypx Blurpx Spreadpx rgba(r,g,b,a) or #hex
		const rgbaMatch = clean.match(
			/([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s*([-\d.]+)?px?\s*rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/
		);
		if (rgbaMatch) {
			const r = Math.round(Number(rgbaMatch[5]));
			const g = Math.round(Number(rgbaMatch[6]));
			const b = Math.round(Number(rgbaMatch[7]));
			const a = rgbaMatch[8] !== undefined ? Number(rgbaMatch[8]) : 1;
			const hex =
				`#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
			return {
				enabled: true,
				inset: isInset,
				x: Number(rgbaMatch[1]),
				y: Number(rgbaMatch[2]),
				blur: Number(rgbaMatch[3]),
				spread: Number(rgbaMatch[4] || 0),
				color: hex,
				opacity: Math.round(a * 100)
			};
		}
		const hexMatch = clean.match(
			/([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s*([-\d.]+)?px?\s*(#[a-fA-F0-9]{3,8})/
		);
		if (hexMatch) {
			return {
				enabled: true,
				inset: isInset,
				x: Number(hexMatch[1]),
				y: Number(hexMatch[2]),
				blur: Number(hexMatch[3]),
				spread: Number(hexMatch[4] || 0),
				color: hexMatch[5].toUpperCase(),
				opacity: 100
			};
		}
		return {
			enabled: false,
			inset: false,
			x: 0,
			y: 4,
			blur: 12,
			spread: 0,
			color: '#000000',
			opacity: 10
		};
	}

	function buildShadowString(s: {
		inset: boolean;
		x: number;
		y: number;
		blur: number;
		spread: number;
		color: string;
		opacity: number;
	}) {
		const hex = s.color.replace('#', '');
		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		const a = (s.opacity / 100).toFixed(2);
		return `${s.inset ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px rgba(${r}, ${g}, ${b}, ${a})`;
	}

	let sidebarLExpandedSize = $state(20);
	let sidebarRExpandedSize = $state(20);
	let agentExpandedSize = $state(25);

	const selectedBlock = $derived(canvas.items.find((b) => b.id === canvas.selectedId));

	$effect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			const isMeta = e.metaKey || e.ctrlKey;

			// Track Alt for the measurement HUD (works regardless of focus).
			if (e.key === 'Alt') canvas.altKey = true;

			// Command palette (Cmd/Ctrl+K) — available even from inputs.
			if (isMeta && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				paletteOpen = !paletteOpen;
				return;
			}

			// Ignore shortcuts if the user is typing in form inputs/textarea
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				return;
			}

			// Space → pan mode (handled in onCanvasPointerDown).
			if (e.code === 'Space') {
				canvas.spaceHeld = true;
			}

			// Tool shortcuts (single-key, not in input).
			if (e.key.toLowerCase() === 'v' && !e.shiftKey) {
				e.preventDefault();
				canvas.toolMode = 'arrow';
				canvas.drawTool = null;
				return;
			}
			if (e.key.toLowerCase() === 'h' && !e.shiftKey) {
				e.preventDefault();
				canvas.toolMode = 'hand';
				canvas.drawTool = null;
				return;
			}
			if (e.key.toLowerCase() === 'r' && !e.shiftKey) {
				e.preventDefault();
				activeShapeType = 'rectangle';
				canvas.activateDrawTool('rectangle');
				return;
			}
			if (e.key.toLowerCase() === 'o' && !e.shiftKey) {
				e.preventDefault();
				activeShapeType = 'ellipse';
				canvas.activateDrawTool('ellipse');
				return;
			}
			if (e.key.toLowerCase() === 'l') {
				e.preventDefault();
				if (e.shiftKey) {
					activeShapeType = 'arrow';
					canvas.activateDrawTool('arrow');
				} else {
					activeShapeType = 'line';
					canvas.activateDrawTool('line');
				}
				return;
			}
			if (e.key.toLowerCase() === 't' && !e.shiftKey) {
				e.preventDefault();
				canvas.activateDrawTool('text');
				return;
			}
			if (e.key.toLowerCase() === 'f' && !e.shiftKey) {
				e.preventDefault();
				canvas.activateDrawTool('frame');
				return;
			}

			// Arrow-key nudge (Shift = 10px). Snapping-aware step otherwise.
			if (
				['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
				canvas.selectedIds.length > 0
			) {
				e.preventDefault();
				const step = e.shiftKey ? 10 : 1;
				const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
				const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
				canvas.nudgeSelected(dx, dy);
				return;
			}

			// Z-order one step: Cmd+] forward, Cmd+[ backward.
			if (isMeta && (e.key === ']' || e.key === '[') && canvas.selectedId) {
				e.preventDefault();
				if (e.key === ']') canvas.moveForward(canvas.selectedId);
				else canvas.moveBackward(canvas.selectedId);
				return;
			}

			if (isMeta && e.key.toLowerCase() === 'z') {
				e.preventDefault();
				if (e.shiftKey) {
					canvas.redo();
				} else {
					canvas.undo();
				}
			} else if (isMeta && e.key.toLowerCase() === 'y') {
				e.preventDefault();
				canvas.redo();
			}

			// Group Selection (Cmd+G) / Ungroup Selection (Cmd+Shift+G)
			if (isMeta && e.key.toLowerCase() === 'g' && canvas.selectedIds.length > 0) {
				e.preventDefault();
				if (e.shiftKey) {
					canvas.ungroupSelected();
				} else {
					canvas.groupSelected();
				}
			}

			// Copy Style (Cmd+Opt+C) / Copy Block (Cmd+C)
			if (isMeta && e.key.toLowerCase() === 'c' && canvas.selectedIds.length > 0) {
				if (e.altKey) {
					e.preventDefault();
					canvas.copyStyle(canvas.selectedId!);
				} else {
					canvas.copySelected();
				}
			}

			// Cut (Cmd+X)
			if (isMeta && e.key.toLowerCase() === 'x' && canvas.selectedIds.length > 0) {
				canvas.cutSelected();
			}

			// Paste Style (Cmd+Opt+V). Plain Cmd+V is handled by the native
			// `paste` event below so it can also import external HTML/CSS + images.
			if (isMeta && e.altKey && e.key.toLowerCase() === 'v') {
				if (canvas.selectedId) {
					e.preventDefault();
					canvas.pasteStyle(canvas.selectedId);
				}
			}

			// Duplicate (Cmd+D)
			if (isMeta && e.key.toLowerCase() === 'd' && canvas.selectedId) {
				e.preventDefault();
				canvas.duplicateBlock(canvas.selectedId);
			}

			// Delete (Backspace/Delete)
			if (e.key === 'Backspace' || e.key === 'Delete') {
				if (canvas.selectedIds.length > 0) {
					e.preventDefault();
					canvas.deleteSelected();
				} else if (canvas.selectedGuideId) {
					e.preventDefault();
					canvas.deleteGuide(canvas.selectedGuideId);
				}
			}
		}

		function handleKeyUp(e: KeyboardEvent) {
			if (e.key === 'Alt') {
				canvas.altKey = false;
				canvas.clearMeasurement();
			}
			if (e.code === 'Space') {
				canvas.spaceHeld = false;
			}
		}

		function handleOutsideClick(e: MouseEvent) {
			if (canvas.contextMenu) {
				canvas.closeContextMenu();
			}
			if (canvas.activePopoverId) {
				const target = e.target as HTMLElement;
				if (!target.closest('.color-picker-popover') && !target.closest('.color-swatch')) {
					canvas.activePopoverId = null;
				}
			}
			if (shapeMenuOpen) {
				const target = e.target as HTMLElement;
				if (!target.closest('.canvas-shape-dropdown') && !target.closest('.dock-chevron')) {
					shapeMenuOpen = false;
				}
			}
		}

		// Native paste: internal blocks, external HTML/CSS import, and images.
		function handlePaste(e: ClipboardEvent) {
			const t = e.target;
			if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) return;
			const cd = e.clipboardData;
			if (!cd) return;

			const html = cd.getData('text/html');
			const text = cd.getData('text/plain');

			// 1. Blocks copied inside the tool (tagged on the OS clipboard).
			if (text && text.startsWith(CLIPBOARD_MARKER)) {
				e.preventDefault();
				canvas.clipboard = text.slice(CLIPBOARD_MARKER.length);
				canvas.pasteBlock(canvas.selectedId);
				return;
			}

			// 2. An image on the clipboard.
			for (const item of Array.from(cd.items)) {
				if (item.type.startsWith('image/')) {
					const file = item.getAsFile();
					if (file) {
						e.preventDefault();
						readImageFile(file);
						return;
					}
				}
			}

			// 3. External markup -> import as blocks.
			const payload = (html && html.trim()) || (text && text.trim()) || '';
			if (payload && /<[a-z!][\s\S]*>/i.test(payload)) {
				e.preventDefault();
				canvas.importFromHtml(html && html.trim() ? html : payload);
				return;
			}

			// 4. Fall back to the internal clipboard.
			if (canvas.clipboard) {
				e.preventDefault();
				canvas.pasteBlock(canvas.selectedId);
			}
		}

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('click', handleOutsideClick);
		window.addEventListener('paste', handlePaste);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('click', handleOutsideClick);
			window.removeEventListener('paste', handlePaste);
		};
	});

	let rulerH = $state<HTMLCanvasElement | null>(null);
	let rulerV = $state<HTMLCanvasElement | null>(null);
	let viewportEl = $state<HTMLDivElement | null>(null);

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

			const ctxH = rulerH!.getContext('2d');
			const ctxV = rulerV!.getContext('2d');

			const styles = getComputedStyle(viewportEl!);
			const border = styles.getPropertyValue('--border-primary').trim() || '#d9d9d9';
			const textCol = styles.getPropertyValue('--text-secondary').trim() || '#707070';
			const themeColor = styles.getPropertyValue('--theme-color').trim() || '#0066ff';

			if (ctxH) {
				ctxH.save();
				ctxH.scale(dpr, dpr);
				ctxH.clearRect(0, 0, width, 24);

				const zoom = canvas.viewport.zoom;
				const panX = canvas.viewport.x;

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
				ctxH.font = '9px sans-serif';

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

						ctxH.textAlign = 'center';
						ctxH.textBaseline = 'middle';
						ctxH.fillText(Math.round(val).toString(), screenX, 6);
					} else {
						ctxH.moveTo(screenX, 17);
						ctxH.lineTo(screenX, 24);
						ctxH.stroke();
					}
				}

				// Draw vertical guide markers on horizontal ruler
				for (const guide of canvas.userGuides) {
					if (guide.type === 'v') {
						const screenX = guide.value * zoom + panX - 24;
						if (screenX >= 0 && screenX <= width) {
							const isSelected =
								canvas.selectedGuideId === guide.id ||
								canvas.rulerDrag?.id === guide.id;
							ctxH.fillStyle = isSelected ? themeColor : '#ff3b30';
							ctxH.strokeStyle = isSelected ? themeColor : '#ff3b30';
							ctxH.lineWidth = 1.5;
							ctxH.beginPath();
							ctxH.moveTo(screenX, 12);
							ctxH.lineTo(screenX, 24);
							ctxH.stroke();
							ctxH.font = 'bold 9px sans-serif';
							ctxH.textAlign = 'center';
							ctxH.textBaseline = 'bottom';
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

				const zoom = canvas.viewport.zoom;
				const panY = canvas.viewport.y;

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
				ctxV.font = '9px sans-serif';

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
						ctxV.textAlign = 'center';
						ctxV.textBaseline = 'middle';
						ctxV.fillText(Math.round(val).toString(), 0, 0);
						ctxV.restore();
					} else {
						ctxV.moveTo(17, screenY);
						ctxV.lineTo(24, screenY);
						ctxV.stroke();
					}
				}

				// Draw horizontal guide markers on vertical ruler
				for (const guide of canvas.userGuides) {
					if (guide.type === 'h') {
						const screenY = guide.value * zoom + panY - 24;
						if (screenY >= 0 && screenY <= height) {
							const isSelected =
								canvas.selectedGuideId === guide.id ||
								canvas.rulerDrag?.id === guide.id;
							ctxV.fillStyle = isSelected ? themeColor : '#ff3b30';
							ctxV.strokeStyle = isSelected ? themeColor : '#ff3b30';
							ctxV.lineWidth = 1.5;
							ctxV.beginPath();
							ctxV.moveTo(12, screenY);
							ctxV.lineTo(24, screenY);
							ctxV.stroke();
							ctxV.save();
							ctxV.translate(10, screenY);
							ctxV.rotate(-Math.PI / 2);
							ctxV.font = 'bold 9px sans-serif';
							ctxV.textAlign = 'center';
							ctxV.textBaseline = 'bottom';
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
			canvas.viewport.x,
			canvas.viewport.y,
			canvas.viewport.zoom,
			canvas.userGuides,
			...canvas.userGuides.map((g) => g.value),
			canvas.selectedGuideId,
			canvas.rulerDrag?.id
		];

		return () => {
			resizeObserver.disconnect();
		};
	});
</script>

<section
	class="outer-canvas native-dragging"
	class:resizing={resizing !== null}
	bind:this={containerEl}
>
	{#if !native.sidebarCollapsed}
		<aside
			class="panel sidebar"
			style="width: {sidebarW}px"
			in:slide={{ axis: 'x', easing: quadOut, duration: 200 }}
			out:slide={{ axis: 'x', easing: quadIn }}
		>
			<!-- RECURSIVE SNIPPET FOR LAYER ROWS -->
			{#snippet renderLayerRow(block: DesignBlock, depth: number)}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="layer-row"
					class:selected={canvas.selectedIds.includes(block.id)}
					class:dragging={canvas.sidebarDrag?.id === block.id}
					class:drag-over-before={canvas.sidebarDrag?.targetId === block.id &&
						canvas.sidebarDrag?.dropPosition === 'before'}
					class:drag-over-inside={canvas.sidebarDrag?.targetId === block.id &&
						canvas.sidebarDrag?.dropPosition === 'inside'}
					class:drag-over-after={canvas.sidebarDrag?.targetId === block.id &&
						canvas.sidebarDrag?.dropPosition === 'after'}
					style="padding-left: {depth * 4 + 4}px;"
					data-block-id={block.id}
					onpointerdown={(event) => canvas.onLayerPointerDown(event, block)}
					onpointermove={(event) => canvas.onLayerPointerMove(event)}
					onpointerup={(event) => canvas.onLayerPointerUp(event)}
					oncontextmenu={(event) => canvas.onBlockContextMenu(event, block)}
				>
					<!-- Carat for folding -->
					<button
						class="layer-collapse-btn"
						class:has-children={block.children && block.children.length > 0}
						onpointerdown={(e) => e.stopPropagation()}
						onclick={(e) => {
							e.stopPropagation();
							canvas.toggleCollapse(block.id);
						}}
					>
						{#if block.children && block.children.length > 0}
							{#if canvas.isCollapsed(block.id)}
								▸
							{:else}
								▾
							{/if}
						{/if}
					</button>

					<span class="layer-icon">
						{#if block.type === 'text'}T
						{:else if block.type === 'image'}◈
						{:else if block.type === 'card'}□
						{:else if block.type === 'frame'}⛶
						{:else if block.type === 'container'}☲
						{/if}
					</span>
					<span class="layer-name">{block.name}</span>

					<div class="layer-actions">
						<!-- Toggle Hide -->
						<button
							class="layer-action-btn"
							class:active={block.hidden}
							onclick={(e) => {
								e.stopPropagation();
								canvas.toggleHide(block.id);
							}}
							title={block.hidden ? 'Show layer' : 'Hide layer'}
						>
							{#if block.hidden}👁‍🗨{:else}👁{/if}
						</button>

						<!-- Toggle Lock -->
						<button
							class="layer-action-btn"
							class:active={block.locked}
							onclick={(e) => {
								e.stopPropagation();
								canvas.toggleLock(block.id);
							}}
							title={block.locked ? 'Unlock layer' : 'Lock layer'}
						>
							{#if block.locked}🔒{:else}🔓{/if}
						</button>
					</div>
				</div>

				{#if block.children && block.children.length > 0}
					{#if !canvas.isCollapsed(block.id)}
						<div class="layer-children">
							{#each block.children as childId (childId)}
								{@const child = canvas.items.find((b) => b.id === childId)}
								{#if child}
									{@render renderLayerRow(child, depth + 1)}
								{/if}
							{/each}
						</div>
					{/if}
				{/if}
			{/snippet}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="layer-tree-container"
				oncontextmenu={(event) => canvas.onCanvasContextMenu(event)}
			>
				{#each canvas.items.filter((b) => b.parentId === null) as rootBlock (rootBlock.id)}
					{@render renderLayerRow(rootBlock, 0)}
				{/each}
			</div>
			<div
				class="box gap4 pad8 text-sm padtop12 col3"
			>
				<span class="text-sm">{Math.round(canvas.viewport.zoom * 100)}% | {Math.round(canvas.viewport.x)}px, {Math.round(canvas.viewport.y)}px</span>
				<span class="text-sm">sidebar · {Math.round(sidebarW)}px</span>
			</div>
			<div
				class="resize-handle right"
				role="separator"
				aria-orientation="vertical"
				aria-label="Resize sidebar"
				onpointerdown={(e) => startResize('sidebar', e)}
				onpointermove={onMove}
				onpointerup={endResize}
				onpointercancel={endResize}
			></div>
		</aside>
	{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div bind:this={viewportEl} class="canvas-viewport panel main" class:measuring={canvas.altKey && canvas.selectedIds.length > 0} class:space-pan={canvas.spaceHeld || canvas.toolMode === 'hand'} class:draw-active={canvas.drawTool !== null} onpointermove={(e) => onViewportPointerMove(e)} onpointerup={(e) => canvas.onPointerUp(e)} onpointercancel={(e) => canvas.onPointerUp(e)} onpointerdown={(e) => canvas.onCanvasPointerDown(e)} onwheel={(e) => canvas.onWheel(e)} oncontextmenu={(e) => canvas.onCanvasContextMenu(e)}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="canvas-ruler-corner" onpointerdown={(e) => e.stopPropagation()}>
			<svg
				width="12"
				height="12"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
			>
				<line x1="12" y1="5" x2="12" y2="19"></line>
				<line x1="5" y1="12" x2="19" y2="12"></line>
			</svg>
		</div>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<canvas bind:this={rulerH} class="canvas-ruler-h" onpointerdown={(e) => canvas.onRulerPointerDown(e, 'h')}></canvas>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<canvas
			bind:this={rulerV}
			class="canvas-ruler-v"
			onpointerdown={(e) => canvas.onRulerPointerDown(e, 'v')}></canvas>
		<div
			class="canvas-world"
			style="transform: translate({canvas.viewport.x}px, {canvas.viewport.y}px) scale({canvas
				.viewport.zoom});"
		>
			<div class="canvas-grid"></div>
			{#if canvas.activeGuides || canvas.userGuides.length > 0 || canvas.measure}
				<svg class="canvas-svg-overlay" viewBox="-50000 -50000 100000 100000">
					{#if canvas.activeGuides}
						{#if canvas.activeGuides.x !== undefined && canvas.activeGuides.boundsX}
							<line
								class="align-guide"
								x1={canvas.activeGuides.x}
								y1={canvas.activeGuides.boundsX.min}
								x2={canvas.activeGuides.x}
								y2={canvas.activeGuides.boundsX.max}
							/>
						{/if}
						{#if canvas.activeGuides.y !== undefined && canvas.activeGuides.boundsY}
							<line
								class="align-guide"
								x1={canvas.activeGuides.boundsY.min}
								y1={canvas.activeGuides.y}
								x2={canvas.activeGuides.boundsY.max}
								y2={canvas.activeGuides.y}
							/>
						{/if}
					{/if}

					{#each canvas.userGuides as guide (guide.id)}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<line
							class="user-guide-hit type-{guide.type}"
							x1={guide.type === 'v' ? guide.value : -50000}
							y1={guide.type === 'h' ? guide.value : -50000}
							x2={guide.type === 'v' ? guide.value : 50000}
							y2={guide.type === 'h' ? guide.value : 50000}
							onpointerdown={(event) => canvas.onGuidePointerDown(event, guide)}
						/>
						<line
							class="user-guide-visual type-{guide.type}"
							class:dragging={canvas.rulerDrag?.id === guide.id}
							class:selected={canvas.selectedGuideId === guide.id}
							x1={guide.type === 'v' ? guide.value : -50000}
							y1={guide.type === 'h' ? guide.value : -50000}
							x2={guide.type === 'v' ? guide.value : 50000}
							y2={guide.type === 'h' ? guide.value : 50000}
						/>
					{/each}

					{#if canvas.measure}
						{#each canvas.measure.segments as seg, i (i)}
							{@const horiz = seg.y1 === seg.y2}
							{@const cap = 4 / canvas.viewport.zoom}
							<line
								class="measure-line"
								x1={seg.x1}
								y1={seg.y1}
								x2={seg.x2}
								y2={seg.y2}
							/>
							<line
								class="measure-cap"
								x1={horiz ? seg.x1 : seg.x1 - cap}
								y1={horiz ? seg.y1 - cap : seg.y1}
								x2={horiz ? seg.x1 : seg.x1 + cap}
								y2={horiz ? seg.y1 + cap : seg.y1}
							/>
							<line
								class="measure-cap"
								x1={horiz ? seg.x2 : seg.x2 - cap}
								y1={horiz ? seg.y2 - cap : seg.y2}
								x2={horiz ? seg.x2 : seg.x2 + cap}
								y2={horiz ? seg.y2 + cap : seg.y2}
							/>
							<text
								class="measure-label"
								x={(seg.x1 + seg.x2) / 2 + (horiz ? 0 : 6 / canvas.viewport.zoom)}
								y={(seg.y1 + seg.y2) / 2 - (horiz ? 5 : 0) / canvas.viewport.zoom}
								font-size={11 / canvas.viewport.zoom}
								text-anchor={horiz ? 'middle' : 'start'}
								dominant-baseline="middle">{seg.label}</text
							>
						{/each}
					{/if}
				</svg>
			{/if}
			{#snippet renderBlock(block: DesignBlock)}
				{#if !block.hidden}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="design-block type-{block.type}"
						class:selected={canvas.selectedIds.includes(block.id)}
						class:locked={block.locked}
						class:drop-target={canvas.hoveredParentId === block.id}
						style="
									transform: translate({block.x}px, {block.y}px){block.rotation
							? ` rotate(${block.rotation}deg)`
							: ''};
									width: {block.w}px;
									height: {block.h}px;
									{Object.entries(block.style)
							.filter(([, v]) => v !== '' && v !== undefined)
							.map(([k, v]) => `${camelToDash(k)}:${v}`)
							.join(';')}
								"
						onpointerdown={(event) => canvas.onItemPointerDown(event, block)}
						oncontextmenu={(event) => canvas.onBlockContextMenu(event, block)}
					>
						<!-- Render custom visuals depending on block type -->
						{#if block.type === 'text'}
							<!-- svelte-ignore a11y_autofocus -->
							<div
								class="block-content-text"
								class:editing={canvas.editingTextId === block.id}
								style="color: {block.props.color || 'inherit'}"
								contenteditable={canvas.editingTextId === block.id
									? 'plaintext-only'
									: undefined}
								tabindex="-1"
								role="textbox"
								aria-multiline="false"
								ondblclick={(e) => {
									e.stopPropagation();
									canvas.startEditingText(block.id);
								}}
								onblur={(e) =>
									canvas.finishEditingText(
										block.id,
										(e.target as HTMLElement).innerText
									)}
								onkeydown={(e) => {
									const el = e.currentTarget as HTMLElement;
									if (e.key === 'Enter' || e.key === 'Escape') {
										e.preventDefault();
										e.stopPropagation();
										canvas.finishEditingText(block.id, el.innerText);
									}
								}}
								onpointerdown={(e) => {
									if (canvas.editingTextId === block.id) e.stopPropagation();
								}}
							>
								{block.props.text || ''}
							</div>
						{:else if block.type === 'image'}
							<div
								class="block-content-image"
								style="background-image: url('{block.props.src || ''}')"
							></div>
						{:else if block.type === 'card'}
							<div class="block-content-card">
								<h4>{block.name}</h4>
								<p>{block.props.description || ''}</p>
							</div>
						{:else if block.type === 'container'}
							<div class="block-content-frame-label">{block.name}</div>
						{:else if block.type === 'frame'}
							<div class="block-content-frame-label">{block.name}</div>
						{:else if block.type === 'ellipse'}
							<div class="block-content-shape-label">{block.name}</div>
						{:else if block.type === 'rectangle'}
							<div class="block-content-shape-label">{block.name}</div>
						{:else if block.type === 'line'}
							<div class="block-content-shape-label">{block.name}</div>
							<svg
								class="shape-svg"
								viewBox="0 0 {block.w} {block.h}"
								width={block.w}
								height={block.h}
							>
								<line
									x1="0"
									y1={block.h / 2}
									x2={block.w}
									y2={block.h / 2}
									stroke={String(
										block.style.color || block.style.stroke || '#6366f1'
									)}
									stroke-width="2"
									stroke-linecap="round"
								/>
							</svg>
						{:else if block.type === 'arrow'}
							<div class="block-content-shape-label">{block.name}</div>
							<svg
								class="shape-svg"
								viewBox="0 0 {block.w} {block.h}"
								width={block.w}
								height={block.h}
							>
								<line
									x1="0"
									y1={block.h / 2}
									x2={block.w - 10}
									y2={block.h / 2}
									stroke={String(
										block.style.color || block.style.stroke || '#6366f1'
									)}
									stroke-width="2"
									stroke-linecap="round"
								/>
								<polygon
									points={`${block.w - 10},${block.h / 2 - 5} ${block.w},${block.h / 2} ${block.w - 10},${block.h / 2 + 5}`}
									fill={String(
										block.style.color || block.style.stroke || '#6366f1'
									)}
								/>
							</svg>
						{:else if block.type === 'polygon'}
							<div class="block-content-shape-label">{block.name}</div>
							<svg
								class="shape-svg"
								viewBox="0 0 {block.w} {block.h}"
								width={block.w}
								height={block.h}
							>
								<polygon
									points={polygonPoints(
										block.w / 2,
										block.h / 2,
										Math.min(block.w, block.h) / 2 - 2,
										Number(block.props.sides) || 6
									)}
									fill={String(block.style.background || '#e0e7ff')}
									stroke={String(
										block.style.color || block.style.stroke || '#6366f1'
									)}
									stroke-width="2"
									stroke-linejoin="round"
								/>
							</svg>
						{:else if block.type === 'star'}
							<div class="block-content-shape-label">{block.name}</div>
							<svg
								class="shape-svg"
								viewBox="0 0 {block.w} {block.h}"
								width={block.w}
								height={block.h}
							>
								<polygon
									points={starPoints(
										block.w / 2,
										block.h / 2,
										Math.min(block.w, block.h) / 2 - 2,
										(Math.min(block.w, block.h) / 2 - 2) * 0.4,
										Number(block.props.points) || 5
									)}
									fill={String(block.style.background || '#e0e7ff')}
									stroke={String(
										block.style.color || block.style.stroke || '#6366f1'
									)}
									stroke-width="2"
									stroke-linejoin="round"
								/>
							</svg>
						{/if}
						<!-- Recursively render nested child items -->
						{#if block.children && block.children.length > 0}
							<div class="block-children-container">
								{#each block.children as childId (childId)}
									{@const child = canvas.items.find((b) => b.id === childId)}
									{#if child}
										{@render renderBlock(child)}
									{/if}
								{/each}
							</div>
						{/if}
						<!-- Transform UI on active element (only single selection + unlocked) -->
						{#if canvas.selectedIds.length === 1 && canvas.selectedId === block.id && !block.locked}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<span
								class="rotate-handle"
								onpointerdown={(event) => canvas.onRotatePointerDown(event, block)}
							></span>
							{#each ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const as handle}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<span
									class="resize-handle handle-{handle}"
									class:edge={handle.length === 1}
									onpointerdown={(event) =>
										canvas.onResizePointerDown(event, block, handle)}
								></span>
							{/each}
						{/if}
					</div>
				{/if}
			{/snippet}

			{#each canvas.items.filter((b) => b.parentId === null) as rootBlock (rootBlock.id)}
				{@render renderBlock(rootBlock)}
			{/each}

			{#if canvas.marquee}
				<div
					class="marquee-box"
					style="
								left: {Math.min(canvas.marquee.x0, canvas.marquee.x1)}px;
								top: {Math.min(canvas.marquee.y0, canvas.marquee.y1)}px;
								width: {Math.abs(canvas.marquee.x1 - canvas.marquee.x0)}px;
								height: {Math.abs(canvas.marquee.y1 - canvas.marquee.y0)}px;
							"
				></div>
			{/if}
		</div>
		<!-- Contextual selection toolbar -->
		{#if selectionScreen}
			{@const multi = canvas.selectedIds.length > 1}
			{@const hasChildren = canvas.items.some(
				(b) => canvas.selectedIds.includes(b.id) && b.children?.length > 0
			)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="selection-toolbar"
				class:flip={selectionScreen.flip}
				style="left: {selectionScreen.cx}px; top: {selectionScreen.anchorY}px;"
				onpointerdown={(e) => e.stopPropagation()}
				onwheel={(e) => e.stopPropagation()}
			>
				<button
					class="sel-btn"
					title="Duplicate (⌘D)"
					onclick={() => canvas.selectedId && canvas.duplicateBlock(canvas.selectedId)}
					aria-label="Duplicate"
				>
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="9" y="9" width="13" height="13" rx="2"></rect>
						<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
					</svg>
				</button>
				{#if multi}
					<button
						class="sel-btn"
						title="Group (⌘G)"
						onclick={() => canvas.groupSelected()}
						aria-label="Group"
					>
						<svg
							width="15"
							height="15"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect x="3" y="3" width="8" height="8" rx="1"></rect>
							<rect x="13" y="13" width="8" height="8" rx="1"></rect>
							<rect x="13" y="3" width="8" height="8" rx="1"></rect>
							<rect x="3" y="13" width="8" height="8" rx="1"></rect>
						</svg>
					</button>
				{:else if hasChildren}
					<button
						class="sel-btn"
						title="Ungroup (⌘⇧G)"
						onclick={() => canvas.ungroupSelected()}
						aria-label="Ungroup"
					>
						<svg
							width="15"
							height="15"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect x="3" y="3" width="7" height="7" rx="1"></rect>
							<rect x="14" y="14" width="7" height="7" rx="1"></rect>
						</svg>
					</button>
				{:else}
					<button
						class="sel-btn"
						title="Bring to front"
						onclick={() => canvas.selectedId && canvas.bringToFront(canvas.selectedId)}
						aria-label="Bring to front"
					>
						<svg
							width="15"
							height="15"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect x="7" y="7" width="12" height="12" rx="2"></rect>
							<path d="M5 15H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1"
							></path>
						</svg>
					</button>
				{/if}
				<div class="sel-divider"></div>
				<button
					class="sel-btn danger"
					title="Delete (⌫)"
					onclick={() => canvas.deleteSelected()}
					aria-label="Delete"
				>
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<polyline points="3 6 5 6 21 6"></polyline>
						<path
							d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
						></path>
					</svg>
				</button>
			</div>
		{/if}
		<!-- Floating Controls -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="canvas-floating-controls"
			onpointerdown={(e) => e.stopPropagation()}
			onwheel={(e) => e.stopPropagation()}
			oncontextmenu={(e) => e.stopPropagation()}
		>
			<button class="btn-floating" onclick={() => canvas.zoomOut()} title="Zoom Out">
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
				>
					<line x1="5" y1="12" x2="19" y2="12"></line>
				</svg>
			</button>
			<button
				class="blank zoom-display"
				onclick={() => canvas.resetZoom()}
				title="Reset Zoom to 100%"
			>
				{Math.round(canvas.viewport.zoom * 100)}%
			</button>
			<button class="btn-floating" onclick={() => canvas.zoomIn()} title="Zoom In">
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
				>
					<line x1="12" y1="5" x2="12" y2="19"></line>
					<line x1="5" y1="12" x2="19" y2="12"></line>
				</svg>
			</button>
			<div
				style="width: 1px; height: 16px; background: var(--border-primary); margin: 0 2px;"
			></div>
			<button class="btn-floating" onclick={() => canvas.centerView()} title="Center View">
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10"></circle>
					<circle cx="12" cy="12" r="3"></circle>
					<line x1="12" y1="1" x2="12" y2="3"></line>
					<line x1="12" y1="21" x2="12" y2="23"></line>
					<line x1="1" y1="12" x2="3" y2="12"></line>
					<line x1="21" y1="12" x2="23" y2="12"></line>
				</svg>
			</button>
		</div>
		{#if canvas.isDrawing && canvas.drawStartPos && canvas.drawCurrentPos}
			{@const px = Math.min(canvas.drawStartPos.x, canvas.drawCurrentPos.x)}
			{@const py = Math.min(canvas.drawStartPos.y, canvas.drawCurrentPos.y)}
			{@const pw = Math.abs(canvas.drawCurrentPos.x - canvas.drawStartPos.x)}
			{@const ph = Math.abs(canvas.drawCurrentPos.y - canvas.drawStartPos.y)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="canvas-draw-preview"
				style="left: {px}px; top: {py}px; width: {pw}px; height: {ph}px;"
				onpointerdown={(e) => e.stopPropagation()}
			></div>
		{/if}
		<!-- Canvas Dock -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="canvas-dock"
			onpointerdown={(e) => e.stopPropagation()}
			onwheel={(e) => e.stopPropagation()}
			oncontextmenu={(e) => e.stopPropagation()}
		>
			<!-- Tool toggles -->
			<button
				class="dock-btn"
				class:active={canvas.toolMode === 'arrow' && !canvas.drawTool}
				onclick={() => {
					canvas.toolMode = 'arrow';
					canvas.drawTool = null;
				}}
				title="Move (V)"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
					<path d="M13 13l6 6"></path>
				</svg>
			</button>
			<button
				class="dock-btn"
				class:active={canvas.toolMode === 'hand'}
				onclick={() => {
					canvas.toolMode = 'hand';
					canvas.drawTool = null;
				}}
				title="Hand (H)"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M18 11V6a2 2 0 0 0-4 0v-1a2 2 0 0 0-4 0v1a2 2 0 0 0-4 0v4"></path>
					<path d="M18 11V8a2 2 0 0 0-4 0v3"></path>
					<path d="M10 11V9a2 2 0 0 0-4 0v5a6 6 0 0 0 6 6h2a4 4 0 0 0 4-4v-4"></path>
				</svg>
			</button>

			<div class="dock-separator"></div>

			<!-- Frame -->
			<button
				class="dock-btn"
				class:active={canvas.drawTool === 'frame'}
				onclick={() => canvas.activateDrawTool('frame')}
				title="Frame (F)"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="4" y="4" width="16" height="16" rx="2"></rect>
				</svg>
			</button>

			<div class="dock-separator"></div>

			<!-- Shape tools group -->
			<div class="dock-tool-group">
				<button
					class="dock-btn dock-shape-btn"
					class:active={canvas.drawTool === activeShapeType}
					onclick={() => canvas.activateDrawTool(activeShapeType)}
					title={activeShapeType.charAt(0).toUpperCase() +
						activeShapeType.slice(1) +
						' (R/O/L)'}
				>
					{#if activeShapeType === 'rectangle'}
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="currentColor"
							stroke="none"
							><rect x="4" y="6" width="16" height="12" rx="2"></rect></svg
						>
					{:else if activeShapeType === 'ellipse'}
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="currentColor"
							stroke="none"><ellipse cx="12" cy="12" rx="8" ry="6"></ellipse></svg
						>
					{:else if activeShapeType === 'line'}
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"><line x1="4" y1="12" x2="20" y2="12"></line></svg
						>
					{:else if activeShapeType === 'arrow'}
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							><line x1="5" y1="12" x2="19" y2="12"></line><polyline
								points="15 8 19 12 15 16"
							></polyline></svg
						>
					{:else if activeShapeType === 'polygon'}
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="currentColor"
							stroke="none"
							><polygon points="12,3 20,8 20,17 12,22 4,17 4,8"></polygon></svg
						>
					{:else if activeShapeType === 'star'}
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="currentColor"
							stroke="none"
							><polygon
								points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9"
							></polygon></svg
						>
					{/if}
				</button>
				<button
					class="dock-chevron"
					onclick={(e) => {
						e.stopPropagation();
						shapeMenuOpen = !shapeMenuOpen;
					}}
					title="More shapes"
				>
					<svg
						width="10"
						height="10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"><polyline points="6 9 12 15 18 9"></polyline></svg
					>
				</button>
				{#if shapeMenuOpen}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="canvas-shape-dropdown" onpointerdown={(e) => e.stopPropagation()}>
						{#each ['rectangle', 'ellipse', 'line', 'arrow', 'polygon', 'star'] as ShapeType[] as shapeType (shapeType)}
							<button
								class="shape-option"
								class:active={activeShapeType === shapeType}
								onclick={() => {
									activeShapeType = shapeType;
									shapeMenuOpen = false;
									canvas.activateDrawTool(shapeType);
								}}
							>
								<span class="shape-icon">
									{#if shapeType === 'rectangle'}
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="currentColor"
											stroke="none"
											><rect x="4" y="6" width="16" height="12" rx="2"
											></rect></svg
										>
									{:else if shapeType === 'ellipse'}
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="currentColor"
											stroke="none"
											><ellipse cx="12" cy="12" rx="8" ry="6"></ellipse></svg
										>
									{:else if shapeType === 'line'}
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2.5"
											stroke-linecap="round"
											><line x1="4" y1="12" x2="20" y2="12"></line></svg
										>
									{:else if shapeType === 'arrow'}
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2.5"
											stroke-linecap="round"
											stroke-linejoin="round"
											><line x1="5" y1="12" x2="19" y2="12"></line><polyline
												points="15 8 19 12 15 16"
											></polyline></svg
										>
									{:else if shapeType === 'polygon'}
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="currentColor"
											stroke="none"
											><polygon points="12,3 20,8 20,17 12,22 4,17 4,8"
											></polygon></svg
										>
									{:else if shapeType === 'star'}
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="currentColor"
											stroke="none"
											><polygon
												points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9"
											></polygon></svg
										>
									{/if}
								</span>
								<span class="shape-label"
									>{shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}</span
								>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Text -->
			<button
				class="dock-btn"
				class:active={canvas.drawTool === 'text'}
				onclick={() => canvas.activateDrawTool('text')}
				title="Text (T)"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="4 7 4 4 20 4 20 7"></polyline>
					<line x1="9" y1="20" x2="15" y2="20"></line>
					<line x1="12" y1="4" x2="12" y2="20"></line>
				</svg>
			</button>

			<div class="dock-separator"></div>

			<!-- Command Palette -->
			<button
				class="dock-btn"
				onclick={() => (paletteOpen = !paletteOpen)}
				title="Commands (⌘K)"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path
						d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
					></path>
				</svg>
			</button>
		</div>
	</div>

	{#if !native.rightbarCollapsed}
		<aside
			class="panel rightbar"
			style="width: {rightbarW}px"
			in:slide={{ axis: 'x', easing: quadOut, duration: 300 }}
			out:slide={{ axis: 'x', easing: quintInOut }}
		>
			<div class="rightbar-tabs row gap16">
				<button onclick={toggleRightbarTabs}>Styler</button>
				<button onclick={toggleRightbarTabs}>Extract</button>
				<button class="blank" disabled={!canvas.canUndo} onclick={() => canvas.undo()}
					>Undo</button
				>
				<button class="blank" disabled={!canvas.canRedo} onclick={() => canvas.redo()}
					>Redo</button
				>
			</div>
			{#if rightbarTabsToggled}
			<div class="box agent"><CodePanel /></div>
			{:else}
			<div class="box pad16 gap12">
				<h3>Inspector</h3>
				{#if canvas.selectedIds.length > 0}
					<div class="inspector-align-toolbar">
						<button
							class="btn-align"
							onclick={() => canvas.alignLeft()}
							title="Align Left"
						>
							<svg
								viewBox="0 0 24 24"
								width="16"
								height="16"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<line x1="4" y1="2" x2="4" y2="22"></line>
								<rect x="7" y="5" width="10" height="4" rx="1"></rect>
								<rect x="7" y="15" width="14" height="4" rx="1"></rect>
							</svg>
						</button>
						<button
							class="btn-align"
							onclick={() => canvas.alignHorizontalCenter()}
							title="Align Horizontal Center"
						>
							<svg
								viewBox="0 0 24 24"
								width="16"
								height="16"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<line x1="12" y1="2" x2="12" y2="22"></line>
								<rect x="7" y="5" width="10" height="4" rx="1"></rect>
								<rect x="5" y="15" width="14" height="4" rx="1"></rect>
							</svg>
						</button>
						<button
							class="btn-align"
							onclick={() => canvas.alignRight()}
							title="Align Right"
						>
							<svg
								viewBox="0 0 24 24"
								width="16"
								height="16"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<line x1="20" y1="2" x2="20" y2="22"></line>
								<rect x="7" y="5" width="10" height="4" rx="1"></rect>
								<rect x="3" y="15" width="14" height="4" rx="1"></rect>
							</svg>
						</button>
						<button
							class="btn-align"
							onclick={() => canvas.alignTop()}
							title="Align Top"
						>
							<svg
								viewBox="0 0 24 24"
								width="16"
								height="16"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<line x1="2" y1="4" x2="22" y2="4"></line>
								<rect x="5" y="7" width="4" height="10" rx="1"></rect>
								<rect x="15" y="7" width="4" height="14" rx="1"></rect>
							</svg>
						</button>
						<button
							class="btn-align"
							onclick={() => canvas.alignVerticalCenter()}
							title="Align Vertical Center"
						>
							<svg
								viewBox="0 0 24 24"
								width="16"
								height="16"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<line x1="2" y1="12" x2="22" y2="12"></line>
								<rect x="5" y="7" width="4" height="10" rx="1"></rect>
								<rect x="15" y="5" width="4" height="14" rx="1"></rect>
							</svg>
						</button>
						<button
							class="btn-align"
							onclick={() => canvas.alignBottom()}
							title="Align Bottom"
						>
							<svg
								viewBox="0 0 24 24"
								width="16"
								height="16"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<line x1="2" y1="20" x2="22" y2="20"></line>
								<rect x="5" y="7" width="4" height="10" rx="1"></rect>
								<rect x="15" y="3" width="4" height="14" rx="1"></rect>
							</svg>
						</button>
						<button
							class="btn-align"
							onclick={() => canvas.distributeHorizontally()}
							disabled={canvas.selectedIds.length < 3}
							title="Distribute Horizontally"
						>
							<svg
								viewBox="0 0 24 24"
								width="16"
								height="16"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<rect x="3" y="6" width="3" height="12" rx="0.5"></rect>
								<rect x="10" y="6" width="4" height="12" rx="0.5"></rect>
								<rect x="18" y="6" width="3" height="12" rx="0.5"></rect>
							</svg>
						</button>
						<button
							class="btn-align"
							onclick={() => canvas.distributeVertically()}
							disabled={canvas.selectedIds.length < 3}
							title="Distribute Vertically"
						>
							<svg
								viewBox="0 0 24 24"
								width="16"
								height="16"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<rect x="6" y="3" width="12" height="3" rx="0.5"></rect>
								<rect x="6" y="10" width="12" height="4" rx="0.5"></rect>
								<rect x="6" y="18" width="12" height="3" rx="0.5"></rect>
							</svg>
						</button>
					</div>
				{/if}

				{#if selectedBlock}
					<!-- Block name, size, type -->
					<div class="inspector-section">
						<span class="section-title">Block Properties</span>
						<div class="styling-grid">
							<div class="input-container">
								<label for="block-name-input">Name</label>
								<input
									id="block-name-input"
									type="text"
									value={selectedBlock.name}
									onchange={(e) =>
										canvas.updateBlockStyleWithUndo(
											selectedBlock.id,
											'name',
											e.currentTarget.value
										)}
								/>
							</div>
							<div class="input-container">
								<label for="block-type-select">Type</label>
								<select id="block-type-select" disabled>
									<option>{selectedBlock.type}</option>
								</select>
							</div>
						</div>
						<div class="styling-grid">
							<div class="input-container">
								<label for="block-width-input">Width (px)</label>
								<input
									id="block-width-input"
									type="number"
									value={selectedBlock.w}
									onchange={(e) =>
										canvas.updateBlockStyleWithUndo(
											selectedBlock.id,
											'w',
											e.currentTarget.value
										)}
								/>
							</div>
							<div class="input-container">
								<label for="block-height-input">Height (px)</label>
								<input
									id="block-height-input"
									type="number"
									value={selectedBlock.h}
									onchange={(e) =>
										canvas.updateBlockStyleWithUndo(
											selectedBlock.id,
											'h',
											e.currentTarget.value
										)}
								/>
							</div>
						</div>
						<div class="styling-grid">
							<div class="input-container">
								<label for="block-x-input">X (px)</label>
								<input
									id="block-x-input"
									type="number"
									value={Math.round(selectedBlock.x)}
									onchange={(e) =>
										canvas.updateBlockStyleWithUndo(
											selectedBlock.id,
											'x',
											e.currentTarget.value
										)}
								/>
							</div>
							<div class="input-container">
								<label for="block-y-input">Y (px)</label>
								<input
									id="block-y-input"
									type="number"
									value={Math.round(selectedBlock.y)}
									onchange={(e) =>
										canvas.updateBlockStyleWithUndo(
											selectedBlock.id,
											'y',
											e.currentTarget.value
										)}
								/>
							</div>
						</div>
						<div class="input-container">
							<label for="block-rotation-input"
								>Rotation ({selectedBlock.rotation || 0}°)</label
							>
							<input
								id="block-rotation-input"
								type="range"
								min="-180"
								max="180"
								value={selectedBlock.rotation || 0}
								onpointerdown={() => canvas.recordGestureStart()}
								oninput={(e) =>
									canvas.updateBlockStyle(
										selectedBlock.id,
										'rotation',
										Number(e.currentTarget.value)
									)}
								onpointerup={() => canvas.commitGesture()}
							/>
						</div>
						{#if selectedBlock.type === 'frame' || selectedBlock.type === 'container'}
							<div class="box gap4 padtop4">
								<label class="row ycenter gap8 cursor-pointer text-xs">
									<input
										type="checkbox"
										checked={selectedBlock.style.overflow !== 'visible'}
										onchange={() => canvas.toggleClip(selectedBlock.id)}
									/>
									<span>Clip content (overflow: hidden)</span>
								</label>
							</div>
						{/if}
					</div>

					<!-- Opacity -->
					{@const currentOpacity = parseFloat(String(selectedBlock.style.opacity ?? '1'))}
					<div class="inspector-section">
						<span class="section-title">Opacity</span>
						<div class="row ycenter gap16">
							<input
								type="range"
								min="0"
								max="100"
								style="flex: 1;"
								value={Math.round(currentOpacity * 100)}
								onpointerdown={() => canvas.recordGestureStart()}
								oninput={(e) =>
									canvas.updateBlockStyle(
										selectedBlock.id,
										'opacity',
										Number(e.currentTarget.value) / 100
									)}
								onpointerup={() => canvas.commitGesture()}
								aria-label="Opacity range"
							/>
							<div class="input-container" style="width: 50px;">
								<input
									type="number"
									min="0"
									max="100"
									value={Math.round(currentOpacity * 100)}
									onchange={(e) =>
										canvas.updateBlockStyleWithUndo(
											selectedBlock.id,
											'opacity',
											Number(e.currentTarget.value) / 100
										)}
									aria-label="Opacity percentage"
								/>
							</div>
						</div>
					</div>

					<!-- Fill Color & Gradient -->
					{@const bgParsed = parseBackground(selectedBlock.style.background)}
					<div class="inspector-section">
						<div class="row xbetween ycenter">
							<span class="section-title">Fill</span>
							<select
								value={bgParsed.mode}
								onchange={(e) => {
									if (e.currentTarget.value === 'gradient') {
										canvas.updateBlockStyleWithUndo(
											selectedBlock.id,
											'background',
											`linear-gradient(${bgParsed.angle}deg, ${bgParsed.colorStart}, ${bgParsed.colorEnd})`
										);
									} else {
										canvas.updateBlockStyleWithUndo(
											selectedBlock.id,
											'background',
											bgParsed.color
										);
									}
								}}
								style="width: 80px; height: 22px; font-size: 11px; padding: 2px 4px;"
								aria-label="Fill mode"
							>
								<option value="solid">Solid</option>
								<option value="gradient">Gradient</option>
							</select>
						</div>

						{#if bgParsed.mode === 'solid'}
							<div class="color-swatch-container">
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="color-swatch"
									style:background={bgParsed.color}
									onclick={() =>
										(canvas.activePopoverId =
											canvas.activePopoverId === 'fill' ? null : 'fill')}
								></div>
								<span class="text-sm col2">{bgParsed.color}</span>
							</div>
						{:else}
							<div class="box gap8">
								<div class="row gap16">
									<div class="color-swatch-container">
										<!-- svelte-ignore a11y_click_events_have_key_events -->
										<!-- svelte-ignore a11y_no_static_element_interactions -->
										<div
											class="color-swatch"
											style:background={bgParsed.colorStart}
											onclick={() =>
												(canvas.activePopoverId =
													canvas.activePopoverId === 'fill-start'
														? null
														: 'fill-start')}
										></div>
										<span class="text-xs col3">Start</span>
									</div>

									<div class="color-swatch-container">
										<!-- svelte-ignore a11y_click_events_have_key_events -->
										<!-- svelte-ignore a11y_no_static_element_interactions -->
										<div
											class="color-swatch"
											style:background={bgParsed.colorEnd}
											onclick={() =>
												(canvas.activePopoverId =
													canvas.activePopoverId === 'fill-end'
														? null
														: 'fill-end')}
										></div>
										<span class="text-xs col3">End</span>
									</div>
								</div>

								<div class="input-container">
									<label for="fill-angle-range">Angle: {bgParsed.angle}°</label>
									<input
										id="fill-angle-range"
										type="range"
										min="0"
										max="360"
										value={bgParsed.angle}
										onpointerdown={() => canvas.recordGestureStart()}
										oninput={(e) =>
											canvas.updateBlockStyle(
												selectedBlock.id,
												'background',
												`linear-gradient(${e.currentTarget.value}deg, ${bgParsed.colorStart}, ${bgParsed.colorEnd})`
											)}
										onpointerup={() => canvas.commitGesture()}
									/>
								</div>
							</div>
						{/if}
					</div>

					<!-- Shadow -->
					{@const shadowParsed = parseShadow(selectedBlock.style)}
					<div class="inspector-section">
						<div class="row xbetween ycenter">
							<span class="section-title">Shadow</span>
							<label class="row ycenter gap4 cursor-pointer text-xs">
								<input
									type="checkbox"
									checked={shadowParsed.enabled}
									onchange={(e) => {
										if (e.currentTarget.checked) {
											canvas.updateBlockStyleWithUndo(
												selectedBlock.id,
												'boxShadow',
												buildShadowString({
													inset: false,
													x: 0,
													y: 4,
													blur: 12,
													spread: 0,
													color: '#000000',
													opacity: 10
												})
											);
										} else {
											canvas.updateBlockStyleWithUndo(
												selectedBlock.id,
												'boxShadow',
												''
											);
										}
									}}
								/>
								<span>{shadowParsed.enabled ? 'On' : 'Off'}</span>
							</label>
						</div>

						{#if shadowParsed.enabled}
							<div class="row ycenter gap8 padtop4">
								<label class="row ycenter gap4 cursor-pointer text-xs">
									<input
										type="checkbox"
										checked={shadowParsed.inset}
										onchange={(e) => {
											const s = {
												...shadowParsed,
												inset: e.currentTarget.checked
											};
											canvas.updateBlockStyleWithUndo(
												selectedBlock.id,
												'boxShadow',
												buildShadowString(s)
											);
										}}
									/>
									<span>Inset</span>
								</label>
							</div>
							<div class="styling-grid four-cols">
								<div class="input-container">
									<label for="shadow-x-input">X</label>
									<input
										id="shadow-x-input"
										type="number"
										value={shadowParsed.x}
										onchange={(e) => {
											const s = {
												...shadowParsed,
												x: Number(e.currentTarget.value)
											};
											canvas.updateBlockStyleWithUndo(
												selectedBlock.id,
												'boxShadow',
												buildShadowString(s)
											);
										}}
									/>
								</div>
								<div class="input-container">
									<label for="shadow-y-input">Y</label>
									<input
										id="shadow-y-input"
										type="number"
										value={shadowParsed.y}
										onchange={(e) => {
											const s = {
												...shadowParsed,
												y: Number(e.currentTarget.value)
											};
											canvas.updateBlockStyleWithUndo(
												selectedBlock.id,
												'boxShadow',
												buildShadowString(s)
											);
										}}
									/>
								</div>
								<div class="input-container">
									<label for="shadow-blur-input">Blur</label>
									<input
										id="shadow-blur-input"
										type="number"
										min="0"
										value={shadowParsed.blur}
										onchange={(e) => {
											const s = {
												...shadowParsed,
												blur: Math.max(0, Number(e.currentTarget.value))
											};
											canvas.updateBlockStyleWithUndo(
												selectedBlock.id,
												'boxShadow',
												buildShadowString(s)
											);
										}}
									/>
								</div>
								<div class="input-container">
									<label for="shadow-spread-input">Spread</label>
									<input
										id="shadow-spread-input"
										type="number"
										value={shadowParsed.spread}
										onchange={(e) => {
											const s = {
												...shadowParsed,
												spread: Number(e.currentTarget.value)
											};
											canvas.updateBlockStyleWithUndo(
												selectedBlock.id,
												'boxShadow',
												buildShadowString(s)
											);
										}}
									/>
								</div>
							</div>
							<div class="row ycenter xbetween" style="gap: 8px;">
								<div class="color-swatch-container">
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										class="color-swatch"
										style:background={shadowParsed.color}
										onclick={() =>
											(canvas.activePopoverId =
												canvas.activePopoverId === 'shadow-color'
													? null
													: 'shadow-color')}
									></div>
									<span class="text-sm col2">{shadowParsed.color}</span>
								</div>
								<div class="input-container" style="width: 60px;">
									<label for="shadow-opacity-input">Opacity</label>
									<input
										id="shadow-opacity-input"
										type="number"
										min="0"
										max="100"
										value={shadowParsed.opacity}
										onchange={(e) => {
											const s = {
												...shadowParsed,
												opacity: Number(e.currentTarget.value)
											};
											canvas.updateBlockStyleWithUndo(
												selectedBlock.id,
												'boxShadow',
												buildShadowString(s)
											);
										}}
									/>
								</div>
							</div>
						{/if}
					</div>

					<!-- Border Radius -->
					{@const radiusParsed = getRadius(selectedBlock.style)}
					<div class="inspector-section">
						<div class="row xbetween ycenter">
							<span class="section-title">Corner Radius</span>
							<label class="row ycenter gap4 cursor-pointer text-xs">
								<input
									type="checkbox"
									checked={radiusParsed.isIndividual}
									onchange={(e) => {
										if (e.currentTarget.checked) {
											canvas.recordGestureStart();
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderRadius',
												''
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderTopLeftRadius',
												`${radiusParsed.unified}px`
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderTopRightRadius',
												`${radiusParsed.unified}px`
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderBottomRightRadius',
												`${radiusParsed.unified}px`
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderBottomLeftRadius',
												`${radiusParsed.unified}px`
											);
											canvas.commitGesture();
										} else {
											canvas.recordGestureStart();
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderRadius',
												`${radiusParsed.tl}px`
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderTopLeftRadius',
												''
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderTopRightRadius',
												''
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderBottomRightRadius',
												''
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderBottomLeftRadius',
												''
											);
											canvas.commitGesture();
										}
									}}
								/>
								<span>Split</span>
							</label>
						</div>

						{#if radiusParsed.isIndividual}
							<div class="styling-grid four-cols">
								<div class="input-container">
									<label for="corner-tl-input">TL</label>
									<input
										id="corner-tl-input"
										type="number"
										value={radiusParsed.tl}
										onchange={(e) =>
											canvas.updateBlockStyleWithUndo(
												selectedBlock.id,
												'borderTopLeftRadius',
												`${e.currentTarget.value}px`
											)}
									/>
								</div>
								<div class="input-container">
									<label for="corner-tr-input">TR</label>
									<input
										id="corner-tr-input"
										type="number"
										value={radiusParsed.tr}
										onchange={(e) =>
											canvas.updateBlockStyleWithUndo(
												selectedBlock.id,
												'borderTopRightRadius',
												`${e.currentTarget.value}px`
											)}
									/>
								</div>
								<div class="input-container">
									<label for="corner-br-input">BR</label>
									<input
										id="corner-br-input"
										type="number"
										value={radiusParsed.br}
										onchange={(e) =>
											canvas.updateBlockStyleWithUndo(
												selectedBlock.id,
												'borderBottomRightRadius',
												`${e.currentTarget.value}px`
											)}
									/>
								</div>
								<div class="input-container">
									<label for="corner-bl-input">BL</label>
									<input
										id="corner-bl-input"
										type="number"
										value={radiusParsed.bl}
										onchange={(e) =>
											canvas.updateBlockStyleWithUndo(
												selectedBlock.id,
												'borderBottomLeftRadius',
												`${e.currentTarget.value}px`
											)}
									/>
								</div>
							</div>
						{:else}
							<div class="input-container">
								<label for="corner-all-input">All Corners (px)</label>
								<input
									id="corner-all-input"
									type="number"
									value={radiusParsed.unified}
									onchange={(e) =>
										canvas.updateBlockStyleWithUndo(
											selectedBlock.id,
											'borderRadius',
											`${e.currentTarget.value}px`
										)}
								/>
							</div>
						{/if}
					</div>

					<!-- Strokes -->
					{@const borderParsed = getBorder(selectedBlock.style)}
					<div class="inspector-section">
						<div class="row xbetween ycenter">
							<span class="section-title">Strokes</span>
							<label class="row ycenter gap4 cursor-pointer text-xs">
								<input
									type="checkbox"
									checked={borderParsed.isIndividual}
									onchange={(e) => {
										if (e.currentTarget.checked) {
											canvas.recordGestureStart();
											canvas.updateBlockStyle(selectedBlock.id, 'border', '');
											const uStr = `${borderParsed.unified.width}px ${borderParsed.unified.style} ${borderParsed.unified.color}`;
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderTop',
												uStr
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderRight',
												uStr
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderBottom',
												uStr
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderLeft',
												uStr
											);
											canvas.commitGesture();
										} else {
											canvas.recordGestureStart();
											const tStr = `${borderParsed.top.width}px ${borderParsed.top.style} ${borderParsed.top.color}`;
											canvas.updateBlockStyle(
												selectedBlock.id,
												'border',
												tStr
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderTop',
												''
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderRight',
												''
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderBottom',
												''
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'borderLeft',
												''
											);
											canvas.commitGesture();
										}
									}}
								/>
								<span>Split</span>
							</label>
						</div>

						{#if borderParsed.isIndividual}
							<div class="box gap8">
								{#each ['Top', 'Right', 'Bottom', 'Left'] as side}
									{@const sideKey = `border${side}`}
									{@const sideData =
										borderParsed[
											side.toLowerCase() as
												| 'top'
												| 'right'
												| 'bottom'
												| 'left'
										]}
									<div class="row ycenter xbetween" style="gap: 8px;">
										<span class="text-xs col3" style="width: 44px;">{side}</span
										>
										<div
											class="row ycenter gap8"
											style="flex: 1; justify-content: flex-end;"
										>
											<input
												type="number"
												value={sideData.width}
												onchange={(e) =>
													canvas.updateBlockStyleWithUndo(
														selectedBlock.id,
														sideKey,
														`${e.currentTarget.value}px ${sideData.style} ${sideData.color}`
													)}
												style="width: 44px; height: 22px; padding: 2px 4px; font-size: 11px;"
												placeholder="0"
												aria-label={`${side} border width`}
											/>
											<select
												value={sideData.style}
												onchange={(e) =>
													canvas.updateBlockStyleWithUndo(
														selectedBlock.id,
														sideKey,
														`${sideData.width}px ${e.currentTarget.value} ${sideData.color}`
													)}
												style="width: 66px; height: 22px; padding: 2px; font-size: 11px;"
												aria-label={`${side} border style`}
											>
												<option value="solid">solid</option>
												<option value="dashed">dashed</option>
												<option value="dotted">dotted</option>
											</select>
											<div class="color-swatch-container">
												<!-- svelte-ignore a11y_click_events_have_key_events -->
												<!-- svelte-ignore a11y_no_static_element_interactions -->
												<div
													class="color-swatch"
													style:background={sideData.color}
													onclick={() =>
														(canvas.activePopoverId =
															canvas.activePopoverId ===
															`stroke-${side.toLowerCase()}`
																? null
																: `stroke-${side.toLowerCase()}`)}
												></div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="row ycenter xbetween" style="gap: 8px;">
								<input
									type="number"
									value={borderParsed.unified.width}
									onchange={(e) =>
										canvas.updateBlockStyleWithUndo(
											selectedBlock.id,
											'border',
											`${e.currentTarget.value}px ${borderParsed.unified.style} ${borderParsed.unified.color}`
										)}
									style="width: 44px; height: 22px; padding: 2px 4px; font-size: 11px;"
									placeholder="0"
									aria-label="Border width"
								/>
								<select
									value={borderParsed.unified.style}
									onchange={(e) =>
										canvas.updateBlockStyleWithUndo(
											selectedBlock.id,
											'border',
											`${borderParsed.unified.width}px ${e.currentTarget.value} ${borderParsed.unified.color}`
										)}
									style="width: 70px; height: 22px; padding: 2px; font-size: 11px;"
									aria-label="Border style"
								>
									<option value="solid">solid</option>
									<option value="dashed">dashed</option>
									<option value="dotted">dotted</option>
								</select>
								<div class="color-swatch-container">
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										class="color-swatch"
										style:background={borderParsed.unified.color}
										onclick={() =>
											(canvas.activePopoverId =
												canvas.activePopoverId === 'stroke-all'
													? null
													: 'stroke-all')}
									></div>
								</div>
							</div>
						{/if}
					</div>

					<!-- Padding -->
					{@const paddingParsed = getPadding(selectedBlock.style)}
					<div class="inspector-section">
						<div class="row xbetween ycenter">
							<span class="section-title">Padding</span>
							<label class="row ycenter gap4 cursor-pointer text-xs">
								<input
									type="checkbox"
									checked={paddingParsed.isIndividual}
									onchange={(e) => {
										if (e.currentTarget.checked) {
											canvas.recordGestureStart();
											canvas.updateBlockStyle(
												selectedBlock.id,
												'padding',
												''
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'paddingTop',
												`${paddingParsed.unified}px`
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'paddingRight',
												`${paddingParsed.unified}px`
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'paddingBottom',
												`${paddingParsed.unified}px`
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'paddingLeft',
												`${paddingParsed.unified}px`
											);
											canvas.commitGesture();
										} else {
											canvas.recordGestureStart();
											canvas.updateBlockStyle(
												selectedBlock.id,
												'padding',
												`${paddingParsed.top}px`
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'paddingTop',
												''
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'paddingRight',
												''
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'paddingBottom',
												''
											);
											canvas.updateBlockStyle(
												selectedBlock.id,
												'paddingLeft',
												''
											);
											canvas.commitGesture();
										}
									}}
								/>
								<span>Split</span>
							</label>
						</div>

						{#if paddingParsed.isIndividual}
							<div class="styling-grid four-cols">
								<div class="input-container">
									<label for="padding-top-input">Top</label>
									<input
										id="padding-top-input"
										type="number"
										value={paddingParsed.top}
										onchange={(e) =>
											canvas.updateBlockStyleWithUndo(
												selectedBlock.id,
												'paddingTop',
												`${e.currentTarget.value}px`
											)}
									/>
								</div>
								<div class="input-container">
									<label for="padding-right-input">Right</label>
									<input
										id="padding-right-input"
										type="number"
										value={paddingParsed.right}
										onchange={(e) =>
											canvas.updateBlockStyleWithUndo(
												selectedBlock.id,
												'paddingRight',
												`${e.currentTarget.value}px`
											)}
									/>
								</div>
								<div class="input-container">
									<label for="padding-bottom-input">Bottom</label>
									<input
										id="padding-bottom-input"
										type="number"
										value={paddingParsed.bottom}
										onchange={(e) =>
											canvas.updateBlockStyleWithUndo(
												selectedBlock.id,
												'paddingBottom',
												`${e.currentTarget.value}px`
											)}
									/>
								</div>
								<div class="input-container">
									<label for="padding-left-input">Left</label>
									<input
										id="padding-left-input"
										type="number"
										value={paddingParsed.left}
										onchange={(e) =>
											canvas.updateBlockStyleWithUndo(
												selectedBlock.id,
												'paddingLeft',
												`${e.currentTarget.value}px`
											)}
									/>
								</div>
							</div>
						{:else}
							<div class="input-container">
								<label for="padding-all-input">All Sides (px)</label>
								<input
									id="padding-all-input"
									type="number"
									value={paddingParsed.unified}
									onchange={(e) =>
										canvas.updateBlockStyleWithUndo(
											selectedBlock.id,
											'padding',
											`${e.currentTarget.value}px`
										)}
								/>
							</div>
						{/if}
					</div>
				{:else}
					<p class="text-sm col3 italic">
						Select an element on the canvas to inspect it.
					</p>
				{/if}

				<div class="row gap8 padtop12" style="border-top: 1px solid var(--border-primary)">
					<button
						class="btn-icon"
						disabled={!canvas.canUndo}
						onclick={() => canvas.undo()}
					>
						Undo
					</button>
					<button
						class="btn-icon"
						disabled={!canvas.canRedo}
						onclick={() => canvas.redo()}
					>
						Redo
					</button>
				</div>
				<div class="box gap4 text-sm padtop12 col3">
					<p>Zoom: {Math.round(canvas.viewport.zoom * 100)}%</p>
					<p>
						Pan: ({Math.round(canvas.viewport.x)}px, {Math.round(canvas.viewport.y)}px)
					</p>
				</div>
			</div>
			{/if}
		<div
			class="resize-handle left"
			role="separator"
			aria-orientation="vertical"
			aria-label="Resize rightbar"
			onpointerdown={(e) => startResize('rightbar', e)}
			onpointermove={onMove}
			onpointerup={endResize}
			onpointercancel={endResize}
		></div>
		</aside>
	{/if}
</section>

{#if canvas.contextMenu}
	{@const activeBlock = canvas.items.find((b) => b.id === canvas.contextMenu?.blockId)}
	{#if activeBlock}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="canvas-context-menu"
			style="left: {canvas.contextMenu.x}px; top: {canvas.contextMenu.y}px;"
			onpointerdown={(e) => e.stopPropagation()}
		>
			{#if canvas.selectedIds.length > 1 && canvas.selectedIds.includes(activeBlock.id)}
				<div class="context-menu-item header-item">
					{canvas.selectedIds.length} Selected Layers
				</div>
				<button class="context-menu-item" onclick={() => canvas.groupSelected()}>
					<span>Group Selection</span>
					<span class="col3">Cmd+G</span>
				</button>
				{#if canvas.items.some((b) => canvas.selectedIds.includes(b.id) && b.children && b.children.length > 0)}
					<button class="context-menu-item" onclick={() => canvas.ungroupSelected()}>
						<span>Ungroup Selection</span>
						<span class="col3">Cmd+Shift+G</span>
					</button>
				{/if}
				<button class="context-menu-item" onclick={() => canvas.copySelected()}>
					<span>Copy Selection</span>
					<span class="col3">Cmd+C</span>
				</button>
				<button class="context-menu-item" onclick={() => canvas.cutSelected()}>
					<span>Cut Selection</span>
					<span class="col3">Cmd+X</span>
				</button>
				<div class="context-menu-divider"></div>
				<button class="context-menu-item" onclick={() => canvas.copyStyle(activeBlock.id)}>
					<span>Copy Style</span>
					<span class="col3">Cmd+Opt+C</span>
				</button>
				<button
					class="context-menu-item"
					disabled={!canvas.styleClipboard}
					onclick={() => canvas.pasteStyle(activeBlock.id)}
				>
					<span>Paste Style</span>
					<span class="col3">Cmd+Opt+V</span>
				</button>
				<div class="context-menu-divider"></div>
				<button
					class="context-menu-item danger-item"
					onclick={() => canvas.deleteSelected()}
				>
					<span>Delete Selection</span>
					<span class="col3">Backspace</span>
				</button>
			{:else}
				<div class="context-menu-item header-item">{activeBlock.name}</div>
				<button
					class="context-menu-item"
					onclick={() => canvas.renameBlock(activeBlock.id)}
				>
					<span>Rename...</span>
				</button>
				<button class="context-menu-item" onclick={() => canvas.toggleLock(activeBlock.id)}>
					<span>{activeBlock.locked ? 'Unlock' : 'Lock'}</span>
				</button>
				{#if activeBlock.children && activeBlock.children.length > 0}
					<button class="context-menu-item" onclick={() => canvas.ungroupSelected()}>
						<span>Ungroup</span>
						<span class="col3">Cmd+Shift+G</span>
					</button>
				{/if}
				<button
					class="context-menu-item"
					disabled={activeBlock.locked}
					onclick={() => canvas.duplicateBlock(activeBlock.id)}
				>
					<span>Duplicate</span>
					<span class="col3">Cmd+D</span>
				</button>
				<button
					class="context-menu-item"
					disabled={activeBlock.locked}
					onclick={() => canvas.copyBlock(activeBlock.id)}
				>
					<span>Copy</span>
					<span class="col3">Cmd+C</span>
				</button>
				<button
					class="context-menu-item"
					disabled={activeBlock.locked}
					onclick={() => canvas.cutBlock(activeBlock.id)}
				>
					<span>Cut</span>
					<span class="col3">Cmd+X</span>
				</button>
				<button
					class="context-menu-item"
					disabled={!canvas.clipboard ||
						(activeBlock.type !== 'frame' && activeBlock.type !== 'container')}
					onclick={() => canvas.pasteBlock(activeBlock.id)}
				>
					<span>Paste Into</span>
					<span class="col3">Cmd+V</span>
				</button>
				<div class="context-menu-divider"></div>
				<button class="context-menu-item" onclick={() => canvas.copyStyle(activeBlock.id)}>
					<span>Copy Style</span>
					<span class="col3">Cmd+Opt+C</span>
				</button>
				<button
					class="context-menu-item"
					disabled={!canvas.styleClipboard}
					onclick={() => canvas.pasteStyle(activeBlock.id)}
				>
					<span>Paste Style</span>
					<span class="col3">Cmd+Opt+V</span>
				</button>
				<div class="context-menu-divider"></div>
				<button
					class="context-menu-item"
					onclick={() => canvas.bringToFront(activeBlock.id)}
				>
					<span>Bring to Front</span>
				</button>
				<button
					class="context-menu-item"
					onclick={() => canvas.moveForward(activeBlock.id)}
				>
					<span>Move Forward</span>
					<span class="col3">Cmd+]</span>
				</button>
				<button
					class="context-menu-item"
					onclick={() => canvas.moveBackward(activeBlock.id)}
				>
					<span>Move Backward</span>
					<span class="col3">Cmd+[</span>
				</button>
				<button class="context-menu-item" onclick={() => canvas.sendToBack(activeBlock.id)}>
					<span>Send to Back</span>
				</button>
				<button
					class="context-menu-item danger-item"
					disabled={activeBlock.locked}
					onclick={() => canvas.deleteBlock(activeBlock.id)}
				>
					<span>Delete</span>
					<span class="col3">Backspace</span>
				</button>
			{/if}
		</div>
	{:else if canvas.contextMenu.blockId === null}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="canvas-context-menu"
			style="left: {canvas.contextMenu.x}px; top: {canvas.contextMenu.y}px;"
			onpointerdown={(e) => e.stopPropagation()}
		>
			<div class="context-menu-item header-item">Canvas Background</div>
			<button
				class="context-menu-item"
				disabled={!canvas.clipboard}
				onclick={() => canvas.pasteBlock(null)}
			>
				<span>Paste</span>
				<span class="col3">Cmd+V</span>
			</button>
			<button
				class="context-menu-item"
				onclick={() =>
					canvas.insertBlock('text', canvas.contextMenu!.x, canvas.contextMenu!.y)}
			>
				<span>Insert Text</span>
			</button>
			<button
				class="context-menu-item"
				onclick={() =>
					canvas.insertBlock('card', canvas.contextMenu!.x, canvas.contextMenu!.y)}
			>
				<span>Insert Card</span>
			</button>
			<button
				class="context-menu-item"
				onclick={() =>
					canvas.insertBlock('frame', canvas.contextMenu!.x, canvas.contextMenu!.y)}
			>
				<span>Insert Frame</span>
			</button>
			<button
				class="context-menu-item"
				onclick={() =>
					canvas.insertBlock('container', canvas.contextMenu!.x, canvas.contextMenu!.y)}
			>
				<span>Insert Container</span>
			</button>
		</div>
	{/if}
{/if}

{#if canvas.activePopoverId && selectedBlock}
	{@const bgParsed = parseBackground(selectedBlock.style.background)}
	{@const borderParsed = getBorder(selectedBlock.style)}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="color-picker-popover"
		style="right: {surface.sidebarRCollapsed
			? 20
			: (sidebarREl?.getBoundingClientRect().width ?? 320) + 16}px; top: 150px;"
		onpointerdown={(e) => e.stopPropagation()}
	>
		<div
			class="row xbetween ycenter padbot8"
			style="border-bottom: 1px solid var(--border-primary); margin-bottom: 8px;"
		>
			<span class="text-xs font-semibold col2">Color Picker</span>
			<button
				class="btn-close-popover"
				onclick={() => (canvas.activePopoverId = null)}
				aria-label="Close color picker"
			>
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>

		{#if canvas.activePopoverId === 'fill'}
			<ColorSpectrumPicker
				value={bgParsed.color}
				onchange={(val) => canvas.updateBlockStyle(selectedBlock.id, 'background', val)}
			/>
		{:else if canvas.activePopoverId === 'fill-start'}
			<ColorSpectrumPicker
				value={bgParsed.colorStart}
				onchange={(val) =>
					canvas.updateBlockStyle(
						selectedBlock.id,
						'background',
						`linear-gradient(${bgParsed.angle}deg, ${val}, ${bgParsed.colorEnd})`
					)}
			/>
		{:else if canvas.activePopoverId === 'fill-end'}
			<ColorSpectrumPicker
				value={bgParsed.colorEnd}
				onchange={(val) =>
					canvas.updateBlockStyle(
						selectedBlock.id,
						'background',
						`linear-gradient(${bgParsed.angle}deg, ${bgParsed.colorStart}, ${val})`
					)}
			/>
		{:else if canvas.activePopoverId === 'stroke-all'}
			<ColorSpectrumPicker
				value={borderParsed.unified.color}
				onchange={(val) =>
					canvas.updateBlockStyle(
						selectedBlock.id,
						'border',
						`${borderParsed.unified.width}px ${borderParsed.unified.style} ${val}`
					)}
			/>
		{:else if canvas.activePopoverId === 'stroke-top'}
			<ColorSpectrumPicker
				value={borderParsed.top.color}
				onchange={(val) =>
					canvas.updateBlockStyle(
						selectedBlock.id,
						'borderTop',
						`${borderParsed.top.width}px ${borderParsed.top.style} ${val}`
					)}
			/>
		{:else if canvas.activePopoverId === 'stroke-right'}
			<ColorSpectrumPicker
				value={borderParsed.right.color}
				onchange={(val) =>
					canvas.updateBlockStyle(
						selectedBlock.id,
						'borderRight',
						`${borderParsed.right.width}px ${borderParsed.right.style} ${val}`
					)}
			/>
		{:else if canvas.activePopoverId === 'stroke-bottom'}
			<ColorSpectrumPicker
				value={borderParsed.bottom.color}
				onchange={(val) =>
					canvas.updateBlockStyle(
						selectedBlock.id,
						'borderBottom',
						`${borderParsed.bottom.width}px ${borderParsed.bottom.style} ${val}`
					)}
			/>
		{:else if canvas.activePopoverId === 'stroke-left'}
			<ColorSpectrumPicker
				value={borderParsed.left.color}
				onchange={(val) =>
					canvas.updateBlockStyle(
						selectedBlock.id,
						'borderLeft',
						`${borderParsed.left.width}px ${borderParsed.left.style} ${val}`
					)}
			/>
		{/if}
	</div>
{/if}

{#if paletteOpen}
	<CommandPalette {commands} onclose={() => (paletteOpen = false)} />
{/if}

<style lang="sass">
	.native-dragging
		display: flex
		width: 100%
		height: calc(100dvh - var(--header-height) - var(--footer-height))
		overflow: hidden
		// While dragging, force the resize cursor everywhere and kill text
		// selection so a fast drag never highlights page text.
		&.resizing
			cursor: col-resize
			user-select: none

	.panel
		position: relative // anchors the absolutely-positioned handle
		display: flex
		height: 100%
		box-sizing: border-box

	.sidebar
		flex: 0 0 auto // fixed width (set inline); never grow/shrink
		border-right: 1px solid var(--border-primary)
		flex-direction: column

	.rightbar
		flex: 0 0 auto
		background: var(--background20)
		border-left: 1px solid var(--border-primary)
		flex-direction: column

	.main
		flex: 1 1 0 // soaks up the remaining space
		min-width: 0 // lets it shrink below content width
		background: var(--background10)

	.panel-label
		font-size: 13px
		color: var(--text-secondary)
		user-select: none

	.resize-handle
		position: absolute
		top: 0
		bottom: 0
		height: 100%
		width: 1px // generous hit area, even though the line is 2px
		cursor: col-resize
		background: var(--border-secondary)
		touch-action: none // stop the browser from claiming the gesture (scroll/zoom)
		z-index: 5
		display: flex
		align-items: center
		justify-content: center
		&:hover
			width: 4px
		&.right
			right: -1px // straddle the boundary so it's easy to grab
			&:hover::before
				background: var(--border-tertiary)
				width: 2px
		&.left
			left: -1px
			&:hover::before
				background: var(--border-tertiary)
				width: 2px
		&::before
			content: ''
			width: 1px
			height: 100%
			background: transparent
			transition: background 0.15s ease
</style>

