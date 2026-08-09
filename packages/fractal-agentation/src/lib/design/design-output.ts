import type { DesignPlacement } from './design-types';

export function generateDesignOutput(
	placements: DesignPlacement[],
	wireframePurpose?: string,
	wireframe?: boolean
): string {
	if (placements.length === 0) return '';

	const lines: string[] = [];

	lines.push(`## ${wireframe ? 'Wireframe Layout' : 'Layout Design'}`);
	lines.push('');
	lines.push(`**${placements.length} component${placements.length !== 1 ? 's' : ''} placed**`);
	lines.push('');

	if (wireframePurpose) {
		lines.push(`**Purpose:** ${wireframePurpose}`);
		lines.push('');
	}

	lines.push('**Viewport context:**');
	if (typeof window !== 'undefined') {
		lines.push(`- Viewport: ${window.innerWidth}×${window.innerHeight}px`);
		lines.push(`- User Agent: ${navigator.userAgent.substring(0, 80)}`);
	}
	lines.push('');

	// Group placements into rows by vertical proximity
	const sorted = [...placements].sort((a, b) => a.y - b.y || a.x - b.x);
	const rows: DesignPlacement[][] = [];
	for (const p of sorted) {
		let placed = false;
		for (const row of rows) {
			const avgY = row.reduce((s, r) => s + r.y, 0) / row.length;
			if (Math.abs(p.y - avgY) < p.height * 1.5) {
				row.push(p);
				placed = true;
				break;
			}
		}
		if (!placed) rows.push([p]);
	}

	// Output with spatial context
	lines.push('**Component layout (top → bottom):**');
	lines.push('');

	for (const row of rows) {
		const yStr = `${Math.round(row[0].y)}px`;
		const components = row
			.map((p) => `\`${p.type}\` (${Math.round(p.width)}×${Math.round(p.height)}${p.text ? ` — "${p.text}"` : ''})`)
			.join(', ');
		lines.push(`- At y≈${yStr}: ${components}`);
	}

	lines.push('');
	lines.push('**Implementation guidance:**');
	lines.push('- Placements are approximate spatial hints, not pixel-perfect specs.');
	lines.push('- Adapt widths and heights to your design system and breakpoints.');
	lines.push('- Group adjacent components into semantic sections.');
	lines.push('- Adjust vertical spacing (y positions) for consistent rhythm.');

	return lines.join('\n');
}

export function generateRearrangeOutput(): string {
	return '';
}
