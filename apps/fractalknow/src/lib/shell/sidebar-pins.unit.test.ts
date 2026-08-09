import { beforeEach, describe, expect, it } from 'vitest';
import {
	LEFT_COLLAPSE_THRESHOLD,
	RIGHT_COLLAPSE_THRESHOLD,
	applyToggle,
	readPins,
	resolveEffectiveState,
	resolvePartition,
	smartDefault,
} from './sidebar-pins';

const PINS_KEY = 'fractalknow:sidebar-pins';

describe('sidebar-pins', () => {
	beforeEach(() => {
		window.localStorage.removeItem(PINS_KEY);
	});

	it('resolves partitions per side with staggered thresholds', () => {
		expect(resolvePartition(LEFT_COLLAPSE_THRESHOLD, 'left')).toBe('above');
		expect(resolvePartition(LEFT_COLLAPSE_THRESHOLD - 1, 'left')).toBe('below');
		// Right panel collapses first as the viewport narrows.
		expect(resolvePartition(1100, 'right')).toBe('below');
		expect(resolvePartition(RIGHT_COLLAPSE_THRESHOLD, 'right')).toBe('above');
	});

	it('smart default: open above, collapsed below', () => {
		expect(smartDefault('above')).toBe('open');
		expect(smartDefault('below')).toBe('collapsed');
	});

	it('effective state falls back to the smart default without a pin', () => {
		expect(resolveEffectiveState('left', 'above', {})).toBe('open');
		expect(resolveEffectiveState('left', 'below', {})).toBe('collapsed');
	});

	it('effective state honors the pin for the current partition only', () => {
		const pins = { left: { below: 'open' as const } };
		expect(resolveEffectiveState('left', 'below', pins)).toBe('open');
		// The 'above' partition has no remembered state and uses its default.
		expect(resolveEffectiveState('left', 'above', pins)).toBe('open');
		const collapsedAbove = { left: { above: 'collapsed' as const } };
		expect(resolveEffectiveState('left', 'above', collapsedAbove)).toBe('collapsed');
	});

	it('applyToggle persists per-partition state and round-trips', () => {
		applyToggle('left', 'below', 'open');
		const stored = readPins();
		expect(stored.left?.below).toBe('open');
		expect(resolveEffectiveState('left', 'below', stored)).toBe('open');

		applyToggle('right', 'above', 'collapsed');
		const stored2 = readPins();
		expect(stored2.right?.above).toBe('collapsed');
		// Earlier left pin survives the second write.
		expect(stored2.left?.below).toBe('open');
	});

	it('readPins tolerates missing, malformed, and partially-invalid payloads', () => {
		expect(readPins()).toEqual({});

		window.localStorage.setItem(PINS_KEY, 'not-json');
		expect(readPins()).toEqual({});

		window.localStorage.setItem(
			PINS_KEY,
			JSON.stringify({ left: { above: 'open', bogus: 'open' }, right: { above: 'nope' } }),
		);
		// left has an invalid partition key, right has an invalid state → both dropped.
		expect(readPins()).toEqual({});

		window.localStorage.setItem(PINS_KEY, JSON.stringify({ left: { below: 'collapsed' } }));
		expect(readPins()).toEqual({ left: { below: 'collapsed' } });
	});
});
