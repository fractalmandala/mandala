<script lang="ts">
	import { AnimatePresence, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import {
		CaretRightIcon,
		FilmReelIcon,
		MagicWandIcon,
		PlayIcon,
		PlusIcon,
		ScissorsIcon,
		TrashIcon,
		WaveformIcon
	} from 'phosphor-svelte';
	import { backend } from '$lib/backend';
	import type { MediaItem, ProjectData } from '$lib/backend/types';
	import { motionConfig } from '$lib/motion';
	import ActionTooltip from './ActionTooltip.svelte';

	interface Props {
		clips: ProjectData['clips'];
		moments: MediaItem[];
		selectedMoment: number;
		voiceover?: MediaItem;
		repairOpen: boolean;
		selectedMarker: number[];
		cleaning: boolean;
		isTauri: boolean;
		onSelectMoment: (index: number) => void;
		onToggleRepair: () => void;
		onToggleMarker: (marker: number) => void;
		onCleanVoiceover: () => void;
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
		repairOpen,
		selectedMarker,
		cleaning,
		isTauri,
		onSelectMoment,
		onToggleRepair,
		onToggleMarker,
		onCleanVoiceover,
		onChooseVoiceover,
		onOpenGather,
		onSplitSelected,
		onTrimSelected,
		onRemoveSelected
	}: Props = $props();

	const reducedMotion = useReducedMotion();
	let previewVideo = $state<HTMLVideoElement | undefined>();
	const currentMoment = $derived(moments[selectedMoment]);

	function transition(name: 'fast' | 'normal' = 'normal', essential = false) {
		return motionConfig.transition(name, reducedMotion.current, essential);
	}

	function togglePreview() {
		if (!previewVideo) return;
		if (previewVideo.paused) void previewVideo.play();
		else previewVideo.pause();
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
</script>

<div class="embedded-page">
	<div class="preview-surface">
		<div class="preview-frame">
			{#if currentMoment?.kind === 'video'}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					bind:this={previewVideo}
					src={backend.mediaUrl(currentMoment)}
					controls
					preload="metadata">
				</video>
			{:else if currentMoment}
				<img src={backend.mediaUrl(currentMoment)} alt={currentMoment.filename} />
			{:else}
				<div class="preview-placeholder">
					<FilmReelIcon size={44} />
					<p>Add a photo or video to see it here.</p>
				</div>
			{/if}
		</div>
		<div class="transport">
			<ActionTooltip
				class="icon-button"
				label="Play or pause preview"
				onclick={togglePreview}
				disabled={!previewVideo}>
				<PlayIcon size={24} weight="fill" />
			</ActionTooltip>
			<span>{selectedMoment + 1} of {moments.length} moments</span>
			<span class="transport-note">Tell the story</span>
		</div>
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
							<img src={backend.thumbUrl(voiceover)} alt={`Waveform for ${voiceover.filename}`} />
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
		<div class="timeline-ruler">
			<span>00:00</span>
			<span>00:20</span>
			<span>00:40</span>
			<span>01:00</span>
			<span>01:20</span>
		</div>
		<div class="track">
			<strong>Moments</strong>
			<motion.div
				class="clip-row"
				role="region"
				aria-label="Timeline moments. Use the mouse wheel or arrow keys to move across clips."
				onwheel={scrollTimeline}
				onkeydown={moveTimeline}
				tabindex="0">
				{#each moments as item, index (item.id)}
					<motion.button
						class={`timeline-clip ${selectedMoment === index ? 'selected' : ''}`}
						whileHover={reducedMotion.current ? {} : { y: -4 }}
						whileTap={reducedMotion.current ? {} : { scale: 0.96 }}
						transition={transition('fast')}
						onclick={() => onSelectMoment(index)}>
						<img src={backend.thumbUrl(item)} alt={item.filename} />
					</motion.button>
				{/each}
				{#if moments.length === 0}
					<button class="timeline-add" onclick={onOpenGather}>
						<PlusIcon size={20} />
					</button>
				{/if}
			</motion.div>
		</div>
		<div class="track">
			<strong>Voiceover</strong>
			<div class="audio-track">
				<WaveformIcon size={22} />
				<span>{voiceover?.filename ?? 'Choose a voiceover in Polish sound'}</span>
			</div>
		</div>
		<div class="track">
			<strong>Music</strong>
			<div class="music-track">Add and arrange music on its own track.</div>
		</div>
	</section>
</div>
