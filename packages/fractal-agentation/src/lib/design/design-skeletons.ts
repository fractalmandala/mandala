/**
 * Compact SVG skeleton renderers for design mode placements.
 * Each creates a distinct visual identity using basic SVG shapes.
 */
import type { ComponentType } from './design-types';

type SkeletonFn = (w: number, h: number, text?: string) => string;

function rect(x: number, y: number, w: number, h: number, r = 0, fill = '', stroke = '', sw = '0.5') {
	const fillAttr = fill ? ` fill="${fill}" fill-opacity="0.06"` : '';
	const strokeAttr = stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : '';
	const rxAttr = r ? ` rx="${r}"` : '';
	return `<rect x="${x}" y="${y}" width="${w}" height="${h}"${rxAttr}${fillAttr}${strokeAttr} stroke-dasharray="3 2"/>`;
}

function bar(x: number, y: number, w: number, h: number, r = 1) {
	return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="currentColor" opacity="0.15"/>`;
}

function strong(x: number, y: number, w: number, h: number, r = 1) {
	return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="currentColor" opacity="0.3"/>`;
}

function circle(cx: number, cy: number, r: number) {
	return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 1"/>`;
}

function textEl(x: number, y: number, content: string, size = 5) {
	return `<text x="${x}" y="${y}" font-size="${size}" fill="currentColor" opacity="0.5" font-family="system-ui">${content}</text>`;
}

const skeletons: Record<ComponentType, SkeletonFn> = {
	navigation: (w, h) =>
		`${rect(0, 0, w, h, 2)}${bar(8, h/2 - 2, w * 0.15, 4)}${bar(w * 0.22, h/2 - 1, w * 0.08, 2)}${bar(w * 0.33, h/2 - 1, w * 0.08, 2)}${bar(w * 0.44, h/2 - 1, w * 0.08, 2)}${rect(w * 0.75, h/4 + 2, w * 0.18, h/2 - 4, 3, 'currentColor')}`,

	header: (w, h) =>
		`${rect(0, 0, w, h, 2)}${strong(6, h * 0.3, w * 0.35, h * 0.4, 2)}${bar(6, h * 0.75, w * 0.5, h * 0.1)}`,

	hero: (w, h) =>
		`${rect(0, 0, w, h, 2)}${strong(w * 0.15, h * 0.2, w * 0.7, h * 0.12, 2)}${bar(w * 0.2, h * 0.38, w * 0.6, h * 0.08)}${bar(w * 0.3, h * 0.5, w * 0.4, h * 0.08)}${rect(w * 0.35, h * 0.65, w * 0.3, h * 0.18, 4, '', 'currentColor', '0.75')}`,

	section: (w, h) =>
		`${rect(0, 0, w, h, 2)}${strong(6, h * 0.1, w * 0.25, h * 0.08)}${bar(6, h * 0.25, w * 0.9, h * 0.06)}${bar(6, h * 0.38, w * 0.7, h * 0.06)}${bar(6, h * 0.5, w * 0.8, h * 0.06)}${bar(6, h * 0.62, w * 0.6, h * 0.06)}`,

	sidebar: (w, h) =>
		`${rect(0, 0, w, h, 2)}${bar(4, h * 0.05, w * 0.7, h * 0.03)}${bar(4, h * 0.12, w * 0.5, h * 0.03)}${bar(4, h * 0.19, w * 0.65, h * 0.03)}${bar(4, h * 0.26, w * 0.55, h * 0.03)}${bar(4, h * 0.33, w * 0.6, h * 0.03)}${bar(4, h * 0.7, w * 0.8, h * 0.04, 2)}`,

	footer: (w, h) =>
		`${rect(0, 0, w, h, 2)}${bar(8, h * 0.3, w * 0.12, h * 0.15)}${bar(w * 0.18, h * 0.3, w * 0.12, h * 0.15)}${bar(w * 0.55, h * 0.3, w * 0.12, h * 0.15)}${bar(8, h * 0.65, w * 0.2, h * 0.1)}${bar(w * 0.25, h * 0.65, w * 0.2, h * 0.1)}`,

	modal: (w, h) =>
		`${rect(w * 0.1, h * 0.05, w * 0.8, h * 0.9, 3)}${strong(w * 0.18, h * 0.18, w * 0.4, h * 0.12)}${bar(w * 0.18, h * 0.38, w * 0.6, h * 0.08)}${bar(w * 0.18, h * 0.52, w * 0.5, h * 0.06)}${rect(w * 0.55, h * 0.75, w * 0.3, h * 0.14, 3, '', 'currentColor')}`,

	card: (w, h) =>
		`${rect(0, 0, w, h, 3)}${rect(0, 0, w, h * 0.35, 3, 'currentColor')}${strong(8, h * 0.45, w * 0.6, h * 0.1)}${bar(8, h * 0.62, w * 0.8, h * 0.07)}${bar(8, h * 0.75, w * 0.45, h * 0.06)}`,

	text: (w, h, text) =>
		text ? `${strong(4, h * 0.15, w * 0.9, h * 0.15, 2)}${textEl(8, h * 0.3 + 5, text)}` :
		`${strong(4, h * 0.05, w * 0.7, h * 0.12)}${bar(4, h * 0.25, w * 0.9, h * 0.08)}${bar(4, h * 0.4, w * 0.85, h * 0.06)}${bar(4, h * 0.52, w * 0.6, h * 0.06)}${bar(4, h * 0.64, w * 0.75, h * 0.06)}`,

	image: (w, h) =>
		`${rect(0, 0, w, h, 2)}<line x1="0" y1="0" x2="${w}" y2="${h}" stroke="currentColor" stroke-width="0.3" opacity="0.15"/><line x1="${w}" y1="0" x2="0" y2="${h}" stroke="currentColor" stroke-width="0.3" opacity="0.15"/>`,

	table: (w, h) => {
		const cols = 4, colW = w / cols;
		let svg = `${rect(0, 0, w, h, 2)}`;
		for (let i = 0; i < 4; i++) {
			svg += `<line x1="${i * colW}" y1="${h * 0.15}" x2="${i * colW}" y2="${h}" stroke="currentColor" stroke-width="0.3" opacity="0.12"/>`;
		}
		svg += `<line x1="0" y1="${h * 0.15}" x2="${w}" y2="${h * 0.15}" stroke="currentColor" stroke-width="0.3" opacity="0.12"/>`;
		svg += strong(4, h * 0.05, colW - 8, h * 0.08);
		svg += bar(4, h * 0.25, colW - 8, h * 0.06);
		svg += bar(4, h * 0.4, colW - 8, h * 0.06);
		return svg;
	},

	grid: (w, h) => {
		const gw = w / 2 - 4, gh = h / 2 - 4;
		return `${rect(2, 2, gw, gh, 2)}${rect(w/2 + 2, 2, gw, gh, 2)}${rect(2, h/2 + 2, gw, gh, 2)}${rect(w/2 + 2, h/2 + 2, gw, gh, 2)}`;
	},

	list: (w, h) => {
		let svg = '';
		for (let i = 0; i < 4; i++) {
			const y = h * 0.1 + i * h * 0.22;
			svg += circle(6, y, 2);
			svg += bar(12, y - 2, w * 0.5, h * 0.06);
		}
		return svg;
	},

	accordion: (w, h) =>
		`${rect(0, 0, w, h, 2)}${bar(4, h * 0.08, w * 0.3, h * 0.12)}${rect(2, h * 0.26, w - 4, h * 0.16, 2, 'currentColor')}${rect(2, h * 0.48, w - 4, h * 0.16, 2, 'currentColor')}${rect(2, h * 0.7, w - 4, h * 0.16, 2, 'currentColor')}`,

	carousel: (w, h) =>
		`${rect(w * 0.08, h * 0.1, w * 0.84, h * 0.65, 3)}<path d="M${w*0.04} ${h/2}L${w*0.07} ${h*0.4}L${w*0.04} ${h*0.6}" stroke="currentColor" stroke-width="0.5" opacity="0.2" fill="none"/><path d="M${w*0.96} ${h/2}L${w*0.93} ${h*0.4}L${w*0.96} ${h*0.6}" stroke="currentColor" stroke-width="0.5" opacity="0.2" fill="none"/>${circle(w*0.4, h*0.9, 1.5)}${circle(w*0.5, h*0.9, 1.5)}${circle(w*0.6, h*0.9, 1.5)}`,

	button: (w, h) =>
		`${rect(0, 0, w, h, h/2, '', 'currentColor', '0.75')}${bar(w*0.15, h/2 - 1, w*0.7, 2)}`,

	input: (w, h) =>
		`${bar(4, h * 0.15, w * 0.3, h * 0.2)}${rect(4, h * 0.45, w - 8, h * 0.45, 2, '', 'currentColor')}${bar(8, h * 0.6, w * 0.25, h * 0.15)}`,

	search: (w, h) =>
		`${rect(4, h * 0.25, w - 8, h * 0.55, h * 0.3, '', 'currentColor')}${circle(w*0.12, h/2, 4)}<line x1="${w*0.16}" y1="${h*0.6}" x2="${w*0.2}" y2="${h*0.7}" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>`,

	form: (w, h) => {
		let svg = `${rect(0, 0, w, h, 3)}`;
		const fields = ['Name', 'Email', 'Message'];
		fields.forEach((f, i) => {
			const y = h * 0.1 + i * h * 0.25;
			svg += bar(6, y - 4, w * 0.3, h * 0.06);
			svg += rect(6, y + 2, w - 12, h * 0.14, 2, '', 'currentColor');
		});
		svg += rect(w * 0.55, h * 0.82, w * 0.35, h * 0.12, 3, '', 'currentColor', '0.75');
		return svg;
	},

	tabs: (w, h) =>
		`${rect(0, 0, w, h, 2)}${rect(2, 2, w * 0.25, h * 0.18, 4, '', 'currentColor', '0.75')}${rect(w * 0.28, 2, w * 0.25, h * 0.18, 4, '', 'currentColor')}${bar(4, h * 0.3, w - 8, h * 0.08)}${bar(4, h * 0.45, w * 0.6, h * 0.06)}${bar(4, h * 0.55, w * 0.7, h * 0.06)}`,

	dropdown: (w, h) =>
		`${rect(0, 0, w, h * 0.25, 2, '', 'currentColor')}${bar(4, h * 0.08, w * 0.4, h * 0.08)}<path d="M${w*0.85} ${h*0.08}l${w*0.03} ${h*0.06}l${w*0.03} -${h*0.06}" stroke="currentColor" stroke-width="0.5" opacity="0.2" fill="none"/>${rect(0, h * 0.3, w, h * 0.65, 2, '', 'currentColor')}${bar(4, h * 0.4, w * 0.5, h * 0.06)}${bar(4, h * 0.55, w * 0.4, h * 0.06)}${bar(4, h * 0.7, w * 0.6, h * 0.06)}`,

	toggle: (w, h) => {
		const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 2;
		return `${rect(cx - r, cy - r, r * 2, r * 2, r, '', 'currentColor', '0.5')}${circle(cx + r * 0.3, cy, r * 0.6)}`;
	},

	breadcrumb: (w, h) =>
		`${bar(4, h/2 - 1, w*0.15, 2)}<text x="${w*0.18}" y="${h/2 + 2}" font-size="4" fill="currentColor" opacity="0.3" font-family="system-ui">/</text>${bar(w*0.24, h/2 - 1, w*0.12, 2)}<text x="${w*0.38}" y="${h/2 + 2}" font-size="4" fill="currentColor" opacity="0.3" font-family="system-ui">/</text>${bar(w*0.44, h/2 - 1, w*0.12, 2)}`,

	pagination: (w, h) => {
		const items = 5, itemW = Math.min(w / items - 4, h * 0.9);
		let svg = '';
		for (let i = 0; i < items; i++) {
			const x = 4 + i * (itemW + 4);
			svg += rect(x, (h - itemW) / 2, itemW, itemW, 2, '', 'currentColor', '0.5');
		}
		return svg;
	},

	toast: (w, h) =>
		`${rect(0, 0, w, h, 4)}${circle(w*0.08, h/2, 5)}${bar(w*0.2, h*0.35, w*0.5, h*0.15)}${bar(w*0.2, h*0.6, w*0.35, h*0.1)}`,

	tooltip: (w, h) =>
		`${rect(4, 2, w-8, h*0.6, 3, '', 'currentColor')}${bar(8, h*0.2, w*0.6, h*0.15)}<path d="M${w/2-4} ${h*0.65}L${w/2} ${h-4}L${w/2+4} ${h*0.65}" stroke="currentColor" stroke-width="0.5" opacity="0.15" fill="none"/>`,

	alert: (w, h) =>
		`${rect(0, 0, w, h, 3)}${circle(w*0.08, h/2, 5)}${bar(w*0.2, h*0.35, w*0.5, h*0.15)}${bar(w*0.2, h*0.6, w*0.4, h*0.1)}`,

	drawer: (w, h) =>
		`${rect(w*0.6, 0, w*0.4, h, 2)}${bar(w*0.64, h*0.1, w*0.3, h*0.06)}${bar(w*0.64, h*0.25, w*0.2, h*0.04)}${bar(w*0.64, h*0.38, w*0.28, h*0.04)}${rect(0, 0, w*0.35, h, 2, '', 'currentColor', '0.3')}`,

	popover: (w, h) =>
		`${rect(2, 2, w-4, h*0.55, 3, '', 'currentColor', '0.75')}${bar(6, h*0.12, w*0.4, h*0.12)}${bar(6, h*0.32, w*0.6, h*0.08)}<path d="M${w/2-3} ${h*0.6}L${w/2} ${h-3}L${w/2+3} ${h*0.6}" stroke="currentColor" stroke-width="0.5" opacity="0.2" fill="none"/>`,

	checkbox: (w, h) => {
		const s = Math.min(w, h) * 0.6;
		return `${rect((w-s)/2, (h-s)/2, s, s, 2, '', 'currentColor', '0.5')}<path d="M${w*0.35} ${h*0.5}l${s*0.2} ${s*0.2}l${s*0.45} -${s*0.4}" stroke="currentColor" stroke-width="0.6" opacity="0.2" fill="none"/>`;
	},

	radio: (w, h) => {
		const s = Math.min(w, h) * 0.6;
		return `${circle(w/2, h/2, s/2)}${circle(w/2, h/2, s*0.2)}`;
	},

	slider: (w, h) =>
		`${bar(4, h/2 - 1, w*0.4, 2)}${bar(w*0.45, h/2 - 1, w*0.5, 1)}${circle(w*0.45, h/2, 4)}`,

	skeleton: (w, h) =>
		`${bar(4, h*0.1, w*0.9, h*0.15)}${bar(4, h*0.35, w*0.7, h*0.12)}${bar(4, h*0.55, w*0.85, h*0.12)}${bar(4, h*0.75, w*0.5, h*0.12)}`,

	chip: (w, h) =>
		`${rect(0, (h-16)/2, Math.min(w, 48), 16, 8, 'currentColor')}${bar(6, h/2 - 1, Math.min(w, 48) - 12, 2)}`
};

const empty: SkeletonFn = () => '';

export function renderSkeleton(type: ComponentType, width: number, height: number, text?: string): string {
	const fn = skeletons[type] || empty;
	const inner = fn(width, height, text);
	// Full-viewport SVG that fills the placement container
	return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">${inner}</svg>`;
}
