<script lang="ts">
	import { useMessages } from '../../i18n/messages.js';
	import { cn } from '../../utils.js';
	import { onDestroy } from 'svelte';
	import { Film, Image as ImageIcon, Music, X } from '@lucide/svelte';
	import type { BinItem } from '../../types/timeline.js';
	import { Button, ContextMenu, Tooltip } from '../atoms/index.js';
	import { useTimelineEditor } from '../../core/state.svelte.js';
	import { formatDuration, pxToFrame } from '../../core/geometry.js';

	const t = useMessages();
	const editor = useTimelineEditor();
	const POINTER_DRAG_THRESHOLD = 6;

	type Props = {
		item: BinItem;
		thumbUrl?: string;
		onRemove: (itemId: string) => void;
		onAddToTimeline: (item: BinItem) => void;
	};

	let { item, thumbUrl, onRemove, onAddToTimeline }: Props = $props();
	let dragging = $state(false);
	let pointerStart:
		| {
				id: number;
				x: number;
				y: number;
				metaKey: boolean;
				ctrlKey: boolean;
		  }
		| null = null;

	function targetAtPoint(x: number, y: number): HTMLElement | null {
		for (const el of document.elementsFromPoint(x, y)) {
			if (!(el instanceof HTMLElement)) continue;
			const track = el.closest<HTMLElement>('[data-timeline-track-id]');
			if (track) return track;
			const preview = el.closest<HTMLElement>('[data-preview-drop]');
			if (preview) return preview;
		}
		return null;
	}

	function firstUnlockedTrackId(): string | null {
		return editor.project.tracks.find((track) => !track.locked)?.id ?? null;
	}

	function addAtPoint(e: PointerEvent) {
		const target = targetAtPoint(e.clientX, e.clientY);
		if (!target) return;

		const targetTrackId = target.dataset.timelineTrackId ?? firstUnlockedTrackId();
		const targetTrack = editor.project.tracks.find((track) => track.id === targetTrackId);
		if (!targetTrack || targetTrack.locked) return;

		const atF = target.dataset.timelineTrackId
			? pxToFrame(e.clientX - target.getBoundingClientRect().left, editor.project.fps, editor.project.zoom)
			: editor.playheadF;
		editor.addClipFromBin(item, targetTrack.id, atF, e.metaKey || e.ctrlKey);
	}

	function clearPointerDrag() {
		pointerStart = null;
		dragging = false;
		document.body.style.cursor = '';
		window.removeEventListener('pointermove', onWindowPointerMove);
		window.removeEventListener('pointerup', onWindowPointerUp);
		window.removeEventListener('pointercancel', clearPointerDrag);
	}

	function onWindowPointerMove(e: PointerEvent) {
		if (!pointerStart || e.pointerId !== pointerStart.id) return;
		const dx = e.clientX - pointerStart.x;
		const dy = e.clientY - pointerStart.y;
		if (!dragging && Math.hypot(dx, dy) >= POINTER_DRAG_THRESHOLD) {
			dragging = true;
			document.body.style.cursor = 'copy';
		}
		if (dragging) e.preventDefault();
	}

	function onWindowPointerUp(e: PointerEvent) {
		if (!pointerStart || e.pointerId !== pointerStart.id) return;
		if (dragging) {
			e.preventDefault();
			addAtPoint(e);
		}
		clearPointerDrag();
	}

	function onPointerDown(e: PointerEvent) {
		if (e.button !== 0) return;
		if (e.target instanceof Element && e.target.closest('button')) return;
		pointerStart = {
			id: e.pointerId,
			x: e.clientX,
			y: e.clientY,
			metaKey: e.metaKey,
			ctrlKey: e.ctrlKey
		};
		window.addEventListener('pointermove', onWindowPointerMove, { passive: false });
		window.addEventListener('pointerup', onWindowPointerUp);
		window.addEventListener('pointercancel', clearPointerDrag);
	}

	onDestroy(clearPointerDrag);
</script>

<ContextMenu>
	{#snippet trigger({ props })}
		<div
			{...props}
			role="listitem"
			draggable="false"
			class={cn(
				'group relative cursor-grab overflow-hidden rounded-md border bg-muted/40 active:cursor-grabbing',
				dragging && 'opacity-60 ring-2 ring-primary'
			)}
			onpointerdown={onPointerDown}
		>
			<div class="pointer-events-none absolute top-1 left-1 z-10 rounded bg-black/60 p-0.5 text-white">
				{#if item.mediaType === 'video'}
					<Film class="size-3" />
				{:else if item.mediaType === 'audio'}
					<Music class="size-3" />
				{:else}
					<ImageIcon class="size-3" />
				{/if}
			</div>
			<div class="pointer-events-none flex aspect-video items-center justify-center overflow-hidden">
				{#if item.mediaType === 'audio'}
					<Music class="size-5 text-muted-foreground" />
				{:else if item.mediaType === 'video' && !thumbUrl}
					<Film class="size-5 text-muted-foreground" />
				{:else}
					<img
						src={thumbUrl ?? item.url}
						alt={item.name}
						class="h-full w-full object-cover"
						loading="lazy"
						draggable="false"
					/>
				{/if}
			</div>
			<div class="pointer-events-none flex items-center gap-1 px-1.5 py-1">
				<span class="truncate text-[10px] text-muted-foreground">{item.name}</span>
				{#if item.duration !== null}
					<span
						class={cn(
							'ml-auto shrink-0 rounded bg-background/80 px-1 text-[10px] tabular-nums',
							'text-muted-foreground'
						)}
					>
						{formatDuration(item.duration)}
					</span>
				{/if}
			</div>
			<Tooltip text={t.removeFromBin}>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="secondary"
						size="icon"
						class="absolute top-1 right-1 size-5 opacity-0 transition-opacity group-hover:opacity-100"
						aria-label={t.removeFromBin}
						onclick={() => onRemove(item.id)}
					>
						<X class="size-3" />
					</Button>
				{/snippet}
			</Tooltip>
		</div>
	{/snippet}

	{#snippet content({ item: menuItem, separator })}
		{#snippet addToTimeline()}{t.addToTimeline}{/snippet}
		{@render menuItem({
			children: addToTimeline,
			onclick: () => onAddToTimeline(item)
		})}
		{@render separator()}
		{#snippet remove()}{t.removeFromBin}{/snippet}
		{@render menuItem({
			children: remove,
			onclick: () => onRemove(item.id),
			variant: 'destructive'
		})}
	{/snippet}
</ContextMenu>
