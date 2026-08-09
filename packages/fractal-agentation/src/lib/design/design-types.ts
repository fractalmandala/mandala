export type ComponentType =
	| 'navigation'
	| 'hero'
	| 'card'
	| 'button'
	| 'sidebar'
	| 'table'
	| 'form'
	| 'input'
	| 'modal'
	| 'footer'
	| 'text'
	| 'image'
	| 'list'
	| 'tabs'
	| 'header'
	| 'section'
	| 'grid'
	| 'dropdown'
	| 'toggle'
	| 'breadcrumb'
	| 'pagination'
	| 'accordion'
	| 'carousel'
	| 'search'
	| 'toast'
	| 'tooltip'
	| 'alert'
	| 'drawer'
	| 'popover'
	| 'checkbox'
	| 'radio'
	| 'slider'
	| 'skeleton'
	| 'chip';

export type DesignPlacement = {
	id: string;
	type: ComponentType;
	x: number;
	y: number;
	width: number;
	height: number;
	scrollY: number;
	timestamp: number;
	text?: string;
};

export type ComponentDefinition = {
	type: ComponentType;
	label: string;
	width: number;
	height: number;
};

export type ComponentSection = {
	section: string;
	items: ComponentDefinition[];
};

export const DEFAULT_SIZES: Record<ComponentType, { width: number; height: number }> = {
	navigation: { width: 800, height: 56 },
	hero: { width: 800, height: 320 },
	header: { width: 800, height: 80 },
	section: { width: 800, height: 400 },
	sidebar: { width: 240, height: 400 },
	footer: { width: 800, height: 160 },
	modal: { width: 480, height: 300 },
	card: { width: 280, height: 240 },
	text: { width: 400, height: 120 },
	image: { width: 320, height: 200 },
	table: { width: 560, height: 220 },
	grid: { width: 600, height: 300 },
	list: { width: 300, height: 180 },
	accordion: { width: 400, height: 200 },
	carousel: { width: 600, height: 300 },
	button: { width: 140, height: 40 },
	input: { width: 280, height: 56 },
	search: { width: 320, height: 44 },
	form: { width: 360, height: 320 },
	tabs: { width: 480, height: 240 },
	dropdown: { width: 200, height: 200 },
	toggle: { width: 44, height: 24 },
	breadcrumb: { width: 300, height: 24 },
	pagination: { width: 300, height: 36 },
	toast: { width: 320, height: 64 },
	tooltip: { width: 180, height: 40 },
	alert: { width: 400, height: 56 },
	drawer: { width: 320, height: 400 },
	popover: { width: 240, height: 160 },
	checkbox: { width: 20, height: 20 },
	radio: { width: 20, height: 20 },
	slider: { width: 240, height: 32 },
	skeleton: { width: 320, height: 120 },
	chip: { width: 96, height: 32 }
};

export const COMPONENT_REGISTRY: ComponentSection[] = [
	{
		section: 'Layout',
		items: [
			{ type: 'navigation', label: 'Navigation', ...DEFAULT_SIZES.navigation },
			{ type: 'header', label: 'Header', ...DEFAULT_SIZES.header },
			{ type: 'hero', label: 'Hero', ...DEFAULT_SIZES.hero },
			{ type: 'section', label: 'Section', ...DEFAULT_SIZES.section },
			{ type: 'sidebar', label: 'Sidebar', ...DEFAULT_SIZES.sidebar },
			{ type: 'footer', label: 'Footer', ...DEFAULT_SIZES.footer },
			{ type: 'modal', label: 'Modal', ...DEFAULT_SIZES.modal },
			{ type: 'drawer', label: 'Drawer', ...DEFAULT_SIZES.drawer },
			{ type: 'popover', label: 'Popover', ...DEFAULT_SIZES.popover }
		]
	},
	{
		section: 'Content',
		items: [
			{ type: 'card', label: 'Card', ...DEFAULT_SIZES.card },
			{ type: 'text', label: 'Text', ...DEFAULT_SIZES.text },
			{ type: 'image', label: 'Image', ...DEFAULT_SIZES.image },
			{ type: 'table', label: 'Table', ...DEFAULT_SIZES.table },
			{ type: 'grid', label: 'Grid', ...DEFAULT_SIZES.grid },
			{ type: 'list', label: 'List', ...DEFAULT_SIZES.list },
			{ type: 'accordion', label: 'Accordion', ...DEFAULT_SIZES.accordion },
			{ type: 'carousel', label: 'Carousel', ...DEFAULT_SIZES.carousel }
		]
	},
	{
		section: 'Controls',
		items: [
			{ type: 'button', label: 'Button', ...DEFAULT_SIZES.button },
			{ type: 'input', label: 'Input', ...DEFAULT_SIZES.input },
			{ type: 'search', label: 'Search', ...DEFAULT_SIZES.search },
			{ type: 'form', label: 'Form', ...DEFAULT_SIZES.form },
			{ type: 'tabs', label: 'Tabs', ...DEFAULT_SIZES.tabs },
			{ type: 'dropdown', label: 'Dropdown', ...DEFAULT_SIZES.dropdown },
			{ type: 'toggle', label: 'Toggle', ...DEFAULT_SIZES.toggle },
			{ type: 'slider', label: 'Slider', ...DEFAULT_SIZES.slider },
			{ type: 'checkbox', label: 'Checkbox', ...DEFAULT_SIZES.checkbox },
			{ type: 'radio', label: 'Radio', ...DEFAULT_SIZES.radio }
		]
	},
	{
		section: 'Elements',
		items: [
			{ type: 'breadcrumb', label: 'Breadcrumb', ...DEFAULT_SIZES.breadcrumb },
			{ type: 'pagination', label: 'Pagination', ...DEFAULT_SIZES.pagination },
			{ type: 'toast', label: 'Toast', ...DEFAULT_SIZES.toast },
			{ type: 'tooltip', label: 'Tooltip', ...DEFAULT_SIZES.tooltip },
			{ type: 'alert', label: 'Alert', ...DEFAULT_SIZES.alert },
			{ type: 'skeleton', label: 'Skeleton', ...DEFAULT_SIZES.skeleton },
			{ type: 'chip', label: 'Chip', ...DEFAULT_SIZES.chip }
		]
	}
];

export const COMPONENT_MAP: Record<string, ComponentDefinition> = {};
for (const section of COMPONENT_REGISTRY) {
	for (const item of section.items) {
		COMPONENT_MAP[item.type] = item;
	}
}

export const TEXT_TYPES = new Set<ComponentType>([
	'text', 'hero', 'button', 'card', 'modal', 'navigation', 'tabs', 'input', 'search',
	'breadcrumb', 'toast', 'alert', 'chip', 'section', 'header', 'form'
]);

export const TEXT_PLACEHOLDERS: Partial<Record<ComponentType, string>> = {
	hero: 'Headline text',
	button: 'Button label',
	card: 'Card title',
	modal: 'Dialog title',
	navigation: 'Brand / nav items',
	tabs: 'Tab labels',
	input: 'Placeholder text',
	search: 'Search placeholder',
	breadcrumb: 'Breadcrumb labels',
	toast: 'Notification message',
	alert: 'Alert message',
	section: 'Section heading',
	header: 'Header text',
	form: 'Form description',
	chip: 'Chip label',
	text: 'Content text'
};

export type CanvasPurpose = 'new-page' | 'replace-current';

export type WireframeOptions = {
	wireframePurpose?: string;
};

export type SnapRect = { x: number; y: number; width: number; height: number };
