<script lang="ts">
	import { useMotionValueEvent } from '@humanspeak/svelte-motion';
	import { type Snippet } from 'svelte';
	import { usePopoverPortalPosition } from '../popover-position/popover-position.svelte.js';
	import { getPopoverContext } from './popover-context.js';
	import './popover.sass';

	const CIRCLE_KAPPA = 0.5523;
	const ALIGN_ORIGIN = { start: 'left', center: 'center', end: 'right' } as const;

	const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

	interface Rect {
		x: number;
		y: number;
		w: number;
		h: number;
		r: number;
	}
	interface Geo {
		layerW: number;
		layerH: number;
		left: number;
		top: number;
		trigger: Rect;
		panel: Rect;
	}

	// Trigger rect and panel rect in a shared local coordinate box.
	function buildGeo(
		tW: number,
		tH: number,
		cW: number,
		cH: number,
		side: 'top' | 'bottom',
		align: 'start' | 'center' | 'end',
		gap: number,
		panelRadius: number
	): Geo {
		const py = side === 'bottom' ? tH + gap : -(gap + cH);
		const px = align === 'start' ? 0 : align === 'end' ? tW - cW : (tW - cW) / 2;

		const left = Math.min(0, px);
		const top = Math.min(0, py);
		const layerW = Math.max(tW, px + cW) - left;
		const layerH = Math.max(tH, py + cH) - top;

		const triggerRadius = Math.min(tH / 2, panelRadius);

		return {
			layerW,
			layerH,
			left,
			top,
			trigger: { x: -left, y: -top, w: tW, h: tH, r: triggerRadius },
			panel: { x: px - left, y: py - top, w: cW, h: cH, r: panelRadius }
		};
	}

	function rectAtProgress(geo: Geo, progress: number): Rect {
		const trigger = geo.trigger;
		const panel = geo.panel;

		return {
			x: lerp(trigger.x, panel.x, progress),
			y: lerp(trigger.y, panel.y, progress),
			w: lerp(trigger.w, panel.w, progress),
			h: lerp(trigger.h, panel.h, progress),
			r: lerp(trigger.r, panel.r, progress)
		};
	}

	function insetFor(rect: Rect, layerW: number, layerH: number) {
		const top = rect.y;
		const right = layerW - (rect.x + rect.w);
		const bottom = layerH - (rect.y + rect.h);
		const left = rect.x;
		return `inset(${top}px ${right}px ${bottom}px ${left}px round ${rect.r}px)`;
	}

	function roundedRectShape(rect: Rect) {
		const radius = Math.max(0, Math.min(rect.r, rect.w / 2, rect.h / 2));
		const control = radius * CIRCLE_KAPPA;
		const x1 = rect.x;
		const y1 = rect.y;
		const x2 = rect.x + rect.w;
		const y2 = rect.y + rect.h;
		const px = (value: number) => `${value.toFixed(3)}px`;

		return (
			`shape(from ${px(x1 + radius)} ${px(y1)}, ` +
			`line to ${px(x2 - radius)} ${px(y1)}, ` +
			`curve to ${px(x2)} ${px(y1 + radius)} with ${px(x2 - radius + control)} ${px(y1)} / ${px(x2)} ${px(y1 + radius - control)}, ` +
			`line to ${px(x2)} ${px(y2 - radius)}, ` +
			`curve to ${px(x2 - radius)} ${px(y2)} with ${px(x2)} ${px(y2 - radius + control)} / ${px(x2 - radius + control)} ${px(y2)}, ` +
			`line to ${px(x1 + radius)} ${px(y2)}, ` +
			`curve to ${px(x1)} ${px(y2 - radius)} with ${px(x1 + radius - control)} ${px(y2)} / ${px(x1)} ${px(y2 - radius + control)}, ` +
			`line to ${px(x1)} ${px(y1 + radius)}, ` +
			`curve to ${px(x1 + radius)} ${px(y1)} with ${px(x1)} ${px(y1 + radius - control)} / ${px(x1 + radius - control)} ${px(y1)}, ` +
			'close)'
		);
	}

	function clipForProgress(geo: Geo, progress: number, supportsShape: boolean) {
		const rect = rectAtProgress(geo, progress);
		return supportsShape ? roundedRectShape(rect) : insetFor(rect, geo.layerW, geo.layerH);
	}

	let {
		children,
		class: className
	}: {
		children: Snippet;
		class?: string;
	} = $props();

	const ctx = getPopoverContext('PopoverContent');
	const { progress, contentRef } = ctx;

	let portalReady = $state(false);
	$effect(() => {
		portalReady = true;
	});

	let portalEl = $state<HTMLDivElement | null>(null);
	let blobEl = $state<HTMLDivElement | null>(null);
	let clipEl = $state<HTMLDivElement | null>(null);
	let measureEl = $state<HTMLDivElement | null>(null);
	// $state so the change callback (registered once, callback captured) reads
	// the latest geo instead of the first one it closed over.
	let geoRef = $state<Geo | null>(null);
	let supportsShape = $state(false);

	$effect(() => {
		contentRef.current = measureEl;
		return () => {
			contentRef.current = null;
		};
	});

	const layout = usePopoverPortalPosition(
		() => ctx.triggerRef.current,
		() => measureEl,
		() => portalReady
	);

	const geo = $derived(
		buildGeo(
			layout?.trigger.width ?? 0,
			layout?.trigger.height ?? 0,
			layout?.content.width ?? 0,
			layout?.content.height ?? 0,
			ctx.side,
			ctx.align,
			ctx.gap,
			ctx.panelRadius
		)
	);

	// Morph the same clip on the goo body and the content, so the whole popover
	// oozes as one and the text reveals with it.
	function render(g: Geo | null, p: number) {
		if (!g || g.layerW === 0) return;
		const clip = clipForProgress(g, p, supportsShape);
		if (blobEl) blobEl.style.clipPath = clip;
		if (clipEl) clipEl.style.clipPath = clip;
	}

	$effect(() => {
		supportsShape =
			typeof CSS !== 'undefined' &&
			typeof CSS.supports === 'function' &&
			CSS.supports('clip-path', 'shape(from 0px 0px, line to 1px 1px, close)');
		geoRef = geo;
		render(geo, progress.get());
	});

	useMotionValueEvent(progress, 'change', (p) => render(geoRef, p));

	// Move the portalled layer into <body> once mounted so it escapes any
	// ancestor transform/overflow (mirrors React createPortal).
	$effect(() => {
		const el = portalEl;
		if (!el || el.parentElement === document.body) return;
		document.body.appendChild(el);
	});

	const maskId = `${ctx.gooId}-trigger-cutout`;
</script>

{#if portalReady}
	<div
		bind:this={portalEl}
		data-slot="popover-portal"
		style={`visibility:${layout ? 'visible' : 'hidden'};transform:translate3d(${layout?.trigger.left ?? 0}px, ${layout?.trigger.top ?? 0}px, 0)`}
	>
		<!-- Goo filter: blur, sharpen the alpha back into solid shapes, then lay
		     the crisp original on top so blobs merge with liquid edges. The mask
		     removes the real trigger area so this top-layer copy never covers its
		     label or focus ring. -->
		<svg aria-hidden="true" width="0" height="0">
			<title>Popover visual effects</title>
			<defs>
				<filter id={ctx.gooId} x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur in="SourceGraphic" stdDeviation={ctx.gooStrength} result="blur" />
					<feColorMatrix
						in="blur"
						mode="matrix"
						values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
						result="goo"
					/>
					<feComposite in="SourceGraphic" in2="goo" operator="atop" />
				</filter>
				<mask
					id={maskId}
					maskUnits="userSpaceOnUse"
					maskContentUnits="userSpaceOnUse"
					x={0}
					y={0}
					width={geo.layerW}
					height={geo.layerH}
				>
					<rect width={geo.layerW} height={geo.layerH} fill="white" />
					<rect
						x={geo.trigger.x}
						y={geo.trigger.y}
						width={geo.trigger.w}
						height={geo.trigger.h}
						rx={geo.trigger.r}
						fill="black"
					/>
				</mask>
			</defs>
		</svg>

		<!-- Goo body: static trigger pill + morphing blob. -->
		<div
			aria-hidden="true"
			data-slot="popover-goo-layer"
			style={`left:${geo.left}px;top:${geo.top}px;width:${geo.layerW}px;height:${geo.layerH}px;${ctx.reduce ? '' : `filter:url(#${ctx.gooId});`}mask:url(#${maskId});-webkit-mask:url(#${maskId})`}
		>
			<div
				data-slot="popover-goo-fill"
				style={`left:${geo.trigger.x}px;top:${geo.trigger.y}px;width:${geo.trigger.w}px;height:${geo.trigger.h}px;border-radius:${geo.trigger.r}px`}
			></div>
			<div
				bind:this={blobEl}
				data-slot="popover-goo-fill"
				style={`clip-path:${clipForProgress(geo, progress.get(), false)}`}
			></div>
		</div>

		<!-- Content is clipped by the same morph. The portal wrapper stays
		     pointer-transparent; only the fully open panel accepts interaction. -->
		<div
			data-slot="popover-content-layer"
			style={`left:${geo.left}px;top:${geo.top}px;width:${geo.layerW}px;height:${geo.layerH}px`}
		>
			<div
				bind:this={clipEl}
				inert={!ctx.open}
				data-slot="popover-content-clip"
				style={`clip-path:${clipForProgress(geo, progress.get(), false)};pointer-events:${ctx.open ? 'auto' : 'none'}`}
			>
				<div
					bind:this={measureEl}
					id={ctx.contentId}
					role="dialog"
					tabindex={-1}
					onmouseenter={ctx.triggerMode === 'hover' ? ctx.openHover : undefined}
					onmouseleave={ctx.triggerMode === 'hover' ? ctx.scheduleClose : undefined}
					style={`position:absolute;left:${geo.panel.x}px;top:${geo.panel.y}px;transform-origin:${ALIGN_ORIGIN[ctx.align]} ${ctx.side === 'bottom' ? 'top' : 'bottom'}`}
					data-slot="popover-panel"
					class={className}
				>
					{@render children()}
				</div>
			</div>
		</div>
	</div>
{/if}
