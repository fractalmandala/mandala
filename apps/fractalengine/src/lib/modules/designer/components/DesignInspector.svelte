<script lang="ts">
	// designcanvas/DesignInspector
	//
	// Figma-style right-rail inspector for the design canvas. Reads selection
	// from the global `designcanvas` state and writes back through its
	// updateBlockStyle / align / group / clip / etc. methods so the entire
	// edit session is one undo step (via *WithUndo variants).
	//
	// The control sections, in order:
	//   1. Align             (8 buttons)
	//   2. Object Actions    (Duplicate, Group, Ungroup, Copy/Paste Style, Delete)
	//   3. Block Properties  (Name, Type, W, H, X, Y, Rotation, Opacity, Clip)
	//   4. Content           (Text, Image, Link fields)
	//   5. HTML Tag          (codegen tag override)
	//   6. Layout            (Free / Row / Column / Grid)
	//   7. Fill Stack        (multiple fills, gradients, image fills)
	//   8. Strokes           (per-side, dash, cap/join, arrowheads)
	//   9. Corner Radius     (per-corner, linked/unlinked)
	//  10. Effects           (drop/inner shadows, blurs)
	//  11. Blend Mode        (mix-blend-mode selector)
	//  12. Shadow & Corner   (legacy quick controls — migrated to paint model)

	import { isBlockType, type DesignBlock } from '$lib/modules/designer/engine/designtypes';
	import { designcanvas } from '$lib/modules/designer/state/designcanvas.svelte';
	import {
		type Paint, type SolidPaint, type StrokeData, type Corners, type Effect,
		type DropShadowEffect, type InnerShadowEffect, type LayerBlurEffect, type BackgroundBlurEffect,
		type StrokeStyle, type StrokeAlign, type StrokeCap, type StrokeJoin,
		type ImageFillMode, type PaintType,
		readFills, writeFills, defaultSolidPaint,
		readStrokes, writeStrokes,
		readCorners, writeCorners,
		readEffects, writeEffects,
		readBlendMode, setBlendMode,
		BLEND_MODES, isBlendMode,
		migrateLegacyStyle
	} from '$lib/modules/designer/engine/paint';
	import {
		CURATED_FONT_FAMILIES, defaultTypography, isFontAvailable, readTypography,
		type Typography, writeTypography
	} from '$lib/modules/designer/engine/typography';

	// Reactive snapshots — re-runs whenever designcanvas state mutates.
	const items = $derived(designcanvas.items);
	const selectedIds = $derived(designcanvas.selectedIds);

	// Selected blocks (excluding hidden ones)
	const selected = $derived(items.filter((b) => selectedIds.includes(b.id)));

	function singleField<T>(get: (b: DesignBlock) => T): T | undefined {
		if (selected.length === 0) return undefined;
		const first = get(selected[0]);
		for (let i = 1; i < selected.length; i++) {
			if (get(selected[i]) !== first) return undefined;
		}
		return first;
	}

	// ── Field derivations ──
	const blockName = $derived(singleField((b) => b.name));
	const blockType = $derived(singleField((b) => b.type));
	const blockWidth = $derived(singleField((b) => b.w));
	const blockHeight = $derived(singleField((b) => b.h));
	const blockX = $derived(singleField((b) => b.x));
	const blockY = $derived(singleField((b) => b.y));
	const blockRotation = $derived(singleField((b) => b.rotation ?? 0));
	const blockOpacity = $derived(singleField((b) => {
		const v = b.style.opacity;
		if (v == null) return 100;
		const num = Number(v);
		if (!Number.isFinite(num)) return 100;
		return Math.round(num * (num <= 1 ? 100 : 1));
	}));
	const blockOverflow = $derived(singleField((b) => (b.style.overflow as string | undefined) ?? 'visible'));
	const blockHtmlTag = $derived(singleField((b) => b.htmlTag ?? ''));
	const blockText = $derived(singleField((b) => String(b.props.text ?? '')));
	const blockHref = $derived(singleField((b) => String(b.props.href ?? '')));
	const blockImageSrc = $derived(singleField((b) => String(b.props.src ?? '')));
	const blockImageAlt = $derived(singleField((b) => String(b.props.alt ?? b.name ?? '')));
	const blockObjectFit = $derived(singleField((b) => String((b.style['object-fit'] as string | undefined) ?? 'cover')));
	const blockFontSize = $derived(singleField((b) => String((b.style['font-size'] as string | undefined) ?? '')));
	const blockFontWeight = $derived(singleField((b) => String((b.style['font-weight'] as string | number | undefined) ?? '')));
	const blockTextAlign = $derived(singleField((b) => String((b.style['text-align'] as string | undefined) ?? '')));
	const blockTypography = $derived(selected.length === 1 ? readTypography(selected[0].style) : null);

	const blockLayout = $derived(singleField((b) => (b.props.layout as string | undefined) ?? 'free'));

	// ── Paint model derivations ──
	// Ensure legacy migration on read
	const blockFills = $derived(selected.length === 1 ? readFills(selected[0].style) : null);
	const blockStrokes = $derived(selected.length === 1 ? readStrokes(selected[0].style) : null);
	const blockCorners = $derived(selected.length === 1 ? readCorners(selected[0].style) : null);
	const blockEffects = $derived(selected.length === 1 ? readEffects(selected[0].style) : null);
	const blockBlendMode = $derived(selected.length === 1 ? readBlendMode(selected[0].style) : null);

	// ── Stroke derived fields (multi-select compatible) ──
	type SimpleStrokeState = {
		width: number;
		style: StrokeStyle;
		color: string;
	};
	function parseStrokeSimple(shorthand: string | undefined): SimpleStrokeState | undefined {
		if (!shorthand) return undefined;
		const trimmed = shorthand.trim();
		if (trimmed === '' || trimmed === 'none' || trimmed === '0') return undefined;
		const m = trimmed.match(/^([\d.]+)(px|rem|em|%)?\s+(\w+)\s+(.+)$/);
		if (!m) return { width: 1, style: 'solid', color: trimmed };
		const w = parseFloat(m[1]);
		const style = (m[3] as StrokeStyle);
		const color = m[4];
		const allowed: StrokeStyle[] = ['solid', 'dashed', 'dotted'];
		return {
			width: Number.isFinite(w) ? w : 1,
			style: allowed.includes(style) ? style : 'solid',
			color
		};
	}
	const strokeState = $derived(singleField((b) => parseStrokeSimple(b.style.border as string | undefined)));
	const blockRadius = $derived(singleField((b) => {
		const v = b.style['border-radius'];
		return v == null ? '' : String(v);
	}));

	// ── Selection-level helpers ──
	function applyToSelected(fn: (b: DesignBlock) => void) {
		if (selected.length === 0) return;
		designcanvas.recordGestureStart();
		for (const b of selected) fn(b);
		designcanvas.commitGesture();
	}

	function applyStyleToSelected(property: string, value: string | number) {
		if (selected.length === 0) return;
		designcanvas.recordGestureStart();
		for (const b of selected) {
			designcanvas.updateBlockStyle(b.id, property, value);
		}
		designcanvas.commitGesture();
	}

	function applyPropToSelected(property: string, value: unknown) {
		if (selected.length === 0) return;
		designcanvas.recordGestureStart();
		for (const b of selected) {
			const nextProps = { ...b.props };
			if (value === '' || value == null) delete nextProps[property];
			else nextProps[property] = value;
			b.props = nextProps;
		}
		designcanvas.commitGesture();
	}

	function removeStyleFromSelected(property: string) {
		if (selected.length === 0) return;
		designcanvas.recordGestureStart();
		for (const b of selected) {
			designcanvas.updateBlockStyle(b.id, property, '');
		}
		designcanvas.commitGesture();
	}

	/** Apply a paint-model style update across selection. The updater receives
	 *  the current style and returns the new complete style. */
	function applyPaintToSelected(updater: (style: Record<string, string | number>) => Record<string, string | number>) {
		if (selected.length === 0) return;
		designcanvas.recordGestureStart();
		for (const b of selected) {
			migrateLegacyStyle(b.style);
			b.style = updater({ ...b.style });
		}
		designcanvas.commitGesture();
	}

	// ── Property setters ──
	function setName(value: string) { applyToSelected((b) => (b.name = value)); }
	function setWidth(value: number) { applyToSelected((b) => (b.w = Math.max(1, Math.round(value)))); }
	function setHeight(value: number) { applyToSelected((b) => (b.h = Math.max(1, Math.round(value)))); }
	function setX(value: number) { applyToSelected((b) => (b.x = Math.round(value))); }
	function setY(value: number) { applyToSelected((b) => (b.y = Math.round(value))); }
	function setRotation(value: number) { applyToSelected((b) => (b.rotation = Math.round(value))); }
	function setOpacity(value: number) {
		const clamped = Math.max(0, Math.min(100, Math.round(value)));
		applyStyleToSelected('opacity', clamped / 100);
	}
	function setClip(checked: boolean) { applyStyleToSelected('overflow', checked ? 'hidden' : 'visible'); }
	function setType(value: string) {
		if (!isBlockType(value)) return;
		applyToSelected((b) => (b.type = value));
	}
	function setHtmlTag(value: string) { applyToSelected((b) => (b.htmlTag = value === '' ? undefined : value)); }
	function setTextContent(value: string) { applyPropToSelected('text', value); }
	function setHref(value: string) { applyPropToSelected('href', value.trim()); }
	function setImageSrc(value: string) { applyPropToSelected('src', value.trim()); }
	function setImageAlt(value: string) { applyPropToSelected('alt', value); }
	function setObjectFit(value: string) { applyStyleToSelected('object-fit', value); }
	function setFontSize(value: string) {
		const trimmed = value.trim();
		setTypography('fontSize', !trimmed ? '' : (/^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed));
	}
	function setFontWeight(value: string) {
		setTypography('fontWeight', value);
	}
	function setTextAlign(value: string) {
		setTypography('textAlign', value === 'center' || value === 'right' || value === 'justify' ? value : 'left');
	}
	function applyTypographyToSelected(updater: (typography: Typography) => Typography) {
		if (selected.length === 0) return;
		designcanvas.recordGestureStart();
		for (const block of selected) {
			const style = { ...block.style };
			writeTypography(style, updater(readTypography(style)));
			block.style = style;
		}
		designcanvas.commitGesture();
	}
	function setTypography<K extends keyof Typography>(key: K, value: Typography[K]) {
		applyTypographyToSelected((typography) => ({ ...typography, [key]: value }));
	}
	function setLayout(value: 'free' | 'row' | 'column' | 'grid') {
		applyToSelected((b) => (b.props = { ...b.props, layout: value }));
	}

	// ── Paint setters ──
	function setSelectedFills(fills: Paint[]) {
		applyPaintToSelected((style) => {
			const next = { ...style };
			writeFills(next, fills);
			return next;
		});
	}
	function setSelectedStrokes(strokes: StrokeData[]) {
		applyPaintToSelected((style) => {
			const next = { ...style };
			writeStrokes(next, strokes);
			return next;
		});
	}
	function setSelectedCorners(corners: Corners) {
		applyPaintToSelected((style) => {
			const next = { ...style };
			writeCorners(next, corners);
			return next;
		});
	}
	function setSelectedEffects(effects: Effect[]) {
		applyPaintToSelected((style) => {
			const next = { ...style };
			writeEffects(next, effects);
			return next;
		});
	}
	function setSelectedBlendMode(mode: string) {
		const valid = isBlendMode(mode) ? mode : '';
		applyPaintToSelected((style) => setBlendMode(style, valid));
	}

	// ── Legacy setters (kept for backwards compat UI) ──
	function setFill(value: string) {
		if (selected.length === 0) return;
		applyPaintToSelected((style) => {
			const fills = [defaultSolidPaint(value)];
			const next = { ...style };
			writeFills(next, fills);
			return next;
		});
	}
	function setRadius(value: number) {
		const corners: Corners = { topLeft: value, topRight: value, bottomRight: value, bottomLeft: value, linked: true };
		applyPaintToSelected((style) => {
			const next = { ...style };
			writeCorners(next, corners);
			return next;
		});
	}
	function setStroke(s: SimpleStrokeState | null) {
		if (s == null) {
			applyPaintToSelected((style) => {
				const next = { ...style };
				writeStrokes(next, []);
				return next;
			});
		} else {
			applyPaintToSelected((style) => {
				const strokes: StrokeData[] = [{
					color: s.color, weight: s.width, align: 'center',
					style: s.style, dashPattern: [], cap: 'round', join: 'round',
					visible: true, side: 'all'
				}];
				const next = { ...style };
				writeStrokes(next, strokes);
				return next;
			});
		}
	}

	// ── Numeric input UX ──
	let widthStr = $state('');
	let heightStr = $state('');
	let xStr = $state('');
	let yStr = $state('');
	let rotationStr = $state('');
	let opacityStr = $state('');
	let radiusStr = $state('');
	let strokeWidthStr = $state('');
	let strokeColorStr = $state('');
	let textContentStr = $state('');
	let hrefStr = $state('');
	let imageSrcStr = $state('');
	let imageAltStr = $state('');
	let fontSizeStr = $state('');
	let fontSearch = $state('');
	let fontPickerOpen = $state(false);
	let missingFontNotice = $state('');
	$effect(() => {
		widthStr = blockWidth == null ? '' : String(Math.round(blockWidth));
		heightStr = blockHeight == null ? '' : String(Math.round(blockHeight));
		xStr = blockX == null ? '' : String(Math.round(blockX));
		yStr = blockY == null ? '' : String(Math.round(blockY));
		rotationStr = blockRotation == null ? '' : String(Math.round(blockRotation));
		opacityStr = blockOpacity == null ? '' : String(blockOpacity);
		radiusStr = blockRadius == null ? '' : String(parseInt(blockRadius, 10) || 0);
		const ss = strokeState;
		strokeWidthStr = ss == null ? '' : String(ss.width);
		strokeColorStr = ss == null ? '' : ss.color;
		textContentStr = blockText ?? '';
		hrefStr = blockHref ?? '';
		imageSrcStr = blockImageSrc ?? '';
		imageAltStr = blockImageAlt ?? '';
		fontSizeStr = blockFontSize == null ? '' : blockFontSize.replace(/px$/, '');
	});
	const visibleFonts = $derived(CURATED_FONT_FAMILIES.filter((font) => font.toLowerCase().includes(fontSearch.trim().toLowerCase())));
	$effect(() => {
		const family = blockTypography?.fontFamily ?? '';
		if (!family) { missingFontNotice = ''; return; }
		let current = true;
		void isFontAvailable(family).then((available) => {
			if (current) missingFontNotice = available ? '' : `${family} is unavailable; the canvas is using its browser fallback.`;
		});
		return () => { current = false; };
	});
	function pickFont(fontFamily: string) {
		setTypography('fontFamily', fontFamily);
		fontPickerOpen = false;
		fontSearch = '';
	}

	function commitNumber(value: string, commit: (n: number) => void) {
		const n = Number(value);
		if (Number.isFinite(n)) commit(n);
	}

	// ── Color picker popover ──
	type ColorChannel = 'fill' | 'stroke';
	let openColorPicker = $state<ColorChannel | null>(null);
	function toggleColorPicker(channel: ColorChannel) {
		openColorPicker = openColorPicker === channel ? null : channel;
	}
	$effect(() => {
		if (openColorPicker == null) return;
		function onWindowPointerDown(event: PointerEvent) {
			const target = event.target as Element | null;
			if (target && target.closest('.inspector-color-popover')) return;
			if (target && target.closest('.inspector-color-swatch')) return;
			openColorPicker = null;
		}
		window.addEventListener('pointerdown', onWindowPointerDown, true);
		return () => window.removeEventListener('pointerdown', onWindowPointerDown, true);
	});
	function applyColor(channel: ColorChannel, hex: string) {
		if (channel === 'fill') setFill(hex);
		else {
			const current = strokeState ?? { width: 1, style: 'solid', color: hex };
			setStroke({ ...current, color: hex });
		}
	}

	// ── Fill stack local state ──
	let editingFillIndex = $state<number | null>(null);
	let gradientAngleStr = $state('180');
	let gradientType: 'linear' | 'radial' = $state('linear');
	let gradientCxStr = $state('50');
	let gradientCyStr = $state('50');
	let imageFillUrl = $state('');

	$effect(() => {
		// Reset editing state when selection changes
		editingFillIndex = null;
	});

	function selectFillForEdit(idx: number) {
		editingFillIndex = editingFillIndex === idx ? null : idx;
		if (blockFills && blockFills[idx]) {
			const f = blockFills[idx];
			if (f.type === 'linear-gradient') {
				gradientAngleStr = String(f.angle);
				gradientType = 'linear';
			} else if (f.type === 'radial-gradient') {
				gradientCxStr = String(Math.round(f.cx * 100));
				gradientCyStr = String(Math.round(f.cy * 100));
				gradientType = 'radial';
			} else if (f.type === 'image') {
				imageFillUrl = f.src;
			}
		}
	}

	function addFill() {
		if (!blockFills) return;
		const newFill: SolidPaint = defaultSolidPaint('#cccccc');
		setSelectedFills([...blockFills, newFill]);
	}

	function removeFill(idx: number) {
		if (!blockFills) return;
		const next = blockFills.filter((_, i) => i !== idx);
		setSelectedFills(next.length > 0 ? next : [defaultSolidPaint('transparent')]);
	}

	function toggleFillVisibility(idx: number) {
		if (!blockFills) return;
		const next = blockFills.map((f, i) => i === idx ? { ...f, visible: !f.visible } : f);
		setSelectedFills(next);
	}

	function changeFillType(idx: number, type: PaintType) {
		if (!blockFills) return;
		const next = [...blockFills];
		if (type === 'solid') {
			next[idx] = { type: 'solid', color: '#cccccc', opacity: 1, visible: true };
		} else if (type === 'linear-gradient') {
			next[idx] = {
				type: 'linear-gradient', angle: 180,
				stops: [{ position: 0, color: '#000000', opacity: 1 }, { position: 1, color: '#ffffff', opacity: 1 }],
				opacity: 1, visible: true
			};
		} else if (type === 'radial-gradient') {
			next[idx] = {
				type: 'radial-gradient', cx: 0.5, cy: 0.5,
				stops: [{ position: 0, color: '#000000', opacity: 1 }, { position: 1, color: '#ffffff', opacity: 1 }],
				opacity: 1, visible: true
			};
		} else if (type === 'image') {
			next[idx] = { type: 'image', src: '', mode: 'fill', opacity: 1, visible: true };
		}
		setSelectedFills(next);
	}

	function setFillColor(idx: number, color: string) {
		if (!blockFills) return;
		const next = [...blockFills];
		const f = next[idx];
		if (f.type === 'solid') {
			next[idx] = { ...f, color };
		}
		setSelectedFills(next);
	}

	function setFillOpacity(idx: number, opacity: number) {
		if (!blockFills) return;
		const next = [...blockFills];
		next[idx] = { ...next[idx], opacity: Math.max(0, Math.min(1, opacity)) };
		setSelectedFills(next);
	}

	function addGradientStop() {
		if (!blockFills || editingFillIndex == null) return;
		const next = [...blockFills];
		const f = next[editingFillIndex];
		if (f.type === 'linear-gradient' || f.type === 'radial-gradient') {
			const stops = [...f.stops];
			// Insert at midpoint
			const midPos = stops.length > 1 ? (stops[0].position + stops[1].position) / 2 : 0.5;
			stops.push({ position: midPos, color: '#808080', opacity: 1 });
			stops.sort((a, b) => a.position - b.position);
			next[editingFillIndex] = { ...f, stops };
			setSelectedFills(next);
		}
	}

	function removeGradientStop(stopIdx: number) {
		if (!blockFills || editingFillIndex == null) return;
		const next = [...blockFills];
		const f = next[editingFillIndex];
		if ((f.type === 'linear-gradient' || f.type === 'radial-gradient') && f.stops.length > 2) {
			const stops = f.stops.filter((_, i) => i !== stopIdx);
			next[editingFillIndex] = { ...f, stops };
			setSelectedFills(next);
		}
	}

	function setGradientStopColor(stopIdx: number, color: string) {
		if (!blockFills || editingFillIndex == null) return;
		const next = [...blockFills];
		const f = next[editingFillIndex];
		if (f.type === 'linear-gradient' || f.type === 'radial-gradient') {
			const stops = f.stops.map((s, i) => i === stopIdx ? { ...s, color } : s);
			next[editingFillIndex] = { ...f, stops };
			setSelectedFills(next);
		}
	}

	function setGradientStopPosition(stopIdx: number, pos: number) {
		if (!blockFills || editingFillIndex == null) return;
		const next = [...blockFills];
		const f = next[editingFillIndex];
		if (f.type === 'linear-gradient' || f.type === 'radial-gradient') {
			const stops = f.stops.map((s, i) => i === stopIdx ? { ...s, position: Math.max(0, Math.min(1, pos)) } : s);
			stops.sort((a, b) => a.position - b.position);
			next[editingFillIndex] = { ...f, stops };
			setSelectedFills(next);
		}
	}

	function setGradientAngle(angle: number) {
		if (!blockFills || editingFillIndex == null) return;
		const next = [...blockFills];
		const f = next[editingFillIndex];
		if (f.type === 'linear-gradient') {
			next[editingFillIndex] = { ...f, angle };
			setSelectedFills(next);
		}
	}

	function setGradientRadialCx(cx: number) {
		if (!blockFills || editingFillIndex == null) return;
		const next = [...blockFills];
		const f = next[editingFillIndex];
		if (f.type === 'radial-gradient') {
			next[editingFillIndex] = { ...f, cx: Math.max(0, Math.min(1, cx)) };
			setSelectedFills(next);
		}
	}

	function setGradientRadialCy(cy: number) {
		if (!blockFills || editingFillIndex == null) return;
		const next = [...blockFills];
		const f = next[editingFillIndex];
		if (f.type === 'radial-gradient') {
			next[editingFillIndex] = { ...f, cy: Math.max(0, Math.min(1, cy)) };
			setSelectedFills(next);
		}
	}

	function setImageFillUrl(url: string) {
		if (!blockFills || editingFillIndex == null) return;
		const next = [...blockFills];
		const f = next[editingFillIndex];
		if (f.type === 'image') {
			next[editingFillIndex] = { ...f, src: url };
			setSelectedFills(next);
		}
	}

	function setImageFillMode(mode: ImageFillMode) {
		if (!blockFills || editingFillIndex == null) return;
		const next = [...blockFills];
		const f = next[editingFillIndex];
		if (f.type === 'image') {
			next[editingFillIndex] = { ...f, mode };
			setSelectedFills(next);
		}
	}

	function moveFill(fromIdx: number, toIdx: number) {
		if (!blockFills) return;
		const next = [...blockFills];
		const [moved] = next.splice(fromIdx, 1);
		next.splice(toIdx, 0, moved);
		setSelectedFills(next);
	}

	// ── Effects local state ──
	let editingEffectIndex = $state<number | null>(null);
	$effect(() => { editingEffectIndex = null; });

	function addEffect(type: Effect['type']) {
		let effect: Effect;
		switch (type) {
			case 'drop-shadow':
				effect = { type: 'drop-shadow', visible: true, offsetX: 2, offsetY: 2, radius: 8, spread: 0, color: 'rgba(0,0,0,0.18)' };
				break;
			case 'inner-shadow':
				effect = { type: 'inner-shadow', visible: true, offsetX: 0, offsetY: 2, radius: 8, spread: 0, color: 'rgba(0,0,0,0.18)' };
				break;
			case 'layer-blur':
				effect = { type: 'layer-blur', visible: true, blur: 8 };
				break;
			case 'background-blur':
				effect = { type: 'background-blur', visible: true, blur: 8 };
				break;
		}
		const current = blockEffects ?? [];
		setSelectedEffects([...current, effect]);
	}

	function removeEffect(idx: number) {
		const current = blockEffects ?? [];
		setSelectedEffects(current.filter((_, i) => i !== idx));
	}

	function toggleEffectVisibility(idx: number) {
		const current = blockEffects ?? [];
		const next = current.map((e, i) => i === idx ? { ...e, visible: !e.visible } : e);
		setSelectedEffects(next);
	}

	function updateDropShadow(idx: number, upd: Partial<DropShadowEffect>) {
		const current = blockEffects ?? [];
		const e = current[idx];
		if (e && (e.type === 'drop-shadow' || e.type === 'inner-shadow')) {
			const next = [...current];
			next[idx] = { ...e, ...upd } as DropShadowEffect | InnerShadowEffect;
			setSelectedEffects(next);
		}
	}

	function updateBlurEffect(idx: number, blur: number) {
		const current = blockEffects ?? [];
		const e = current[idx];
		if (e && (e.type === 'layer-blur' || e.type === 'background-blur')) {
			const next = [...current];
			next[idx] = { ...e, blur: Math.max(0, blur) } as LayerBlurEffect | BackgroundBlurEffect;
			setSelectedEffects(next);
		}
	}

	// ── Corner local state ──
	let cornerLinked = $state(true);
	$effect(() => {
		if (blockCorners) cornerLinked = blockCorners.linked;
	});

	function setCorner(corner: keyof Corners, value: number) {
		if (!blockCorners) return;
		const clamped = Math.max(0, Math.round(value));
		if (corner === 'linked') {
			setSelectedCorners({ ...blockCorners, linked: value !== 0 });
			return;
		}
		if (blockCorners.linked) {
			setSelectedCorners({ topLeft: clamped, topRight: clamped, bottomRight: clamped, bottomLeft: clamped, linked: true });
		} else {
			setSelectedCorners({ ...blockCorners, [corner]: clamped });
		}
	}

	function toggleCornerLinked() {
		if (!blockCorners) return;
		const next = { ...blockCorners, linked: !blockCorners.linked };
		if (next.linked) {
			const avg = Math.round((next.topLeft + next.topRight + next.bottomRight + next.bottomLeft) / 4);
			next.topLeft = next.topRight = next.bottomRight = next.bottomLeft = avg;
		}
		setSelectedCorners(next);
	}

	// ── Fill preview helpers ──
	function fillPreviewStyle(value: string | undefined): string {
		if (!value || value === 'none' || value === 'transparent') {
			return 'background:repeating-conic-gradient(var(--transparency-dark) 0% 25%, var(--transparency-light) 0% 50%) 0 0/var(--sz-8) var(--sz-8);';
		}
		return `background:${value};`;
	}

	function paintSwatchStyle(paint: Paint): string {
		if (paint.type === 'solid') return `background:${paint.color};`;
		return 'background:repeating-conic-gradient(var(--transparency-dark) 0% 25%, var(--transparency-light) 0% 50%) 0 0/var(--sz-8) var(--sz-8);';
	}

	function paintLabel(paint: Paint): string {
		switch (paint.type) {
			case 'solid': return 'Solid';
			case 'linear-gradient': return 'Linear';
			case 'radial-gradient': return 'Radial';
			case 'image': return 'Image';
		}
	}

	function paintColorPreview(paint: Paint): string {
		if (paint.type === 'solid' && paint.color !== 'transparent') return paint.color;
		if (paint.type === 'linear-gradient' && paint.stops.length > 0) {
			const s = paint.stops.map((st) => `${st.color} ${Math.round(st.position * 100)}%`).join(', ');
			return `linear-gradient(${paint.angle}deg, ${s})`;
		}
		if (paint.type === 'radial-gradient' && paint.stops.length > 0) {
			const s = paint.stops.map((st) => `${st.color} ${Math.round(st.position * 100)}%`).join(', ');
			return `radial-gradient(circle at ${Math.round(paint.cx * 100)}% ${Math.round(paint.cy * 100)}%, ${s})`;
		}
		return '';
	}

	// ── Preset swatches ──
	const swatches = [
		'#FFFFFF', '#F7F7F7', '#E1E1E1', '#9A9A9A', '#5D5D5D', '#181818',
		'#FF6B6B', '#FF9F43', '#FFD93D', '#6BCB77', '#4D96FF', '#A66CFF',
		'#28ad33', '#10b981', '#6366f1', '#dc2626', '#d97706', '#0891b2'
	];

	const typeOptions: { value: string; label: string }[] = [
		{ value: 'frame', label: 'Frame' },
		{ value: 'container', label: 'Group / Container' },
		{ value: 'rectangle', label: 'Rectangle' },
		{ value: 'ellipse', label: 'Ellipse' },
		{ value: 'line', label: 'Line' },
		{ value: 'text', label: 'Text' },
		{ value: 'image', label: 'Image' },
		{ value: 'card', label: 'Card' },
		{ value: 'polygon', label: 'Polygon' },
		{ value: 'star', label: 'Star' },
		{ value: 'vector', label: 'Vector' }
	];

	const htmlTagOptions = [
		{ value: '', label: 'Auto' },
		{ value: 'div', label: '<div>' },
		{ value: 'section', label: '<section>' },
		{ value: 'article', label: '<article>' },
		{ value: 'header', label: '<header>' },
		{ value: 'footer', label: '<footer>' },
		{ value: 'main', label: '<main>' },
		{ value: 'nav', label: '<nav>' },
		{ value: 'aside', label: '<aside>' },
		{ value: 'h1', label: '<h1>' },
		{ value: 'h2', label: '<h2>' },
		{ value: 'h3', label: '<h3>' },
		{ value: 'p', label: '<p>' },
		{ value: 'span', label: '<span>' },
		{ value: 'button', label: '<button>' },
		{ value: 'a', label: '<a>' },
		{ value: 'img', label: '<img>' },
		{ value: 'ul', label: '<ul>' },
		{ value: 'li', label: '<li>' }
	];

	const strokeStylesArr: StrokeStyle[] = ['solid', 'dashed', 'dotted'];
	const strokeAligns: StrokeAlign[] = ['inside', 'center', 'outside'];
	const strokeCaps: StrokeCap[] = ['butt', 'round', 'square'];
	const strokeJoins: StrokeJoin[] = ['miter', 'round', 'bevel'];
	const objectFitOptions = ['cover', 'contain', 'fill', 'none', 'scale-down'];
	const fontWeightOptions = [
		{ value: '', label: 'Auto' },
		{ value: '300', label: 'Light' },
		{ value: '400', label: 'Regular' },
		{ value: '500', label: 'Medium' },
		{ value: '600', label: 'Semibold' },
		{ value: '700', label: 'Bold' },
		{ value: '800', label: 'Extra Bold' }
	];
	const textAlignOptions = [
		{ value: '', label: 'Auto' },
		{ value: 'left', label: 'Left' },
		{ value: 'center', label: 'Center' },
		{ value: 'right', label: 'Right' },
		{ value: 'justify', label: 'Justify' }
	];
	const fillTypeOptions: { value: PaintType; label: string }[] = [
		{ value: 'solid', label: 'Solid' },
		{ value: 'linear-gradient', label: 'Linear' },
		{ value: 'radial-gradient', label: 'Radial' },
		{ value: 'image', label: 'Image' }
	];
	const imageFillModes: { value: ImageFillMode; label: string }[] = [
		{ value: 'fill', label: 'Fill' },
		{ value: 'fit', label: 'Fit' },
		{ value: 'crop', label: 'Crop' },
		{ value: 'tile', label: 'Tile' }
	];
	const effectTypes: { value: Effect['type']; label: string }[] = [
		{ value: 'drop-shadow', label: 'Drop Shadow' },
		{ value: 'inner-shadow', label: 'Inner Shadow' },
		{ value: 'layer-blur', label: 'Layer Blur' },
		{ value: 'background-blur', label: 'Background Blur' }
	];

	function clipEnabled(): boolean { return blockOverflow === 'hidden'; }

	function primarySelectedId(): string | null { return selected[0]?.id ?? null; }

	function copyPrimaryStyle() {
		const id = primarySelectedId();
		if (id) designcanvas.copyStyle(id);
	}
	function pastePrimaryStyle() {
		const id = primarySelectedId();
		if (id) designcanvas.pasteStyle(id);
	}

	const hasTextSelection = $derived(selected.some((b) => b.type === 'text' || b.htmlTag === 'button' || b.htmlTag === 'a'));
	const hasImageSelection = $derived(selected.some((b) => b.type === 'image'));
	const hasLinkSelection = $derived(selected.some((b) => b.htmlTag === 'a' || typeof b.props.href === 'string'));
</script>

{#if selected.length === 0}
	<div class="inspector-empty">
		Select a layer to edit its properties.
	</div>
{:else}
	<div class="inspector-root">
		<!-- ── Align ─────────────────────────────────────────────────────── -->
		<div class="inspector-section">
			<div class="inspector-section-title">ALIGN</div>
			<div class="inspector-align-row">
				<button type="button" class="btn-icon inspector-icon-btn" onclick={() => designcanvas.alignLeft()} title="Align left">
					<img src="/iconset/leftAlign.svg" alt="" class="icon-svg-sm" />
				</button>
				<button type="button" class="btn-icon inspector-icon-btn" onclick={() => designcanvas.alignHorizontalCenter()} title="Align horizontal center">
					<img src="/iconset/centerAlign.svg" alt="" class="icon-svg-sm" />
				</button>
				<button type="button" class="btn-icon inspector-icon-btn" onclick={() => designcanvas.alignRight()} title="Align right">
					<img src="/iconset/rightAlign.svg" alt="" class="icon-svg-sm" />
				</button>
				<button type="button" class="btn-icon inspector-icon-btn" onclick={() => designcanvas.alignTop()} title="Align top">
					<img src="/iconset/moveUp.svg" alt="" class="icon-svg-sm" />
				</button>
				<button type="button" class="btn-icon inspector-icon-btn" onclick={() => designcanvas.alignVerticalCenter()} title="Align vertical center">
					<img src="/iconset/centerAlign.svg" alt="" class="icon-svg-sm" />
				</button>
				<button type="button" class="btn-icon inspector-icon-btn" onclick={() => designcanvas.alignBottom()} title="Align bottom">
					<img src="/iconset/moveDown.svg" alt="" class="icon-svg-sm" />
				</button>
				<button type="button" class="btn-icon inspector-icon-btn" onclick={() => designcanvas.distributeHorizontally()} title="Distribute horizontally">
					<img src="/iconset/layout.svg" alt="" class="icon-svg-sm" />
				</button>
				<button type="button" class="btn-icon inspector-icon-btn" onclick={() => designcanvas.distributeVertically()} title="Distribute vertically">
					<img src="/iconset/layout.svg" alt="" class="icon-svg-sm" />
				</button>
			</div>
		</div>

		<!-- ── Object Actions ───────────────────────────────────────────── -->
		<div class="inspector-section">
			<div class="inspector-section-title">OBJECT</div>
			<div class="inspector-action-grid">
				<button type="button" class="inspector-action-btn" onclick={() => designcanvas.duplicateSelected()}>
					Duplicate
				</button>
				<button type="button" class="inspector-action-btn" onclick={() => designcanvas.groupSelected()} disabled={selected.length === 0}>
					Group
				</button>
				<button type="button" class="inspector-action-btn" onclick={() => designcanvas.ungroupSelected()} disabled={!selected.some((b) => b.children.length > 0)}>
					Ungroup
				</button>
				<button type="button" class="inspector-action-btn" onclick={copyPrimaryStyle}>
					Copy Style
				</button>
				<button type="button" class="inspector-action-btn" onclick={pastePrimaryStyle} disabled={!designcanvas.styleClipboard}>
					Paste Style
				</button>
				<button type="button" class="inspector-action-btn inspector-action-danger" onclick={() => designcanvas.deleteSelected()}>
					Delete
				</button>
			</div>
		</div>

		<!-- ── Block Properties ──────────────────────────────────────────── -->
		<div class="inspector-section">
			<div class="inspector-section-title">BLOCK PROPERTIES</div>
			<div class="inspector-grid">
				<div class="inspector-field">
					<div class="inspector-field-label">NAME</div>
					<input
						aria-label="Layer name"
						type="text"
						class="inspector-input"
						value={blockName ?? ''}
						placeholder={selected.length > 1 ? `${selected.length} selected` : ''}
						onchange={(e) => setName((e.currentTarget as HTMLInputElement).value)}
					/>
				</div>
				<div class="inspector-field">
					<div class="inspector-field-label">TYPE</div>
					<select
						aria-label="Layer type"
						class="inspector-input inspector-select"
						value={blockType ?? ''}
						onchange={(e) => setType((e.currentTarget as HTMLSelectElement).value)}
					>
						{#if blockType == null}
							<option value="" disabled selected>— Mixed —</option>
						{/if}
						{#each typeOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<div class="inspector-field">
					<div class="inspector-field-label">WIDTH (PX)</div>
					<input
						aria-label="Layer width in pixels"
						type="number"
						class="inspector-input"
						bind:value={widthStr}
						onchange={() => commitNumber(widthStr, setWidth)}
						onblur={() => commitNumber(widthStr, setWidth)}
						onkeydown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
					/>
				</div>
				<div class="inspector-field">
					<div class="inspector-field-label">HEIGHT (PX)</div>
					<input
						aria-label="Layer height in pixels"
						type="number"
						class="inspector-input"
						bind:value={heightStr}
						onchange={() => commitNumber(heightStr, setHeight)}
						onblur={() => commitNumber(heightStr, setHeight)}
						onkeydown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
					/>
				</div>

				<div class="inspector-field">
					<div class="inspector-field-label">X (PX)</div>
					<input
						aria-label="Layer X position in pixels"
						type="number"
						class="inspector-input"
						bind:value={xStr}
						onchange={() => commitNumber(xStr, setX)}
						onblur={() => commitNumber(xStr, setX)}
						onkeydown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
					/>
				</div>
				<div class="inspector-field">
					<div class="inspector-field-label">Y (PX)</div>
					<input
						aria-label="Layer Y position in pixels"
						type="number"
						class="inspector-input"
						bind:value={yStr}
						onchange={() => commitNumber(yStr, setY)}
						onblur={() => commitNumber(yStr, setY)}
						onkeydown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
					/>
				</div>

				<div class="inspector-field">
					<div class="inspector-field-label">ROTATION (°)</div>
					<input
						aria-label="Layer rotation in degrees"
						type="number"
						class="inspector-input"
						bind:value={rotationStr}
						onchange={() => commitNumber(rotationStr, setRotation)}
						onblur={() => commitNumber(rotationStr, setRotation)}
						onkeydown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
					/>
				</div>
				<div class="inspector-field">
					<div class="inspector-field-label">OPACITY (%)</div>
					<input
						aria-label="Layer opacity percent"
						type="number"
						class="inspector-input"
						min="0"
						max="100"
						bind:value={opacityStr}
						onchange={() => commitNumber(opacityStr, setOpacity)}
						onblur={() => commitNumber(opacityStr, setOpacity)}
						onkeydown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
					/>
				</div>
			</div>

			<label class="inspector-checkbox-row">
				<input
					type="checkbox"
					checked={clipEnabled()}
					onchange={(e) => setClip((e.currentTarget as HTMLInputElement).checked)}
				/>
				<span>Clip content (overflow: hidden)</span>
			</label>
		</div>

		<!-- ── Content ───────────────────────────────────────────────────── -->
		{#if hasTextSelection || hasImageSelection || hasLinkSelection}
			<div class="inspector-section">
				<div class="inspector-section-title">CONTENT</div>
				{#if hasTextSelection}
					<div class="inspector-field inspector-field-wide">
						<div class="inspector-field-label">TEXT</div>
						<textarea
							aria-label="Text content"
							class="inspector-input inspector-textarea"
							bind:value={textContentStr}
							placeholder={selected.length > 1 ? 'Mixed text' : 'Text content'}
							onchange={() => setTextContent(textContentStr)}
							onblur={() => setTextContent(textContentStr)}
						></textarea>
					</div>
					<div class="inspector-grid">
						<div class="inspector-field inspector-field-wide">
							<div class="inspector-field-label">FONT FAMILY</div>
							<button type="button" class="inspector-font-picker-trigger" onclick={() => (fontPickerOpen = !fontPickerOpen)} aria-expanded={fontPickerOpen}>
								<span style:font-family={blockTypography?.fontFamily || undefined}>{blockTypography?.fontFamily || 'System default'}</span>
								<span aria-hidden="true">⌄</span>
							</button>
							{#if fontPickerOpen}
								<div class="inspector-font-picker">
									<input class="inspector-input" aria-label="Search font families" bind:value={fontSearch} placeholder="Search bundled and system fonts" />
									<div class="inspector-font-options">
										<button type="button" class="inspector-font-option" onclick={() => pickFont('')}>System default</button>
										{#each visibleFonts as font (font)}
											<button type="button" class="inspector-font-option" style:font-family={font} onclick={() => pickFont(font)}>{font}<span>Preview</span></button>
										{/each}
									</div>
								</div>
							{/if}
							{#if missingFontNotice}<p class="inspector-font-notice" role="status">{missingFontNotice}</p>{/if}
						</div>
						<div class="inspector-field">
							<div class="inspector-field-label">FONT SIZE</div>
							<input
								aria-label="Font size"
								type="text"
								class="inspector-input"
								bind:value={fontSizeStr}
								placeholder="Auto"
								onchange={() => setFontSize(fontSizeStr)}
								onblur={() => setFontSize(fontSizeStr)}
								onkeydown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
							/>
						</div>
						<div class="inspector-field">
							<div class="inspector-field-label">WEIGHT</div>
							<select
								aria-label="Font weight"
								class="inspector-input inspector-select"
								value={blockFontWeight ?? ''}
								onchange={(e) => setFontWeight((e.currentTarget as HTMLSelectElement).value)}
							>
								{#each fontWeightOptions as opt (opt.value)}
									<option value={opt.value}>{opt.label}</option>
								{/each}
							</select>
						</div>
						<div class="inspector-field">
							<div class="inspector-field-label">STYLE</div>
							<select aria-label="Font style" class="inspector-input inspector-select" value={blockTypography?.fontStyle ?? 'normal'} onchange={(e) => setTypography('fontStyle', (e.currentTarget as HTMLSelectElement).value === 'italic' ? 'italic' : 'normal')}>
								<option value="normal">Normal</option><option value="italic">Italic</option>
							</select>
						</div>
						<div class="inspector-field">
							<div class="inspector-field-label">LINE HEIGHT</div>
							<input aria-label="Line height" class="inspector-input" value={blockTypography?.lineHeight ?? ''} placeholder="Auto" onchange={(e) => setTypography('lineHeight', (e.currentTarget as HTMLInputElement).value)} />
						</div>
						<div class="inspector-field">
							<div class="inspector-field-label">LETTER SPACING</div>
							<input aria-label="Letter spacing" class="inspector-input" value={blockTypography?.letterSpacing ?? ''} placeholder="Auto" onchange={(e) => setTypography('letterSpacing', (e.currentTarget as HTMLInputElement).value)} />
						</div>
						<div class="inspector-field">
							<div class="inspector-field-label">PARAGRAPH SPACING</div>
							<input aria-label="Paragraph spacing" class="inspector-input" value={blockTypography?.paragraphSpacing ?? ''} placeholder="0px" onchange={(e) => setTypography('paragraphSpacing', (e.currentTarget as HTMLInputElement).value)} />
						</div>
						<div class="inspector-field inspector-field-wide">
							<div class="inspector-field-label">ALIGN</div>
							<select
								aria-label="Text alignment"
								class="inspector-input inspector-select"
								value={blockTextAlign ?? ''}
								onchange={(e) => setTextAlign((e.currentTarget as HTMLSelectElement).value)}
							>
								{#each textAlignOptions as opt (opt.value)}
									<option value={opt.value}>{opt.label}</option>
								{/each}
							</select>
						</div>
						<div class="inspector-field">
							<div class="inspector-field-label">VERTICAL ALIGN</div>
							<select aria-label="Vertical text alignment" class="inspector-input inspector-select" value={blockTypography?.verticalAlign ?? 'top'} onchange={(e) => setTypography('verticalAlign', (e.currentTarget as HTMLSelectElement).value as Typography['verticalAlign'])}>
								<option value="top">Top</option><option value="middle">Middle</option><option value="bottom">Bottom</option>
							</select>
						</div>
						<div class="inspector-field">
							<div class="inspector-field-label">SIZING</div>
							<select aria-label="Text sizing mode" class="inspector-input inspector-select" value={blockTypography?.sizingMode ?? 'fixed'} onchange={(e) => setTypography('sizingMode', (e.currentTarget as HTMLSelectElement).value as Typography['sizingMode'])}>
								<option value="fixed">Fixed</option><option value="auto-width">Auto width</option><option value="auto-height">Auto height</option>
							</select>
						</div>
						<div class="inspector-field">
							<div class="inspector-field-label">DECORATION</div>
							<select aria-label="Text decoration" class="inspector-input inspector-select" value={blockTypography?.textDecoration ?? 'none'} onchange={(e) => setTypography('textDecoration', (e.currentTarget as HTMLSelectElement).value as Typography['textDecoration'])}>
								<option value="none">None</option><option value="underline">Underline</option><option value="line-through">Strikethrough</option>
							</select>
						</div>
						<div class="inspector-field">
							<div class="inspector-field-label">CASE</div>
							<select aria-label="Text case" class="inspector-input inspector-select" value={blockTypography?.textTransform ?? 'none'} onchange={(e) => setTypography('textTransform', (e.currentTarget as HTMLSelectElement).value as Typography['textTransform'])}>
								<option value="none">Original</option><option value="uppercase">Uppercase</option><option value="lowercase">Lowercase</option><option value="capitalize">Capitalize</option>
							</select>
						</div>
						<label class="inspector-checkbox-row inspector-field-wide">
							<input type="checkbox" checked={blockTypography?.truncate ?? false} onchange={(e) => setTypography('truncate', (e.currentTarget as HTMLInputElement).checked)} />
							<span>Truncate overflow with ellipsis</span>
						</label>
					</div>
				{/if}

				{#if hasImageSelection}
					<div class="inspector-field inspector-field-wide">
						<div class="inspector-field-label">IMAGE SOURCE</div>
						<input
							aria-label="Image source"
							type="text"
							class="inspector-input"
							bind:value={imageSrcStr}
							placeholder="/images/example.png"
							onchange={() => setImageSrc(imageSrcStr)}
							onblur={() => setImageSrc(imageSrcStr)}
						/>
					</div>
					<div class="inspector-grid">
						<div class="inspector-field">
							<div class="inspector-field-label">ALT TEXT</div>
							<input
								aria-label="Image alternative text"
								type="text"
								class="inspector-input"
								bind:value={imageAltStr}
								placeholder="Image description"
								onchange={() => setImageAlt(imageAltStr)}
								onblur={() => setImageAlt(imageAltStr)}
							/>
						</div>
						<div class="inspector-field">
							<div class="inspector-field-label">FIT</div>
							<select
								aria-label="Image fit"
								class="inspector-input inspector-select"
								value={blockObjectFit ?? 'cover'}
								onchange={(e) => setObjectFit((e.currentTarget as HTMLSelectElement).value)}
							>
								{#each objectFitOptions as opt (opt)}
									<option value={opt}>{opt}</option>
								{/each}
							</select>
						</div>
					</div>
				{/if}

				{#if hasLinkSelection}
					<div class="inspector-field inspector-field-wide">
						<div class="inspector-field-label">LINK URL</div>
						<input
							aria-label="Link URL"
							type="text"
							class="inspector-input"
							bind:value={hrefStr}
							placeholder="https://example.com"
							onchange={() => setHref(hrefStr)}
							onblur={() => setHref(hrefStr)}
						/>
					</div>
				{/if}
			</div>
		{/if}

		<!-- ── HTML Tag ──────────────────────────────────────────────────── -->
		<div class="inspector-section">
			<div class="inspector-section-title">HTML TAG</div>
			<select
				aria-label="HTML tag"
				class="inspector-input inspector-select inspector-select-wide"
				value={blockHtmlTag ?? ''}
				onchange={(e) => setHtmlTag((e.currentTarget as HTMLSelectElement).value)}
			>
				{#each htmlTagOptions as opt (opt.value)}
					<option value={opt.value}>Tag {opt.label}</option>
				{/each}
			</select>
		</div>

		<!-- ── Layout ────────────────────────────────────────────────────── -->
		<div class="inspector-section">
			<div class="inspector-section-title">LAYOUT</div>
			<div class="inspector-pill-row">
				{#each ['free', 'row', 'column', 'grid'] as layout (layout)}
					<button
						type="button"
						class="inspector-pill"
						class:active={(blockLayout ?? 'free') === layout}
						onclick={() => setLayout(layout as 'free' | 'row' | 'column' | 'grid')}
					>
						{layout === 'free' ? 'Free' : layout === 'row' ? 'Row' : layout === 'column' ? 'Column' : 'Grid'}
					</button>
				{/each}
			</div>
		</div>

		<!-- ── Fill Stack ────────────────────────────────────────────────── -->
		<div class="inspector-section">
			<div class="inspector-section-title inspector-section-title-row">
				<span>FILLS</span>
				<button type="button" class="inspector-add-btn" onclick={addFill} title="Add fill">+</button>
			</div>
			{#if blockFills}
				{#each blockFills as fill, idx (idx)}
					<div class="inspector-fill-item" class:inspector-fill-item-active={editingFillIndex === idx}>
						<div class="inspector-fill-row-compact">
							<button
								type="button"
								class="inspector-eye-btn"
								title={fill.visible ? 'Hide fill' : 'Show fill'}
								onclick={() => toggleFillVisibility(idx)}
							>{fill.visible ? '👁' : '—'}</button>
							<select
								class="inspector-input inspector-select inspector-fill-type-select"
								value={fill.type}
								aria-label="Fill type"
								onchange={(e) => changeFillType(idx, (e.currentTarget as HTMLSelectElement).value as PaintType)}
							>
								{#each fillTypeOptions as opt (opt.value)}
									<option value={opt.value}>{opt.label}</option>
								{/each}
							</select>
							<button
								type="button"
								class="inspector-color-swatch inspector-fill-swatch"
								style={paintSwatchStyle(fill)}
								title="Edit fill"
								onclick={() => selectFillForEdit(idx)}
							></button>
							<div class="inspector-fill-preview" style={fill.type === 'solid' && fill.color !== 'transparent' ? `background:${fill.color}` : paintColorPreview(fill) ? `background:${paintColorPreview(fill)}` : ''}></div>
							<input
								type="number"
								class="inspector-input inspector-fill-opacity"
								min="0"
								max="1"
								step="0.05"
								value={fill.opacity}
								aria-label="Fill opacity"
								onchange={(e) => setFillOpacity(idx, parseFloat((e.currentTarget as HTMLInputElement).value) || 0)}
							/>
							<button
								type="button"
								class="inspector-fill-remove"
								title="Remove fill"
								onclick={() => removeFill(idx)}
							>×</button>
						</div>
						{#if editingFillIndex === idx}
							<div class="inspector-fill-editor">
								{#if fill.type === 'solid'}
									<div class="inspector-color-row-full">
										<span class="inspector-color-label">COLOR</span>
										<input
											type="text"
											class="inspector-input"
											value={fill.color}
											placeholder="#000000"
											onchange={(e) => setFillColor(idx, (e.currentTarget as HTMLInputElement).value)}
										/>
										<div class="inspector-swatches-inline">
											{#each swatches as c (c)}
												<button
													type="button"
													class="inspector-swatch"
													style="background:{c};"
													aria-label="Set fill to {c}"
													onclick={() => setFillColor(idx, c)}
												></button>
											{/each}
										</div>
									</div>
								{:else if fill.type === 'linear-gradient'}
									<div class="inspector-gradient-editor">
										<div class="inspector-color-row-full">
											<span class="inspector-color-label">ANGLE</span>
											<input
												type="range"
												min="0"
												max="360"
												value={fill.angle}
												oninput={(e) => setGradientAngle(parseInt((e.currentTarget as HTMLInputElement).value))}
											/>
											<input
												type="number"
												class="inspector-input inspector-narrow-input"
												value={fill.angle}
												min="0"
												max="360"
												onchange={(e) => setGradientAngle(parseInt((e.currentTarget as HTMLInputElement).value) || 0)}
											/>
										</div>
										<div class="inspector-gradient-stops">
											<span class="inspector-color-label">STOPS</span>
											{#each fill.stops as stop, si (si)}
												<div class="inspector-gradient-stop-row">
													<input
														type="text"
														class="inspector-input inspector-stop-color"
														value={stop.color}
														placeholder="#000000"
														onchange={(e) => setGradientStopColor(si, (e.currentTarget as HTMLInputElement).value)}
													/>
													<input
														type="number"
														class="inspector-input inspector-stop-pos"
														min="0"
														max="100"
														value={Math.round(stop.position * 100)}
														aria-label="Stop position %"
														onchange={(e) => setGradientStopPosition(si, parseFloat((e.currentTarget as HTMLInputElement).value) / 100 || 0)}
													/>
													<button
														type="button"
														class="inspector-fill-remove"
														disabled={fill.stops.length <= 2}
														title="Remove stop"
														onclick={() => removeGradientStop(si)}
													>×</button>
												</div>
											{/each}
											<button type="button" class="inspector-text-btn" onclick={addGradientStop}>+ Add stop</button>
										</div>
									</div>
								{:else if fill.type === 'radial-gradient'}
									<div class="inspector-gradient-editor">
										<div class="inspector-color-row-full">
											<span class="inspector-color-label">CENTER X</span>
											<input
												type="number"
												class="inspector-input inspector-narrow-input"
												min="0"
												max="100"
												value={Math.round(fill.cx * 100)}
												onchange={(e) => setGradientRadialCx(parseFloat((e.currentTarget as HTMLInputElement).value) / 100 || 0.5)}
											/>
											<span class="inspector-color-label">Y</span>
											<input
												type="number"
												class="inspector-input inspector-narrow-input"
												min="0"
												max="100"
												value={Math.round(fill.cy * 100)}
												onchange={(e) => setGradientRadialCy(parseFloat((e.currentTarget as HTMLInputElement).value) / 100 || 0.5)}
											/>
										</div>
										<div class="inspector-gradient-stops">
											<span class="inspector-color-label">STOPS</span>
											{#each fill.stops as stop, si (si)}
												<div class="inspector-gradient-stop-row">
													<input
														type="text"
														class="inspector-input inspector-stop-color"
														value={stop.color}
														placeholder="#000000"
														onchange={(e) => setGradientStopColor(si, (e.currentTarget as HTMLInputElement).value)}
													/>
													<input
														type="number"
														class="inspector-input inspector-stop-pos"
														min="0"
														max="100"
														value={Math.round(stop.position * 100)}
														aria-label="Stop position %"
														onchange={(e) => setGradientStopPosition(si, parseFloat((e.currentTarget as HTMLInputElement).value) / 100 || 0)}
													/>
													<button
														type="button"
														class="inspector-fill-remove"
														disabled={fill.stops.length <= 2}
														title="Remove stop"
														onclick={() => removeGradientStop(si)}
													>×</button>
												</div>
											{/each}
											<button type="button" class="inspector-text-btn" onclick={addGradientStop}>+ Add stop</button>
										</div>
									</div>
								{:else if fill.type === 'image'}
									<div class="inspector-image-fill-editor">
										<div class="inspector-color-row-full">
											<span class="inspector-color-label">URL</span>
											<input
												type="text"
												class="inspector-input"
												value={fill.src}
												placeholder="https://example.com/image.png"
												onchange={(e) => setImageFillUrl((e.currentTarget as HTMLInputElement).value)}
											/>
										</div>
										<div class="inspector-color-row-full">
											<span class="inspector-color-label">MODE</span>
											<select
												class="inspector-input inspector-select"
												value={fill.mode}
												onchange={(e) => setImageFillMode((e.currentTarget as HTMLSelectElement).value as ImageFillMode)}
											>
												{#each imageFillModes as opt (opt.value)}
													<option value={opt.value}>{opt.label}</option>
												{/each}
											</select>
										</div>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			{:else}
				<div class="inspector-multi-mixed">Mixed — use single selection</div>
			{/if}
		</div>

		<!-- ── Strokes ───────────────────────────────────────────────────── -->
		<div class="inspector-section">
			<div class="inspector-section-title inspector-section-title-row">
				<span>STROKES</span>
				{#if blockStrokes}
					<button
						type="button"
						class="inspector-add-btn-small"
						title="Add stroke"
						onclick={() => setSelectedStrokes([...blockStrokes, {
							color: '#000000', weight: 1, align: 'center', style: 'solid',
							dashPattern: [], cap: 'round', join: 'round', visible: true, side: 'all'
						}])}
					>+</button>
				{/if}
			</div>
			{#if blockStrokes}
				{#each blockStrokes as stroke, idx (idx)}
					<div class="inspector-stroke-compact">
						<div class="inspector-stroke-header">
							<button
								type="button"
								class="inspector-eye-btn"
								title={stroke.visible ? 'Hide stroke' : 'Show stroke'}
								onclick={() => {
									const next = [...blockStrokes];
									next[idx] = { ...next[idx], visible: !next[idx].visible };
									setSelectedStrokes(next);
								}}
							>{stroke.visible ? '👁' : '—'}</button>
							<input
								type="number"
								class="inspector-input inspector-stroke-width"
								value={stroke.weight}
								min="0"
								step="0.5"
								aria-label="Stroke width"
								onchange={(e) => {
									const next = [...blockStrokes];
									next[idx] = { ...next[idx], weight: parseFloat((e.currentTarget as HTMLInputElement).value) || 0 };
									setSelectedStrokes(next);
								}}
							/>
							<select
								class="inspector-input inspector-select"
								value={stroke.style}
								aria-label="Stroke style"
								onchange={(e) => {
									const next = [...blockStrokes];
									next[idx] = { ...next[idx], style: (e.currentTarget as HTMLSelectElement).value as StrokeStyle };
									setSelectedStrokes(next);
								}}
							>
								{#each strokeStylesArr as s (s)}
									<option value={s}>{s}</option>
								{/each}
							</select>
							<button
								type="button"
								class="inspector-color-swatch"
								style={fillPreviewStyle(stroke.color)}
								title="Stroke color"
								onclick={() => {
									const next = [...blockStrokes];
									next[idx] = { ...next[idx], color: prompt('Enter color:', stroke.color) ?? stroke.color };
									setSelectedStrokes(next);
								}}
							></button>
							<button
								type="button"
								class="inspector-fill-remove"
								title="Remove stroke"
								onclick={() => {
									const next = blockStrokes.filter((_, i) => i !== idx);
									setSelectedStrokes(next);
								}}
							>×</button>
						</div>
					</div>
				{/each}
			{/if}
			<!-- Legacy simple stroke editor (multi-select compatible) -->
			<div class="inspector-stroke-row">
				<input
					aria-label="Stroke width in pixels"
					type="number"
					class="inspector-input inspector-stroke-width"
					min="0"
					placeholder="—"
					bind:value={strokeWidthStr}
					onchange={() => commitNumber(strokeWidthStr, (n) => {
						const current = strokeState ?? { width: 1, style: 'solid', color: '#000000' };
						setStroke({ ...current, width: n });
					})}
					onblur={() => commitNumber(strokeWidthStr, (n) => {
						const current = strokeState ?? { width: 1, style: 'solid', color: '#000000' };
						setStroke({ ...current, width: n });
					})}
					onkeydown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
				/>
				<select
					aria-label="Stroke style"
					class="inspector-input inspector-select"
					value={strokeState?.style ?? 'solid'}
					onchange={(e) => {
						const v = (e.currentTarget as HTMLSelectElement).value as StrokeStyle;
						const current = strokeState ?? { width: 1, style: 'solid', color: '#000000' };
						setStroke({ ...current, style: v });
					}}
				>
					{#each strokeStylesArr as s (s)}
						<option value={s}>{s}</option>
					{/each}
				</select>
				<button
					type="button"
					class="inspector-color-swatch"
					style={fillPreviewStyle(strokeState?.color)}
					title="Pick stroke color"
					onclick={() => toggleColorPicker('stroke')}
				></button>
			</div>
			{#if openColorPicker === 'stroke'}
				<div class="inspector-color-popover" role="presentation">
					<div class="inspector-swatches">
						{#each swatches as c (c)}
							<button
								type="button"
								class="inspector-swatch"
								style="background:{c};"
								aria-label={`Set stroke to ${c}`}
								onclick={() => { applyColor('stroke', c); openColorPicker = null; }}
							></button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- ── Stroke detail (align, cap, join) ── -->
			{#if blockStrokes && blockStrokes.length > 0}
				<div class="inspector-stroke-detail">
					<div class="inspector-pill-row">
						{#each strokeAligns as al (al)}
							<button
								type="button"
								class="inspector-pill-sm"
								class:active={blockStrokes[0].align === al}
								onclick={() => {
									const next = [...blockStrokes];
									next[0] = { ...next[0], align: al };
									setSelectedStrokes(next);
								}}
							>{al}</button>
						{/each}
					</div>
					<div class="inspector-grid">
						<div class="inspector-field">
							<div class="inspector-field-label">CAP</div>
							<select
								class="inspector-input inspector-select"
								value={blockStrokes[0].cap}
								onchange={(e) => {
									const next = [...blockStrokes];
									next[0] = { ...next[0], cap: (e.currentTarget as HTMLSelectElement).value as StrokeCap };
									setSelectedStrokes(next);
								}}
							>
								{#each strokeCaps as sc (sc)}
									<option value={sc}>{sc}</option>
								{/each}
							</select>
						</div>
						<div class="inspector-field">
							<div class="inspector-field-label">JOIN</div>
							<select
								class="inspector-input inspector-select"
								value={blockStrokes[0].join}
								onchange={(e) => {
									const next = [...blockStrokes];
									next[0] = { ...next[0], join: (e.currentTarget as HTMLSelectElement).value as StrokeJoin };
									setSelectedStrokes(next);
								}}
							>
								{#each strokeJoins as sj (sj)}
									<option value={sj}>{sj}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- ── Corner Radius ─────────────────────────────────────────────── -->
		<div class="inspector-section">
			<div class="inspector-section-title inspector-section-title-row">
				<span>CORNER RADIUS</span>
				<label class="inspector-toggle">
					<input
						type="checkbox"
						checked={blockCorners?.linked ?? true}
						onchange={toggleCornerLinked}
					/>
					<span>Link</span>
				</label>
			</div>
			{#if blockCorners}
				{#if blockCorners.linked}
					<div class="inspector-grid">
						<div class="inspector-field inspector-field-wide">
							<div class="inspector-field-label">ALL CORNERS (PX)</div>
							<input
								type="number"
								class="inspector-input"
								min="0"
								value={blockCorners.topLeft}
								onchange={(e) => setCorner('topLeft', parseInt((e.currentTarget as HTMLInputElement).value) || 0)}
							/>
						</div>
					</div>
				{:else}
					<div class="inspector-grid">
						<div class="inspector-field">
							<div class="inspector-field-label">TL</div>
							<input
								type="number"
								class="inspector-input"
								min="0"
								value={blockCorners.topLeft}
								onchange={(e) => setCorner('topLeft', parseInt((e.currentTarget as HTMLInputElement).value) || 0)}
							/>
						</div>
						<div class="inspector-field">
							<div class="inspector-field-label">TR</div>
							<input
								type="number"
								class="inspector-input"
								min="0"
								value={blockCorners.topRight}
								onchange={(e) => setCorner('topRight', parseInt((e.currentTarget as HTMLInputElement).value) || 0)}
							/>
						</div>
						<div class="inspector-field">
							<div class="inspector-field-label">BR</div>
							<input
								type="number"
								class="inspector-input"
								min="0"
								value={blockCorners.bottomRight}
								onchange={(e) => setCorner('bottomRight', parseInt((e.currentTarget as HTMLInputElement).value) || 0)}
							/>
						</div>
						<div class="inspector-field">
							<div class="inspector-field-label">BL</div>
							<input
								type="number"
								class="inspector-input"
								min="0"
								value={blockCorners.bottomLeft}
								onchange={(e) => setCorner('bottomLeft', parseInt((e.currentTarget as HTMLInputElement).value) || 0)}
							/>
						</div>
					</div>
				{/if}
			{:else}
				<div class="inspector-grid">
					<div class="inspector-field inspector-field-wide">
						<div class="inspector-field-label">ALL CORNERS (PX)</div>
						<input
							type="number"
							class="inspector-input"
							min="0"
							bind:value={radiusStr}
							onchange={() => commitNumber(radiusStr, setRadius)}
							onblur={() => commitNumber(radiusStr, setRadius)}
							onkeydown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
						/>
					</div>
				</div>
			{/if}
		</div>

		<!-- ── Effects ───────────────────────────────────────────────────── -->
		<div class="inspector-section">
			<div class="inspector-section-title inspector-section-title-row">
				<span>EFFECTS</span>
				<select
					class="inspector-input inspector-select inspector-effect-add"
					aria-label="Add effect"
					value=""
					onchange={(e) => {
						const v = (e.currentTarget as HTMLSelectElement).value as Effect['type'];
						if (v) { addEffect(v); (e.currentTarget as HTMLSelectElement).value = ''; }
					}}
				>
					<option value="" disabled>+ Add effect</option>
					{#each effectTypes as et (et.value)}
						<option value={et.value}>{et.label}</option>
					{/each}
				</select>
			</div>
			{#if blockEffects}
				{#each blockEffects as effect, idx (idx)}
					<div class="inspector-effect-row">
						<div class="inspector-effect-header">
							<button
								type="button"
								class="inspector-eye-btn"
								title={effect.visible ? 'Hide effect' : 'Show effect'}
								onclick={() => toggleEffectVisibility(idx)}
							>{effect.visible ? '👁' : '—'}</button>
							<span class="inspector-effect-label">{effect.type.replace('-', ' ')}</span>
							<button
								type="button"
								class="inspector-fill-remove"
								title="Remove effect"
								onclick={() => removeEffect(idx)}
							>×</button>
						</div>
						{#if effect.type === 'drop-shadow' || effect.type === 'inner-shadow'}
							<div class="inspector-grid inspector-effect-params">
								<div class="inspector-field">
									<div class="inspector-field-label">X</div>
									<input
										type="number"
										class="inspector-input"
										value={effect.offsetX}
										onchange={(e) => updateDropShadow(idx, { offsetX: parseInt((e.currentTarget as HTMLInputElement).value) || 0 })}
									/>
								</div>
								<div class="inspector-field">
									<div class="inspector-field-label">Y</div>
									<input
										type="number"
										class="inspector-input"
										value={effect.offsetY}
										onchange={(e) => updateDropShadow(idx, { offsetY: parseInt((e.currentTarget as HTMLInputElement).value) || 0 })}
									/>
								</div>
								<div class="inspector-field">
									<div class="inspector-field-label">BLUR</div>
									<input
										type="number"
										class="inspector-input"
										min="0"
										value={effect.radius}
										onchange={(e) => updateDropShadow(idx, { radius: parseInt((e.currentTarget as HTMLInputElement).value) || 0 })}
									/>
								</div>
								<div class="inspector-field">
									<div class="inspector-field-label">SPREAD</div>
									<input
										type="number"
										class="inspector-input"
										value={effect.spread}
										onchange={(e) => updateDropShadow(idx, { spread: parseInt((e.currentTarget as HTMLInputElement).value) || 0 })}
									/>
								</div>
								<div class="inspector-field inspector-field-wide">
									<div class="inspector-field-label">COLOR</div>
									<input
										type="text"
										class="inspector-input"
										value={effect.color}
										onchange={(e) => updateDropShadow(idx, { color: (e.currentTarget as HTMLInputElement).value })}
									/>
								</div>
							</div>
						{:else if effect.type === 'layer-blur' || effect.type === 'background-blur'}
							<div class="inspector-grid">
								<div class="inspector-field inspector-field-wide">
									<div class="inspector-field-label">BLUR (PX)</div>
									<input
										type="number"
										class="inspector-input"
										min="0"
										value={effect.blur}
										onchange={(e) => updateBlurEffect(idx, parseInt((e.currentTarget as HTMLInputElement).value) || 0)}
									/>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			{:else if !blockEffects}
				<div class="inspector-multi-mixed">Mixed — use single selection</div>
			{/if}
			{#if blockEffects && blockEffects.length === 0}
				<div class="inspector-empty-hint">No effects. Use "+" to add.</div>
			{/if}
		</div>

		<!-- ── Blend Mode ────────────────────────────────────────────────── -->
		<div class="inspector-section">
			<div class="inspector-section-title">BLEND MODE</div>
			<select
				class="inspector-input inspector-select inspector-select-wide"
				value={blockBlendMode ?? 'normal'}
				aria-label="Blend mode"
				onchange={(e) => setSelectedBlendMode((e.currentTarget as HTMLSelectElement).value)}
			>
				{#each BLEND_MODES as bm (bm)}
					<option value={bm}>{bm}</option>
				{/each}
			</select>
		</div>
	</div>
{/if}
