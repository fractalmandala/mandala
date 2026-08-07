<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { mediaAssetUrl, mediaGetThumbnail, mediaSaveVideoThumbnail, mediaSetVideoProbe } from '$lib/ipc';
	import type { MediaItem } from '../types';
	import { media } from '../state/media.svelte';
	interface Props { item: MediaItem; selected: boolean; onSelect: (event: MouseEvent) => void }
	let { item, selected, onSelect }: Props = $props();
	let thumbnail = $state('');
	let observed = $state<HTMLElement | null>(null);
	let hovering = $state(false);
	$effect(() => { thumbnail = item.thumbnail ?? ''; });
	onMount(() => { const observer = new IntersectionObserver(entries => { if (entries[0]?.isIntersecting) void loadThumbnail(); }); if (observed) observer.observe(observed); return () => observer.disconnect(); });
	async function captureVideoThumbnail() {
		const video = document.createElement('video'); video.src = mediaAssetUrl(item.relPath); video.muted = true; video.preload = 'metadata';
		await new Promise<void>((resolve, reject) => { video.onloadedmetadata = () => { video.currentTime = Math.min(1, Math.max(0, video.duration / 4)); }; video.onseeked = () => resolve(); video.onerror = () => reject(new Error('Unable to read video')); });
		const canvas = document.createElement('canvas'); canvas.width = Math.max(1, video.videoWidth); canvas.height = Math.max(1, video.videoHeight); canvas.getContext('2d')?.drawImage(video, 0, 0);
		const dataUrl = canvas.toDataURL('image/jpeg', 0.8); thumbnail = await mediaSaveVideoThumbnail(item.id, dataUrl.split(',')[1] ?? ''); await mediaSetVideoProbe(item.id, video.videoWidth, video.videoHeight, Math.round(video.duration * 1000));
	}
	async function loadThumbnail() { if (thumbnail || item.ext === 'svg' || item.ext === 'ico') { thumbnail ||= mediaAssetUrl(item.relPath); return; } try { if (item.kind === 'video') await captureVideoThumbnail(); else thumbnail = await mediaGetThumbnail(item.id, media.thumbSize); } catch { thumbnail = mediaAssetUrl(item.relPath); } }
</script>

<button bind:this={observed} class="media-card" class:selected draggable="true" ondragstart={event => event.dataTransfer?.setData('application/x-fractal-media-paths', item.relPath)} onclick={onSelect} onmouseenter={() => hovering = true} onmouseleave={() => hovering = false} aria-label={`Select ${item.name}`}>
	<div class="media-card-thumb">
		{#if item.kind === 'video' && hovering}<video muted autoplay loop src={mediaAssetUrl(item.relPath)}></video>{:else if item.kind === 'gif' && hovering}<img src={mediaAssetUrl(item.relPath)} alt="" />{:else if thumbnail}<img src={thumbnail} alt="" />{:else}<span>Loading…</span>{/if}
		<span class="media-kind">{item.kind}</span>{#if item.pinned}<span class="media-pin">●</span>{/if}
	</div>
	<span class="media-card-name">{item.name}</span>{#if item.tags.length}<span class="media-tag-count">{item.tags.length} tags</span>{/if}
</button>
