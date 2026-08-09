import type { ComponentType, DesignPlacement, SnapRect } from './design-types';
import { generateId } from './design-snap';
import { generateDesignOutput } from './design-output';

export class DesignController {
	// ── Public reactive state ──

	enabled = $state(false);
	activeComponent = $state<ComponentType | null>(null);
	placements = $state<DesignPlacement[]>([]);
	selectedIds = $state<Set<string>>(new Set());
	wireframeEnabled = $state(false);
	wireframePurpose = $state('');
	canvasOpacity = $state(0.5);
	interactionActive = $state(false);

	// Cross-overlay signals
	_clearSignal = $state(0);
	_deselectSignal = $state(0);

	// Persisted state stash for wireframe/explore isolation
	#exploreStash: { placements: DesignPlacement[] } | null = null;
	#wireframeStash: { placements: DesignPlacement[]; purpose: string } | null = null;

	// Callbacks
	#onChange?: (output: string) => void;

	constructor(opts?: { onChange?: (output: string) => void }) {
		this.#onChange = opts?.onChange;
	}

	// ── Toggle ──

	toggle() {
		this.enabled = !this.enabled;
		if (!this.enabled) {
			this.activeComponent = null;
			this.selectedIds = new Set();
			this.clearSignal();
		}
	}

	// ── Palette selection ──

	selectComponent(type: ComponentType) {
		this.activeComponent = type;
	}

	deselectComponent() {
		this.activeComponent = null;
	}

	// ── Placement management ──

	addPlacement(placement: DesignPlacement) {
		this.placements = [...this.placements, placement];
	}

	handlePlacementsChange(placements: DesignPlacement[]) {
		this.placements = placements;
	}

	clearAll() {
		this.clearSignal();
		this.placements = [];
	}

	clearSignal() {
		this._clearSignal++;
	}

	deselectSignal() {
		this._deselectSignal++;
	}

	// ── Wireframe ──

	toggleWireframe(enabled: boolean) {
		if (enabled === this.wireframeEnabled) return;

		if (enabled) {
			// Stash explore state
			this.#exploreStash = { placements: [...this.placements] };
			// Restore wireframe state
			if (this.#wireframeStash) {
				this.placements = this.#wireframeStash.placements;
				this.wireframePurpose = this.#wireframeStash.purpose;
			} else {
				this.placements = [];
				this.wireframePurpose = '';
			}
		} else {
			// Stash wireframe state
			this.#wireframeStash = { placements: [...this.placements], purpose: this.wireframePurpose };
			// Restore explore state
			if (this.#exploreStash) {
				this.placements = this.#exploreStash.placements;
			} else {
				this.placements = [];
			}
		}

		this.wireframeEnabled = enabled;
		this.clearSignal();
	}

	setWireframePurpose(purpose: string) {
		this.wireframePurpose = purpose;
	}

	setCanvasOpacity(opacity: number) {
		this.canvasOpacity = Math.max(0, Math.min(1, opacity));
	}

	// ── Keyboard ──

	handleKeyDown(e: KeyboardEvent) {
		if (!this.enabled) return;
		const target = e.target as HTMLElement;
		const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
		if (isTyping) return;

		if (e.key === 'Escape') {
			if (this.activeComponent) {
				this.activeComponent = null;
			} else if (this.selectedIds.size > 0) {
				this.selectedIds = new Set();
			} else {
				this.toggle();
			}
			return;
		}
	}

	// ── Output generation ──

	generateOutput(): string {
		return generateDesignOutput(this.placements, this.wireframePurpose, this.wireframeEnabled);
	}

	copyToClipboard() {
		const output = this.generateOutput();
		if (!output) return;
		navigator.clipboard.writeText(output).catch(() => {});
		this.#onChange?.(output);
	}

	// ── Cleanup ──

	destroy() {
		this.enabled = false;
		this.activeComponent = null;
		this.placements = [];
		this.selectedIds = new Set();
	}
}
