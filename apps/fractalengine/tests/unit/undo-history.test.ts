import { describe, expect, it, beforeEach } from 'vitest';
import { UndoHistory, compositeUndoDomain } from '$lib/state/undoHistory.svelte';

interface ToyState {
	value: number;
	label: string;
}

function createToy(initial: ToyState = { value: 0, label: '' }) {
	let state = { ...initial };
	const history = new UndoHistory<ToyState>({
		capture: () => ({ ...state }),
		restore: (s) => { state = { ...s }; },
		capacity: 100,
	});
	return { state, history, set: (v: number, l?: string) => { state.value = v; if (l !== undefined) state.label = l; } };
}

function createToyCapacity(initial: ToyState = { value: 0, label: '' }, capacity: number) {
	let state = { ...initial };
	const history = new UndoHistory<ToyState>({
		capture: () => ({ ...state }),
		restore: (s) => { state = { ...s }; },
		capacity,
	});
	return { state, history, set: (v: number, l?: string) => { state.value = v; if (l !== undefined) state.label = l; } };
}

function current(env: ReturnType<typeof createToy>): ToyState {
	return env.history['capture']();
}

describe('UndoHistory', () => {
	let env: ReturnType<typeof createToy>;

	beforeEach(() => {
		env = createToy();
	});

	it('(1) transact produces exactly one entry', () => {
		env.history.transact(() => {
			env.set(1);
			env.set(2);
		});
		expect(env.history.canUndo).toBe(true);
		expect(env.history.canRedo).toBe(false);
		// Undo restores the state captured before transact
		env.history.undo();
		expect(current(env).value).toBe(0);
		expect(env.history.canRedo).toBe(true);
	});

	it('(2) nested transacts coalesce into one entry', () => {
		env.history.transact(() => {
			env.set(1);
			env.history.transact(() => {
				env.set(2);
			});
		});
		// One undo should restore value 0 (the before of the outermost transact)
		expect(env.history.canUndo).toBe(true);
		env.history.undo();
		expect(current(env).value).toBe(0);
		// No more entries
		env.history.undo();
		expect(current(env).value).toBe(0);
	});

	it('(3) no-change transact produces zero entries', () => {
		env.history.transact(() => {
			// mutate then change back
			env.set(1);
			env.set(0);
		});
		expect(env.history.canUndo).toBe(false);
	});

	it('(4) push clears redo stack', () => {
		env.history.transact(() => env.set(1));
		env.history.undo();
		expect(env.history.canRedo).toBe(true);
		// A new push should clear redo
		env.history.push();
		expect(env.history.canRedo).toBe(false);
	});

	it('(5) gesture with no net change produces zero entries', () => {
		// Start with value=42, then gesture changes nothing (42→42)
		env.set(42);
		env.history.beginGesture();
		env.set(42);
		env.history.endGesture();
		expect(env.history.canUndo).toBe(false);

		// Also: a gesture that changes nothing at all
		env.history.beginGesture();
		env.history.endGesture();
		expect(env.history.canUndo).toBe(false);
	});

	it('(5a) nested gestures coalesce into one entry with the outermost before-snapshot', () => {
		// Regression: a mutation helper that wraps its own beginGesture/endGesture
		// (e.g. pasteBlock invoked inside an Alt-drag duplicate gesture) must not
		// prematurely consume the outer gesture's snapshot. Before the fix,
		// endGesture cleared gestureSnapshot on the first inner endGesture, so the
		// subsequent drag movement was never captured and undo restored to the
		// pre-duplicate state (losing both the duplicate and the drag).
		env.set(0);
		// Outer gesture — captures snapshot {value: 0}
		env.history.beginGesture();
		// Inner gesture (e.g. duplicateSelected → pasteBlock) — must be a no-op
		env.history.beginGesture();
		env.set(1);
		env.history.endGesture();
		// At this point the inner endGesture must NOT commit; canUndo must be false
		// because the outer gesture is still in progress.
		expect(env.history.canUndo).toBe(false);
		// Drag continues after the inner mutation…
		env.set(2);
		// Outer gesture ends — one entry pushed with before = {value: 0}
		env.history.endGesture();
		expect(env.history.canUndo).toBe(true);
		// A single undo restores the outermost before-state, not an intermediate one.
		env.history.undo();
		expect(current(env).value).toBe(0);
		expect(env.history.canUndo).toBe(false);
		// Redo restores the final state (value 2), proving the drag was captured.
		expect(env.history.canRedo).toBe(true);
		env.history.redo();
		expect(current(env).value).toBe(2);
		expect(env.history.canRedo).toBe(false);
	});

	it('(5b) stray endGesture with no matching beginGesture is a safe no-op', () => {
		env.set(5);
		env.history.endGesture(); // depth was 0 — must not throw or push
		expect(env.history.canUndo).toBe(false);
		// A subsequent real gesture still works normally.
		env.history.beginGesture();
		env.set(6);
		env.history.endGesture();
		expect(env.history.canUndo).toBe(true);
		env.history.undo();
		expect(current(env).value).toBe(5);
	});

	it('(6) capacity trims oldest entries', () => {
		const cap3 = createToyCapacity({ value: 0, label: '' }, 3);
		cap3.history.transact(() => cap3.set(1));
		cap3.history.transact(() => cap3.set(2));
		cap3.history.transact(() => cap3.set(3));
		expect(cap3.history.canUndo).toBe(true);
		// A fourth entry should push out the oldest (value 0 → value 1)
		cap3.history.transact(() => cap3.set(4));
		// Undo three times: 4→3, 3→2, 2→1 and then canUndo should be false
		cap3.history.undo();
		expect(current(cap3).value).toBe(3);
		cap3.history.undo();
		expect(current(cap3).value).toBe(2);
		cap3.history.undo();
		expect(current(cap3).value).toBe(1);
		expect(cap3.history.canUndo).toBe(false); // value 0 entry was trimmed
	});

	it('(7) dedupe-identical-top prevents duplicate entries', () => {
		env.history.transact(() => env.set(1));
		env.history.transact(() => env.set(1)); // same state as current
		expect(env.history.canUndo).toBe(true);
		// Only one entry was pushed (the first transact that changed value 0→1)
		env.history.undo();
		expect(current(env).value).toBe(0);
		expect(env.history.canUndo).toBe(false);
	});

	it('(8) undo skips an entry equal to live state', () => {
		// Push two distinct entries, then make live state equal to the top entry
		env.history.transact(() => env.set(1));
		env.history.transact(() => env.set(2));
		env.history.transact(() => env.set(3));
		// Manually set live state back to match the top entry (value 3)
		env.set(3);
		// undo should skip the entry matching live state (value 3) and restore value 2
		env.history.undo();
		expect(current(env).value).toBe(2);
	});

	it('(9) undo/redo round-trip restores exact snapshots', () => {
		env.history.transact(() => { env.set(10, 'ten'); });
		env.history.transact(() => { env.set(20, 'twenty'); });
		env.history.transact(() => { env.set(30, 'thirty'); });

		// Current state is value=30, label='thirty'
		expect(current(env).value).toBe(30);
		expect(current(env).label).toBe('thirty');

		// Undo twice and verify intermediate state
		env.history.undo();
		expect(current(env).value).toBe(20);
		expect(current(env).label).toBe('twenty');

		env.history.undo();
		expect(current(env).value).toBe(10);
		expect(current(env).label).toBe('ten');

		// Redo once
		env.history.redo();
		expect(current(env).value).toBe(20);
		expect(current(env).label).toBe('twenty');

		// Redo again
		env.history.redo();
		expect(current(env).value).toBe(30);
		expect(current(env).label).toBe('thirty');

		// Full round-trip complete
		expect(env.history.canUndo).toBe(true);
		expect(env.history.canRedo).toBe(false);
	});
});

describe('compositeUndoDomain', () => {
	it('(10) routes undo/redo to the history with the highest order and pushUndo to primary', () => {
		// Two independent histories
		let s1 = { value: 0, label: '' };
		let s2 = { value: 0, label: '' };

		const h1 = new UndoHistory<ToyState>({
			capture: () => ({ ...s1 }),
			restore: (s) => { s1 = { ...s }; },
			capacity: 100,
		});
		const h2 = new UndoHistory<ToyState>({
			capture: () => ({ ...s2 }),
			restore: (s) => { s2 = { ...s }; },
			capacity: 100,
		});

		const composite = compositeUndoDomain('test', [h1, h2], h1);

		expect(composite.id).toBe('test');

		// Push on h1 (primary), pushUndo via the composite
		composite.pushUndo();
		// Make a change to s1
		s1 = { value: 1, label: 'one' };

		// Now edit h2 (higher order because it's newer)
		h2.transact(() => { s2 = { value: 100, label: 'hundo' }; });

		// Since h2's last edit has a higher order, undo should route to h2
		composite.undo();
		expect(s2.value).toBe(0); // h2 reverted to its before state

		// Now undo again — should route to h1 (its entry is now the most recent)
		composite.undo();
		expect(s1.value).toBe(0); // h1 reverted to its before state
	});
});
