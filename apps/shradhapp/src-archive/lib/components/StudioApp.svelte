<script lang="ts">
	import { onMount } from 'svelte';
	import { isTauri, backend } from '$lib/backend';
	import { mediaStore } from '$lib/stores.svelte';
	import type { ProjectRecord } from '$lib/backend/types';
	import { settingsStore } from '$lib/settings.svelte';
	import ProjectStudio from './ProjectStudio.svelte';
	import CommandPalette, { type CommandItem } from './CommandPalette.svelte';

	type View = 'home' | 'library' | 'record' | 'bank' | 'channel' | 'project' | 'settings';
	const viewStorageKey = 'shradhapp:view';

	const demoProject: ProjectRecord = {
		id: 'demo-garden-day',
		name: "Ananya's Garden Day",
		data: {
			version: 1,
			name: "Ananya's Garden Day",
			clips: [],
			voiceover_media_id: null,
			created_at: Date.now(),
			updated_at: Date.now()
		},
		created_at: Date.now(),
		updated_at: Date.now()
	};
	let view = $state<View>(isTauri ? 'home' : 'project');
	let projects = $state<ProjectRecord[]>(isTauri ? [] : [demoProject]);
	let selectedProject = $state<ProjectRecord | null>(isTauri ? null : demoProject);
	let creating = $state(false);
	let status = $state('');
	let projectError = $state<string | null>(null);
	let paletteOpen = $state(false);
	let booted = $state(false);
	const resolvedTheme = $derived.by(() => {
		const theme = settingsStore.settings.appearance.theme;
		if (theme !== 'system') return theme;
		if (typeof window === 'undefined') return 'dark';
		return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
	});

	const commands = $derived<CommandItem[]>([
		{
			id: 'new-project',
			title: 'New project',
			subtitle: 'Start a new local video',
			group: 'Everyday',
			keywords: ['create', 'video'],
			shortcut: 'N',
			run: createProject
		},
		{
			id: 'go-home',
			title: 'Home',
			subtitle: 'Show saved projects',
			group: 'Navigation',
			keywords: ['library', 'projects'],
			run: () => go('home')
		},
		{
			id: 'go-library',
			title: 'Library',
			subtitle: 'Your videos and audio',
			group: 'Navigation',
			keywords: ['media'],
			run: () => go('library')
		},
		{
			id: 'go-record',
			title: 'Record',
			subtitle: 'Record a voiceover',
			group: 'Navigation',
			keywords: ['voice', 'microphone'],
			run: () => go('record')
		},
		{
			id: 'start-recording',
			title: 'Start recording',
			subtitle: 'Open Record and start the microphone',
			group: 'Everyday',
			keywords: ['voiceover', 'microphone'],
			run: () => {
				go('record');
				dispatchStudioCommand('start-recording');
			}
		},
		{
			id: 'go-bank',
			title: 'Media Bank',
			subtitle: 'Browse photos, videos and audio',
			group: 'Navigation',
			keywords: ['import', 'files'],
			run: () => go('bank')
		},
		{
			id: 'import-media',
			title: 'Import media',
			subtitle: 'Add files to the Media Bank',
			group: 'Everyday',
			keywords: ['add', 'files', 'photos'],
			run: () => {
				go('bank');
				dispatchStudioCommand('import-media');
			}
		},
		{
			id: 'go-channel',
			title: 'Channel',
			subtitle: settingsStore.settings.channel.enabled
				? 'Public channel videos'
				: 'Disabled in Settings',
			group: 'Navigation',
			keywords: ['youtube'],
			disabled: !settingsStore.settings.channel.enabled,
			run: () => go('channel')
		},
		{
			id: 'go-settings',
			title: 'Settings',
			subtitle: 'Appearance, workflow, export and advanced',
			group: 'Navigation',
			keywords: ['preferences', 'advanced'],
			shortcut: ',',
			run: () => go('settings')
		},
		{
			id: 'toggle-theme',
			title: 'Toggle theme',
			subtitle: 'Switch dark and light mode',
			group: 'Everyday',
			keywords: ['appearance'],
			run: toggleTheme
		},
		{
			id: 'export-project',
			title: 'Export current project',
			subtitle: selectedProject ? selectedProject.name : 'Open a project first',
			group: 'Everyday',
			keywords: ['finish', 'render'],
			disabled: !selectedProject,
			run: () => {
				if (selectedProject) {
					openProject(selectedProject);
					dispatchStudioCommand('export-project');
				}
			}
		},
		{
			id: 'repair-audio',
			title: 'Repair voiceover ticks',
			subtitle: selectedProject ? 'Run non-destructive tick repair' : 'Open a project first',
			group: 'Everyday',
			keywords: ['audio', 'cleanup', 'clicks'],
			disabled: !selectedProject,
			run: () => {
				if (selectedProject) {
					openProject(selectedProject);
					dispatchStudioCommand('repair-voiceover');
				}
			}
		},
		{
			id: 'advanced-timeline',
			title: 'Open advanced timeline',
			subtitle: selectedProject ? selectedProject.name : 'Open a project first',
			group: 'Power',
			keywords: ['multitrack', 'editor'],
			disabled: !selectedProject,
			run: () => {
				if (selectedProject) {
					openProject(selectedProject);
					dispatchStudioCommand('advanced-timeline');
				}
			}
		},
		{
			id: 'cancel-export',
			title: 'Cancel current export',
			subtitle: 'Stops the active project export if one is running',
			group: 'Power',
			keywords: ['stop'],
			run: () => dispatchStudioCommand('cancel-export')
		},
		{
			id: 'runtime-info',
			title: 'Show runtime info',
			subtitle: 'Open Advanced settings diagnostics',
			group: 'Power',
			keywords: ['ffmpeg', 'paths'],
			run: () => go('settings')
		},
		{
			id: 'reset-settings',
			title: 'Reset settings',
			subtitle: 'Restore Shradhapp defaults',
			group: 'Power',
			keywords: ['preferences'],
			danger: true,
			run: () => settingsStore.reset()
		},
		...projects.map((project) => ({
			id: `open-project-${project.id}`,
			title: project.name,
			subtitle: `Open project · ${new Date(project.updated_at).toLocaleDateString()}`,
			group: 'Projects',
			keywords: ['project', 'video'],
			run: () => openProject(project)
		})),
		...projects.map((project) => ({
			id: `duplicate-project-${project.id}`,
			title: `Duplicate ${project.name}`,
			subtitle: 'Create a local copy',
			group: 'Power',
			keywords: ['copy', 'project'],
			run: () => duplicateProject(project.id)
		})),
		...projects.map((project) => ({
			id: `delete-project-${project.id}`,
			title: `Delete ${project.name}`,
			subtitle: 'Remove this saved project',
			group: 'Power',
			keywords: ['remove', 'project'],
			danger: true,
			run: () => deleteProject(project.id)
		})),
		...mediaStore.items.slice(0, 20).map((item) => ({
			id: `media-${item.id}`,
			title: item.filename,
			subtitle: `Open in Media Bank · ${item.kind}`,
			group: 'Media',
			keywords: [item.kind, ...item.tags],
			run: () => go('bank')
		}))
	]);

	onMount(() => {
		void init();
		const onKeydown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				paletteOpen = true;
			}
		};
		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});

	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.dataset.theme = resolvedTheme;
			document.documentElement.dataset.density = settingsStore.settings.appearance.density;
			document.documentElement.dataset.motion = settingsStore.settings.appearance.reducedMotion;
		}
	});

	$effect(() => {
		if (booted && typeof localStorage !== 'undefined') {
			localStorage.setItem(viewStorageKey, view);
		}
	});

	async function init() {
		await settingsStore.load();
		migrateThemeFromLocalStorage();
		const savedView = getSavedView();
		if (!isTauri) {
			selectedProject = savedView === 'home' ? null : demoProject;
			view = savedView ?? 'project';
		}
		await load();
		if (
			savedView === 'project' ||
			(!savedView && settingsStore.settings.workflow.startView === 'lastProject')
		) {
			const lastProjectId =
				typeof localStorage === 'undefined'
					? null
					: localStorage.getItem('shradhapp:lastProjectId');
			const lastProject = projects.find((project) => project.id === lastProjectId) ?? projects[0];
			if (lastProject) openProject(lastProject);
			else if (isTauri) view = 'home';
		} else if (savedView) {
			view = savedView;
		}
		booted = true;
	}

	function getSavedView(): View | null {
		if (typeof localStorage === 'undefined') return null;
		const saved = localStorage.getItem(viewStorageKey);
		return saved === 'home' ||
			saved === 'library' ||
			saved === 'record' ||
			saved === 'bank' ||
			saved === 'channel' ||
			saved === 'project' ||
			saved === 'settings'
			? saved
			: null;
	}

	function migrateThemeFromLocalStorage() {
		if (typeof localStorage === 'undefined') return;
		const saved = localStorage.getItem('shradhapp:theme');
		if (saved !== 'light' && saved !== 'dark') return;
		localStorage.removeItem('shradhapp:theme');
		if (settingsStore.settings.appearance.theme !== 'dark') return;
		void settingsStore.patch((next) => (next.appearance.theme = saved));
	}

	async function load() {
		if (!isTauri) {
			projects = [demoProject];
			status = '';
			return;
		}
		try {
			await mediaStore.load();
			projects = await backend.listProjects();
			status = '';
		} catch (error) {
			status = String(error);
		}
	}

	async function createProject() {
		if (creating) return;
		if (!isTauri) {
			selectedProject = demoProject;
			view = 'project';
			return;
		}
		creating = true;
		try {
			const project = await backend.createProject('My new video');
			await load();
			selectedProject = project;
			view = 'project';
		} catch (error) {
			status = String(error);
		} finally {
			creating = false;
		}
	}

	async function duplicateProject(id: string) {
		if (!isTauri) return;
		try {
			const project = await backend.duplicateProject(id);
			await load();
			openProject(project);
		} catch (error) {
			status = String(error);
		}
	}

	async function deleteProject(id: string) {
		if (!isTauri) return;
		try {
			await backend.deleteProject(id);
			if (selectedProject?.id === id) {
				selectedProject = null;
				view = 'home';
			}
			await load();
		} catch (error) {
			status = String(error);
		}
	}

	function openProject(project: ProjectRecord) {
		selectedProject = project;
		projectError = null;
		view = 'project';
		if (typeof localStorage !== 'undefined')
			localStorage.setItem('shradhapp:lastProjectId', project.id);
	}

	function handleProjectError(error: unknown) {
		projectError = error instanceof Error ? error.message : String(error);
	}

	function go(next: View) {
		if (next === 'channel' && !settingsStore.settings.channel.enabled) next = 'settings';
		view = next;
		if (next === 'home') {
			selectedProject = null;
			void load();
		}
	}

	function toggleTheme() {
		void settingsStore.patch((next) => {
			next.appearance.theme = resolvedTheme === 'dark' ? 'light' : 'dark';
		});
	}

	function dispatchStudioCommand(command: string) {
		setTimeout(
			() => window.dispatchEvent(new CustomEvent('shradhapp:command', { detail: command })),
			0
		);
	}
</script>

{#if !booted}
	<section class="runtime-message">
		<p class="eyebrow">Shradhapp</p>
		<h1>Loading your studio</h1>
	</section>
{:else}
	<div class="app-shell">
		<main class="app-main">
			<svelte:boundary onerror={handleProjectError}>
				{#key selectedProject?.id ?? 'no-project'}
					<ProjectStudio
						project={selectedProject ?? undefined}
						{projects}
						{view}
						appStatus={status}
						{creating}
						onNavigate={go}
						onOpenProject={openProject}
						onCreateProject={createProject}
						onDeleteProject={deleteProject}
						onToggleTheme={toggleTheme} />
				{/key}
				{#snippet failed()}
					<section class="phase-empty">
						<p class="eyebrow">Project workspace</p>
						<h2>We could not open this project view.</h2>
						<p>{projectError ?? 'The project screen needs to be refreshed.'}</p>
						<button class="button button-primary" onclick={() => (projectError = null)}>
							Try again
						</button>
					</section>
				{/snippet}
			</svelte:boundary>
		</main>
	</div>
	<CommandPalette
		open={paletteOpen}
		{commands}
		confirmDanger={settingsStore.settings.advanced.confirmDestructiveCommands}
		onClose={() => (paletteOpen = false)} />
{/if}
