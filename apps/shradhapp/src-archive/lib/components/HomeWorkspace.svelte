<script lang="ts">
	import { BookImage } from '@lucide/svelte';
	import { backend } from '$lib/backend';
	import type { MediaItem, ProjectRecord } from '$lib/backend/types';
	import { fmtDur, kindLabel } from '$lib/utils';

	interface Props {
		recentProjects: ProjectRecord[];
		recentMedia: MediaItem[];
		onOpenProject: (project: ProjectRecord) => void;
		onShowLibrary: () => void;
		onOpenLibraryMedia: (media: MediaItem) => void;
	}

	let { recentProjects, recentMedia, onOpenProject, onShowLibrary, onOpenLibraryMedia }: Props =
		$props();
</script>

<div class="embedded-page">
	<section class="box pad32 gap16">
		{#if recentProjects.length === 0}
			<p class="empty-copy">Create a project when you are ready to tell a story.</p>
		{:else}
			<div class="section-heading">
				<p class="eyebrow">Recent Projects</p>
			</div>
			<div class="grid grid-cols-3">
				{#each recentProjects as recentProject (recentProject.id)}
					<button
						class="blank box xleft pad16 on-hover"
						onclick={() => onOpenProject(recentProject)}>
						<span class="text-bs fw500">{recentProject.name}</span>
						<span class="text-sm text-muted">
							{new Date(recentProject.updated_at).toLocaleDateString()}
						</span>
					</button>
				{/each}
			</div>
		{/if}
	</section>
	<section class="box pad32 bordtop">
		<div class="section-heading gap8 box">
			<p class="eyebrow">Media library</p>
			<button class="btn-icon-text" onclick={onShowLibrary}>
				<BookImage size={18} />
				<span>See Full Library</span>
			</button>
		</div>
		{#if recentMedia.length === 0}
			<p class="empty-copy">Photos, videos, and recordings you add will appear here.</p>
		{:else}
			<div class="grid grid-cols-4">
				{#each recentMedia as item (item.id)}
					<button
						class="btn-std"
						onclick={() => onOpenLibraryMedia(item)}
						aria-label={`Open ${item.filename} in the media library`}>
						<div class="thumb">
							<img src={backend.thumbUrl(item)} alt="" loading="lazy" />
							<span class={`badge ${item.kind}`}>{kindLabel(item.kind)}</span>
							{#if item.duration != null}
								<span class="dur">{fmtDur(item.duration)}</span>
							{/if}
						</div>
						<div class="meta"><div class="name">{item.filename}</div></div>
					</button>
				{/each}
			</div>
		{/if}
	</section>
</div>
