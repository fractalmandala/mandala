/**
 * RotateEngine.ts
 *
 * A self-contained rotation engine:
 * rotation around a block's center, angle snapping at 15°/45°/90°.
 *
 * Plain TypeScript — no framework dependency.
 *
 * Usage:
 *   const rotate = new RotateEngine();
 *   // In your rotate-handle pointerdown:
 *   rotate.onPointerDown(event, block, getAbsoluteCenter(block));
 *   // Wire to pointermove / pointerup:
 *   canvas.addEventListener('pointermove', (e) => rotate.onPointerMove(e));
 *   canvas.addEventListener('pointerup', (e) => rotate.onPointerUp(e));
 *
 *   // Read current rotation state:
 *   rotate.active  // boolean
 *   rotate.angle   // current angle in degrees being dragged to
 */

import { CanvasViewport } from './CanvasViewport.svelte.js';

/** A rotatable item. The engine mutates `rotation` in place. */
export type RotateItem = {
	id: string;
	rotation: number;
};

export type RotateEngineOptions = {
	/** Snap increments in degrees when Shift is held (default 15). */
	snapAngle?: number;
};

export class RotateEngine {
	// ── Configuration ───────────────────────────────────────────────────────
	snapAngle: number;

	// ── Public state ────────────────────────────────────────────────────────
	/** The id of the item being rotated, or null. */
	id: string | null = null;
	/** The current drag angle in degrees (total rotation = start + delta). */
	angle = 0;

	// ── Internal rotate state ───────────────────────────────────────────────
	private _item: RotateItem | null = null;
	private _cx = 0;
	private _cy = 0;
	private _startAngle = 0;
	private _startRotation = 0;
	private _viewport: CanvasViewport | null = null;
	private _captureEl: EventTarget | null = null;

	constructor(options: RotateEngineOptions = {}) {
		this.snapAngle = options.snapAngle ?? 15;
	}

	/** Connect a CanvasViewport for coordinate transforms. */
	set viewport(vp: CanvasViewport | null) {
		this._viewport = vp;
	}

	get viewport(): CanvasViewport | null {
		return this._viewport;
	}

	/** Whether a rotation gesture is in progress. */
	get active(): boolean {
		return this.id !== null;
	}

	private toCanvas(clientX: number, clientY: number): { x: number; y: number } {
		if (this._viewport) {
			return this._viewport.screenToCanvas(clientX, clientY);
		}
		return { x: clientX, y: clientY };
	}

	// ── Rotation lifecycle ──────────────────────────────────────────────────

	/** Begin a rotation. Call from your rotate handle's pointerdown handler.
	 *  @param event The PointerEvent.
	 *  @param item The item being rotated (its `rotation` is mutated in place).
	 *  @param centerX Canvas-space x-coordinate of the rotation pivot.
	 *  @param centerY Canvas-space y-coordinate of the rotation pivot. */
	onPointerDown(
		event: PointerEvent,
		item: RotateItem,
		centerX: number,
		centerY: number
	) {
		this.id = item.id;
		this._item = item;
		this._cx = centerX;
		this._cy = centerY;
		this._captureEl = event.currentTarget ?? null;

		try {
			(event.currentTarget as HTMLElement)?.setPointerCapture(event.pointerId);
		} catch {
			/* pointer not capturable */
		}

		const point = this.toCanvas(event.clientX, event.clientY);
		this._startAngle = Math.atan2(point.y - centerY, point.x - centerX);
		this._startRotation = item.rotation || 0;
		this.angle = 0;
	}

	/** Continue a rotation. Call from pointermove.
	 *  @param shiftKey Whether Shift is held (angle snapping). */
	onPointerMove(event: PointerEvent) {
		if (!this._item) return;

		const point = this.toCanvas(event.clientX, event.clientY);
		const angle = Math.atan2(point.y - this._cy, point.x - this._cx);
		let deg =
			this._startRotation +
			((angle - this._startAngle) * 180) / Math.PI;

		if (event.shiftKey) {
			// Snap to nearest snapAngle increment
			deg = Math.round(deg / this.snapAngle) * this.snapAngle;
		}

		this.angle = deg;
		this._item.rotation = Math.round(deg);
	}

	/** End a rotation. Call from pointerup. */
	onPointerUp(_event: PointerEvent) {
		if (this._captureEl) {
			try {
				(this._captureEl as HTMLElement).releasePointerCapture(
					(_event as PointerEvent).pointerId
				);
			} catch {
				/* ignore */
			}
		}
		this.id = null;
		this._item = null;
		this._captureEl = null;
	}

	/** Cancel the current rotation, reverting to the start rotation. */
	cancel() {
		if (this._item) {
			this._item.rotation = this._startRotation;
		}
		this.id = null;
		this._item = null;
		this._captureEl = null;
		this.angle = 0;
	}
}
