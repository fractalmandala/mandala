<script lang="ts">
	import { onMount } from 'svelte';
	import { backend } from '../backend';
	import { mediaStore } from '../../lib/stores.svelte';
	import { fmtDur, kindEmoji, kindLabel } from '../utils';
	import type { MediaItem, MediaKind } from '../backend/types';
	import MediaDetail from './MediaDetail.svelte';
	import { VideoCameraIcon, ArticleIcon, ImagesIcon, MusicNotesIcon } from 'phosphor-svelte';

	type MediaBankProps = {
		initialMediaId?: string | null;
		onSelectedMediaChange?: (id: string) => void;
		onSelectedMediaClose?: () => void;
	};

	let {
		initialMediaId = null,
		onSelectedMediaChange,
		onSelectedMediaClose
	}: MediaBankProps = $props();

	let search = $state('');
	let kindFilter = $state<'all' | MediaKind>('all');
	let tagFilter = $state('');
	let selected = $state<MediaItem | null>(null);
	let dragOver = $state(false);
	let importing = $state(false);
	let importError = $state<string | null>(null);
	let handledInitialMediaId = $state<string | null>(null);

	$effect(() => {
		if (!initialMediaId) {
			handledInitialMediaId = null;
			return;
		}
		if (initialMediaId === handledInitialMediaId) return;
		const item = mediaStore.byId(initialMediaId);
		if (!item) return;
		selected = item;
		handledInitialMediaId = initialMediaId;
	});

	function selectMedia(item: MediaItem) {
		selected = item;
		onSelectedMediaChange?.(item.id);
	}

	function closeSelectedMedia() {
		selected = null;
		onSelectedMediaClose?.();
	}

	const allTags = $derived([...new Set(mediaStore.items.flatMap((i) => i.tags))].sort());

	const filtered = $derived(
		mediaStore.items.filter((i) => {
			if (kindFilter !== 'all' && i.kind !== kindFilter) return false;
			if (tagFilter && !i.tags.includes(tagFilter)) return false;
			if (search) {
				const q = search.toLowerCase();
				const hay = `${i.filename} ${i.tags.join(' ')} ${i.notes}`.toLowerCase();
				if (!hay.includes(q)) return false;
			}
			return true;
		})
	);

	async function doImport() {
		importing = true;
		importError = null;
		try {
			const res = await backend.pickImport();
			if (res && res.length) await mediaStore.load();
		} catch (e) {
			importError = String(e);
		} finally {
			importing = false;
		}
	}

	async function importPaths(paths: string[]) {
		importing = true;
		importError = null;
		try {
			const res = await backend.importDropped(paths);
			if (res.length) await mediaStore.load();
		} catch (e) {
			importError = String(e);
		} finally {
			importing = false;
			dragOver = false;
		}
	}

	// File drops arrive as native paths via the Tauri webview drag-drop event.
	onMount(() => {
		let unlisten: (() => void) | null = null;
		const onCommand = (event: Event) => {
			if ((event as CustomEvent<string>).detail === 'import-media') void doImport();
		};
		window.addEventListener('shradhapp:command', onCommand);
		import('@tauri-apps/api/webview').then(({ getCurrentWebview }) =>
			getCurrentWebview()
				.onDragDropEvent((event) => {
					const p = event.payload as { type: string; paths?: string[] };
					if (p.type === 'over') dragOver = true;
					else if (p.type === 'leave') dragOver = false;
					else if (p.type === 'drop' && p.paths) importPaths(p.paths);
				})
				.then((u) => (unlisten = u))
		);
		return () => {
			unlisten?.();
			window.removeEventListener('shradhapp:command', onCommand);
		};
	});

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
	}

	const kindButtons: { id: 'all' | MediaKind; label: string; icon: typeof VideoCameraIcon }[] = [
		{ id: 'all', label: 'Everything', icon: ArticleIcon },
		{ id: 'video', label: 'Videos', icon: VideoCameraIcon },
		{ id: 'image', label: 'Photos', icon: ImagesIcon },
		{ id: 'audio', label: 'Audio', icon: MusicNotesIcon }
	];
</script>

<div
	class="box media-library"
	class:dragover={dragOver}
	role="region"
	aria-label="Media bank"
	ondragover={(e) => {
		e.preventDefault();
		dragOver = true;
	}}
	ondragleave={() => (dragOver = false)}
	ondrop={onDrop}>
	<div class="toolbar row gap32">
		<button class="btn-std" onclick={doImport} disabled={importing}>
			{importing ? 'Importing…' : '➕ Add videos, photos or audio'}
		</button>
		<div class="row gap32">
			{#each kindButtons as k (k.id)}
				{@const Icon = k.icon}
				<button
					class="btn-icon-text"
					class:active={kindFilter === k.id}
					onclick={() => (kindFilter = k.id)}>
					<Icon size={20} weight="bold" />
					<span class="btn-text">{k.label}</span>
				</button>
			{/each}
			{#if allTags.length}
				<select bind:value={tagFilter} aria-label="Filter by tag">
					<option value="">All tags</option>
					{#each allTags as t (t)}
						<option value={t}>#{t}</option>
					{/each}
				</select>
			{/if}
		</div>
		<input
			type="text"
			placeholder="Search by name, tag or note…"
			bind:value={search}
			class="search" />
	</div>

	{#if importError}
		<div class="error-banner">⚠️ {importError}</div>
	{/if}

	<div class="content">
		<div class="grid-wrap">
			{#if !mediaStore.loaded}
				<p class="muted">Loading your media…</p>
			{:else if filtered.length === 0}
				<div class="empty">
					<p class="big">📥</p>
					<h2>Nothing here yet</h2>
					<p class="muted">
						Drag files onto this window, or click <strong>Add videos, photos or audio</strong>
						above.
					</p>
				</div>
			{:else}
				<div class="grid">
					{#each filtered as item (item.id)}
						<button
							class="btn-std"
							class:sel={selected?.id === item.id}
							onclick={() => selectMedia(item)}>
							<div class="thumb">
								<img src={backend.thumbUrl(item)} alt="" loading="lazy" />
								<span class="badge {item.kind}">{kindLabel(item.kind)}</span>
								{#if item.duration != null}
									<span class="dur">{fmtDur(item.duration)}</span>
								{/if}
							</div>
							<div class="meta">
								<div class="name" title={item.filename}>
									{kindEmoji(item.kind)}
									{item.filename}
								</div>
								{#if item.tags.length}
									<div class="tags">{item.tags.map((t) => `#${t}`).join(' ')}</div>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		{#if selected}
			{#key selected.id}
				<MediaDetail
					item={selected}
					onClose={closeSelectedMedia}
					onChanged={async () => {
						const id = selected?.id;
						await mediaStore.load();
						selected = id ? (mediaStore.byId(id) ?? null) : null;
					}}
					onDeleted={async () => {
						closeSelectedMedia();
						await mediaStore.load();
					}} />
			{/key}
		{/if}
	</div>

	{#if dragOver}
		<div class="drop-hint">Drop files to add them to your Media Bank</div>
	{/if}
</div>
