import type { Tile } from '../state/canvas.svelte';

export type AppTemplateId = 'home' | 'code' | 'notes' | 'design' | 'ai' | 'blank' | 'bookmarks' | 'media' | 'docs' | 'dev' | 'tester';

export interface AppTemplate {
	id: AppTemplateId;
	name: string;
	summary: string;
	image: string;
	hero: string;
	logo: string;
	tiles: Omit<Tile, 'id' | 'z'>[];
	type: string;
}

export const TEMPLATES: AppTemplate[] = [
	{
		id: 'home',
		name: 'fracta',
		summary: 'Select your workspace.',
		image: 'module-appmain.svg',
		hero: '',
		logo: '',
		tiles: [
			{ kind: 'editor', x: 40, y: 40, w: 800, h: 500 },
		],
		type: 'nonce'
	},
	{
		id: 'code',
		name: 'Code',
		summary: 'Code, Build, Vibe.',
		image: 'module-code.svg',
		hero: 'mod-cod.webp',
		logo: 'fractalcode.png',
		tiles: [
			{ kind: 'fileTree', x: 20, y: 20, w: 220, h: 500 },
			{ kind: 'editor', x: 260, y: 20, w: 600, h: 360 },
			{ kind: 'terminal', x: 260, y: 400, w: 600, h: 180 },
			{ kind: 'ai', x: 880, y: 20, w: 360, h: 560 },
		],
		type: 'module'
	},
	{
		id: 'notes',
		name: 'Notes',
		summary: 'Store, Read, Grow.',
		image: 'module-notes.svg',
		hero: 'mod-notes.webp',
		logo: 'fractalknowledge.png',
		tiles: [
			{ kind: 'editor', x: 40, y: 40, w: 800, h: 500 },
		],
		type: 'module'
	},
	{
		id: 'design',
		name: 'Design',
		summary: 'Craft, Design, Delight.',
		image: 'module-design.svg',
		hero: 'mod-des.webp',
		logo: 'fractaldesign.png',
		tiles: [
			{ kind: 'editor', x: 40, y: 40, w: 800, h: 500 },
		],
		type: 'module'
	},
	{
		id: 'ai',
		name: 'Agent',
		summary: 'Chat, Prompt, Harness.',
		image: 'module-ai.svg',
		hero: 'mod-ai.webp',
		logo: 'fractalhome.png',
		tiles: [
			{ kind: 'fileTree', x: 20, y: 20, w: 220, h: 500 },
			{ kind: 'editor', x: 260, y: 20, w: 600, h: 360 },
			{ kind: 'terminal', x: 260, y: 400, w: 600, h: 180 },
			{ kind: 'ai', x: 880, y: 20, w: 360, h: 560 },
		],
		type: 'module'
	},
	{
		id: 'bookmarks',
		name: 'Web',
		summary: 'See. Store. Learn.',
		image: 'module-web.svg',
		hero: 'mod-web.webp',
		logo: 'fractalweb.png',
		tiles: [
			{ kind: 'editor', x: 40, y: 40, w: 800, h: 500 },
		],
		type: 'module'
	},
	{
		id: 'media',
		name: 'Media',
		summary: 'Image, Video, Collections.',
		image: 'module-images.svg',
		hero: 'mod-images.webp',
		logo: 'fractalmedia.png',
		tiles: [],
		type: 'module'
	},
	{
		id: 'docs',
		name: 'Docs',
		summary: 'App. User. Docs.',
		image: 'module-docs.svg',
		hero: 'mod-docs.png',
		logo: 'fractaldocs.png',
		tiles: [],
		type: 'footer'
	},
	{
		id: 'dev',
		name: 'Dev',
		summary: 'Plan. Do. Review.',
		image: '',
		hero: 'mod-dev.webp',
		logo: 'fractaldevs.webp',
		tiles: [],
		type: 'footer'
	},
	{
		id: 'tester',
		name: 'Tester',
		summary: 'Plan. Do. Review.',
		image: '',
		hero: 'mod-dev.webp',
		logo: 'fractaldevs.webp',
		tiles: [],
		type: 'footer'
	}
];
 