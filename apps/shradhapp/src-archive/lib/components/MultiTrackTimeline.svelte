<script lang="ts">
	import { PlusIcon, SpeakerHighIcon, SpeakerSlashIcon } from 'phosphor-svelte';
	import type { MediaItem } from '$lib/backend/types';
	import type { ProjectDataV2, TimelineClip } from '$lib/timeline/model';

	let {
		data,
		mediaItems,
		selectedClipId = null,
		onAddClip,
		onSelectClip,
		onRemoveClip,
		onToggleTrackMute
	}: {
		data: ProjectDataV2;
		mediaItems: readonly MediaItem[];
		selectedClipId?: string | null;
		onAddClip?: (trackId: string) => void;
		onSelectClip?: (clipId: string | null) => void;
		onRemoveClip?: (clipId: string) => void;
		onToggleTrackMute?: (trackId: string) => void;
	} = $props();

	const TRACK_HEADER_WIDTH = 132;
	const TRACK_HEIGHT = 52;
	const PX_PER_SEC = 12;

	const mediaById = $derived(new Map(mediaItems.map((item) => [item.id, item])));
	const tracks = $derived(data.timeline.tracks);
	const timelineDuration = $derived(Math.max(data.timeline.duration, 10));
	const rulerWidth = $derived(timelineDuration * PX_PER_SEC);

	function clipWidth(clip: TimelineClip): number {
		return Math.max(clip.timeline.duration * PX_PER_SEC, 8);
	}

	function clipLeft(clip: TimelineClip): number {
		return clip.timeline.start * PX_PER_SEC;
	}

	function clipLabel(clip: TimelineClip): string {
		const item = mediaById.get(clip.mediaId);
		return clip.name ?? item?.filename ?? 'Clip';
	}

	function clipColor(clip: TimelineClip): string {
		if (clip.kind === 'audio') return 'var(--audio-clip, #5ba0c8)';
		const item = mediaById.get(clip.mediaId);
		if (item?.kind === 'image') return 'var(--image-clip, #7c9a6e)';
		return 'var(--video-clip, #c49b5a)';
	}

	function rulerMarks(): { left: number; label: string }[] {
		const marks: { left: number; label: string }[] = [];
		const step = timelineDuration > 60 ? 10 : 5;
		for (let t = 0; t <= timelineDuration; t += step) {
			const m = Math.floor(t / 60);
			const s = t % 60;
			marks.push({ left: t * PX_PER_SEC, label: `${m}:${s.toString().padStart(2, '0')}` });
		}
		return marks;
	}

	function handleClipClick(e: MouseEvent, clipId: string) {
		e.stopPropagation();
		onSelectClip?.(clipId);
	}

	function handleBackgroundClick() {
		onSelectClip?.(null);
	}
</script>

<div class="multi-track-timeline" role="region" aria-label="Multi-track timeline">
	<div class="mt-ruler" style="padding-left: {TRACK_HEADER_WIDTH}px">
		{#each rulerMarks() as mark}
			<span class="mt-ruler-mark" style="left: {mark.left + TRACK_HEADER_WIDTH}px">
				{mark.label}
			</span>
		{/each}
	</div>

	{#each tracks as track (track.id)}
		<div class="mt-track-row">
			<div class="mt-track-header">
				<button
					class="mt-mute-btn"
					class:muted={track.muted}
					onclick={() => onToggleTrackMute?.(track.id)}
					aria-label={track.muted ? 'Unmute track' : 'Mute track'}>
					{#if track.muted}
						<SpeakerSlashIcon size={16} />
					{:else}
						<SpeakerHighIcon size={16} />
					{/if}
				</button>
				<span class="mt-track-name" title={track.name}>{track.name}</span>
				<button
					class="mt-add-btn"
					onclick={() => onAddClip?.(track.id)}
					aria-label="Add clip to track">
					<PlusIcon size={14} />
				</button>
			</div>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="mt-track-lane"
				class:audio={track.kind === 'audio'}
				style="width: {rulerWidth}px; min-height: {TRACK_HEIGHT}px"
				onclick={handleBackgroundClick}>
				{#each track.clips as clip (clip.id)}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<button
						class="mt-clip"
						class:selected={selectedClipId === clip.id}
						class:muted={clip.muted}
						style="left: {clipLeft(clip)}px; width: {clipWidth(clip)}px; background: {clipColor(clip)}"
						onclick={(e) => handleClipClick(e, clip.id)}
						onkeydown={(e) => {
							if (e.key === 'Delete' || e.key === 'Backspace') {
								e.preventDefault();
								onRemoveClip?.(clip.id);
							}
						}}
						aria-label="{clipLabel(clip)} — {clip.timeline.duration.toFixed(1)}s"
						title="{clipLabel(clip)} ({clip.timeline.duration.toFixed(1)}s)">
						<span class="mt-clip-label">{clipLabel(clip)}</span>
						<span class="mt-clip-duration">{clip.timeline.duration.toFixed(1)}s</span>
					</button>
				{/each}
			</div>
		</div>
	{/each}

	{#if tracks.length === 0}
		<div class="mt-empty">
			<p>No tracks yet. Add moments to build your timeline.</p>
		</div>
	{/if}
</div>
