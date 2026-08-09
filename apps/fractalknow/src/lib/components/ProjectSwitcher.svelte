<script lang="ts">
	import {
		createDocument,
		openRecentProject,
		projectState,
		recentProjects,
	} from '$lib/shell';
	import Icon from '$lib/icons/Icon.svelte';
	import DropdownMenu from './overlays/DropdownMenu.svelte';
	import type { RecentProject } from '$lib/shell';

	type Props = {
		open?: boolean;
	};

	let { open = $bindable(false) }: Props = $props();

	let menuOpen = $state(false);
	let buttonEl = $state<HTMLButtonElement | null>(null);

	const project = $derived($projectState);
	const recents = $derived($recentProjects);

	function close(): void {
		menuOpen = false;
		open = false;
	}

	function chooseFolder(): void {
		menuOpen = false;
		open = false;
		// The shell commands folder-picker command is exposed as choose-template
		// but the cleanest path here is to dispatch a native event the shell
		// can intercept to open the Tauri dialog.
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('ok:sidebar-choose-folder'));
		}
	}

	function openProject(project: RecentProject): void {
		openRecentProject(project);
		menuOpen = false;
		open = false;
	}

	function quickStart(): void {
		const document = createDocument('doc');
		void document;
		menuOpen = false;
		open = false;
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('ok:sidebar-quick-start'));
		}
	}
</script>

<button
	bind:this={buttonEl}
	type="button"
	class="project-switcher"
	aria-haspopup="menu"
	aria-expanded={open}
	onclick={() => {
		menuOpen = !menuOpen;
		open = menuOpen;
	}}
	title={project.name}
>
	<Icon name="folder" size={14} />
	<span class="project-switcher__label">{project.name}</span>
	<Icon name="chevron-down" size={12} />
</button>

<DropdownMenu
	bind:open={menuOpen}
	anchor={buttonEl}
	placement="bottom-start"
	ariaLabel="Project switcher"
>
	<header class="project-switcher-menu__header">
		<strong>Project</strong>
		<small>{project.path || 'No folder open'}</small>
	</header>

	<div class="project-switcher-menu__section">
		<button type="button" role="menuitem" data-dropdown-item onclick={chooseFolder}>
			<Icon name="folder" size={12} />
			Choose folder…
		</button>
		<button type="button" role="menuitem" data-dropdown-item onclick={quickStart}>
			<Icon name="plus" size={12} />
			Quick start
		</button>
	</div>

	{#if recents.length > 0}
		<div class="project-switcher-menu__section">
			<p class="project-switcher-menu__caption">Recent</p>
			{#each recents.slice(0, 6) as recentProject (recentProject.path)}
				<button type="button" role="menuitem" data-dropdown-item onclick={() => openProject(recentProject)}>
					<Icon name="folder-open" size={12} />
					<div>
						<strong>{recentProject.name}</strong>
						<small>{recentProject.path}</small>
					</div>
				</button>
			{/each}
		</div>
	{/if}

	<div class="project-switcher-menu__section">
		<button type="button" role="menuitem" data-dropdown-item onclick={close}>
			<Icon name="x" size={12} />
			Close menu
		</button>
	</div>
</DropdownMenu>

<style lang="sass">
	@use '$lib/styles/tokens' as t
	@use '$lib/styles/mixins' as m

	.project-switcher
		min-width: 0
		border: 1px solid var(--ok-line)
		border-radius: t.$radius-md
		padding: t.$space-1 t.$space-2
		background: var(--ok-surface)
		color: var(--ok-ink)
		font-size: t.$font-size-sm
		display: flex
		align-items: center
		gap: t.$space-2
		cursor: pointer
		@include m.hover-transition(border-color)

		&__label
			min-width: 0
			overflow: hidden
			text-overflow: ellipsis
			white-space: nowrap

		&:hover
			border-color: var(--ok-accent)

		&:focus-visible
			@include m.focus-ring

	.project-switcher-menu__header
		padding: t.$space-2 t.$space-3
		display: flex
		flex-direction: column
		gap: 2px

		strong
			color: var(--ok-ink)
			font-size: t.$font-size-sm

		small
			color: var(--ok-muted)
			font-size: t.$font-size-xs
			overflow: hidden
			text-overflow: ellipsis
			white-space: nowrap

	.project-switcher-menu__section
		display: flex
		flex-direction: column
		padding: t.$space-1 0

		button
			min-width: 0
			border: 0
			background: transparent
			padding: t.$space-2 t.$space-3
			color: var(--ok-ink)
			font-size: t.$font-size-sm
			display: flex
			align-items: center
			gap: t.$space-2
			cursor: pointer
			text-align: left
			@include m.hover-transition(background-color)

			&:hover
				background: var(--ok-surface)

			&:focus-visible
				@include m.focus-ring(1px, 1px)

			div
				min-width: 0
				display: flex
				flex-direction: column

			strong
				color: var(--ok-ink)
				font-size: t.$font-size-sm
				overflow: hidden
				text-overflow: ellipsis
				white-space: nowrap

			small
				color: var(--ok-muted)
				font-size: t.$font-size-xs
				overflow: hidden
				text-overflow: ellipsis
				white-space: nowrap

	.project-switcher-menu__caption
		margin: 0
		padding: t.$space-1 t.$space-3 0
		color: var(--ok-muted)
		font-size: t.$font-size-xs
		font-weight: 700
		text-transform: uppercase
</style>