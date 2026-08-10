<script lang="ts">
	import type { Snippet } from 'svelte';
	import { motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import * as Tooltip from 'fractalsvelte/tooltip';
	import {
		ArrowRightFromLine,
		BookImage,
		FoldHorizontal,
		HouseHeart,
		ImagePlus,
		Mic,
		PanelLeft,
		PanelRight,
		Plus,
		Redo,
		Settings,
		SunMoon,
		TvMinimalPlay,
		Undo,
		UnfoldHorizontal
	} from '@lucide/svelte';
	import { layout, type PanelId } from '$lib/layoutstate.svelte';
	import { motionConfig } from '$lib/motion';
	import ActionTooltip from './ActionTooltip.svelte';

	type View = 'home' | 'library' | 'record' | 'bank' | 'channel' | 'project' | 'settings';
	type Phase = 'gather' | 'story' | 'sound' | 'finish';

	interface Props {
		view: View;
		phase: Phase;
		hasProject: boolean;
		creating: boolean;
		isMac: boolean;
		leftSidebar: Snippet;
		workspace: Snippet;
		rightSidebar: Snippet;
		onCreateProject: () => void;
		onShowProjects: () => void;
		onShowLibrary: () => void;
		onImportToLibrary: () => void;
		onShowChannel: () => void;
		onShowRecord: () => void;
		onShowExport: () => void;
		onUndo: () => void;
		onRedo: () => void;
		onToggleTheme: () => void;
		onOpenSettings: () => void;
		onToggleLeftSidebar: () => void;
		onToggleRightSidebar: () => void;
	}

	let {
		view,
		phase,
		hasProject,
		creating,
		isMac,
		leftSidebar,
		workspace,
		rightSidebar,
		onCreateProject,
		onShowProjects,
		onShowLibrary,
		onImportToLibrary,
		onShowChannel,
		onShowRecord,
		onShowExport,
		onUndo,
		onRedo,
		onToggleTheme,
		onOpenSettings,
		onToggleLeftSidebar,
		onToggleRightSidebar
	}: Props = $props();

	const reducedMotion = useReducedMotion();

	function transition(name: 'fast' | 'normal' = 'normal', essential = false) {
		return motionConfig.transition(name, reducedMotion.current, essential);
	}

	function startResize(event: PointerEvent, panel: PanelId) {
		event.preventDefault();
		const startX = event.clientX;
		const startWidth = panel === 'sidebar1' ? layout.sidebar1W : layout.sidebar2W;
		const onMove = (move: PointerEvent) => {
			const delta = move.clientX - startX;
			layout.resize(panel, startWidth + (panel === 'sidebar1' ? delta : -delta));
		};
		const onUp = () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
		};
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp, { once: true });
	}
</script>

<Tooltip.Provider delayDuration={420}>
	<section class="project-shell">
		<header class="app-header">
			<div class="row ycenter bordleft">
				<ActionTooltip
					class="btn-header-grid"
					label={layout.sidebar1Collapsed ? 'Expand left panel' : 'Collapse left panel'}
					onclick={onToggleLeftSidebar}
					aria-expanded={!layout.sidebar1Collapsed}>
					<PanelLeft size={18} />
				</ActionTooltip>
				<ActionTooltip
					class="btn-header-grid themed"
					label="Create new project"
					onclick={onCreateProject}
					disabled={creating}>
					<Plus size={18} />
				</ActionTooltip>
				<ActionTooltip
					class={`btn-header-grid ${view === 'home' ? 'active' : ''}`}
					label="Projects"
					onclick={onShowProjects}>
					<HouseHeart size={18} />
				</ActionTooltip>
				<ActionTooltip
					class={`btn-header-grid ${view === 'library' || view === 'bank' ? 'active' : ''}`}
					label="Media library"
					onclick={onShowLibrary}>
					<BookImage size={18} />
				</ActionTooltip>
				<ActionTooltip class="btn-header-grid" label="Add Media" onclick={onImportToLibrary}>
					<ImagePlus size={18} />
				</ActionTooltip>
				<ActionTooltip
					class={`btn-header-grid ${view === 'channel' ? 'active' : ''}`}
					label="Open channel"
					onclick={onShowChannel}>
					<TvMinimalPlay size={18} />
				</ActionTooltip>
				{#if !layout.sidebar1Collapsed && !layout.sidebar2Collapsed}
					<ActionTooltip
						class="btn-header-grid"
						label="Collapse Sidebars"
						onclick={() => {
							layout.toggleSidebar1();
							layout.toggleSidebar2();
						}}>
						<UnfoldHorizontal size={18} />
					</ActionTooltip>
				{/if}
				{#if layout.sidebar1Collapsed && layout.sidebar2Collapsed}
					<ActionTooltip
						class="btn-header-grid"
						label="Expand"
						onclick={() => {
							layout.toggleSidebar1();
							layout.toggleSidebar2();
						}}>
						<FoldHorizontal size={18} />
					</ActionTooltip>
				{/if}
			</div>
			<div class="row ycenter bordleft">
				<ActionTooltip
					class={`btn-header-grid ${view === 'record' ? 'active' : ''}`}
					label="Record a voiceover"
					onclick={onShowRecord}>
					<Mic size={18} />
				</ActionTooltip>
				<ActionTooltip
					class={`btn-header-grid ${view === 'project' && phase === 'finish' ? 'active' : ''}`}
					label="Export this project"
					onclick={onShowExport}>
					<ArrowRightFromLine size={18} />
				</ActionTooltip>
				<ActionTooltip
					class="btn-header-grid"
					label="Undo"
					shortcut={isMac ? '⌘Z' : 'Ctrl Z'}
					onclick={onUndo}
					disabled={!hasProject}>
					<Undo size={18} />
				</ActionTooltip>
				<ActionTooltip
					class="btn-header-grid"
					label="Redo"
					shortcut={isMac ? '⇧⌘Z' : 'Ctrl Shift Z'}
					onclick={onRedo}
					disabled={!hasProject}>
					<Redo size={18} />
				</ActionTooltip>
				<ActionTooltip class="btn-header-grid" label="Toggle theme" onclick={onToggleTheme}>
					<SunMoon size={18} />
				</ActionTooltip>
				<ActionTooltip class="btn-header-grid" label="Open settings" onclick={onOpenSettings}>
					<Settings size={18} />
				</ActionTooltip>
				<ActionTooltip
					class="btn-header-grid"
					label={layout.sidebar2Collapsed ? 'Expand right panel' : 'Collapse right panel'}
					onclick={onToggleRightSidebar}
					aria-expanded={!layout.sidebar2Collapsed}>
					<PanelRight size={18} />
				</ActionTooltip>
			</div>
		</header>
		<div class="workspace-workarea">
			<motion.aside
				class="workspace-sidebar"
				aria-label="Project navigation"
				aria-hidden={layout.sidebar1Collapsed}
				inert={layout.sidebar1Collapsed}
				initial={false}
				animate={layout.sidebar1Collapsed
					? { width: 0, opacity: 0 }
					: { width: layout.sidebar1W, opacity: 1 }}
				transition={transition('normal', true)}>
				<div class="workspace-sidebar-content">
					{@render leftSidebar()}
				</div>
			</motion.aside>
			{#if !layout.sidebar1Collapsed}
				<button
					class="workspace-resizer"
					type="button"
					aria-label="Resize left sidebar"
					onpointerdown={(event) => startResize(event, 'sidebar1')}>
				</button>
			{/if}
			<main class="project-workspace">
				{@render workspace()}
			</main>
			{#if !layout.sidebar2Collapsed}
				<button
					class="workspace-resizer"
					type="button"
					aria-label="Resize right sidebar"
					onpointerdown={(event) => startResize(event, 'sidebar2')}>
				</button>
			{/if}
			<motion.aside
				class="workspace-sidebar"
				aria-label="Project tools"
				aria-hidden={layout.sidebar2Collapsed}
				inert={layout.sidebar2Collapsed}
				initial={false}
				animate={layout.sidebar2Collapsed
					? { width: 0, opacity: 0 }
					: { width: layout.sidebar2W, opacity: 1 }}
				transition={transition('normal', true)}>
				<div class="workspace-sidebar-content">
					{@render rightSidebar()}
				</div>
			</motion.aside>
		</div>
	</section>
</Tooltip.Provider>
