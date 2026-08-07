import { nextHistorySequence } from './historyClock';

export interface UndoHistoryOptions<S> {
	capture: () => S;
	restore: (snapshot: S) => void;
	capacity?: number;                  // default 100 (kernel passes 50)
	equals?: (a: S, b: S) => boolean;   // default: JSON.stringify equality
}

interface HistoryEntry<S> {
	snapshot: S;
	order: number;   // historyClock sequence — enables composite-domain ordering
}

export class UndoHistory<S> {
	private undoStack = $state<HistoryEntry<S>[]>([]);
	private redoStack = $state<HistoryEntry<S>[]>([]);
	private gestureSnapshot: S | null = null;
	private gestureDepth = 0;
	private transactionDepth = 0;
	private transactionBefore: S | null = null;
	private readonly capture: () => S;
	private readonly restore: (snapshot: S) => void;
	private readonly capacity: number;
	private readonly equals: (a: S, b: S) => boolean;

	constructor(options: UndoHistoryOptions<S>) {
		this.capture = options.capture;
		this.restore = options.restore;
		this.capacity = options.capacity ?? 100;
		this.equals = options.equals ?? ((a, b) => JSON.stringify(a) === JSON.stringify(b));
	}

	private pushEntry(snapshot: S): void {
		const top = this.undoStack.at(-1);
		if (top && this.equals(top.snapshot, snapshot)) return;   // dedupe identical top
		this.undoStack.push({ snapshot, order: nextHistorySequence() });
		if (this.undoStack.length > this.capacity) this.undoStack.shift();
		this.redoStack = [];
	}

	/** Pre-mutation push, for call sites not yet converted to transact(). */
	push(): void {
		if (this.transactionDepth > 0) return;   // outer transaction already owns this mutation
		this.pushEntry(this.capture());
	}

	/** One atomic undo entry per outermost transaction; no entry if nothing changed. */
	transact<T>(fn: () => T): T {
		if (this.transactionDepth === 0) this.transactionBefore = this.capture();
		this.transactionDepth++;
		try {
			return fn();
		} finally {
			this.transactionDepth--;
			if (this.transactionDepth === 0) {
				const before = this.transactionBefore as S;
				this.transactionBefore = null;
				if (!this.equals(before, this.capture())) this.pushEntry(before);
			}
		}
	}

	/** Begin a (possibly nested) gesture. The snapshot captured by the
	 *  outermost beginGesture is held until the matching outermost
	 *  endGesture commits it — inner begin/end pairs are no-ops so a
	 *  mutation helper that itself wraps in a gesture (e.g. pasteBlock
	 *  invoked inside an Alt-drag duplicate gesture) cannot prematurely
	 *  consume the caller's snapshot. Mirrors the depth tracking already
	 *  used by transact(). */
	beginGesture(): void {
		if (this.gestureDepth === 0) this.gestureSnapshot = this.capture();
		this.gestureDepth++;
	}

	endGesture(): void {
		if (this.gestureDepth === 0) return;   // stray endGesture — nothing to commit
		this.gestureDepth--;
		if (this.gestureDepth > 0) return;     // inner gesture — outer still owns the snapshot
		const before = this.gestureSnapshot;
		this.gestureSnapshot = null;
		if (before === null || this.equals(before, this.capture())) return;
		this.pushEntry(before);
	}

	undo(): void {
		let entry = this.undoStack.pop();
		if (!entry) return;
		const current = this.capture();
		// Skip an entry identical to the live state (kernel's historical behavior).
		if (this.equals(entry.snapshot, current)) {
			const next = this.undoStack.pop();
			if (!next) { this.undoStack.push(entry); return; }
			entry = next;
		}
		this.redoStack.push({ snapshot: current, order: nextHistorySequence() });
		this.restore(entry.snapshot);
	}

	redo(): void {
		const entry = this.redoStack.pop();
		if (!entry) return;
		this.undoStack.push({ snapshot: this.capture(), order: nextHistorySequence() });
		this.restore(entry.snapshot);
	}

	clear(): void {
		this.undoStack = [];
		this.redoStack = [];
		this.gestureSnapshot = null;
		this.gestureDepth = 0;
	}

	get canUndo(): boolean { return this.undoStack.length > 0; }
	get canRedo(): boolean { return this.redoStack.length > 0; }
	get nextUndoOrder(): number { return this.undoStack.at(-1)?.order ?? -1; }
	get nextRedoOrder(): number { return this.redoStack.at(-1)?.order ?? -1; }
}

/**
 * Composite domain over multiple histories (the designer pattern): undo/redo route to
 * whichever history holds the most recent entry; pushUndo routes to `primary`.
 * Returns the exact shape `registerUndoDomain` expects.
 */
export function compositeUndoDomain(
	id: string,
	histories: UndoHistory<any>[],
	primary: UndoHistory<any>,
): { id: string; undo: () => void; redo: () => void; pushUndo: () => void } {
	const latestBy = (key: 'nextUndoOrder' | 'nextRedoOrder') =>
		histories.reduce((a, b) => (b[key] > a[key] ? b : a));
	return {
		id,
		undo: () => latestBy('nextUndoOrder').undo(),
		redo: () => latestBy('nextRedoOrder').redo(),
		pushUndo: () => primary.push(),
	};
}
