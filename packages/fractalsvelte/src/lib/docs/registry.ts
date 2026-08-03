// The component registry — the single source of truth for the docs navigation and for
// tracking the port.
//
// `wave` is the dependency-ordered build order (see AGENTS.md §5). `status` is updated as
// each component lands. The sidebar renders everything, so unported components are visible
// as planned work rather than silently absent.

export type Status = 'ready' | 'planned';

export type Category =
	| 'Layout'
	| 'Forms'
	| 'Navigation'
	| 'Overlay'
	| 'Feedback'
	| 'Data'
	| 'Media';

export type ComponentEntry = {
	slug: string;
	name: string;
	category: Category;
	wave: number;
	status: Status;
	/** Components this one composes. Must be ported first. */
	deps?: string[];
	/** Headless/behavioural package it relies on. */
	external?: string;
};

export const COMPONENTS: ComponentEntry[] = [
	// ── Wave 0 — no dependencies ────────────────────────────────────────────────
	{ slug: 'breadcrumb', name: 'Breadcrumb', category: 'Navigation', wave: 0, status: 'ready' },
	{ slug: 'card', name: 'Card', category: 'Layout', wave: 0, status: 'ready' },
	{ slug: 'input', name: 'Input', category: 'Forms', wave: 0, status: 'ready' },
	{ slug: 'kbd', name: 'Kbd', category: 'Data', wave: 0, status: 'ready' },
	{ slug: 'native-select', name: 'Native Select', category: 'Forms', wave: 0, status: 'ready' },
	{ slug: 'skeleton', name: 'Skeleton', category: 'Feedback', wave: 0, status: 'ready' },
	{ slug: 'spinner', name: 'Spinner', category: 'Feedback', wave: 0, status: 'ready' },
	{ slug: 'table', name: 'Table', category: 'Data', wave: 0, status: 'ready' },
	{ slug: 'textarea', name: 'Textarea', category: 'Forms', wave: 0, status: 'ready' },

	// ── Wave 1 — variant matrices only ──────────────────────────────────────────
	{ slug: 'alert', name: 'Alert', category: 'Feedback', wave: 1, status: 'ready' },
	{ slug: 'badge', name: 'Badge', category: 'Data', wave: 1, status: 'ready' },
	{ slug: 'button', name: 'Button', category: 'Forms', wave: 1, status: 'ready' },
	{ slug: 'empty', name: 'Empty', category: 'Feedback', wave: 1, status: 'ready' },

	// ── Wave 2 — composes ported components ─────────────────────────────────────
	{
		slug: 'input-group',
		name: 'Input Group',
		category: 'Forms',
		wave: 2,
		status: 'ready',
		deps: ['button', 'input', 'textarea']
	},

	// ── Wave 3 — headless leaves ────────────────────────────────────────────────
	{
		slug: 'accordion',
		name: 'Accordion',
		category: 'Layout',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'aspect-ratio',
		name: 'Aspect Ratio',
		category: 'Layout',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'avatar',
		name: 'Avatar',
		category: 'Data',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'checkbox',
		name: 'Checkbox',
		category: 'Forms',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'collapsible',
		name: 'Collapsible',
		category: 'Layout',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'context-menu',
		name: 'Context Menu',
		category: 'Overlay',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'dropdown-menu',
		name: 'Dropdown Menu',
		category: 'Overlay',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'hover-card',
		name: 'Hover Card',
		category: 'Overlay',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'input-otp',
		name: 'Input OTP',
		category: 'Forms',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'label',
		name: 'Label',
		category: 'Forms',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'menubar',
		name: 'Menubar',
		category: 'Navigation',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'navigation-menu',
		name: 'Navigation Menu',
		category: 'Navigation',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'popover',
		name: 'Popover',
		category: 'Overlay',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'progress',
		name: 'Progress',
		category: 'Feedback',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'radio-group',
		name: 'Radio Group',
		category: 'Forms',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'scroll-area',
		name: 'Scroll Area',
		category: 'Layout',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'separator',
		name: 'Separator',
		category: 'Layout',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'slider',
		name: 'Slider',
		category: 'Forms',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'switch',
		name: 'Switch',
		category: 'Forms',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'tabs',
		name: 'Tabs',
		category: 'Navigation',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'toggle',
		name: 'Toggle',
		category: 'Forms',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},
	{
		slug: 'tooltip',
		name: 'Tooltip',
		category: 'Overlay',
		wave: 3,
		status: 'ready',
		external: 'bits-ui'
	},

	// ── Wave 4 ──────────────────────────────────────────────────────────────────
	{
		slug: 'button-group',
		name: 'Button Group',
		category: 'Forms',
		wave: 4,
		status: 'ready',
		deps: ['separator']
	},
	{
		slug: 'dialog',
		name: 'Dialog',
		category: 'Overlay',
		wave: 4,
		status: 'ready',
		deps: ['button'],
		external: 'bits-ui'
	},
	{
		slug: 'field',
		name: 'Field',
		category: 'Forms',
		wave: 4,
		status: 'ready',
		deps: ['label', 'separator']
	},
	{
		slug: 'form',
		name: 'Form',
		category: 'Forms',
		wave: 4,
		status: 'ready',
		deps: ['button', 'label'],
		external: 'formsnap'
	},
	{
		slug: 'item',
		name: 'Item',
		category: 'Layout',
		wave: 4,
		status: 'ready',
		deps: ['separator']
	},
	{
		slug: 'select',
		name: 'Select',
		category: 'Forms',
		wave: 4,
		status: 'ready',
		deps: ['separator'],
		external: 'bits-ui'
	},
	{
		slug: 'toggle-group',
		name: 'Toggle Group',
		category: 'Forms',
		wave: 4,
		status: 'ready',
		deps: ['toggle'],
		external: 'bits-ui'
	},

	// ── Wave 5 ──────────────────────────────────────────────────────────────────
	{
		slug: 'alert-dialog',
		name: 'Alert Dialog',
		category: 'Overlay',
		wave: 5,
		status: 'ready',
		deps: ['button'],
		external: 'bits-ui'
	},
	{
		slug: 'carousel',
		name: 'Carousel',
		category: 'Media',
		wave: 5,
		status: 'ready',
		deps: ['button'],
		external: 'embla'
	},
	{
		slug: 'command',
		name: 'Command',
		category: 'Overlay',
		wave: 5,
		status: 'ready',
		deps: ['dialog'],
		external: 'bits-ui'
	},
	{
		slug: 'pagination',
		name: 'Pagination',
		category: 'Navigation',
		wave: 5,
		status: 'ready',
		deps: ['button'],
		external: 'bits-ui'
	},
	{
		slug: 'sheet',
		name: 'Sheet',
		category: 'Overlay',
		wave: 5,
		status: 'ready',
		deps: ['button'],
		external: 'bits-ui'
	},

	// ── Wave 6 ──────────────────────────────────────────────────────────────────
	{
		slug: 'sidebar',
		name: 'Sidebar',
		category: 'Layout',
		wave: 6,
		status: 'ready',
		deps: ['button', 'input', 'separator', 'sheet', 'skeleton', 'tooltip'],
		external: 'bits-ui'
	},

	// ── Separate track — heavy external dependencies ────────────────────────────
	{
		slug: 'calendar',
		name: 'Calendar',
		category: 'Forms',
		wave: 7,
		status: 'planned',
		external: '@internationalized/date'
	},
	{
		slug: 'range-calendar',
		name: 'Range Calendar',
		category: 'Forms',
		wave: 7,
		status: 'planned',
		external: '@internationalized/date'
	},
	{
		slug: 'chart',
		name: 'Chart',
		category: 'Data',
		wave: 7,
		status: 'planned',
		external: 'layerchart'
	},
	{
		slug: 'data-table',
		name: 'Data Table',
		category: 'Data',
		wave: 7,
		status: 'planned',
		external: '@tanstack/table-core'
	},
	{
		slug: 'drawer',
		name: 'Drawer',
		category: 'Overlay',
		wave: 7,
		status: 'ready',
		external: 'vaul-svelte'
	},
	{
		slug: 'resizable',
		name: 'Resizable',
		category: 'Layout',
		wave: 7,
		status: 'ready',
		external: 'paneforge'
	},
	{
		slug: 'sonner',
		name: 'Sonner',
		category: 'Feedback',
		wave: 7,
		status: 'ready',
		external: 'svelte-sonner'
	}
];

export const CATEGORY_ORDER: Category[] = [
	'Layout',
	'Forms',
	'Navigation',
	'Overlay',
	'Feedback',
	'Data',
	'Media'
];

export function byCategory(entries = COMPONENTS) {
	return CATEGORY_ORDER.map((category) => ({
		category,
		items: entries
			.filter((c) => c.category === category)
			.sort((a, b) => a.name.localeCompare(b.name))
	})).filter((group) => group.items.length > 0);
}

export const getComponent = (slug: string) => COMPONENTS.find((c) => c.slug === slug);

export const progress = () => ({
	ready: COMPONENTS.filter((c) => c.status === 'ready').length,
	total: COMPONENTS.length
});
