// src/lib/utils/svgpath.ts
//
// SVG path data conversion for vector blocks.
//
// Internal representation: VectorPath[] with bezier handles (PathPoint).
// SVG representation: a single `d` attribute per path (M/L/C/Z commands).
//
// pathsToD — convert our internal model to an SVG `d` string.
// dToPaths — parse a raw SVG `d` string into VectorPath[]. Used by
//            importSvg() and by paste-from-clipboard. Implements the subset
//            of SVG path commands Illustrator / Figma emit:
//              M / m, L / l, H / h, V / v, C / c, S / s, Q / q, T / t, Z / z,
//              and the implicit "next command after M is L" rule.

import type { PathPoint, VectorPath } from '$lib/modules/designer/engine/designtypes';

/** Build the SVG `d` string for one of our internal VectorPaths. */
function pathToD(path: VectorPath): string {
	if (path.points.length === 0) return '';
	const out: string[] = [];
	const first = path.points[0];
	out.push(`M ${round(first.x)} ${round(first.y)}`);
	for (let i = 1; i < path.points.length; i++) {
		const prev = path.points[i - 1];
		const cur = path.points[i];
		const hasOut =
			prev.handleOutX !== undefined && prev.handleOutY !== undefined;
		const hasIn =
			cur.handleInX !== undefined && cur.handleInY !== undefined;
		if (hasOut && hasIn) {
			const c1x = prev.x + (prev.handleOutX ?? 0);
			const c1y = prev.y + (prev.handleOutY ?? 0);
			const c2x = cur.x + (cur.handleInX ?? 0);
			const c2y = cur.y + (cur.handleInY ?? 0);
			out.push(
				`C ${round(c1x)} ${round(c1y)}, ${round(c2x)} ${round(c2y)}, ${round(cur.x)} ${round(cur.y)}`,
			);
		} else {
			out.push(`L ${round(cur.x)} ${round(cur.y)}`);
		}
	}
	if (path.closed) out.push('Z');
	return out.join(' ');
}

/** Concatenate all sub-paths of a vector block into one `d` attribute. */
export function pathsToD(paths: VectorPath[]): string {
	return paths.map(pathToD).filter(Boolean).join(' ');
}

/** Generate a short unique id for new PathPoint/VectorPath records. */
function pid(): string {
	return Math.random().toString(36).slice(2, 9) + '_' + Date.now().toString(36);
}

function round(n: number): number {
	// 2 decimal places is plenty for canvas work and keeps `d` strings small.
	return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------------------
// SVG path parser (`d` -> VectorPath[])
// ---------------------------------------------------------------------------

/** Tokenize a `d` string into (command, args[]) tuples. The tokenizer accepts
 *  both explicit (e.g. "L 10 20") and implicit (e.g. "L 10 20 30 40", or even
 *  "10 20 30 40" after an M) command repetition per the SVG spec. */
function tokenize(d: string): { cmd: string; args: number[] }[] {
	const tokens: { cmd: string; args: number[] }[] = [];
	const re = /([MmLlHhVvCcSsQqTtAaZz])|(-?\d*\.?\d+(?:e[-+]?\d+)?)/gi;
	const argCounts: Record<string, number> = {
		M: 2,
		L: 2,
		H: 1,
		V: 1,
		C: 6,
		S: 4,
		Q: 4,
		T: 2,
		A: 7
	};
	let cmd: string | null = null;
	let args: number[] = [];

	const flush = (): boolean => {
		if (cmd === null) return false;
		const upper = cmd.toUpperCase();
		// Z carries no args — emit it as soon as it's seen.
		if (upper === 'Z') {
			tokens.push({ cmd, args: [] });
			cmd = null;
			return true;
		}
		if (args.length === 0) return false;
		const need = argCounts[upper] ?? 0;
		if (args.length !== need) return false;
		tokens.push({ cmd, args });
		args = [];
		return true;
	};

	for (const m of d.matchAll(re)) {
		if (m[1]) {
			// New explicit command — flush whatever the previous one had.
			flush();
			cmd = m[1];
		} else if (m[2] !== undefined && cmd !== null) {
			args.push(Number(m[2]));
			// Implicit-L-after-M: once M has consumed its 2 args, switch to
			// L/l for any subsequent pairs.
			if (
				flush() &&
				(cmd === 'M' || cmd === 'm')
			) {
				cmd = cmd === 'M' ? 'L' : 'l';
			}
		}
	}
	flush();
	return tokens;
}

/** Parse a raw SVG `d` attribute into our internal VectorPath[]. Returns an
 *  empty array if the string is unparseable. Curves without explicit handles
 *  are stored as straight line segments (no bezier conversion); we don't try
 *  to fit beziers through polylines — that's the editor's job. */
export function dToPaths(d: string): VectorPath[] {
	if (!d || typeof d !== 'string') return [];
	const tokens = tokenize(d.trim());
	if (tokens.length === 0) return [];

	const paths: VectorPath[] = [];
	// `hasCurrent` mirrors `current !== null`; carrying both around keeps
	// TypeScript happy without sprinkling `!` non-null assertions through
	// every case branch.
	let current: VectorPath = { id: pid(), points: [], closed: false };
	let hasCurrent = false;
	let cx = 0;
	let cy = 0;
	let startX = 0;
	let startY = 0;
	let lastCtrlX = 0;
	let lastCtrlY = 0;
	let lastCmd = '';

	const begin = (x: number, y: number, closedHint = false): VectorPath => {
		if (hasCurrent && current.points.length > 0) paths.push(current);
		const next: VectorPath = { id: pid(), points: [], closed: closedHint };
		current = next;
		hasCurrent = true;
		startX = x;
		startY = y;
		cx = x;
		cy = y;
		lastCtrlX = x;
		lastCtrlY = y;
		return next;
	};

	const pushPoint = (x: number, y: number): PathPoint => {
		const pt: PathPoint = { id: pid(), x: round(x), y: round(y) };
		current.points.push(pt);
		return pt;
	};

	const ensureCurrent = (): VectorPath => {
		if (!hasCurrent) return begin(cx, cy);
		return current;
	};

	for (const tok of tokens) {
		const upper = tok.cmd.toUpperCase();
		const rel = tok.cmd !== upper;
		const a = tok.args;
		switch (upper) {
			case 'M': {
				// M starts a new sub-path. The M coord itself is the first
				// anchor — it must be pushed as a PathPoint, otherwise the
				// starting corner is missing from the rendered path.
				const mx = rel ? cx + a[0] : a[0];
				const my = rel ? cy + a[1] : a[1];
				begin(mx, my, false);
				pushPoint(mx, my);
				cx = mx;
				cy = my;
				// SVG spec: subsequent coord pairs after M are implicit L.
				for (let i = 2; i < a.length; i += 2) {
					const lx = rel ? cx + a[i] : a[i];
					const ly = rel ? cy + a[i + 1] : a[i + 1];
					pushPoint(lx, ly);
					cx = lx;
					cy = ly;
				}
				break;
			}
			case 'L': {
				ensureCurrent();
				for (let i = 0; i < a.length; i += 2) {
					const x = rel ? cx + a[i] : a[i];
					const y = rel ? cy + a[i + 1] : a[i + 1];
					pushPoint(x, y);
					cx = x;
					cy = y;
				}
				break;
			}
			case 'H': {
				ensureCurrent();
				for (const v of a) {
					const x = rel ? cx + v : v;
					pushPoint(x, cy);
					cx = x;
				}
				break;
			}
			case 'V': {
				ensureCurrent();
				for (const v of a) {
					const y = rel ? cy + v : v;
					pushPoint(cx, y);
					cy = y;
				}
				break;
			}
			case 'C': {
				ensureCurrent();
				for (let i = 0; i < a.length; i += 6) {
					const c1x = rel ? cx + a[i] : a[i];
					const c1y = rel ? cy + a[i + 1] : a[i + 1];
					const c2x = rel ? cx + a[i + 2] : a[i + 2];
					const c2y = rel ? cy + a[i + 3] : a[i + 3];
					const ex = rel ? cx + a[i + 4] : a[i + 4];
					const ey = rel ? cy + a[i + 5] : a[i + 5];
					// Attach handles to the current (just-placed) point + the
					// next anchor. Convert to offsets relative to each anchor.
					const last = current.points[current.points.length - 1];
					if (last) {
						last.handleOutX = round(c1x - last.x);
						last.handleOutY = round(c1y - last.y);
					}
					const next = pushPoint(ex, ey);
					next.handleInX = round(c2x - ex);
					next.handleInY = round(c2y - ey);
					lastCtrlX = c2x;
					lastCtrlY = c2y;
					cx = ex;
					cy = ey;
				}
				break;
			}
			case 'S': {
				// Smooth cubic: control point 1 is the reflection of the last
				// C/S control point 2. If the previous command wasn't C/S,
				// the spec says the first control point equals the current point.
				ensureCurrent();
				for (let i = 0; i < a.length; i += 4) {
					const usedReflection =
						lastCmd === 'C' || lastCmd === 'S' || lastCmd === 'c' || lastCmd === 's';
					const c1x = usedReflection ? 2 * cx - lastCtrlX : cx;
					const c1y = usedReflection ? 2 * cy - lastCtrlY : cy;
					const c2x = rel ? cx + a[i] : a[i];
					const c2y = rel ? cy + a[i + 1] : a[i + 1];
					const ex = rel ? cx + a[i + 2] : a[i + 2];
					const ey = rel ? cy + a[i + 3] : a[i + 3];
					const last = current.points[current.points.length - 1];
					if (last) {
						last.handleOutX = round(c1x - last.x);
						last.handleOutY = round(c1y - last.y);
					}
					const next = pushPoint(ex, ey);
					next.handleInX = round(c2x - ex);
					next.handleInY = round(c2y - ey);
					lastCtrlX = c2x;
					lastCtrlY = c2y;
					cx = ex;
					cy = ey;
				}
				break;
			}
			case 'Q': {
				// Quadratic curves are stored as cubics with degenerate handles
				// (c1 = anchor, c2 = q control reflected out from the anchor).
				// This keeps the renderer simple — every segment is a C.
				ensureCurrent();
				for (let i = 0; i < a.length; i += 4) {
					const qx = rel ? cx + a[i] : a[i];
					const qy = rel ? cy + a[i + 1] : a[i + 1];
					const ex = rel ? cx + a[i + 2] : a[i + 2];
					const ey = rel ? cy + a[i + 3] : a[i + 3];
					const last = current.points[current.points.length - 1];
					if (last) {
						// For a quadratic P0->P1->P2 the equivalent cubic has
						// c1 = P0 + 2/3*(P1-P0), c2 = P2 + 2/3*(P1-P2).
						last.handleOutX = round((2 / 3) * (qx - last.x));
						last.handleOutY = round((2 / 3) * (qy - last.y));
					}
					const next = pushPoint(ex, ey);
					next.handleInX = round((2 / 3) * (qx - ex));
					next.handleInY = round((2 / 3) * (qy - ey));
					cx = ex;
					cy = ey;
				}
				break;
			}
			case 'T': {
				ensureCurrent();
				for (let i = 0; i < a.length; i += 2) {
					const ex = rel ? cx + a[i] : a[i];
					const ey = rel ? cy + a[i + 1] : a[i + 1];
					// Use straight line; smooth-quadratic reflection is rare in
					// imported SVGs and over-engineering this isn't worth it.
					pushPoint(ex, ey);
					cx = ex;
					cy = ey;
				}
				break;
			}
			case 'Z': {
				if (hasCurrent && current.points.length > 0) {
					current.closed = true;
					cx = startX;
					cy = startY;
				}
				break;
			}
			case 'A': {
				// Arc command — convert to a polyline by sampling. Arcs are
				// rare in vector imports and sampling is lossless up to the
				// chosen segment count.
				ensureCurrent();
				for (let i = 0; i < a.length; i += 7) {
					const [x1, y1] = [cx, cy];
					const rx = a[i];
					const ry = a[i + 1];
					const xAxisRotation = a[i + 2];
					const largeArc = a[i + 3];
					const sweep = a[i + 4];
					const ex = rel ? cx + a[i + 5] : a[i + 5];
					const ey = rel ? cy + a[i + 6] : a[i + 6];
					const samples = arcToBezierSamples(
						x1,
						y1,
						ex,
						ey,
						rx,
						ry,
						xAxisRotation,
						largeArc,
						sweep,
					);
					for (const [sx, sy] of samples) {
						pushPoint(sx, sy);
					}
					cx = ex;
					cy = ey;
				}
				break;
			}
			default:
				break;
		}
		lastCmd = tok.cmd;
	}
	if (hasCurrent && current.points.length > 0) paths.push(current);
	return paths;
}

/** Sample an SVG arc as a polyline. Returns ~32 evenly-spaced points along
 *  the arc — good enough for editing, never used for display. */
function arcToBezierSamples(
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	rx: number,
	ry: number,
	xAxisRotationDeg: number,
	largeArc: number,
	sweep: number,
): [number, number][] {
	if (rx === 0 || ry === 0) return [[x2, y2]];
	const phi = (xAxisRotationDeg * Math.PI) / 180;
	const cosP = Math.cos(phi);
	const sinP = Math.sin(phi);
	const dx = (x1 - x2) / 2;
	const dy = (y1 - y2) / 2;
	const x1p = cosP * dx + sinP * dy;
	const y1p = -sinP * dx + cosP * dy;
	let rxA = Math.abs(rx);
	let ryA = Math.abs(ry);
	const lambda = (x1p * x1p) / (rxA * rxA) + (y1p * y1p) / (ryA * ryA);
	if (lambda > 1) {
		const s = Math.sqrt(lambda);
		rxA *= s;
		ryA *= s;
	}
	const sign = largeArc !== sweep ? 1 : -1;
	const num = rxA * rxA * ryA * ryA - rxA * rxA * y1p * y1p - ryA * ryA * x1p * x1p;
	const den = rxA * rxA * y1p * y1p + ryA * ryA * x1p * x1p;
	const coef = sign * Math.sqrt(Math.max(0, num / den));
	const cxp = (coef * (rxA * y1p)) / ryA;
	const cyp = (coef * -(ryA * x1p)) / rxA;
	const cx = cosP * cxp - sinP * cyp + (x1 + x2) / 2;
	const cy = sinP * cxp + cosP * cyp + (y1 + y2) / 2;

	const angle = (ux: number, uy: number, vx: number, vy: number): number => {
		const dot = ux * vx + uy * vy;
		const len = Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);
		let ang = Math.acos(Math.max(-1, Math.min(1, dot / len)));
		if (ux * vy - uy * vx < 0) ang = -ang;
		return ang;
	};
	const theta1 = angle(1, 0, (x1p - cxp) / rxA, (y1p - cyp) / ryA);
	let deltaTheta = angle(
		(x1p - cxp) / rxA,
		(y1p - cyp) / ryA,
		(-x1p - cxp) / rxA,
		(-y1p - cyp) / ryA,
	);
	if (sweep === 0 && deltaTheta > 0) deltaTheta -= 2 * Math.PI;
	if (sweep === 1 && deltaTheta < 0) deltaTheta += 2 * Math.PI;

	const N = 32;
	const out: [number, number][] = [];
	for (let i = 1; i <= N; i++) {
		const t = theta1 + (deltaTheta * i) / N;
		const px = rxA * Math.cos(t);
		const py = ryA * Math.sin(t);
		out.push([cosP * px - sinP * py + cx, sinP * px + cosP * py + cy]);
	}
	return out;
}
