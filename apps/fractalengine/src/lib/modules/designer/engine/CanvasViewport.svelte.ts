/**
 * CanvasViewport.ts
 *
 * A self-contained canvas viewport engine:
 * pan, zoom, screen↔canvas coordinate transform, and wheel handler.
 *
 * Plain TypeScript — no framework dependency. Works in any project.
 * For Svelte 5 reactivity, prefix public fields with `$state()`.
 *
 * Usage:
 *   const vp = new CanvasViewport({ containerQuery: '.canvas-viewport' });
 *   // In your template:
 *   <div class="canvas-viewport" onwheel={(e) => vp.onWheel(e)}>
 *     <div style="transform: translate({vp.x}px, {vp.y}px) scale({vp.zoom});">
 *       <!-- your canvas content -->
 *     </div>
 *   </div>
 *   vp.screenToCanvas(clientX, clientY) → { x, y }
 *   vp.canvasToScreen(canvasX, canvasY) → { x, y }
 */

export type ViewportState = {
	x: number;
	y: number;
	zoom: number;
};

export type ViewportOptions = {
	/** CSS selector for the viewport container element. Used by screenToCanvas
	 *  to compute the offset via getBoundingClientRect. */
	containerQuery?: string;
	/** Minimum zoom level (default 0.15). */
	minZoom?: number;
	/** Maximum zoom level (default 4.0). */
	maxZoom?: number;
	/** Zoom factor per scroll tick (default 1.05). */
	zoomFactor?: number;
};

export class CanvasViewport {
	// ── Public state ────────────────────────────────────────────────────────
	// Must be $state — these drive the canvas-world transform directly, and
	// this class is instantiated as a plain `new CanvasViewport()` (not
	// itself wrapped in $state), so plain fields here would never trigger
	// a re-render no matter how much pan/zoom math mutates them.
	x = $state(0);
	y = $state(0);
	zoom = $state(1);

	// ── Configuration ───────────────────────────────────────────────────────
	private containerQuery: string;
	private minZoom: number;
	private maxZoom: number;
	private zoomFactor: number;

	// ── Pan gesture tracking ────────────────────────────────────────────────
	private pan: {
		startPointerX: number;
		startPointerY: number;
		startViewportX: number;
		startViewportY: number;
	} | null = null;

	// ── Animation ───────────────────────────────────────────────────────────
	private animationFrameId: number | null = null;
	private animationTarget: ViewportState | null = null;

	constructor(options: ViewportOptions = {}) {
		this.containerQuery = options.containerQuery ?? '.canvas-viewport';
		this.minZoom = options.minZoom ?? 0.15;
		this.maxZoom = options.maxZoom ?? 4.0;
		this.zoomFactor = options.zoomFactor ?? 1.05;
	}

	/** Return the current viewport as a plain object (for snapshotting, etc.). */
	get state(): ViewportState {
		return { x: this.x, y: this.y, zoom: this.zoom };
	}

	/** Replace the viewport state from a snapshot. */
	set state(s: ViewportState) {
		this.cancelAnimation();
		this.x = s.x;
		this.y = s.y;
		this.zoom = s.zoom;
	}

	// ── Coordinate transforms ───────────────────────────────────────────────

	/** Cached container screen offset, valid only for the span of an active
	 *  pointer gesture. `getBoundingClientRect()` forces a synchronous layout
	 *  flush; calling it on every pointermove (as screenToCanvas does) reflows
	 *  the page each frame. The container's screen position is stable during a
	 *  drag/resize/rotate, so we snapshot it once at gesture start. */
	private cachedRect: { left: number; top: number } | null = null;

	/** Snapshot the container offset for the duration of a gesture. */
	beginGestureRectCache() {
		const el = this.getContainer();
		if (el) {
			const r = el.getBoundingClientRect();
			this.cachedRect = { left: r.left, top: r.top };
		} else {
			this.cachedRect = null;
		}
	}

	/** Drop the cached offset so subsequent reads are live again. */
	endGestureRectCache() {
		this.cachedRect = null;
	}

	private containerRect(): { left: number; top: number } {
		if (this.cachedRect) return this.cachedRect;
		const el = this.getContainer();
		return el ? el.getBoundingClientRect() : { left: 0, top: 0 };
	}

	/** Convert a screen-space point (clientX/clientY) to canvas-space
	 *  coordinates, accounting for the viewport container offset and the
	 *  current zoom/pan transform. */
	screenToCanvas(clientX: number, clientY: number): { x: number; y: number } {
		const rect = this.containerRect();
		return {
			x: (clientX - rect.left - this.x) / this.zoom,
			y: (clientY - rect.top - this.y) / this.zoom
		};
	}

	/** Convert a canvas-space point to screen-space (client coordinates).
	 *  Inverse of `screenToCanvas`. */
	canvasToScreen(canvasX: number, canvasY: number): { x: number; y: number } {
		const rect = this.containerRect();
		return {
			x: canvasX * this.zoom + this.x + rect.left,
			y: canvasY * this.zoom + this.y + rect.top
		};
	}

	/** Convert a canvas-space point to coordinates relative to the viewport
	 *  container (excluding the container's screen offset). */
	canvasToLocal(canvasX: number, canvasY: number): { x: number; y: number } {
		return {
			x: canvasX * this.zoom + this.x,
			y: canvasY * this.zoom + this.y
		};
	}

	// ── Pan ────────────────────────────────────────────────────────────────

	/** Begin a programmatic pan gesture. Call `panMove` on each pointer move
	 *  and `panEnd` to finish. */
	panStart(clientX: number, clientY: number) {
		this.pan = {
			startPointerX: clientX,
			startPointerY: clientY,
			startViewportX: this.x,
			startViewportY: this.y
		};
	}

	/** Continue a pan gesture (call from pointermove). */
	panMove(clientX: number, clientY: number) {
		if (!this.pan) return;
		this.x = this.pan.startViewportX + (clientX - this.pan.startPointerX);
		this.y = this.pan.startViewportY + (clientY - this.pan.startPointerY);
	}

	/** End the pan gesture. */
	panEnd() {
		this.pan = null;
	}

	/** Check if a pan gesture is in progress. */
	get isPanning(): boolean {
		return this.pan !== null;
	}

	// ── Wheel handler (zoom + trackpad pan) ────────────────────────────────

	/** Handle a wheel event. Ctrl/Meta + scroll = zoom (pinch-zoom on
	 *  trackpad). Plain scroll = trackpad pan. Call this from the viewport
	 *  element's `onwheel` handler. */
	onWheel(event: WheelEvent) {
		event.preventDefault();

		if (event.ctrlKey || event.metaKey) {
			// Zoom toward the pointer position
			const direction = event.deltaY < 0 ? 1 : -1;
			const oldZoom = this.zoom;
			const newZoom = Math.min(
				this.maxZoom,
				Math.max(
					this.minZoom,
					direction > 0 ? oldZoom * this.zoomFactor : oldZoom / this.zoomFactor
				)
			);

			const canvasPoint = this.screenToCanvas(event.clientX, event.clientY);
			const el = this.getContainer();
			const rect = el ? el.getBoundingClientRect() : { left: 0, top: 0 };
			const localX = event.clientX - rect.left;
			const localY = event.clientY - rect.top;

			this.x = localX - canvasPoint.x * newZoom;
			this.y = localY - canvasPoint.y * newZoom;
			this.zoom = newZoom;
		} else {
			// Trackpad / scrollwheel pan
			this.x -= event.deltaX;
			this.y -= event.deltaY;
		}
	}

	// ── Zoom helpers ────────────────────────────────────────────────────────

	/** Zoom in by one step toward the viewport center. */
	zoomIn() {
		const newZoom = Math.min(this.maxZoom, this.zoom * 1.15);
		this.setZoomCentered(newZoom);
	}

	/** Zoom out by one step from the viewport center. */
	zoomOut() {
		const newZoom = Math.max(this.minZoom, this.zoom / 1.15);
		this.setZoomCentered(newZoom);
	}

	/** Reset zoom to 1.0 (100%). */
	resetZoom() {
		this.setZoomCentered(1.0);
	}

	/** Set an explicit zoom preset while keeping the current viewport centre stable. */
	setZoom(zoom: number) {
		this.setZoomCentered(Math.min(this.maxZoom, Math.max(this.minZoom, zoom)));
	}

	/** Zoom to fit a set of bounding boxes within the viewport.
	 *  `items` is an array of { x, y, w, h } in canvas-space coordinates.
	 *  `padding` adds margin around the content in CSS pixels (default 60). */
	zoomToFit(
		items: { x: number; y: number; w: number; h: number }[],
		padding = 60
	) {
		if (items.length === 0) {
			this.animateViewport(0, 0, 1, 350);
			return;
		}

		let minX = Infinity, maxX = -Infinity;
		let minY = Infinity, maxY = -Infinity;
		for (const item of items) {
			minX = Math.min(minX, item.x);
			maxX = Math.max(maxX, item.x + item.w);
			minY = Math.min(minY, item.y);
			maxY = Math.max(maxY, item.y + item.h);
		}

		const contentW = maxX - minX;
		const contentH = maxY - minY;

		const el = this.getContainer();
		const rect = el ? el.getBoundingClientRect() : { width: 800, height: 600 };
		const viewportW = rect.width;
		const viewportH = rect.height;

		const availW = Math.max(100, viewportW - 2 * padding);
		const availH = Math.max(100, viewportH - 2 * padding);

		let targetZoom = Math.min(availW / contentW, availH / contentH);
		targetZoom = Math.min(1.0, Math.max(this.minZoom, targetZoom));

		const cx = minX + contentW / 2;
		const cy = minY + contentH / 2;
		const viewportCx = viewportW / 2;
		const viewportCy = viewportH / 2;

		const targetX = viewportCx - cx * targetZoom;
		const targetY = viewportCy - cy * targetZoom;

		this.animateViewport(targetX, targetY, targetZoom, 400);
	}

	// ── Animated transitions ────────────────────────────────────────────────

	/** Animate the viewport to a target position and zoom over `duration` ms. */
	animateViewport(
		targetX: number,
		targetY: number,
		targetZoom: number,
		duration = 350
	) {
		this.cancelAnimation();
		this.animationTarget = { x: targetX, y: targetY, zoom: targetZoom };

		const startX = this.x;
		const startY = this.y;
		const startZoom = this.zoom;
		const startTime = performance.now();
		const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

		const step = (now: number) => {
			const elapsed = now - startTime;
			const progress = Math.min(1, elapsed / duration);
			const eased = easeOutCubic(progress);

			this.x = startX + (targetX - startX) * eased;
			this.y = startY + (targetY - startY) * eased;
			this.zoom = startZoom + (targetZoom - startZoom) * eased;

			if (progress < 1) {
				this.animationFrameId = requestAnimationFrame(step);
			} else {
				this.animationFrameId = null;
				this.animationTarget = null;
			}
		};

		this.animationFrameId = requestAnimationFrame(step);
	}

	/** Cancel any in-progress viewport animation. */
	cancelAnimation() {
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
		this.animationTarget = null;
	}

	/** Complete an in-progress transition at its intended target before history or persistence. */
	settleAnimation() {
		const target = this.animationTarget;
		if (!target) return;
		this.cancelAnimation();
		this.x = target.x;
		this.y = target.y;
		this.zoom = target.zoom;
	}

	// ── Internal helpers ────────────────────────────────────────────────────

	private getContainer(): Element | null {
		return typeof document !== 'undefined'
			? document.querySelector(this.containerQuery)
			: null;
	}

	zoomAroundCanvasPoint(newZoom: number, targetCanvasPoint?: { x: number; y: number }) {
		const clampedZoom = Math.min(this.maxZoom, Math.max(this.minZoom, newZoom));
		const el = this.getContainer();
		const rect = el ? el.getBoundingClientRect() : { width: 800, height: 600 };
		const cx = rect.width / 2;
		const cy = rect.height / 2;

		const cp = targetCanvasPoint ?? {
			x: (cx - this.x) / this.zoom,
			y: (cy - this.y) / this.zoom
		};

		const targetX = cx - cp.x * clampedZoom;
		const targetY = cy - cp.y * clampedZoom;

		if (this.animationFrameId !== null) {
			this.x = targetX;
			this.y = targetY;
			this.zoom = clampedZoom;
		} else {
			this.animateViewport(targetX, targetY, clampedZoom, 250);
		}
	}

	private setZoomCentered(newZoom: number) {
		this.zoomAroundCanvasPoint(newZoom);
	}
}
