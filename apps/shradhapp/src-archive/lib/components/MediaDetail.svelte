<script lang="ts">
	import { backend } from '../backend';
	import { fmtDur, fmtDate, kindLabel } from '../utils';
	import type { MediaItem } from '../backend/types';

	let { item, onClose, onChanged, onDeleted } = $props<{
		item: MediaItem;
		onClose: () => void;
		onChanged: () => void | Promise<void>;
		onDeleted: () => void | Promise<void>;
	}>();

	let draftName = $state<string | null>(null);
	let draftNotes = $state<string | null>(null);
	let newTag = $state('');
	let busy = $state(false);
	let error = $state<string | null>(null);
	let confirmDelete = $state(false);

	const name = $derived(draftName ?? item.filename);
	const notes = $derived(draftNotes ?? item.notes);
	const playableUrl = $derived(backend.mediaUrl(item));

	async function saveName() {
		const n = name.trim();
		if (!n || n === item.filename) return;
		busy = true;
		try {
			await backend.renameMedia(item.id, n);
			draftName = null;
			await onChanged();
		} catch (e) {
			error = String(e);
		} finally {
			busy = false;
		}
	}

	async function saveTags(next: string[]) {
		try {
			await backend.setTags(item.id, next);
			await onChanged();
		} catch (e) {
			error = String(e);
		}
	}

	function addTag() {
		const t = newTag.trim().replace(/^#/, '').toLowerCase();
		if (t && !item.tags.includes(t)) saveTags([...item.tags, t]);
		newTag = '';
	}

	async function saveNotes() {
		if (notes === item.notes) return;
		try {
			await backend.setNotes(item.id, notes);
			draftNotes = null;
			await onChanged();
		} catch (e) {
			error = String(e);
		}
	}

	async function doDelete() {
		busy = true;
		try {
			await backend.deleteMedia(item.id);
			await onDeleted();
		} catch (e) {
			error = String(e);
			busy = false;
		}
	}
</script>

<aside class="card detail">
	<div class="head">
		<h2>{kindLabel(item.kind)} details</h2>
		<button class="ghost" onclick={onClose} aria-label="Close">✕</button>
	</div>

	<div class="preview">
		{#if item.kind === 'image'}
			<img src={playableUrl} alt={item.filename} />
		{:else if item.kind === 'video'}
			<!-- User-imported preview clips do not have caption tracks. -->
			<!-- svelte-ignore a11y_media_has_caption -->
			<video src={playableUrl} controls preload="metadata"></video>
		{:else}
			<img class="wave" src={backend.thumbUrl(item)} alt="" />
			<audio src={playableUrl} controls preload="metadata"></audio>
		{/if}
	</div>

	<div class="facts">
		<span>⏱ {fmtDur(item.duration)}</span>
		{#if item.width && item.height}<span>📐 {item.width}×{item.height}</span>{/if}
		<span>📅 {fmtDate(item.imported_at)}</span>
	</div>

	<label class="field">
		<span>Name</span>
		<div class="row">
			<input
				type="text"
				value={name}
				oninput={(e) => (draftName = e.currentTarget.value)}
				onkeydown={(e) => e.key === 'Enter' && saveName()} />
			<button class="secondary" onclick={saveName} disabled={busy || name.trim() === item.filename}>
				Rename
			</button>
		</div>
	</label>

	<div class="field">
		<span>Tags</span>
		<div class="chips">
			{#each item.tags as t (t)}
				<span class="chip">
					#{t}
					<button
						aria-label="Remove tag"
						onclick={() => saveTags(item.tags.filter((x) => x !== t))}>
						✕
					</button>
				</span>
			{/each}
			<input
				type="text"
				class="tag-input"
				placeholder="Add tag…"
				bind:value={newTag}
				onkeydown={(e) => e.key === 'Enter' && addTag()}
				onblur={addTag} />
		</div>
	</div>

	<label class="field">
		<span>Notes</span>
		<textarea
			rows="3"
			value={notes}
			oninput={(e) => (draftNotes = e.currentTarget.value)}
			onblur={saveNotes}
			placeholder="Anything to remember…"></textarea>
	</label>

	{#if error}<div class="err">⚠️ {error}</div>{/if}

	{#if confirmDelete}
		<div class="confirm">
			<p>
				Remove <strong>{item.filename}</strong>
				from the bank? The copy inside the app is deleted; your original file is untouched.
			</p>
			<div class="row">
				<button class="danger" onclick={doDelete} disabled={busy}>Yes, remove it</button>
				<button class="ghost" onclick={() => (confirmDelete = false)}>Keep it</button>
			</div>
		</div>
	{:else}
		<button class="danger" onclick={() => (confirmDelete = true)} disabled={busy}>
			Remove from bank
		</button>
	{/if}
</aside>
