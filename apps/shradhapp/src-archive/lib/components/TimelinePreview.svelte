<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { PlayIcon, PauseIcon } from 'phosphor-svelte';
	import { backend } from '$lib/backend';
	import type { MediaItem } from '$lib/backend/types';
	import type { ProjectDataV2, TimelineClip } from '$lib/timeline/model';

	let {
		data,
		mediaItems,
		currentTime = 0,
		playing = false,
		onTimeUpdate,
		onPlayStateChange,
		onSeek
	}: {
		data: ProjectDataV2;
		mediaItems: readonly MediaItem[];
		currentTime?: number;
		playing?: boolean;
		onTimeUpdate: (time: number) => void;
		onPlayStateChange: (playing: boolean) => void;
		onSeek: (time: number) => void;
	} = $props();

	// ── Derived lookups ──────────────────────────────────────────────
	const mediaById = $derived(new Map(mediaItems.map((m) => [m.id, m])));

	const videoTrack = $derived(data.timeline.tracks.find((t) => t.kind === 'video') ?? null);
	const audioTrack = $derived(data.timeline.tracks.find((t) => t.kind === 'audio') ?? null);

	const videoClips = $derived(
		videoTrack ? [...videoTrack.clips].sort((a, b) => a.timeline.start - b.timeline.start) : []
	);

	const voiceoverClip = $derived(audioTrack?.clips.find((c) => !c.muted) ?? null);
	const voiceoverItem = $derived(
		voiceoverClip ? mediaById.get(voiceoverClip.mediaId) ?? null : null
	);

	const duration = $derived(data.timeline.duration || 0);

	const activeVideoClip = $derived.by(() => {
		for (const clip of videoClips) {
			const end = clip.timeline.start + clip.timeline.duration;
			if (currentTime >= clip.timeline.start && currentTime < end) return clip;
		}
		return null;
	});

	const progressPct = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);
	const hasVideo = $derived(videoClips.length > 0);

	// ── Local state ──────────────────────────────────────────────────
	let videoEl: HTMLVideoElement | undefined = $state(undefined);
	let audioEl: HTMLAudioElement | undefined = $state(undefined);

	let rafId: number | null = null;
	let lastTs: number | null = null;
	let localTime = $state(currentTime);
	let lastEmittedTime = -1;
	let lastActiveClipId: string | null = null;

	// ── Helpers ──────────────────────────────────────────────────────
	function formatTime(t: number): string {
		const s = Math.max(0, Math.floor(t));
		return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
	}

	function loadVideoClip(clip: TimelineClip) {
		if (!videoEl) return;
		const item = mediaById.get(clip.mediaId);
		if (!item) return;
		const url = backend.mediaUrl(item);
		if (videoEl.src !== url) videoEl.src = url;
		const offset = localTime - clip.timeline.start + clip.source.trimStart;
		videoEl.currentTime = Math.max(0, offset);
		lastActiveClipId = clip.id;
	}

	function clearVideo() {
		if (!videoEl) return;
		videoEl.pause();
		videoEl.removeAttribute('src');
		videoEl.load();
		lastActiveClipId = null;
	}

	// ── Sync video src when active clip changes ─────────────────────
	$effect(() => {
		const clip = activeVideoClip;
		untrack(() => {
			if (!clip) {
				clearVideo();
				return;
			}
			if (clip.id !== lastActiveClipId) {
				loadVideoClip(clip);
				if (playing) videoEl?.play().catch(() => {});
			}
		});
	});

	// ── Sync voiceover audio src when it changes ────────────────────
	$effect(() => {
		const item = voiceoverItem;
		untrack(() => {
			if (!audioEl || !item) return;
			audioEl.src = backend.mediaUrl(item);
			audioEl.load();
		});
	});

	// ── rAF loop ────────────────────────────────────────────────────
	function tick(ts: number) {
		if (lastTs === null) lastTs = ts;
		const dt = (ts - lastTs) / 1000;
		lastTs = ts;

		const next = Math.min(localTime + dt, duration);
		localTime = next;
		lastEmittedTime = next;
		onTimeUpdate(next);

		if (next >= duration) {
			stopRaf();
			onPlayStateChange(false);
			return;
		}
		rafId = requestAnimationFrame(tick);
	}

	function startRaf() {
		if (rafId !== null) return;
		lastTs = null;
		rafId = requestAnimationFrame(tick);
	}

	function stopRaf() {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
		lastTs = null;
	}

	// ── Respond to playing state changes ────────────────────────────
	$effect(() => {
		const isPlaying = playing;
		untrack(() => {
			if (isPlaying) {
				localTime = currentTime;

				const clip = activeVideoClip;
				if (clip && videoEl) {
					loadVideoClip(clip);
					videoEl.play().catch(() => {});
				}

				if (audioEl && voiceoverClip) {
					const offset =
						currentTime - voiceoverClip.timeline.start + voiceoverClip.source.trimStart;
					audioEl.currentTime = Math.max(0, offset);
					audioEl.play().catch(() => {});
				}

				startRaf();
			} else {
				stopRaf();
				videoEl?.pause();
				audioEl?.pause();
			}
		});
	});

	// ── External seek detection (skip our own emissions) ─────────────
	$effect(() => {
		const t = currentTime;
		untrack(() => {
			if (Math.abs(t - lastEmittedTime) > 0.05) {
				localTime = t;
				lastActiveClipId = null;

				const clip = activeVideoClip;
				if (clip) loadVideoClip(clip);

				if (audioEl && voiceoverClip) {
					const offset = t - voiceoverClip.timeline.start + voiceoverClip.source.trimStart;
					audioEl.currentTime = Math.max(0, offset);
				}
			}
		});
	});

	// ── Reset clip tracking when project data changes ────────────────
	$effect(() => {
		void data;
		void mediaItems;
		untrack(() => {
			lastActiveClipId = null;
		});
	});

	onDestroy(() => {
		stopRaf();
	});

	// ── Interaction handlers ─────────────────────────────────────────
	function togglePlay() {
		onPlayStateChange(!playing);
	}

	function handleProgressClick(e: MouseEvent) {
		const el = e.currentTarget as HTMLElement;
		const rect = el.getBoundingClientRect();
		const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
		onSeek(frac * duration);
	}
</script>

<div class="timeline-preview">
	<div class="preview-video-frame">
		{#if hasVideo}
			<video bind:this={videoEl} muted playsinline preload="auto" />
		{:else}
			<div class="preview-placeholder">
				<PlayIcon size={32} weight="fill" />
				<span>Add video clips to preview</span>
			</div>
		{/if}
	</div>

	{#if voiceoverItem}
		<audio bind:this={audioEl} preload="auto"></audio>
	{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="preview-progress" onclick={handleProgressClick} role="slider" aria-label="Seek" aria-valuenow={Math.round(currentTime)} aria-valuemax={Math.round(duration)}>
		<div class="preview-progress-fill" style="width: {progressPct}%" />
	</div>

	<div class="preview-transport">
		<button
			class="preview-play-btn"
			onclick={togglePlay}
			aria-label={playing ? 'Pause' : 'Play'}
			disabled={!hasVideo}
		>
			{#if playing}
				<PauseIcon size={20} weight="fill" />
			{:else}
				<PlayIcon size={20} weight="fill" />
			{/if}
		</button>
		<span class="preview-timecode">
			{formatTime(currentTime)}&ensp;/&ensp;{formatTime(duration)}
		</span>
	</div>
</div>
