<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import { DownloadSimpleIcon } from 'phosphor-svelte';
	import { AnimatePresence, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import * as AlertDialog from 'fractalsvelte/alert-dialog';
	import { backend, isTauri } from '$lib/backend';
	import type { ExportPreset, MediaItem, ProjectData, ProjectRecord } from '$lib/backend/types';
	import { layout } from '$lib/layoutstate.svelte';
	import { motionConfig } from '$lib/motion';
	import { settingsStore } from '$lib/settings.svelte';
	import { mediaStore } from '$lib/stores.svelte';
	import { isProjectDataV2, projectV1ToV2, projectV2ToV1 } from '$lib/timeline/mapper';
	import { UndoStack, snapshotCommand } from '$lib/undo.svelte';
	import { clone, sanitizeFileName } from '$lib/utils';
	import ExportPanel from './ExportPanel.svelte';
	import HomeWorkspace from './HomeWorkspace.svelte';
	import MediaBank from './MediaBank.svelte';
	import ProjectSidebar from './ProjectSidebar.svelte';
	import ProjectWorkspace from './ProjectWorkspace.svelte';
	import RecordPanel from './RecordPanel.svelte';
	import SettingsPanel from './SettingsPanel.svelte';
	import WorkspaceShell from './WorkspaceShell.svelte';
	import YouTubeChannelViewer from './YouTubeChannelViewer.svelte';

	type View = 'home' | 'library' | 'record' | 'bank' | 'channel' | 'project' | 'settings';
	type Phase = 'gather' | 'story' | 'sound' | 'finish';
	type LeftSidebarView = 'projects' | 'media' | 'gather';
	type DeletionTarget =
		{ kind: 'project'; project: ProjectRecord } | { kind: 'media'; media: MediaItem };

	const emptyProject: ProjectRecord = {
		id: '__empty-project__',
		name: 'Untitled project',
		data: {
			version: 1,
			name: 'Untitled project',
			clips: [],
			voiceover_media_id: null,
			created_at: 0,
			updated_at: 0
		},
		created_at: 0,
		updated_at: 0
	};

	let {
		project = emptyProject,
		projects = [],
		view,
		appStatus = '',
		creating = false,
		onNavigate,
		onOpenProject,
		onCreateProject,
		onDeleteProject,
		onToggleTheme
	}: {
		project?: ProjectRecord;
		projects?: ProjectRecord[];
		view: View;
		appStatus?: string;
		creating?: boolean;
		onNavigate: (view: View) => void;
		onOpenProject: (project: ProjectRecord) => void;
		onCreateProject: () => void;
		onDeleteProject?: (id: string) => void | Promise<void>;
		onToggleTheme: () => void;
	} = $props();

	const imageDuration = 3;
	const undo = new UndoStack();
	const reducedMotion = useReducedMotion();

	let phase = $state<Phase>('story');
	let repairOpen = $state(true);
	let selectedMarker = $state<number[]>([1, 2, 3]);
	let selectedMoment = $state(0);
	let data = $state<ProjectData>(
		untrack(() => clone(isProjectDataV2(project.data) ? projectV2ToV1(project.data) : project.data))
	);
	let saveTimer: ReturnType<typeof setTimeout> | null = null;
	let saved = $state(false);
	let status = $state<string | null>(null);
	let importing = $state(false);
	let cleaning = $state(false);
	let exportOpen = $state(false);
	let exporting = $state(false);
	let exportPercent = $state(0);
	let exportStage = $state('');
	let preset = $state<ExportPreset>(settingsStore.settings.export.defaultPreset);
	let exportId = '';
	let gatherOpen = $state(false);
	let isMac = $state(false);
	let libraryMediaId = $state<string | null>(null);
	let leftSidebarView = $state<LeftSidebarView>('media');
	let pendingDeletion = $state<DeletionTarget | null>(null);
	let deleteDialogOpen = $state(false);
	let deleting = $state(false);

	const hasProject = $derived(project.id !== emptyProject.id);
	const clips = $derived(data.clips);
	const moments = $derived(
		clips
			.map((clip) => mediaStore.byId(clip.media_id))
			.filter((item): item is MediaItem => Boolean(item))
	);
	const voiceover = $derived(
		data.voiceover_media_id ? mediaStore.byId(data.voiceover_media_id) : undefined
	);
	const v2Data = $derived(projectV1ToV2(data, { mediaItems: mediaStore.items }));
	const availableMedia = $derived(mediaStore.items.filter((item) => item.kind !== 'audio'));
	const audioMedia = $derived(mediaStore.items.filter((item) => item.kind === 'audio'));
	const recentProjects = $derived(projects.slice(0, 6));
	const recentMedia = $derived(mediaStore.items.slice(0, 8));
	const leftSidebarContent: LeftSidebarView = $derived.by(() => {
		if (gatherOpen) return 'gather';
		if (!hasProject && view === 'home') return 'projects';
		if (!hasProject && (view === 'library' || view === 'bank')) return 'media';
		return leftSidebarView;
	});

	function transition(name: 'fast' | 'normal' = 'normal', essential = false) {
		return motionConfig.transition(name, reducedMotion.current, essential);
	}

	function mutate(label: string, change: (next: ProjectData) => void) {
		const before = clone(data);
		const next = clone(data);
		change(next);
		next.updated_at = Date.now();
		data = next;
		undo.record(snapshotCommand(label, before, next, (value) => (data = value)));
		scheduleSave();
	}

	function scheduleSave() {
		if (!isTauri || !hasProject) return;
		if (saveTimer) clearTimeout(saveTimer);
		saved = false;
		saveTimer = setTimeout(async () => {
			try {
				await backend.updateProject(project.id, clone(data));
				saved = true;
				status = null;
			} catch (error) {
				status = error instanceof Error ? error.message : String(error);
			}
		}, 600);
	}

	async function flushSave() {
		if (!isTauri || !hasProject) return;
		if (saveTimer) clearTimeout(saveTimer);
		await backend.updateProject(project.id, clone(data));
		saved = true;
	}

	function addClip(item: MediaItem) {
		if (item.kind === 'audio') return;
		const end = item.kind === 'image' ? imageDuration : Math.max(0.1, item.duration ?? 0.1);
		mutate(`Add ${item.filename}`, (next) =>
			next.clips.push({ media_id: item.id, trim_start: 0, trim_end: end })
		);
		selectedMoment = Math.max(0, clips.length);
		phase = 'story';
	}

	async function addFromComputer() {
		if (!isTauri || importing) return;
		importing = true;
		try {
			const imported = await backend.pickImport();
			if (imported?.length) {
				await mediaStore.load();
				for (const item of imported) addClip(item);
			}
		} catch (error) {
			status = error instanceof Error ? error.message : String(error);
		} finally {
			importing = false;
		}
	}

	async function importToLibrary() {
		if (!isTauri || importing) return;
		importing = true;
		try {
			await backend.pickImport();
			await mediaStore.load();
		} catch (error) {
			status = error instanceof Error ? error.message : String(error);
		} finally {
			importing = false;
		}
	}

	function removeSelected() {
		if (!clips[selectedMoment]) return;
		mutate('Remove moment', (next) => next.clips.splice(selectedMoment, 1));
		selectedMoment = Math.max(0, selectedMoment - 1);
	}

	function splitSelected() {
		const clip = clips[selectedMoment];
		if (!clip || clip.trim_end - clip.trim_start < 0.2) return;
		const halfway = Math.round(((clip.trim_start + clip.trim_end) / 2) * 10) / 10;
		mutate('Split moment', (next) => {
			const original = next.clips[selectedMoment];
			next.clips.splice(
				selectedMoment,
				1,
				{ ...original, trim_end: halfway },
				{ ...original, trim_start: halfway }
			);
		});
	}

	function trimSelected() {
		const clip = clips[selectedMoment];
		if (!clip) return;
		const remaining = clip.trim_end - clip.trim_start;
		if (remaining <= 0.6) return;
		mutate(
			'Trim moment',
			(next) =>
				(next.clips[selectedMoment].trim_end = Math.max(
					next.clips[selectedMoment].trim_start + 0.1,
					next.clips[selectedMoment].trim_end - 0.5
				))
		);
	}

	function setVoiceover(id: string) {
		mutate('Change voiceover', (next) => (next.voiceover_media_id = id || null));
	}

	function toggleMarker(marker: number) {
		selectedMarker = selectedMarker.includes(marker)
			? selectedMarker.filter((item) => item !== marker)
			: [...selectedMarker, marker];
	}

	async function cleanVoiceover() {
		if (!voiceover || cleaning || !isTauri) return;
		cleaning = true;
		try {
			const result = await backend.repairAudioTicks(voiceover.id);
			await mediaStore.load();
			setVoiceover(result.cleaned.id);
			status = 'A tick-repaired copy is ready. Your original recording is unchanged.';
		} catch (error) {
			status = error instanceof Error ? error.message : String(error);
		} finally {
			cleaning = false;
		}
	}

	async function onAudioCut(region: { start: number; end: number }) {
		if (!voiceover || !isTauri) return;
		try {
			const result = await backend.cutAudioRegion(voiceover.id, region.start, region.end);
			await mediaStore.load();
			setVoiceover(result.cleaned.id);
			status = 'Cut region removed. Original unchanged.';
		} catch (error) {
			status = error instanceof Error ? error.message : String(error);
		}
	}

	async function onAudioSilence(region: { start: number; end: number }) {
		if (!voiceover || !isTauri) return;
		try {
			const result = await backend.silenceAudioRegion(voiceover.id, region.start, region.end);
			await mediaStore.load();
			setVoiceover(result.cleaned.id);
			status = 'Selected region silenced. Original unchanged.';
		} catch (error) {
			status = error instanceof Error ? error.message : String(error);
		}
	}

	async function onAudioFadeIn(region: { start: number; end: number }) {
		if (!voiceover || !isTauri) return;
		try {
			const duration = region.end - region.start;
			const result = await backend.fadeAudio(voiceover.id, region.start, duration, true);
			await mediaStore.load();
			setVoiceover(result.cleaned.id);
			status = 'Fade in applied. Original unchanged.';
		} catch (error) {
			status = error instanceof Error ? error.message : String(error);
		}
	}

	async function onAudioFadeOut(region: { start: number; end: number }) {
		if (!voiceover || !isTauri) return;
		try {
			const duration = region.end - region.start;
			const result = await backend.fadeAudio(voiceover.id, region.start, duration, false);
			await mediaStore.load();
			setVoiceover(result.cleaned.id);
			status = 'Fade out applied. Original unchanged.';
		} catch (error) {
			status = error instanceof Error ? error.message : String(error);
		}
	}

	async function onAudioNormalize() {
		if (!voiceover || !isTauri) return;
		try {
			const result = await backend.normalizeAudio(voiceover.id);
			await mediaStore.load();
			setVoiceover(result.cleaned.id);
			status = 'Audio normalized (EBU R128). Original unchanged.';
		} catch (error) {
			status = error instanceof Error ? error.message : String(error);
		}
	}

	function undoChange() {
		if (undo.undo()) scheduleSave();
	}

	function redoChange() {
		if (undo.redo()) scheduleSave();
	}

	function isTextEntry(target: EventTarget | null) {
		return (
			target instanceof HTMLInputElement ||
			target instanceof HTMLTextAreaElement ||
			(target instanceof HTMLElement && target.isContentEditable)
		);
	}

	async function beginExport() {
		if (!isTauri || exporting || !hasProject) return;
		if (!data.clips.length) {
			status = 'Add at least one photo or video before exporting.';
			return;
		}
		const ext = preset === 'mov' ? 'mov' : 'mp4';
		try {
			await flushSave();
			const outPath = await backend.pickSavePath(`${sanitizeFileName(data.name)}.${ext}`, ext);
			if (!outPath) return;
			exportId = crypto.randomUUID();
			exporting = true;
			exportPercent = 0;
			exportStage = 'Preparing your video';
			await backend.exportProject(
				exportId,
				clone(data),
				preset,
				settingsStore.settings.export.keepOriginalAudio,
				outPath
			);
			status = `Finished video saved to ${outPath}`;
			exportOpen = false;
		} catch (error) {
			status = error instanceof Error ? error.message : String(error);
		} finally {
			exporting = false;
		}
	}

	function openGather() {
		if (!hasProject) {
			onNavigate('home');
			return;
		}
		gatherOpen = true;
		phase = 'story';
		onNavigate('project');
	}

	function openFinish() {
		if (!hasProject) {
			onNavigate('home');
			return;
		}
		phase = 'finish';
		onNavigate('project');
	}

	function showProjects() {
		leftSidebarView = 'projects';
		if (layout.sidebar1Collapsed) layout.toggleSidebar1();
		gatherOpen = false;
		if (!hasProject) onNavigate('home');
	}

	function showLibrary() {
		leftSidebarView = 'media';
		libraryMediaId = null;
		if (layout.sidebar1Collapsed) layout.toggleSidebar1();
		gatherOpen = false;
		if (!hasProject) onNavigate('library');
	}

	function openLibraryMedia(item: MediaItem) {
		leftSidebarView = 'media';
		libraryMediaId = item.id;
		if (layout.sidebar1Collapsed) layout.toggleSidebar1();
		gatherOpen = false;
		onNavigate('library');
	}

	function showRecord() {
		if (layout.sidebar2Collapsed) layout.toggleSidebar2();
		onNavigate('record');
	}

	function showExport() {
		if (layout.sidebar2Collapsed) layout.toggleSidebar2();
		openFinish();
	}

	function toggleLeftSidebar() {
		if (layout.sidebar1Collapsed) leftSidebarView = 'media';
		layout.toggleSidebar1();
	}

	function toggleRightSidebar() {
		layout.toggleSidebar2();
	}

	function showChannel() {
		gatherOpen = false;
		if (!layout.sidebar1Collapsed) layout.toggleSidebar1();
		if (!layout.sidebar2Collapsed) layout.toggleSidebar2();
		onNavigate('channel');
	}

	function requestProjectDeletion(project: ProjectRecord) {
		if (!onDeleteProject) return;
		pendingDeletion = { kind: 'project', project };
		deleteDialogOpen = true;
	}

	function requestMediaDeletion(media: MediaItem) {
		pendingDeletion = { kind: 'media', media };
		deleteDialogOpen = true;
	}

	async function confirmDeletion() {
		const target = pendingDeletion;
		if (!target || deleting) return;
		deleting = true;
		try {
			if (target.kind === 'project') {
				if (!onDeleteProject) return;
				await onDeleteProject(target.project.id);
			} else {
				await backend.deleteMedia(target.media.id);
				await mediaStore.load();
				if (libraryMediaId === target.media.id) libraryMediaId = null;
			}
			deleteDialogOpen = false;
			pendingDeletion = null;
		} catch (error) {
			status = error instanceof Error ? error.message : String(error);
		} finally {
			deleting = false;
		}
	}

	onMount(() => {
		isMac = navigator.platform.toUpperCase().includes('MAC');
		const unlisten = backend.onExportProgress((progress) => {
			if (progress.id !== exportId) return;
			exportPercent = progress.percent;
			exportStage = progress.stage;
		});
		const onCommand = (event: Event) => {
			const command = (event as CustomEvent<string>).detail;
			if (command === 'export-project') {
				openFinish();
			} else if (command === 'repair-voiceover') {
				void cleanVoiceover();
			} else if (command === 'cancel-export' && exportId) {
				void backend.cancelExport(exportId);
			}
		};
		const onKeydown = (event: KeyboardEvent) => {
			if (!hasProject || isTextEntry(event.target) || (!event.metaKey && !event.ctrlKey)) return;
			if (event.key.toLowerCase() === 'z') {
				event.preventDefault();
				if (event.shiftKey) redoChange();
				else undoChange();
			}
		};
		window.addEventListener('shradhapp:command', onCommand);
		window.addEventListener('keydown', onKeydown);
		return () => {
			unlisten();
			window.removeEventListener('shradhapp:command', onCommand);
			window.removeEventListener('keydown', onKeydown);
		};
	});

	onDestroy(() => {
		if (saveTimer) clearTimeout(saveTimer);
	});
</script>

<WorkspaceShell
	{view}
	{phase}
	{hasProject}
	{creating}
	{isMac}
	{onCreateProject}
	onShowProjects={showProjects}
	onShowLibrary={showLibrary}
	onImportToLibrary={importToLibrary}
	onShowChannel={showChannel}
	onShowRecord={showRecord}
	onShowExport={showExport}
	onUndo={undoChange}
	onRedo={redoChange}
	{onToggleTheme}
	onOpenSettings={() => onNavigate('settings')}
	onToggleLeftSidebar={toggleLeftSidebar}
	onToggleRightSidebar={toggleRightSidebar}>
	{#snippet leftSidebar()}
		<ProjectSidebar
			mode={leftSidebarContent}
			{projects}
			media={mediaStore.items}
			{availableMedia}
			{isTauri}
			{importing}
			{onOpenProject}
			onRequestProjectDeletion={requestProjectDeletion}
			onOpenLibraryMedia={openLibraryMedia}
			onRequestMediaDeletion={requestMediaDeletion}
			onAddFromComputer={addFromComputer}
			onAddClip={addClip} />
	{/snippet}

	{#snippet workspace()}
		{#if appStatus || status}
			<p
				class="notice"
				class:notice-error={(appStatus || status)?.includes('failed') ||
					(appStatus || status)?.includes('Add at least')}>
				{status ?? appStatus}
			</p>
		{/if}
		{#if view === 'settings'}
			<div class="embedded-page"><SettingsPanel /></div>
		{:else if view === 'channel'}
			<div class="embedded-page"><YouTubeChannelViewer /></div>
		{:else if view === 'library' || view === 'bank'}
			<div class="embedded-page">
				<MediaBank
					initialMediaId={libraryMediaId}
					onSelectedMediaChange={(id) => (libraryMediaId = id)}
					onSelectedMediaClose={() => (libraryMediaId = null)} />
			</div>
		{:else if !hasProject}
			<HomeWorkspace
				{recentProjects}
				{recentMedia}
				{onOpenProject}
				onShowLibrary={showLibrary}
				onOpenLibraryMedia={openLibraryMedia} />
		{:else}
			<ProjectWorkspace
				{clips}
				{moments}
				{selectedMoment}
				{voiceover}
				audioUrl={voiceover ? backend.mediaUrl(voiceover) : ''}
				timelineData={v2Data}
				allMedia={mediaStore.items}
				{repairOpen}
				{selectedMarker}
				{cleaning}
				{isTauri}
				onSelectMoment={(index) => (selectedMoment = index)}
				onToggleRepair={() => (repairOpen = !repairOpen)}
				onToggleMarker={toggleMarker}
				onCleanVoiceover={cleanVoiceover}
				onAudioCut={onAudioCut}
				onAudioSilence={onAudioSilence}
				onAudioFadeIn={onAudioFadeIn}
				onAudioFadeOut={onAudioFadeOut}
				onAudioNormalize={onAudioNormalize}
				onChooseVoiceover={() => onNavigate('record')}
				onOpenGather={openGather}
				onSplitSelected={splitSelected}
				onTrimSelected={trimSelected}
				onRemoveSelected={removeSelected} />
		{/if}
	{/snippet}

	{#snippet rightSidebar()}
		{#if view === 'project' && phase === 'finish'}
			<ExportPanel
				{preset}
				onPresetChange={(nextPreset) => (preset = nextPreset)}
				onOpenExport={() => (exportOpen = true)} />
		{:else}
			<RecordPanel
				{audioMedia}
				voiceoverMediaId={data.voiceover_media_id}
				showVoiceoverSelector={view === 'record'}
				onSetVoiceover={setVoiceover}
				onReviewVoiceover={() => {
					repairOpen = true;
					onNavigate('project');
				}} />
		{/if}
	{/snippet}
</WorkspaceShell>

<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>
				Delete {pendingDeletion?.kind === 'project'
					? pendingDeletion.project.name
					: pendingDeletion?.media.filename}?
			</AlertDialog.Title>
			<AlertDialog.Description>This action cannot be undone.</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={() => (pendingDeletion = null)}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmDeletion} disabled={deleting}>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<AnimatePresence initial={false}>
	{#if exportOpen}
		<motion.div
			key="export-backdrop"
			class="modal-backdrop"
			role="presentation"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={transition('fast', true)}>
			<motion.div
				key="export-modal"
				class="export-modal"
				role="dialog"
				aria-modal="true"
				aria-label="Export video"
				initial={{ opacity: 0, y: reducedMotion.current ? 0 : 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={transition('normal', true)}>
				<p class="eyebrow">Finish</p>
				<h2>Ready to make your video?</h2>
				<p>Your original media stays safe. The finished video will be saved where you choose.</p>
				<div class="export-choices">
					<button
						class:active={preset === 'mp4-full'}
						class="choice"
						onclick={() => (preset = 'mp4-full')}>
						<strong>MP4 · Full quality</strong>
						<small>1080p · Best for keeping</small>
					</button>
					<button
						class:active={preset === 'mp4-small'}
						class="choice"
						onclick={() => (preset = 'mp4-small')}>
						<strong>MP4 · Small</strong>
						<small>Easy to send on WhatsApp</small>
					</button>
				</div>
				{#if exporting && settingsStore.settings.export.showExportProgress}
					<p class="notice">{exportStage} · {exportPercent}%</p>
				{/if}
				<div class="modal-actions">
					<button
						class="button button-quiet"
						onclick={() => (exportOpen = false)}
						disabled={exporting}>
						Not yet
					</button>
					<button
						class="button button-primary"
						onclick={beginExport}
						disabled={exporting || !isTauri}>
						<DownloadSimpleIcon size={18} />
						{exporting ? 'Making video…' : 'Choose where to save'}
					</button>
				</div>
			</motion.div>
		</motion.div>
	{/if}
</AnimatePresence>
