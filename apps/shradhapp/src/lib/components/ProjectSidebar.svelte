<script lang="ts">
	import { PlusIcon } from 'phosphor-svelte';
	import { Trash2 } from '@lucide/svelte';
	import type { MediaItem, ProjectRecord } from '$lib/backend/types';

	type SidebarMode = 'projects' | 'media' | 'gather';

	interface Props {
		mode: SidebarMode;
		projects: ProjectRecord[];
		media: MediaItem[];
		availableMedia: MediaItem[];
		isTauri: boolean;
		importing: boolean;
		onOpenProject: (project: ProjectRecord) => void;
		onRequestProjectDeletion: (project: ProjectRecord) => void;
		onOpenLibraryMedia: (media: MediaItem) => void;
		onRequestMediaDeletion: (media: MediaItem) => void;
		onAddFromComputer: () => void;
		onAddClip: (media: MediaItem) => void;
	}

	let {
		mode,
		projects,
		media,
		availableMedia,
		isTauri,
		importing,
		onOpenProject,
		onRequestProjectDeletion,
		onOpenLibraryMedia,
		onRequestMediaDeletion,
		onAddFromComputer,
		onAddClip
	}: Props = $props();
</script>

{#if mode === 'projects'}
	{#if projects.length === 0}
		<p class="rail-empty">Your saved videos will appear here.</p>
	{:else}
		<div class="rail-project-list">
			{#each projects as savedProject (savedProject.id)}
				<div class="rail-item">
					<button
						class="blank noxp xleft grow min-w-0 box"
						onclick={() => onOpenProject(savedProject)}>
						<span class="text-md fw500">{savedProject.name}</span>
						<span class="text-xs text-muted">
							{new Date(savedProject.updated_at).toLocaleDateString()}
						</span>
					</button>
					<button
						class="btn-icon-text shrink-0"
						type="button"
						aria-label={`Delete ${savedProject.name}`}
						onclick={() => onRequestProjectDeletion(savedProject)}>
						<Trash2 size={16} />
					</button>
				</div>
			{/each}
		</div>
	{/if}
{:else if mode === 'media'}
	{#if media.length === 0}
		<p class="rail-empty">Your media library is empty.</p>
	{:else}
		<div class="rail-project-list">
			{#each media as item (item.id)}
				<div class="rail-item">
					<button
						class="blank noxp xleft grow min-w-0 box"
						onclick={() => onOpenLibraryMedia(item)}
						aria-label={`Open ${item.filename} in the media library`}>
						<span class="text-md fw500">{item.filename.slice(0, 25)}</span>
						<span class="text-xs text-muted">{item.kind} · In library</span>
					</button>
					<button
						class="btn-icon-text shrink-0"
						type="button"
						aria-label={`Delete ${item.filename}`}
						onclick={() => onRequestMediaDeletion(item)}>
						<Trash2 size={16} />
					</button>
				</div>
			{/each}
		</div>
	{/if}
{:else if mode === 'gather'}
	<button
		class="button button-primary"
		onclick={onAddFromComputer}
		disabled={!isTauri || importing}>
		<PlusIcon size={16} />
		{importing ? 'Adding…' : 'Add files'}
	</button>
	<div class="rail-project-list">
		{#each availableMedia as item (item.id)}
			<button class="rail-project" onclick={() => onAddClip(item)}>
				<span>{item.filename}</span>
				<small>Add to this project</small>
			</button>
		{/each}
	</div>
{/if}
