import { registerUndoDomain } from '$lib/state/undo.svelte';
import { compositeUndoDomain, UndoHistory } from '$lib/state/undoHistory.svelte';
import { canvasGrid } from './canvasGrid.svelte';

export interface NewDesignUnit {
	id: string;
	x: number;
	y: number;
	w: number;
	h: number;
	rotation: number;
}

type NewDesignSnapshot = {
	items: NewDesignUnit[];
	selectedId: string | null;
	canvasPatternId: string | null;
};

class NewDesignState {
	items = $state<NewDesignUnit[]>([]);
	selectedId = $state<string | null>(null);
	canvasPatternId = $state<string | null>(null);

	history = new UndoHistory<NewDesignSnapshot>({
		capture: () => this.snapshot(),
		restore: (snapshot) => this.restore(snapshot)
	});

	private snapshot(): NewDesignSnapshot {
		return { items: this.items.map((item) => ({ ...item })), selectedId: this.selectedId, canvasPatternId: this.canvasPatternId };
	}

	private restore(snapshot: NewDesignSnapshot) {
		this.items = snapshot.items.map((item) => ({ ...item }));
		this.selectedId = snapshot.selectedId;
		this.canvasPatternId = snapshot.canvasPatternId;
	}

	add(x: number, y: number): void {
		this.history.transact(() => {
			const unit: NewDesignUnit = { id: `unit_${crypto.randomUUID()}`, x, y, w: 240, h: 144, rotation: 0 };
			this.items = [...this.items, unit];
			this.selectedId = unit.id;
		});
	}

	select(id: string | null): void { this.selectedId = id; }

	setCanvasPattern(id: string | null): void {
		if (id === this.canvasPatternId) return;
		this.history.transact(() => { this.canvasPatternId = id; });
	}

	update(id: string, patch: Partial<NewDesignUnit>): void {
		const unit = this.items.find((item) => item.id === id);
		if (unit) Object.assign(unit, patch);
	}

	beginGesture(): void { this.history.beginGesture(); }
	endGesture(): void { this.history.endGesture(); }
	undo(): void { this.history.undo(); }
	redo(): void { this.history.redo(); }
	pushUndo(): void { this.history.push(); }
}

export const newdesign = new NewDesignState();

registerUndoDomain(compositeUndoDomain('newdesign', [newdesign.history, canvasGrid.history], newdesign.history));
