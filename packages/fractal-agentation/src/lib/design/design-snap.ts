import type { DesignPlacement, SnapRect } from './design-types';

const SNAP_THRESHOLD = 5;
const MIN_SIZE = 24;

export type Guide = { axis: 'x' | 'y'; pos: number };

export function generateId(): string {
	return `dp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function computeSnap(
	rect: SnapRect,
	others: DesignPlacement[],
	excludeIds: Set<string>,
	activeEdges?: { left?: boolean; right?: boolean; top?: boolean; bottom?: boolean },
	extraRects?: SnapRect[]
): { dx: number; dy: number; guides: Guide[] } {
	let bestDx = Infinity;
	let bestDy = Infinity;

	const mL = rect.x, mR = rect.x + rect.width, mCx = rect.x + rect.width / 2;
	const mT = rect.y, mB = rect.y + rect.height, mCy = rect.y + rect.height / 2;

	const checkAll = !activeEdges;
	const xFroms = checkAll ? [mL, mR, mCx] : [
		...(activeEdges.left ? [mL] : []),
		...(activeEdges.right ? [mR] : [])
	];
	const yFroms = checkAll ? [mT, mB, mCy] : [
		...(activeEdges.top ? [mT] : []),
		...(activeEdges.bottom ? [mB] : [])
	];

	const allTargets: SnapRect[] = [];
	for (const o of others) {
		if (!excludeIds.has(o.id)) allTargets.push(o);
	}
	if (extraRects) allTargets.push(...extraRects);

	for (const o of allTargets) {
		const oL = o.x, oR = o.x + o.width, oCx = o.x + o.width / 2;
		const oT = o.y, oB = o.y + o.height, oCy = o.y + o.height / 2;

		for (const from of xFroms) {
			for (const to of [oL, oR, oCx]) {
				const d = to - from;
				if (Math.abs(d) < SNAP_THRESHOLD && Math.abs(d) < Math.abs(bestDx)) bestDx = d;
			}
		}
		for (const from of yFroms) {
			for (const to of [oT, oB, oCy]) {
				const d = to - from;
				if (Math.abs(d) < SNAP_THRESHOLD && Math.abs(d) < Math.abs(bestDy)) bestDy = d;
			}
		}
	}

	const dx = Math.abs(bestDx) < SNAP_THRESHOLD ? bestDx : 0;
	const dy = Math.abs(bestDy) < SNAP_THRESHOLD ? bestDy : 0;

	const guides: Guide[] = [];
	const seen = new Set<string>();
	const sL = mL + dx, sR = mR + dx, sCx = mCx + dx;
	const sT = mT + dy, sB = mB + dy, sCy = mCy + dy;

	for (const o of allTargets) {
		const oL = o.x, oR = o.x + o.width, oCx = o.x + o.width / 2;
		const oT = o.y, oB = o.y + o.height, oCy = o.y + o.height / 2;

		for (const xPos of [oL, oCx, oR]) {
			for (const sx of [sL, sCx, sR]) {
				if (Math.abs(sx - xPos) < 0.5) {
					const key = `x:${Math.round(xPos)}`;
					if (!seen.has(key)) { seen.add(key); guides.push({ axis: 'x', pos: xPos }); }
				}
			}
		}
		for (const yPos of [oT, oCy, oB]) {
			for (const sy of [sT, sCy, sB]) {
				if (Math.abs(sy - yPos) < 0.5) {
					const key = `y:${Math.round(yPos)}`;
					if (!seen.has(key)) { seen.add(key); guides.push({ axis: 'y', pos: yPos }); }
				}
			}
		}
	}

	return { dx, dy, guides };
}

export { MIN_SIZE, SNAP_THRESHOLD };
