// src/lib/utils/templates.ts
// T3.1 — Template catalog as DesignBlock subtrees.
//
// Each template is `{ id, name, category, blocks: DesignBlock[] }`. Blocks
// are absolutely positioned (the app's actual layout model) and form a
// coherent, parented subtree. `canvas.insertTemplate` clones them with fresh
// ids and offsets the whole subtree so its visual centre lands at the
// viewport centre (see canvasstate.svelte.ts).
//
// Why this shape?
//   - matches the doc's `CanvasNode` intent but adapted to DesignBlock
//   - keeps each template in one file (no scattered JSON)
//   - tests can construct a template + call insertTemplate in 5 lines

export type DesignBlock = {
	id: string;
	type: 'text' | 'image' | 'frame' | 'container' | 'card';
	name: string;
	x: number;
	y: number;
	w: number;
	h: number;
	rotation: number;
	props: Record<string, unknown>;
	style: Record<string, string | number>;
	parentId: string | null;
	children: string[];
	locked?: boolean;
	hidden?: boolean;
	/** Semantic HTML tag for codegen (div/section/article/header/nav/main/footer/aside) */
	htmlTag?: string;
	/** Animation preset assigned to the block */
	animation?: {
		in?: string;
		out?: string;
		combo?: string;
		duration?: number;
	};
}

export type TemplateCategory = 'Hero' | 'Auth' | 'Layout' | 'Content' | 'Nav';

export type Template = {
	id: string;
	name: string;
	category: TemplateCategory;
	description: string;
	blocks: DesignBlock[];
};

/** Generate a deterministic-ish id with a stable prefix so template ids
 *  don't collide with canvas-generated ids (`<random>_<timestamp>`). */
function tid(suffix: string): string {
	return `tpl_${suffix}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}

/** Tiny helper so template definitions read like a declarative spec. Returns
 *  a fresh block — never mutates, never references the canvas. */
function make(partial: Omit<DesignBlock, 'rotation' | 'children'> & { children?: string[] }): DesignBlock {
	return {
		...partial,
		rotation: 0,
		children: partial.children ?? []
	};
}

// ---------------------------------------------------------------------------
// HERO CENTERED
//   Root frame → headline, subhead, CTA button. Padding baked in via the
//   frame's style so the entire hero is one moveable unit.
// ---------------------------------------------------------------------------
const HERO_CENTERED: DesignBlock[] = [
	make({
		id: tid('hero_frame'),
		type: 'frame',
		name: 'Hero Section',
		x: 0,
		y: 0,
		w: 960,
		h: 480,
		style: {
			background: 'linear-gradient(180deg, #ffffff 0%, #f5f7ff 100%)',
			overflow: 'hidden',
			display: 'flex',
			'flex-direction': 'column',
			'align-items': 'center',
			'justify-content': 'center',
			padding: '80px 60px',
			gap: '20px'
		},
		parentId: null,
		props: {},
		children: ['hero_eyebrow', 'hero_headline', 'hero_subhead', 'hero_cta']
	}),
	make({
		id: 'hero_eyebrow',
		type: 'text',
		name: 'Eyebrow',
		x: 60,
		y: 120,
		w: 200,
		h: 24,
		props: { text: 'NEW · LAUNCH', color: '#0066ff' },
		style: {
			'font-size': '12px',
			'font-weight': '600',
			'letter-spacing': '0.16em',
			'text-align': 'center',
			padding: '4px 12px',
			background: '#e0eaff',
			'border-radius': '999px'
		},
		parentId: 'hero_frame'
	}),
	make({
		id: 'hero_headline',
		type: 'text',
		name: 'Headline',
		x: 60,
		y: 160,
		w: 840,
		h: 96,
		props: { text: 'Build beautiful interfaces in minutes.' },
		style: {
			'font-size': '48px',
			'font-weight': '700',
			'line-height': '1.05',
			color: '#0f172a',
			'text-align': 'center',
			padding: '0'
		},
		parentId: 'hero_frame'
	}),
	make({
		id: 'hero_subhead',
		type: 'text',
		name: 'Subheadline',
		x: 60,
		y: 280,
		w: 720,
		h: 56,
		props: { text: 'Drag, drop, and ship. No code required to start.' },
		style: {
			'font-size': '18px',
			'font-weight': '400',
			'line-height': '1.5',
			color: '#475569',
			'text-align': 'center',
			padding: '0'
		},
		parentId: 'hero_frame'
	}),
	make({
		id: 'hero_cta',
		type: 'card',
		name: 'CTA Button',
		x: 380,
		y: 360,
		w: 200,
		h: 48,
		props: { description: '' },
		style: {
			background: '#0066ff',
			border: 'none',
			padding: '12px 24px',
			'border-radius': '10px',
			display: 'flex',
			'align-items': 'center',
			'justify-content': 'center'
		},
		parentId: 'hero_frame'
	})
];

// ---------------------------------------------------------------------------
// SPLIT IMAGE RIGHT — text on left, image area on right.
// ---------------------------------------------------------------------------
const SPLIT_IMAGE_RIGHT: DesignBlock[] = [
	make({
		id: tid('split_root'),
		type: 'frame',
		name: 'Split Hero',
		x: 0,
		y: 0,
		w: 960,
		h: 480,
		style: {
			background: '#ffffff',
			overflow: 'hidden',
			display: 'grid',
			'grid-template-columns': '1fr 1fr',
			gap: '40px',
			padding: '60px'
		},
		parentId: null,
		props: {},
		children: ['split_text', 'split_image']
	}),
	make({
		id: 'split_text',
		type: 'frame',
		name: 'Text Column',
		x: 60,
		y: 80,
		w: 380,
		h: 320,
		style: {
			background: 'transparent',
			border: 'none',
			overflow: 'visible',
			display: 'flex',
			'flex-direction': 'column',
			'justify-content': 'center',
			gap: '16px',
			padding: '0'
		},
		parentId: 'split_root',
		props: {},
		children: ['split_eyebrow', 'split_headline', 'split_body', 'split_btn']
	}),
	make({
		id: 'split_eyebrow',
		type: 'text',
		name: 'Eyebrow',
		x: 0,
		y: 0,
		w: 200,
		h: 20,
		props: { text: 'WHY US' },
		style: {
			'font-size': '11px',
			'font-weight': '700',
			'letter-spacing': '0.16em',
			color: '#0066ff'
		},
		parentId: 'split_text'
	}),
	make({
		id: 'split_headline',
		type: 'text',
		name: 'Headline',
		x: 0,
		y: 28,
		w: 380,
		h: 80,
		props: { text: 'Ship faster with the design tool you already love.' },
		style: {
			'font-size': '34px',
			'font-weight': '700',
			'line-height': '1.15',
			color: '#0f172a'
		},
		parentId: 'split_text'
	}),
	make({
		id: 'split_body',
		type: 'text',
		name: 'Body',
		x: 0,
		y: 124,
		w: 360,
		h: 96,
		props: {
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
		},
		style: {
			'font-size': '15px',
			color: '#475569',
			'line-height': '1.55'
		},
		parentId: 'split_text'
	}),
	make({
		id: 'split_btn',
		type: 'card',
		name: 'CTA',
		x: 0,
		y: 240,
		w: 160,
		h: 44,
		props: { description: '' },
		style: {
			background: '#0066ff',
			border: 'none',
			'border-radius': '8px',
			display: 'flex',
			'align-items': 'center',
			'justify-content': 'center'
		},
		parentId: 'split_text'
	}),
	make({
		id: 'split_image',
		type: 'image',
		name: 'Hero Image',
		x: 460,
		y: 60,
		w: 440,
		h: 360,
		props: { src: '/logomotif.png', alt: 'FractalEngine design preview' },
		style: {
			'border-radius': '16px',
			background: '#e0e7ff',
			border: '1px solid #c7d2fe'
		},
		parentId: 'split_root'
	})
];

// ---------------------------------------------------------------------------
// BENTO GRID — 2x2 mixed-size tiles.
// ---------------------------------------------------------------------------
const BENTO_GRID: DesignBlock[] = [
	make({
		id: tid('bento_root'),
		type: 'frame',
		name: 'Bento Grid',
		x: 0,
		y: 0,
		w: 960,
		h: 540,
		style: {
			background: '#f8fafc',
			overflow: 'hidden',
			display: 'grid',
			'grid-template-columns': '2fr 1fr',
			'grid-template-rows': '1fr 1fr',
			gap: '16px',
			padding: '24px'
		},
		parentId: null,
		props: {},
		children: ['bento_big', 'bento_small_a', 'bento_small_b', 'bento_small_c']
	}),
	make({
		id: 'bento_big',
		type: 'card',
		name: 'Bento Big',
		x: 24,
		y: 24,
		w: 580,
		h: 250,
		props: { description: 'Featured highlight' },
		style: {
			background: '#0f172a',
			border: 'none',
			'border-radius': '16px',
			padding: '32px',
			color: '#f8fafc'
		},
		parentId: 'bento_root'
	}),
	make({
		id: 'bento_small_a',
		type: 'card',
		name: 'Bento Tile A',
		x: 620,
		y: 24,
		w: 316,
		h: 250,
		props: { description: '' },
		style: {
			background: '#fef3c7',
			border: 'none',
			'border-radius': '16px',
			padding: '24px'
		},
		parentId: 'bento_root'
	}),
	make({
		id: 'bento_small_b',
		type: 'card',
		name: 'Bento Tile B',
		x: 24,
		y: 290,
		w: 290,
		h: 226,
		props: { description: '' },
		style: {
			background: '#dbeafe',
			border: 'none',
			'border-radius': '16px',
			padding: '24px'
		},
		parentId: 'bento_root'
	}),
	make({
		id: 'bento_small_c',
		type: 'card',
		name: 'Bento Tile C',
		x: 330,
		y: 290,
		w: 290,
		h: 226,
		props: { description: '' },
		style: {
			background: '#dcfce7',
			border: 'none',
			'border-radius': '16px',
			padding: '24px'
		},
		parentId: 'bento_root'
	})
];

// ---------------------------------------------------------------------------
// 3-COLUMN PRICING — three card tiles side-by-side, middle one highlighted.
// ---------------------------------------------------------------------------
const PRICING_3COL: DesignBlock[] = [
	make({
		id: tid('pricing_root'),
		type: 'frame',
		name: 'Pricing',
		x: 0,
		y: 0,
		w: 960,
		h: 520,
		style: {
			background: '#ffffff',
			overflow: 'hidden',
			display: 'grid',
			'grid-template-columns': 'repeat(3, 1fr)',
			gap: '20px',
			padding: '40px'
		},
		parentId: null,
		props: {},
		children: ['price_free', 'price_pro', 'price_team']
	}),
	make({
		id: 'price_free',
		type: 'card',
		name: 'Free Plan',
		x: 40,
		y: 40,
		w: 290,
		h: 440,
		props: { description: '' },
		style: {
			background: '#ffffff',
			border: '1px solid #e2e8f0',
			'border-radius': '12px',
			padding: '24px'
		},
		parentId: 'pricing_root'
	}),
	make({
		id: 'price_pro',
		type: 'card',
		name: 'Pro Plan',
		x: 350,
		y: 30,
		w: 290,
		h: 460,
		props: { description: '' },
		style: {
			background: '#0f172a',
			border: 'none',
			'border-radius': '12px',
			padding: '24px',
			color: '#f8fafc',
			'box-shadow': '0 12px 32px rgba(15, 23, 42, 0.18)'
		},
		parentId: 'pricing_root'
	}),
	make({
		id: 'price_team',
		type: 'card',
		name: 'Team Plan',
		x: 660,
		y: 40,
		w: 290,
		h: 440,
		props: { description: '' },
		style: {
			background: '#ffffff',
			border: '1px solid #e2e8f0',
			'border-radius': '12px',
			padding: '24px'
		},
		parentId: 'pricing_root'
	})
];

// ---------------------------------------------------------------------------
// AUTH (Login/Signup) — centered card with title, email + password fields,
// submit button.
// ---------------------------------------------------------------------------
const AUTH_CENTERED: DesignBlock[] = [
	make({
		id: tid('auth_root'),
		type: 'frame',
		name: 'Auth Screen',
		x: 0,
		y: 0,
		w: 480,
		h: 560,
		style: {
			background: '#ffffff',
			border: '1px solid #e2e8f0',
			overflow: 'hidden',
			display: 'flex',
			'flex-direction': 'column',
			padding: '40px',
			gap: '16px',
			'border-radius': '16px',
			'box-shadow': '0 20px 50px rgba(15, 23, 42, 0.08)'
		},
		parentId: null,
		props: {},
		children: ['auth_title', 'auth_subtitle', 'auth_email', 'auth_password', 'auth_submit']
	}),
	make({
		id: 'auth_title',
		type: 'text',
		name: 'Auth Title',
		x: 40,
		y: 40,
		w: 400,
		h: 36,
		props: { text: 'Welcome back' },
		style: {
			'font-size': '24px',
			'font-weight': '700',
			color: '#0f172a'
		},
		parentId: 'auth_root'
	}),
	make({
		id: 'auth_subtitle',
		type: 'text',
		name: 'Auth Subtitle',
		x: 40,
		y: 80,
		w: 400,
		h: 20,
		props: { text: 'Sign in to your account to continue' },
		style: {
			'font-size': '14px',
			color: '#64748b'
		},
		parentId: 'auth_root'
	}),
	make({
		id: 'auth_email',
		type: 'frame',
		name: 'Email Field',
		x: 40,
		y: 140,
		w: 400,
		h: 44,
		style: {
			background: '#f8fafc',
			border: '1px solid #e2e8f0',
			'border-radius': '8px',
			padding: '12px 14px',
			display: 'flex',
			'align-items': 'center'
		},
		parentId: 'auth_root',
		props: {},
		children: []
	}),
	make({
		id: 'auth_password',
		type: 'frame',
		name: 'Password Field',
		x: 40,
		y: 200,
		w: 400,
		h: 44,
		style: {
			background: '#f8fafc',
			border: '1px solid #e2e8f0',
			'border-radius': '8px',
			padding: '12px 14px',
			display: 'flex',
			'align-items': 'center'
		},
		parentId: 'auth_root',
		props: {},
		children: []
	}),
	make({
		id: 'auth_submit',
		type: 'card',
		name: 'Submit Button',
		x: 40,
		y: 280,
		w: 400,
		h: 48,
		props: { description: '' },
		style: {
			background: '#0066ff',
			border: 'none',
			'border-radius': '8px',
			display: 'flex',
			'align-items': 'center',
			'justify-content': 'center'
		},
		parentId: 'auth_root'
	})
];

// ---------------------------------------------------------------------------
// NAV BAR — top horizontal bar with logo + 4 link slots + CTA.
// ---------------------------------------------------------------------------
const NAV_BAR: DesignBlock[] = [
	make({
		id: tid('nav_root'),
		type: 'frame',
		name: 'Nav Bar',
		x: 0,
		y: 0,
		w: 1200,
		h: 64,
		style: {
			background: '#ffffff',
			border: '1px solid #e2e8f0',
			overflow: 'hidden',
			display: 'flex',
			'flex-direction': 'row',
			'align-items': 'center',
			padding: '0 32px',
			gap: '24px'
		},
		parentId: null,
		props: {},
		children: ['nav_logo', 'nav_link1', 'nav_link2', 'nav_link3', 'nav_link4', 'nav_cta']
	}),
	make({
		id: 'nav_logo',
		type: 'text',
		name: 'Logo',
		x: 32,
		y: 18,
		w: 120,
		h: 28,
		props: { text: '◆ Fractal' },
		style: {
			'font-size': '18px',
			'font-weight': '700',
			color: '#0f172a'
		},
		parentId: 'nav_root'
	}),
	make({
		id: 'nav_link1',
		type: 'text',
		name: 'Link · Product',
		x: 200,
		y: 20,
		w: 80,
		h: 24,
		props: { text: 'Product' },
		style: { 'font-size': '14px', color: '#334155' },
		parentId: 'nav_root'
	}),
	make({
		id: 'nav_link2',
		type: 'text',
		name: 'Link · Pricing',
		x: 290,
		y: 20,
		w: 80,
		h: 24,
		props: { text: 'Pricing' },
		style: { 'font-size': '14px', color: '#334155' },
		parentId: 'nav_root'
	}),
	make({
		id: 'nav_link3',
		type: 'text',
		name: 'Link · Docs',
		x: 380,
		y: 20,
		w: 80,
		h: 24,
		props: { text: 'Docs' },
		style: { 'font-size': '14px', color: '#334155' },
		parentId: 'nav_root'
	}),
	make({
		id: 'nav_link4',
		type: 'text',
		name: 'Link · Blog',
		x: 470,
		y: 20,
		w: 80,
		h: 24,
		props: { text: 'Blog' },
		style: { 'font-size': '14px', color: '#334155' },
		parentId: 'nav_root'
	}),
	make({
		id: 'nav_cta',
		type: 'card',
		name: 'Nav CTA',
		x: 1056,
		y: 14,
		w: 112,
		h: 36,
		props: { description: '' },
		style: {
			background: '#0066ff',
			border: 'none',
			'border-radius': '6px',
			display: 'flex',
			'align-items': 'center',
			'justify-content': 'center'
		},
		parentId: 'nav_root'
	})
];

// ---------------------------------------------------------------------------
// FOOTER — three columns of links with a copyright row at the bottom.
// ---------------------------------------------------------------------------
const FOOTER: DesignBlock[] = [
	make({
		id: tid('footer_root'),
		type: 'frame',
		name: 'Footer',
		x: 0,
		y: 0,
		w: 1200,
		h: 240,
		style: {
			background: '#0f172a',
			border: 'none',
			overflow: 'hidden',
			display: 'flex',
			'flex-direction': 'column',
			padding: '40px 48px',
			gap: '24px',
			color: '#e2e8f0'
		},
		parentId: null,
		props: {},
		children: ['footer_brand', 'footer_col_a', 'footer_col_b', 'footer_col_c', 'footer_copy']
	}),
	make({
		id: 'footer_brand',
		type: 'text',
		name: 'Footer Brand',
		x: 48,
		y: 40,
		w: 240,
		h: 32,
		props: { text: '◆ Fractal' },
		style: {
			'font-size': '20px',
			'font-weight': '700',
			color: '#f8fafc'
		},
		parentId: 'footer_root'
	}),
	make({
		id: 'footer_col_a',
		type: 'text',
		name: 'Footer Col · Product',
		x: 360,
		y: 40,
		w: 200,
		h: 80,
		props: { text: 'Product\nFeatures\nPricing\nChangelog' },
		style: {
			'font-size': '13px',
			'line-height': '1.7',
			color: '#94a3b8'
		},
		parentId: 'footer_root'
	}),
	make({
		id: 'footer_col_b',
		type: 'text',
		name: 'Footer Col · Resources',
		x: 600,
		y: 40,
		w: 200,
		h: 80,
		props: { text: 'Resources\nDocs\nBlog\nSupport' },
		style: {
			'font-size': '13px',
			'line-height': '1.7',
			color: '#94a3b8'
		},
		parentId: 'footer_root'
	}),
	make({
		id: 'footer_col_c',
		type: 'text',
		name: 'Footer Col · Company',
		x: 840,
		y: 40,
		w: 200,
		h: 80,
		props: { text: 'Company\nAbout\nCareers\nContact' },
		style: {
			'font-size': '13px',
			'line-height': '1.7',
			color: '#94a3b8'
		},
		parentId: 'footer_root'
	}),
	make({
		id: 'footer_copy',
		type: 'text',
		name: 'Footer Copyright',
		x: 48,
		y: 180,
		w: 600,
		h: 20,
		props: { text: '© 2026 Fractal. All rights reserved.' },
		style: {
			'font-size': '12px',
			color: '#64748b'
		},
		parentId: 'footer_root'
	})
];

// ---------------------------------------------------------------------------
// Public catalog
// ---------------------------------------------------------------------------
export const TEMPLATES: Template[] = [
	{
		id: 'hero-centered',
		name: 'Hero · Centered',
		category: 'Hero',
		description: 'Centered headline + subhead + CTA',
		blocks: HERO_CENTERED
	},
	{
		id: 'split-image-right',
		name: 'Split · Image Right',
		category: 'Hero',
		description: 'Two-column hero with image on the right',
		blocks: SPLIT_IMAGE_RIGHT
	},
	{
		id: 'bento-grid',
		name: 'Bento Grid',
		category: 'Layout',
		description: '2x2 mixed-size feature tiles',
		blocks: BENTO_GRID
	},
	{
		id: 'pricing-3col',
		name: 'Pricing · 3 Columns',
		category: 'Content',
		description: 'Three-tier pricing layout',
		blocks: PRICING_3COL
	},
	{
		id: 'auth-centered',
		name: 'Auth · Centered Card',
		category: 'Auth',
		description: 'Login / signup form, centered',
		blocks: AUTH_CENTERED
	},
	{
		id: 'nav-bar',
		name: 'Nav Bar',
		category: 'Nav',
		description: 'Top nav with logo + links + CTA',
		blocks: NAV_BAR
	},
	{
		id: 'footer',
		name: 'Footer',
		category: 'Nav',
		description: 'Three-column footer with copyright',
		blocks: FOOTER
	}
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = ['Hero', 'Auth', 'Layout', 'Content', 'Nav'];

export function findTemplate(id: string): Template | undefined {
	return TEMPLATES.find((t) => t.id === id);
}

export const componentTypes = [
	{
		name: 'Flexbox Column',
		class: 'design-flexbox-column',
		icon: "ds-flexcol.svg"
	},
	{
		name: 'Flexbox Row',
		class: 'design-flexbox-row',
		icon: 'ds-flexrow.svg'
	},
	{
		name: 'Grid',
		class: 'design-grid',
		icon: 'ds-grid.svg'
	},
	{
		name: 'Grid Two',
		class: 'design-grid design-grid-two',
		icon: 'ds-grid.svg'
	},
	{
		name: 'Grid Three',
		class: 'design-grid design-grid-three',
		icon: 'ds-grid.svg'
	},
	{
		name: 'Grid Four',
		class: 'design-grid design-grid-four',
		icon: 'ds-grid.svg'
	},
	{
		name: 'Grid Five',
		class: 'design-grid design-grid-five',
		icon: 'ds-grid.svg'
	},
	{
		name: 'Grid Auto',
		class: 'design-grid design-grid-auto',
		icon: 'ds-grid.svg'
	},
	{
		name: 'Text',
		class: 'design-text',
		icon: 'ds-grid.svg'
	}
]
