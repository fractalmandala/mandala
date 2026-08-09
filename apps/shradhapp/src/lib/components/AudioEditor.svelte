<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { PlayIcon, PauseIcon, ScissorsIcon, PlusIcon, MinusIcon } from 'phosphor-svelte';

	let {
		audioId = '',
		audioUrl = '',
		peaks = [],
		duration = 0,
		playing = false,
		currentTime = 0,
		onTogglePlay,
		onSeek,
		onRegionChange,
		onCut,
		onSilence,
		onFadeIn,
		onFadeOut,
		onNormalize
	}: {
		audioId?: string;
		audioUrl?: string;
		peaks?: number[];
		duration?: number;
		playing?: boolean;
		currentTime?: number;
		onTogglePlay?: () => void;
		onSeek?: (time: number) => void;
		onRegionChange?: (region: { start: number; end: number } | null) => void;
		onCut?: (region: { start: number; end: number }) => void;
		onSilence?: (region: { start: number; end: number }) => void;
		onFadeIn?: (region: { start: number; end: number }) => void;
		onFadeOut?: (region: { start: number; end: number }) => void;
		onNormalize?: () => void;
	} = $props();

	/** Helper to build the current region payload. */
	function currentRegion(): { start: number; end: number } {
		return { start: regionMin, end: regionMax };
	}

	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let wrapperEl = $state<HTMLDivElement | null>(null);
	let regionStart = $state<number | null>(null);
	let regionEnd = $state<number | null>(null);
	let dragging = $state(false);
	let dragStartX = $state(0);
	let zoom = $state(1);
	let scrollOffset = $state(0);
	let canvasWidth = $state(0);
	let canvasHeight = $state(120);

	let hasRegion = $derived(regionStart !== null && regionEnd !== null);
	let regionMin = $derived(hasRegion ? Math.min(regionStart!, regionEnd!) : 0);
	let regionMax = $derived(hasRegion ? Math.max(regionStart!, regionEnd!) : 0);

	let playheadLeft = $derived(
		duration > 0 ? (currentTime / duration) * canvasWidth * zoom - scrollOffset * (canvasWidth / (duration / zoom)) : 0
	);

	function formatTime(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function xToTime(clientX: number): number {
		if (!canvasEl || duration <= 0) return 0;
		const rect = canvasEl.getBoundingClientRect();
		const x = clientX - rect.left;
		const visibleDuration = duration / zoom;
		return scrollOffset + (x / rect.width) * visibleDuration;
	}

	function timeToX(time: number): number {
		if (!canvasEl || duration <= 0) return 0;
		const rect = canvasEl.getBoundingClientRect();
		const visibleDuration = duration / zoom;
		return ((time - scrollOffset) / visibleDuration) * rect.width;
	}

	function handleMouseDown(e: MouseEvent) {
		dragging = true;
		dragStartX = e.clientX;
		const t = xToTime(e.clientX);
		regionStart = t;
		regionEnd = t;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!dragging) return;
		regionEnd = xToTime(e.clientX);
	}

	function handleMouseUp(e: MouseEvent) {
		if (!dragging) return;
		dragging = false;
		const dx = Math.abs(e.clientX - dragStartX);
		if (dx < 4) {
			// Click without drag → seek
			regionStart = null;
			regionEnd = null;
			onRegionChange?.(null);
			onSeek?.(xToTime(e.clientX));
		} else {
			const start = Math.min(regionStart!, regionEnd!);
			const end = Math.max(regionStart!, regionEnd!);
			regionStart = start;
			regionEnd = end;
			onRegionChange?.({ start, end });
		}
	}

	function handleDblClick() {
		regionStart = null;
		regionEnd = null;
		onRegionChange?.(null);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === ' ' || e.code === 'Space') {
			e.preventDefault();
			onTogglePlay?.();
		} else if (e.key === 'Delete' || e.key === 'Backspace') {
			if (hasRegion) {
				e.preventDefault();
				onCut?.(currentRegion());
			}
		}
	}

	function zoomIn() {
		zoom = Math.min(zoom * 1.5, 32);
	}

	function zoomOut() {
		zoom = Math.max(zoom / 1.5, 1);
		if (zoom === 1) scrollOffset = 0;
	}

	function drawWaveform() {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const w = canvasEl.clientWidth;
		const h = canvasEl.clientHeight;
		canvasEl.width = w * dpr;
		canvasEl.height = h * dpr;
		ctx.scale(dpr, dpr);
		canvasWidth = w;
		canvasHeight = h;

		// Read CSS custom properties
		const style = getComputedStyle(canvasEl);
		const surfaceColor = style.getPropertyValue('--surface-1').trim() || '#10191e';
		const accentColor = style.getPropertyValue('--accent').trim() || '#f4ae64';

		// Background
		ctx.fillStyle = surfaceColor;
		ctx.fillRect(0, 0, w, h);

		if (peaks.length === 0 || duration <= 0) return;

		const visibleDuration = duration / zoom;
		const startSample = Math.floor((scrollOffset / duration) * peaks.length);
		const endSample = Math.floor(((scrollOffset + visibleDuration) / duration) * peaks.length);
		const visiblePeaks = peaks.slice(Math.max(0, startSample), Math.min(peaks.length, endSample));

		if (visiblePeaks.length === 0) return;

		const mid = h / 2;
		const barWidth = w / visiblePeaks.length;

		// Draw waveform fill
		ctx.fillStyle = accentColor;
		ctx.beginPath();
		ctx.moveTo(0, mid);

		for (let i = 0; i < visiblePeaks.length; i++) {
			const peak = Math.abs(visiblePeaks[i]);
			const x = i * barWidth;
			const barH = peak * mid * 0.92;
			ctx.lineTo(x, mid - barH);
		}

		for (let i = visiblePeaks.length - 1; i >= 0; i--) {
			const peak = Math.abs(visiblePeaks[i]);
			const x = i * barWidth;
			const barH = peak * mid * 0.92;
			ctx.lineTo(x, mid + barH);
		}

		ctx.closePath();
		ctx.fill();

		// Draw region overlay on canvas
		if (hasRegion) {
			const rx1 = timeToX(regionMin);
			const rx2 = timeToX(regionMax);
			ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
			ctx.fillRect(rx1, 0, rx2 - rx1, h);
		}

		// Draw playhead
		const px = timeToX(currentTime);
		if (px >= 0 && px <= w) {
			ctx.fillStyle = accentColor;
			ctx.fillRect(px, 0, 2, h);
		}
	}

	let resizeObserver: ResizeObserver | null = null;

	onMount(() => {
		if (wrapperEl) {
			resizeObserver = new ResizeObserver(() => {
				drawWaveform();
			});
			resizeObserver.observe(wrapperEl);
		}
	});

	onDestroy(() => {
		resizeObserver?.disconnect();
	});

	// Redraw whenever relevant data changes
	$effect(() => {
		// Touch reactive deps
		void peaks;
		void duration;
		void currentTime;
		void zoom;
		void scrollOffset;
		void regionStart;
		void regionEnd;
		void canvasEl;
		drawWaveform();
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="audio-editor" onkeydown={handleKeydown} tabindex={0} role="region" aria-label="Audio editor">
	<div class="audio-toolbar">
		<div class="group">
			<button class="icon-button" onclick={onTogglePlay} aria-label={playing ? 'Pause' : 'Play'}>
				{#if playing}
					<PauseIcon size={20} weight="fill" />
				{:else}
					<PlayIcon size={20} weight="fill" />
				{/if}
			</button>
			<span class="timecode">{formatTime(currentTime)} / {formatTime(duration)}</span>
		</div>

		<div class="group group-center">
			<button class="edit-btn" onclick={() => onCut?.(currentRegion())} disabled={!hasRegion}>
				<ScissorsIcon size={16} />
				Cut
			</button>
			<button class="edit-btn" onclick={() => onSilence?.(currentRegion())} disabled={!hasRegion}>Silence</button>
			<button class="edit-btn" onclick={() => onFadeIn?.(currentRegion())} disabled={!hasRegion}>Fade In</button>
			<button class="edit-btn" onclick={() => onFadeOut?.(currentRegion())} disabled={!hasRegion}>Fade Out</button>
			<button class="edit-btn" onclick={() => onNormalize?.()}>Normalize</button>
		</div>

		<div class="group">
			<button class="icon-button" onclick={zoomOut} aria-label="Zoom out">
				<MinusIcon size={18} />
			</button>
			<button class="icon-button" onclick={zoomIn} aria-label="Zoom in">
				<PlusIcon size={18} />
			</button>
		</div>
	</div>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="audio-canvas-wrapper" bind:this={wrapperEl}>
		<canvas
			class="audio-canvas"
			bind:this={canvasEl}
			onmousedown={handleMouseDown}
			onmousemove={handleMouseMove}
			onmouseup={handleMouseUp}
			ondblclick={handleDblClick}
		></canvas>

		{#if hasRegion}
			<div
				class="region-overlay"
				style="left: {timeToX(regionMin)}px; width: {Math.max(0, timeToX(regionMax) - timeToX(regionMin))}px;"
			></div>
		{/if}
	</div>
</div>
