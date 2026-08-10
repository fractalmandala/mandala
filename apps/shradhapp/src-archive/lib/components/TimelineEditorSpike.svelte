<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import {
		TimelineEditor,
		type NotifyKind,
		type ResolvedAsset,
		type TimelineProject
	} from '../../../svelte-video-editor-ref/src/lib';
	import { backend } from '$lib/backend';
	import type { ExportPreset, ProjectRecord } from '$lib/backend/types';
	import { mediaStore } from '$lib/stores.svelte';
	import { projectToV2 } from '$lib/timeline/mapper';
	import type { ProjectDataV2 } from '$lib/timeline/model';
	import {
		editorProjectToProjectDataV2,
		projectDataV2ToEditorProject,
		projectDataV2ToExportDto
	} from '$lib/timeline/editor-adapter';

	let {
		project: initialProject = null,
		onProjectSaved
	}: {
		project?: ProjectRecord | null;
		onProjectSaved?: (data: ProjectDataV2) => void;
	} = $props();

	let projectRecord = $state<ProjectRecord | null>(null);
	let timelineData = $state<ProjectDataV2 | null>(null);
	let editorProject = $state<TimelineProject | null>(null);
	let loading = $state(true);
	let status = $state('');
	const exportPreset: ExportPreset = 'mp4-full';
	let saveTimer: ReturnType<typeof setTimeout> | null = null;

	onMount(() => {
		if (browser) void load();
	});

	onDestroy(() => {
		if (saveTimer) clearTimeout(saveTimer);
	});

	async function load() {
		loading = true;
		try {
			await mediaStore.load();
			const projects = initialProject ? [] : await backend.listProjects();
			projectRecord =
				initialProject ?? projects[0] ?? (await backend.createProject('Timeline editor spike'));
			timelineData = projectToV2(projectRecord.data, { mediaItems: mediaStore.items });
			editorProject = projectDataV2ToEditorProject(
				timelineData,
				mediaStore.items,
				(item) => backend.mediaUrl(item),
				projectRecord.id
			);
			status = '';
		} catch (error) {
			status = String(error);
		} finally {
			loading = false;
		}
	}

	async function resolveAsset(assetId: string): Promise<ResolvedAsset> {
		const item = mediaStore.byId(assetId);
		if (!item) throw new Error('That media item is no longer in the Media Bank.');
		return {
			url: backend.mediaUrl(item),
			hasAudio: item.kind === 'audio' || item.kind === 'video',
			width: item.width ?? undefined,
			height: item.height ?? undefined,
			durationFrames: item.duration == null ? undefined : Math.round(item.duration * 30)
		};
	}

	async function generateThumbnail(assetId: string): Promise<string> {
		const item = mediaStore.byId(assetId);
		if (!item) throw new Error('That media item is no longer in the Media Bank.');
		return backend.thumbUrl(item);
	}

	function handleChange(project: TimelineProject) {
		if (!timelineData || !projectRecord) return;
		editorProject = project;
		timelineData = editorProjectToProjectDataV2(project, timelineData);
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			void autosave();
		}, 600);
	}

	async function autosave() {
		if (!timelineData || !projectRecord) return;
		await backend.updateProject(projectRecord.id, timelineData);
		onProjectSaved?.(timelineData);
		status = 'Saved';
	}

	async function handleExport(project: TimelineProject) {
		if (!timelineData || !projectRecord) return;
		const next = editorProjectToProjectDataV2(project, timelineData);
		timelineData = next;
		await autosave();
		const ext = exportPreset === 'mov' ? 'mov' : 'mp4';
		const outPath = await backend.pickSavePath(`${next.name}.${ext}`, ext);
		if (!outPath) return;
		const exportId = crypto.randomUUID();
		await backend.exportTimelineProject(
			exportId,
			projectDataV2ToExportDto(next),
			exportPreset,
			true,
			outPath
		);
		status = `Exported to ${outPath}`;
	}

	function notify(message: string, kind: NotifyKind) {
		status = `${kind}: ${message}`;
	}
</script>

{#if loading}
	<p>Loading editor...</p>
{:else if status && !editorProject}
	<p>{status}</p>
{:else if browser && editorProject}
	<div class="video-editor-shell box">
		{#if status}
			<p class="video-editor-status text-sm">{status}</p>
		{/if}
		<div class="video-editor-frame">
			<TimelineEditor
				project={editorProject}
				onChange={handleChange}
				{resolveAsset}
				{generateThumbnail}
				onExport={handleExport}
				can={() => true}
				onNotify={notify} />
		</div>
	</div>
{/if}
