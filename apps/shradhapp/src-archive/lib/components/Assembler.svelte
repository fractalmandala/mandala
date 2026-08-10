<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { backend } from '../backend';
	import { mediaStore } from '../../lib/stores.svelte';
	import { UndoStack, snapshotCommand } from '../undo.svelte';
	import { fmtDur, fmtDate, kindEmoji, sanitizeFileName, clone } from '../utils';
	import { isProjectDataV2, projectV2ToV1 } from '$lib/timeline/mapper';
	import type { Clip, ExportPreset, MediaItem, ProjectData, ProjectRecord } from '../backend/types';

	const IMAGE_DEFAULT_LEN = 3;

	// ---------------- state ----------------
	let projects = $state<ProjectRecord[]>([]);
	let current = $state<ProjectRecord | null>(null);
	let data = $state<ProjectData | null>(null);
	let loading = $state(false);
	let newName = $state('');
	let showNew = $state(false);

	let previewIdx = $state<number | null>(null);

	const undo = new UndoStack();
	let saveTimer: ReturnType<typeof setTimeout> | null = null;
	let flashTimer: ReturnType<typeof setTimeout> | null = null;
	let savedFlash = $state(false);

	// export state
	let preset = $state<ExportPreset>('mp4-full');
	let keepAudio = $state(true);
	let exporting = $state(false);
	let exportPct = $state(0);
	let exportStage = $state('');
	let exportMsg = $state<{ ok: boolean; text: string } | null>(null);
	let exportId = '';

	// ---------------- helpers ----------------
	function mediaFor(id: string): MediaItem | undefined {
		return mediaStore.byId(id);
	}
	function clipDur(c: Clip): number {
		return Math.max(0, c.trim_end - c.trim_start);
	}
	const totalDur = $derived(data ? data.clips.reduce((s, c) => s + clipDur(c), 0) : 0);
	const audioItems = $derived(mediaStore.items.filter((i) => i.kind === 'audio'));
	const bankClips = $derived(mediaStore.items.filter((i) => i.kind !== 'audio'));

	/** Apply an undoable mutation: snapshot before/after, push a real command. */
	function mutate(label: string, fn: (d: ProjectData) => void) {
		if (!data) return;
		const before = clone(data);
		fn(data);
		data.updated_at = Date.now();
		const after = clone(data);
		undo.record(snapshotCommand(label, before, after, (v) => (data = v)));
		scheduleAutosave();
	}

	function doUndo() {
		if (undo.undo()) scheduleAutosave();
	}
	function doRedo() {
		if (undo.redo()) scheduleAutosave();
	}

	// ---------------- projects ----------------
	async function loadProjects(selectId?: string) {
		loading = true;
		try {
			projects = await backend.listProjects();
			if (selectId) {
				const p = projects.find((x) => x.id === selectId);
				if (p) openProject(p);
			}
		} finally {
			loading = false;
		}
	}

	function openProject(p: ProjectRecord) {
		clearPendingSave();
		current = p;
		data = clone(isProjectDataV2(p.data) ? projectV2ToV1(p.data) : p.data);
		undo.clear();
		previewIdx = null;
		exportMsg = null;
	}

	function projectClipCount(p: ProjectRecord): number {
		return isProjectDataV2(p.data)
			? p.data.timeline.tracks.reduce((sum, track) => sum + track.clips.length, 0)
			: p.data.clips.length;
	}

	async function createProject() {
		const name = newName.trim() || 'Untitled video';
		const rec = await backend.createProject(name);
		newName = '';
		showNew = false;
		await loadProjects(rec.id);
	}

	async function duplicateProject(id: string) {
		const rec = await backend.duplicateProject(id);
		await loadProjects(rec.id);
	}

	async function deleteProject(id: string) {
		await backend.deleteProject(id);
		if (current?.id === id) {
			current = null;
			data = null;
		}
		await loadProjects();
	}

	async function renameProject(name: string) {
		if (!data) return;
		mutate('Rename project', (d) => (d.name = name));
	}

	// ---------------- autosave (debounced) ----------------
	function clearPendingSave() {
		if (saveTimer) {
			clearTimeout(saveTimer);
			saveTimer = null;
		}
	}

	function showSavedFlash() {
		savedFlash = true;
		if (flashTimer) clearTimeout(flashTimer);
		flashTimer = setTimeout(() => {
			savedFlash = false;
			flashTimer = null;
		}, 1500);
	}

	function scheduleAutosave() {
		if (!data || !current) return;
		const snapshot = clone(data);
		const projectId = current.id;
		clearPendingSave();
		saveTimer = setTimeout(async () => {
			saveTimer = null;
			try {
				await backend.updateProject(projectId, snapshot);
				showSavedFlash();
			} catch {
				/* surfaced on next action */
			}
		}, 600);
	}

	// ---------------- clip operations ----------------
	function addClip(m: MediaItem) {
		if (!data) return;
		mutate(`Add “${m.filename}”`, (d) => {
			const end = m.kind === 'image' ? IMAGE_DEFAULT_LEN : (m.duration ?? 0);
			d.clips.push({ media_id: m.id, trim_start: 0, trim_end: Math.max(0.1, end) });
		});
	}

	function removeClip(ix: number) {
		if (!data) return;
		const m = mediaFor(data.clips[ix].media_id);
		mutate(`Remove “${m?.filename ?? 'clip'}”`, (d) => {
			d.clips.splice(ix, 1);
		});
		if (previewIdx === ix) previewIdx = null;
	}

	function moveClip(ix: number, dir: -1 | 1) {
		if (!data) return;
		const j = ix + dir;
		if (j < 0 || j >= data.clips.length) return;
		mutate('Reorder clips', (d) => {
			const [c] = d.clips.splice(ix, 1);
			d.clips.splice(j, 0, c);
		});
	}

	function setTrim(ix: number, field: 'trim_start' | 'trim_end', raw: number) {
		if (!data || !isFinite(raw)) return;
		const c = data.clips[ix];
		const m = mediaFor(c.media_id);
		const maxLen = m?.kind === 'image' ? 600 : (m?.duration ?? 3600);
		let v = Math.min(Math.max(0, raw), maxLen);
		if (field === 'trim_start') v = Math.min(v, c.trim_end - 0.1);
		else v = Math.max(v, c.trim_start + 0.1);
		if (Math.abs(v - c[field]) < 0.001) return;
		mutate('Adjust trim', (d) => {
			d.clips[ix][field] = Math.round(v * 10) / 10;
		});
	}

	function setImageLen(ix: number, raw: number) {
		if (!data || !isFinite(raw)) return;
		const v = Math.min(Math.max(0.5, raw), 600);
		mutate('Change photo length', (d) => {
			d.clips[ix].trim_start = 0;
			d.clips[ix].trim_end = Math.round(v * 10) / 10;
		});
	}

	function setVoiceover(id: string | null) {
		mutate('Change voiceover', (d) => (d.voiceover_media_id = id));
	}

	// ---------------- preview ----------------
	function onPreviewMeta(el: HTMLVideoElement) {
		if (previewIdx == null || !data) return;
		el.currentTime = data.clips[previewIdx].trim_start;
	}
	function onPreviewTime(el: HTMLVideoElement) {
		if (previewIdx == null || !data) return;
		if (el.currentTime >= data.clips[previewIdx].trim_end) el.pause();
	}

	// ---------------- export ----------------
	const presetInfo: Record<ExportPreset, { label: string; desc: string; ext: string }> = {
		'mp4-full': { label: 'MP4 — Full quality (1080p)', desc: 'Best for TV & keeping', ext: 'mp4' },
		'mp4-small': {
			label: 'MP4 — Small (for WhatsApp)',
			desc: 'Smaller file, easy to send',
			ext: 'mp4'
		},
		mov: { label: 'MOV', desc: 'For Apple apps that ask for it', ext: 'mov' }
	};

	async function doExport() {
		if (!data || !current || exporting) return;
		exportMsg = null;
		if (data.clips.length === 0) {
			exportMsg = { ok: false, text: 'Add at least one clip first.' };
			return;
		}
		// flush autosave so the exported data matches what is stored
		await backend.updateProject(current.id, clone(data));

		const ext = presetInfo[preset].ext;
		const outPath = await backend.pickSavePath(sanitizeFileName(data.name), ext);
		if (!outPath) return;

		exportId = crypto.randomUUID();
		exporting = true;
		exportPct = 0;
		exportStage = 'Starting…';
		try {
			await backend.exportProject(exportId, clone(data), preset, keepAudio, outPath);
			exportMsg = { ok: true, text: `Finished! Your video was saved to: ${outPath}` };
		} catch (e) {
			const s = String(e);
			exportMsg = { ok: false, text: s.toLowerCase().includes('cancel') ? 'Export cancelled.' : s };
		} finally {
			exporting = false;
		}
	}

	onMount(() => {
		loadProjects();
		const off = backend.onExportProgress((p) => {
			if (p.id !== exportId) return;
			exportPct = p.percent;
			exportStage = p.stage;
		});
		return off;
	});

	onDestroy(() => {
		clearPendingSave();
		if (flashTimer) clearTimeout(flashTimer);
	});
</script>

<div class="assembler">
	<!-- projects sidebar -->
	<aside class="card projects">
		<div class="p-head">
			<h2>Your videos</h2>
			<button class="btn-std" onclick={() => (showNew = !showNew)}>＋ New</button>
		</div>
		{#if showNew}
			<div class="new-box">
				<input
					type="text"
					placeholder="Name, e.g. Lily's birthday"
					bind:value={newName}
					onkeydown={(e) => e.key === 'Enter' && createProject()} />
				<button class="btn-std" onclick={createProject}>Create</button>
			</div>
		{/if}
		<div class="p-list">
			{#if loading}
				<p class="muted">Loading…</p>
			{:else if projects.length === 0}
				<p class="muted">No videos yet. Click “＋ New” to start one.</p>
			{:else}
				{#each projects as p (p.id)}
					<div class="p-row" class:on={current?.id === p.id}>
						<button class="btn-std p-open" onclick={() => openProject(p)}>
							<span class="p-name">{p.name}</span>
							<span class="muted small">{projectClipCount(p)} clips · {fmtDate(p.updated_at)}</span>
						</button>
						<div class="p-actions">
							<button class="btn-std" title="Duplicate" onclick={() => duplicateProject(p.id)}>
								⧉
							</button>
							<button class="btn-std" title="Delete" onclick={() => deleteProject(p.id)}>🗑</button>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</aside>

	{#if !data || !current}
		<div class="placeholder">
			<p class="big">🎬</p>
			<h2>Pick a video on the left, or start a new one</h2>
			<p class="muted">Arrange your clips, add a voiceover, and press Export.</p>
		</div>
	{:else}
		<div class="editor">
			<div class="e-head">
				<input
					class="title"
					type="text"
					value={data.name}
					oninput={(e) => renameProject((e.target as HTMLInputElement).value)} />
				<div class="e-tools">
					<button class="btn-std" onclick={doUndo} disabled={!undo.canUndo} title="Undo">
						↩️ Undo
					</button>
					<button class="btn-std" onclick={doRedo} disabled={!undo.canRedo} title="Redo">
						↪️ Redo
					</button>
					<span class="total">
						Total: <strong>{fmtDur(totalDur)}</strong>
					</span>
					{#if savedFlash}<span class="saved">✓ Saved</span>{/if}
				</div>
			</div>

			<!-- clip list -->
			<div class="clips card">
				{#if data.clips.length === 0}
					<p class="muted pad">Your video is empty. Add clips from your Media Bank below 👇</p>
				{:else}
					{#each data.clips as clip, ix (ix)}
						{@const m = mediaFor(clip.media_id)}
						<div class="clip">
							<span class="num">{ix + 1}</span>
							{#if m}
								<img class="c-thumb" src={backend.thumbUrl(m)} alt="" />
								<div class="c-main">
									<div class="c-name">{kindEmoji(m.kind)} {m.filename}</div>
									{#if m.kind === 'image'}
										<div class="c-trim">
											Show photo for
											<input
												type="number"
												min="0.5"
												step="0.5"
												value={clip.trim_end}
												onchange={(e) =>
													setImageLen(ix, parseFloat((e.target as HTMLInputElement).value))} />
											seconds
										</div>
									{:else}
										<div class="c-trim">
											from
											<input
												type="number"
												min="0"
												step="0.1"
												value={clip.trim_start}
												onchange={(e) =>
													setTrim(
														ix,
														'trim_start',
														parseFloat((e.target as HTMLInputElement).value)
													)} />
											to
											<input
												type="number"
												min="0"
												step="0.1"
												value={clip.trim_end}
												onchange={(e) =>
													setTrim(
														ix,
														'trim_end',
														parseFloat((e.target as HTMLInputElement).value)
													)} />
											s
											<span class="muted small">
												(of {fmtDur(m.duration)} → uses {fmtDur(clipDur(clip))})
											</span>
										</div>
									{/if}
								</div>
							{:else}
								<div class="c-main missing">⚠️ This media was removed from the bank</div>
							{/if}
							<div class="c-btns">
								<button
									class="btn-std"
									title="Play this clip"
									onclick={() => (previewIdx = previewIdx === ix ? null : ix)}>
									▶
								</button>
								<button
									class="btn-std"
									title="Move up"
									disabled={ix === 0}
									onclick={() => moveClip(ix, -1)}>
									↑
								</button>
								<button
									class="btn-std"
									title="Move down"
									disabled={ix === data.clips.length - 1}
									onclick={() => moveClip(ix, 1)}>
									↓
								</button>
								<button class="btn-std" title="Remove" onclick={() => removeClip(ix)}>✕</button>
							</div>
						</div>
						{#if previewIdx === ix && m}
							<div class="preview">
								{#if m.kind === 'image'}
									<img src={backend.mediaUrl(m)} alt={m.filename} />
									<p class="muted small">Photos show for {clip.trim_end}s in the video.</p>
								{:else}
									<!-- User-imported preview clips do not have caption tracks. -->
									<!-- svelte-ignore a11y_media_has_caption -->
									<video
										src={backend.mediaUrl(m)}
										controls
										autoplay
										onloadedmetadata={(e) => onPreviewMeta(e.currentTarget)}
										ontimeupdate={(e) => onPreviewTime(e.currentTarget)}>
									</video>
									<p class="muted small">
										Playing the trimmed part: {clip.trim_start}s → {clip.trim_end}s
									</p>
								{/if}
							</div>
						{/if}
					{/each}
				{/if}
			</div>

			<!-- add from bank -->
			<div class="add-bank card">
				<h3>Add from your Media Bank</h3>
				{#if bankClips.length === 0}
					<p class="muted">
						Your bank has no videos or photos yet — add some in the Media Bank tab.
					</p>
				{:else}
					<div class="bank-strip">
						{#each bankClips as m (m.id)}
							<div class="strip-item">
								<img src={backend.thumbUrl(m)} alt="" />
								<div class="s-name" title={m.filename}>{m.filename}</div>
								<button class="btn-std" onclick={() => addClip(m)}>＋ Add</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- voiceover + export -->
			<div class="finish card">
				<div class="vo">
					<h3>
						Voiceover <span class="muted small">(optional)</span>
					</h3>
					<select
						value={data.voiceover_media_id ?? ''}
						onchange={(e) => {
							const v = (e.target as HTMLSelectElement).value;
							setVoiceover(v === '' ? null : v);
						}}>
						<option value="">No voiceover</option>
						{#each audioItems as a (a.id)}
							<option value={a.id}>🎵 {a.filename} ({fmtDur(a.duration)})</option>
						{/each}
					</select>
					<label class="keep">
						<input
							type="checkbox"
							checked={keepAudio}
							onchange={(e) => (keepAudio = (e.target as HTMLInputElement).checked)} />
						Keep the original sound of the clips
					</label>
				</div>

				<div class="export">
					<h3>Export</h3>
					<div class="presets">
						{#each Object.entries(presetInfo) as [key, p] (key)}
							<button
								class="btn-std preset"
								class:on={preset === key}
								onclick={() => (preset = key as ExportPreset)}>
								<strong>{p.label}</strong>
								<span class="small">{p.desc}</span>
							</button>
						{/each}
					</div>

					{#if exporting}
						<div class="progress">
							<div class="bar"><div class="fill" style:width="{exportPct}%"></div></div>
							<div class="p-row2">
								<span>{exportStage} — {exportPct}%</span>
								<button class="btn-std" onclick={() => backend.cancelExport(exportId)}>
									Cancel
								</button>
							</div>
						</div>
					{:else}
						<button
							class="btn-std export-btn"
							onclick={doExport}
							disabled={data.clips.length === 0}>
							💾 Export “{data.name}”
						</button>
					{/if}

					{#if exportMsg}
						<p class:ok={exportMsg.ok} class:err={!exportMsg.ok} class="msg">{exportMsg.text}</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
