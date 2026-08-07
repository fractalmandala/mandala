import type { Component } from 'svelte';
// Documented core → IDE-module edge; revisit during the future kernel decomposition.
import Sidebar from '$lib/modules/ide/components/Sidebar.svelte';
import Editor from '$lib/modules/ide/components/Editor.svelte';
import Terminal from '$lib/modules/ide/components/Terminal.svelte';
import BrowserLauncherCard from '$lib/modules/browser/components/BrowserLauncherCard.svelte';
import AIChat from '../components/AIChat.svelte';
import ModelMarketplace from '../components/ModelMarketplace.svelte';
import SkillsMarketplace from '../components/SkillsMarketplace.svelte';
import type { TileKind } from '../state/canvas.svelte';

export type ModuleId = 'code' | 'design' | 'wiki' | 'mail' | 'db' | 'system';

export interface TileKindMeta {
	label: string;
	module: ModuleId;          // drives the legend dot color via a token, see §5
	// `any` here is Svelte's documented escape hatch for a heterogeneous component registry —
	// each tile body declares different (often required) props, so a shared Props type can't
	// satisfy all of them; Tile.svelte renders each one directly with its own known props.
	component: Component<any>;
	defaultW: number;
	defaultH: number;
}

export const TILE_KINDS: Record<TileKind, TileKindMeta> = {
	fileTree: { label: 'Explorer', module: 'code', component: Sidebar, defaultW: 220, defaultH: 600 },
	editor: { label: 'Editor', module: 'code', component: Editor, defaultW: 640, defaultH: 460 },
	terminal: { label: 'Terminal', module: 'code', component: Terminal, defaultW: 640, defaultH: 200 },
	browser: { label: 'Browser', module: 'design', component: BrowserLauncherCard, defaultW: 480, defaultH: 360 },
	ai: { label: 'AI Copilot', module: 'system', component: AIChat, defaultW: 360, defaultH: 520 },
	modelMarketplace: { label: 'Model Downloads', module: 'system', component: ModelMarketplace, defaultW: 480, defaultH: 400 },
	skillsMarketplace: { label: 'Skills Library', module: 'system', component: SkillsMarketplace, defaultW: 480, defaultH: 400 }
};

/**
 * Future module placeholders — shared list used by both TileDock (A5)
 * and TemplateGallery (B4) to render "coming soon" entries.
 * When the actual module ships, swap its card from disabled to live;
 * no gallery/dock rework needed.
 */
export interface FutureModuleEntry {
	id: string;
	label: string;
	module: ModuleId;
	description: string;
	icon: string;
}

export const FUTURE_MODULES: FutureModuleEntry[] = [
	{ id: 'design', label: 'Design Canvas', module: 'design', description: 'Visual canvas for layout and design.', icon: '/iconset/IntelliJ Platform Icons (196).svg' },
	{ id: 'mail', label: 'Mail Client', module: 'mail', description: 'Integrated email client.', icon: '/iconset/mailer.svg' },
	{ id: 'db', label: 'DB Inspector', module: 'db', description: 'Database schema and data browser.', icon: '/iconset/database.svg' },
];
