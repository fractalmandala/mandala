<script lang="ts">
	import { AnimatePresence, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import {
		CaretRightIcon,
		MagicWandIcon,
		PlusIcon,
		ScissorsIcon,
		TrashIcon,
		WaveformIcon
	} from 'phosphor-svelte';
	import { backend } from '$lib/backend';
	import type { MediaItem, ProjectData } from '$lib/backend/types';
	import type { ProjectDataV2 } from '$lib/timeline/model';
	import { motionConfig } from '$lib/motion';
	import AudioEditor from './AudioEditor.svelte';
	import MultiTrackTimeline from './MultiTrackTimeline.svelte';
	import TimelinePreview from './TimelinePreview.svelte';

	interface Props {
		clips: ProjectData['clips'];
		moments: MediaItem[];
		selectedMoment: number;
		voiceover?: MediaItem;
		audioUrl: string;
		timelineData: ProjectDataV2;
		allMedia: readonly MediaItem[];
		repairOpen: boolean;
		selectedMarker: number[];
		cleaning: boolean;
		isTauri: boolean;
		onSelectMoment: (index: number) => void;
		onToggleRepair: () => void;
		onToggleMarker: (marker: number) => void;
		onCleanVoiceover: () => void;
		onAudioCut: (region: { start: number; end: number }) => void;
		onAudioSilence: (region: { start: number; end: number }) => void;
		onAudioFadeIn: (region: { start: number; end: number }) => void;
		onAudioFadeOut: (region: { start: number; end: number }) => void;
		onAudioNormalize: () => void;
		onChooseVoiceover: () => void;
		onOpenGather: () => void;
		onSplitSelected: () => void;
		onTrimSelected: () => void;
		onRemoveSelected: () => void;
	}

	let {
		clips,
		moments,
		selectedMoment,
		voiceover,
		audioUrl,
		timelineData,
		allMedia,
		repairOpen,
		selectedMarker,
		cleaning,
		isTauri,
		onSelectMoment,
		onToggleRepair,
		onToggleMarker,
		onCleanVoiceover,
		onAudioCut,
		onAudioSilence,
		onAudioFadeIn,
		onAudioFadeOut,
		onAudioNormalize,
		onChooseVoiceover,
		onOpenGather,
		onSplitSelected,
		onTrimSelected,
		onRemoveSelected
	}: Props = $props();

	const reducedMotion = useReducedMotion();

	function transition(name: 'fast' | 'normal' = 'normal', essential = false) {
		return motionConfig.transition(name, reducedMotion.current, essential);
	}

	function scrollTimeline(event: WheelEvent) {
		if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
		const row = event.currentTarget as HTMLElement;
		row.scrollLeft += event.deltaY;
		event.preventDefault();
	}

	function moveTimeline(event: KeyboardEvent) {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		const row = event.currentTarget as HTMLElement;
		row.scrollLeft += event.key === 'ArrowRight' ? 80 : -80;
		event.preventDefault();
	}

	/* ── Audio editor state & playback ───────────────────── */
	let audioEl = $state<HTMLAudioElement | null>(null);
	let peaks = $state<number[]>([]);
	let audioDuration = $state(0);
	let audioPlaying = $state(false);
	let audioCurrentTime = $state(0);

	/* ── Timeline preview playback state ────────────────── */
	let timelinePlaying = $state(false);
	let timelineTime = $state(0);

	function onTimelineTimeUpdate(time: number) {
		timelineTime = time;
	}

	function onTimelinePlayChange(playing: boolean) {
		timelinePlaying = playing;
		if (!playing) {
			// Pause audio too when timeline stops
			if (audioEl && !audioEl.paused) audioEl.pause();
			audioPlaying = false;
		}
	}

	function onTimelineSeek(time: number) {
		timelineTime = time;
		if (audioEl) audioEl.currentTime = Math.max(0, Math.min(time, audioDuration));
		audioCurrentTime = time;
	}

	function toggleAudioPlay() {
		if (!audioEl) return;
		if (audioEl.paused) {
			void audioEl.play();
			audioPlaying = true;
			// Also start timeline playback
			timelinePlaying = true;
		} else {
			audioEl.pause();
			audioPlaying = false;
			timelinePlaying = false;
		}
	}

	function seekAudio(time: number) {
		if (!audioEl) return;
		audioEl.currentTime = Math.max(0, Math.min(time, audioDuration));
		timelineTime = time;
		audioCurrentTime = time;
	}

	function onAudioTimeUpdate() {
		if (!audioEl) return;
		audioCurrentTime = audioEl.currentTime;
	}

	$effect(() => {
		const id = voiceover?.id;
		const dur = voiceover?.duration ?? 0;
		if (!id) {
			peaks = [];
			audioDuration = 0;
			audioPlaying = false;
			audioCurrentTime = 0;
			return;
		}
		audioDuration = dur;
		audioPlaying = false;
		audioCurrentTime = 0;
		backend.getWaveformData(id, 800).then((p) => { peaks = p; });
	});

	$effect(() => {
		const el = audioEl;
		const url = audioUrl;
		if (!el) return;
		if (url) {
			el.src = url;
			el.load();
		} else {
			el.removeAttribute('src');
		}
	});

	$effect(() => {
		const el = audioEl;
		if (!el) return;
		const onEnded = () => { audioPlaying = false; };
		el.addEventListener('timeupdate', onAudioTimeUpdate);
		el.addEventListener('ended', onEnded);
		return () => {
			el.removeEventListener('timeupdate', onAudioTimeUpdate);
			el.removeEventListener('ended', onEnded);
		};
	});
</script>

<div class="embedded-page">
	<div class="preview-surface">
		<TimelinePreview
			data={timelineData}
			mediaItems={allMedia}
			currentTime={timelineTime}
			playing={timelinePlaying}
			onTimeUpdate={onTimelineTimeUpdate}
			onPlayStateChange={onTimelinePlayChange}
			onSeek={onTimelineSeek}
		/>
	</div>
	<section class="repair-drawer" class:open={repairOpen}>
		<motion.button
			class="drawer-header"
			whileTap={reducedMotion.current ? {} : { scale: 0.98 }}
			transition={transition('fast', true)}
			onclick={onToggleRepair}>
			<span>
				<WaveformIcon size={20} /> Tick repair
				<small>{voiceover ? voiceover.filename : 'Choose a voiceover'}</small>
			</span>
			<motion.span
				animate={reducedMotion.current ? { rotate: 0 } : { rotate: repairOpen ? 90 : 0 }}
				transition={transition('fast', true)}>
				<CaretRightIcon size={18} />
			</motion.span>
		</motion.button>
		<AnimatePresence initial={false}>
			{#if repairOpen}
				<motion.div
					key="repair-content"
					class="repair-content"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={transition('fast', true)}>
					<div class="waveform" aria-label="Voiceover waveform">
						{#if voiceover}
							<!-- svelte-ignore a11y_media_has_caption -->
							<audio bind:this={audioEl} preload="metadata" style="display: none"></audio>
							<AudioEditor
								audioId={voiceover.id}
								peaks={peaks}
								duration={audioDuration}
								playing={audioPlaying}
								currentTime={audioCurrentTime}
								onTogglePlay={toggleAudioPlay}
								onSeek={seekAudio}
								onCut={onAudioCut}
								onSilence={onAudioSilence}
								onFadeIn={onAudioFadeIn}
								onFadeOut={onAudioFadeOut}
								onNormalize={onAudioNormalize}
							/>
						{:else}
							<span class="text-muted text-xs">
								Choose or record a voiceover to review it here.
							</span>
						{/if}
						{#if voiceover}
							{#each [1, 2, 3] as marker}
								<motion.button
									class={`wave-marker ${selectedMarker.includes(marker) ? 'selected' : ''}`}
									whileTap={reducedMotion.current ? {} : { scale: 0.96 }}
									transition={transition('fast', true)}
									style={`left: ${marker * 24}%`}
									onclick={() => onToggleMarker(marker)}
									aria-label={`Select marker ${marker}`}>
									{marker}
								</motion.button>
							{/each}
						{/if}
					</div>
					<div class="repair-actions">
						<span>
							{voiceover ? 'Automatic click and tick detection is ready' : 'No voiceover selected'}
						</span>
						<button class="button button-quiet" onclick={onChooseVoiceover}>
							Choose voiceover
						</button>
						<button
							class="button button-primary"
							onclick={onCleanVoiceover}
							disabled={!voiceover || cleaning || !isTauri}>
							<MagicWandIcon size={17} />
							{cleaning ? 'Repairing…' : 'Repair clicks and ticks'}
						</button>
					</div>
				</motion.div>
			{/if}
		</AnimatePresence>
	</section>
	<section class="timeline-surface">
		<div class="timeline-toolbar">
			<button class="button button-quiet" onclick={onOpenGather}>
				<PlusIcon size={17} /> Add moment
			</button>
			<button
				class="button button-quiet"
				onclick={onSplitSelected}
				disabled={!clips[selectedMoment]}>
				<ScissorsIcon size={17} /> Split
			</button>
			<button
				class="button button-quiet"
				onclick={onTrimSelected}
				disabled={!clips[selectedMoment]}>
				<ScissorsIcon size={17} /> Trim
			</button>
			<button
				class="button button-quiet"
				onclick={onRemoveSelected}
				disabled={!clips[selectedMoment]}>
				<TrashIcon size={17} /> Remove
			</button>
			<span>{clips.length} moments</span>
		</div>
		<MultiTrackTimeline
			data={timelineData}
			mediaItems={allMedia} />
	</section>
</div>
