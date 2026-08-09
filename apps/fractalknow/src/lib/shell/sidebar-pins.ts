import { browser } from '$app/environment';
import { readLocalStorage, writeLocalStorage } from './storage';

/**
 * Partition-aware sidebar pin store — a faithful port of the reference app's
 * `sidebar-pin-store.ts` + `sidebar-partition.ts` (resolveEffectiveState /
 * applyToggle / smartDefault). The viewport is split into two partitions per
 * side: `above` the collapse threshold and `below` it. Each partition keeps
 * its own remembered state; partitions without a remembered state fall back
 * to the smart default (open above, collapsed below).
 */

export type SidebarPartition = 'above' | 'below';
export type SidebarPinState = 'open' | 'collapsed';
export type SidebarSide = 'left' | 'right';

export const LEFT_COLLAPSE_THRESHOLD = 1024;
// Staggered with the left's 1024 so the right panel collapses FIRST as the
// viewport narrows — editor breathing room arrives before the sidebar hides.
export const RIGHT_COLLAPSE_THRESHOLD = 1280;

const PINS_KEY = 'fractalknow:sidebar-pins';

type PartitionSlots = Partial<Record<SidebarPartition, SidebarPinState>>;

export interface StoredSidebarPins {
	left?: PartitionSlots;
	right?: PartitionSlots;
}

const THRESHOLDS: Record<SidebarSide, number> = {
	left: LEFT_COLLAPSE_THRESHOLD,
	right: RIGHT_COLLAPSE_THRESHOLD,
};

export function resolvePartition(viewportWidth: number, side: SidebarSide): SidebarPartition {
	return viewportWidth >= THRESHOLDS[side] ? 'above' : 'below';
}

export function smartDefault(partition: SidebarPartition): SidebarPinState {
	return partition === 'above' ? 'open' : 'collapsed';
}

function isSidebarPinState(value: unknown): value is SidebarPinState {
	return value === 'open' || value === 'collapsed';
}

function isValidSlots(value: unknown): value is PartitionSlots {
	if (typeof value !== 'object' || value == null) return false;
	for (const [key, state] of Object.entries(value)) {
		if (key !== 'above' && key !== 'below') return false;
		if (!isSidebarPinState(state)) return false;
	}
	return true;
}

export function readPins(): StoredSidebarPins {
	if (!browser) return {};
	try {
		const raw = readLocalStorage(PINS_KEY);
		if (!raw) return {};
		const parsed: unknown = JSON.parse(raw);
		if (typeof parsed !== 'object' || parsed == null) return {};
		const obj = parsed as Record<string, unknown>;
		const pins: StoredSidebarPins = {};
		if (isValidSlots(obj.left)) pins.left = obj.left;
		if (isValidSlots(obj.right)) pins.right = obj.right;
		return pins;
	} catch {
		return {};
	}
}

export function resolveEffectiveState(
	side: SidebarSide,
	partition: SidebarPartition,
	pins: StoredSidebarPins,
): SidebarPinState {
	return pins[side]?.[partition] ?? smartDefault(partition);
}

export function applyToggle(
	side: SidebarSide,
	partition: SidebarPartition,
	state: SidebarPinState,
): StoredSidebarPins {
	const pins = readPins();
	pins[side] = { ...pins[side], [partition]: state };
	if (browser) {
		try {
			writeLocalStorage(PINS_KEY, JSON.stringify(pins));
		} catch {
			// Quota exceeded — in-memory state holds for the session.
		}
	}
	return pins;
}
