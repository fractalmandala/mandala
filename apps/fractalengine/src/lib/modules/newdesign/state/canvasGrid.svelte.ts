import { UndoHistory } from '$lib/state/undoHistory.svelte';

export interface CanvasGridPoint {
	x: number;
	y: number;
}

interface CanvasGridSnapshot {
	x: number;
	y: number;
	zoom: number;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

class CanvasGridState {
	x = $state(0);
	y = $state(0);
	zoom = $state(1);

	history = new UndoHistory<CanvasGridSnapshot>({
		capture: () => this.snapshot(),
		restore: (snapshot) => this.restore(snapshot)
	});

	private snapshot(): CanvasGridSnapshot {
		return { x: this.x, y: this.y, zoom: this.zoom };
	}

	private restore(snapshot: CanvasGridSnapshot): void {
		this.x = snapshot.x;
		this.y = snapshot.y;
		this.zoom = snapshot.zoom;
	}

	toWorld(point: CanvasGridPoint): CanvasGridPoint {
		return { x: (point.x - this.x) / this.zoom, y: (point.y - this.y) / this.zoom };
	}

	panBy(dx: number, dy: number): void {
		this.x += dx;
		this.y += dy;
	}

	zoomAt(point: CanvasGridPoint, nextZoom: number): void {
		const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
		const world = this.toWorld(point);
		this.zoom = zoom;
		this.x = point.x - world.x * zoom;
		this.y = point.y - world.y * zoom;
	}

	zoomBy(step: number, center: CanvasGridPoint): void {
		this.history.transact(() => this.zoomAt(center, this.zoom * step));
	}

	reset(): void {
		this.history.transact(() => {
			this.x = 0;
			this.y = 0;
			this.zoom = 1;
		});
	}

	beginGesture(): void { this.history.beginGesture(); }
	endGesture(): void { this.history.endGesture(); }
}

export const canvasGrid = new CanvasGridState();
