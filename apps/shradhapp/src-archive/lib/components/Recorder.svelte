<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { backend } from '../backend';
	import { mediaStore } from '../../lib/stores.svelte';
	import { settingsStore } from '$lib/settings.svelte';
	import { fmtDur, timestampName } from '../utils';
	import type { CleanupResult, MediaItem } from '../backend/types';

	let recording = $state(false);
	let elapsed = $state(0);
	let rawItem = $state<MediaItem | null>(null);
	let cleaned = $state<CleanupResult | null>(null);
	let busy = $state(false);
	let error = $state<string | null>(null);
	let micDenied = $state(false);

	let recorder: MediaRecorder | null = null;
	let chunks: Blob[] = [];
	let stream: MediaStream | null = null;
	let timer: ReturnType<typeof setInterval> | null = null;
	let mimeType = '';

	function pickMime(): string {
		const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
		if (typeof MediaRecorder !== 'undefined') {
			for (const m of candidates) if (MediaRecorder.isTypeSupported(m)) return m;
		}
		return '';
	}

	function extFromMime(m: string): string {
		if (m.includes('mp4')) return 'm4a';
		if (m.includes('ogg')) return 'ogg';
		return 'webm';
	}

	async function start() {
		error = null;
		micDenied = false;
		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch {
			micDenied = true;
			return;
		}
		mimeType = pickMime();
		recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
		chunks = [];
		recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
		recorder.start(500);
		elapsed = 0;
		recording = true;
		timer = setInterval(() => (elapsed += 1), 1000);
	}

	function stop(): Promise<Blob> {
		return new Promise((resolve) => {
			if (!recorder) return resolve(new Blob());
			recorder.onstop = () => {
				stream?.getTracks().forEach((t) => t.stop());
				resolve(new Blob(chunks, { type: mimeType || 'audio/webm' }));
			};
			recorder.stop();
			if (timer) clearInterval(timer);
			recording = false;
		});
	}

	async function finishAndSave() {
		const blob = await stop();
		if (!blob.size) {
			error = 'Nothing was recorded.';
			return;
		}
		busy = true;
		cleaned = null;
		try {
			rawItem = await backend.saveRecording(
				blob,
				extFromMime(mimeType),
				timestampName('Voiceover')
			);
			if (settingsStore.settings.audio.defaultRepairMode === 'autoAfterRecording') {
				cleaned = await backend.repairAudioTicks(rawItem.id);
			}
			await mediaStore.load();
		} catch (e) {
			error = String(e);
		} finally {
			busy = false;
		}
	}

	async function cleanUp() {
		if (!rawItem) return;
		busy = true;
		error = null;
		try {
			cleaned = await backend.cleanupAudio(rawItem.id);
			await mediaStore.load();
		} catch (e) {
			error = String(e);
		} finally {
			busy = false;
		}
	}

	function reset() {
		rawItem = null;
		cleaned = null;
		error = null;
		elapsed = 0;
	}

	onDestroy(() => {
		if (timer) clearInterval(timer);
		stream?.getTracks().forEach((t) => t.stop());
	});

	onMount(() => {
		const onCommand = (event: Event) => {
			if ((event as CustomEvent<string>).detail === 'start-recording' && !recording && !busy)
				void start();
		};
		window.addEventListener('shradhapp:command', onCommand);
		return () => window.removeEventListener('shradhapp:command', onCommand);
	});
</script>

<div class="recorder">
	<div class="card panel">
		{#if !rawItem}
			<div class="center">
				<p class="hint">
					Press the big red button and talk. When you're done, press it again — your recording is
					saved into the Media Bank automatically.
				</p>
				<button
					class="bigrec"
					class:recording
					onclick={recording ? finishAndSave : start}
					disabled={busy}
					aria-label={recording ? 'Stop recording' : 'Start recording'}>
					{#if recording}⏹{:else}🎙️{/if}
				</button>
				<div class="status">
					{#if recording}
						<span class="dot"></span>
						Recording…
						<strong>{fmtDur(elapsed)}</strong>
					{:else if busy}
						Saving…
					{:else}
						Ready when you are
					{/if}
				</div>
				{#if micDenied}
					<p class="err">
						The microphone is blocked. Please allow microphone access for this app and try again.
					</p>
				{/if}
			</div>
		{:else}
			<h2>Your recording</h2>
			<div class="take">
				<div class="take-head">
					<strong>🎤 {rawItem.filename}</strong>
					<span class="muted">{fmtDur(cleaned ? cleaned.before_duration : rawItem.duration)}</span>
				</div>
				<audio src={backend.mediaUrl(rawItem)} controls preload="metadata"></audio>
				<p class="muted small">Original — saved in your Media Bank with the tag “voiceover”.</p>
			</div>

			{#if !cleaned}
				<button onclick={cleanUp} disabled={busy}>
					{busy ? 'Cleaning up…' : '✨ Clean up the sound'}
				</button>
				<p class="muted small">
					Removes background hiss, evens out the loudness, and trims silence at the start and end.
				</p>
			{:else}
				<div class="take cleaned">
					<div class="take-head">
						<strong>✨ {cleaned.cleaned.filename}</strong>
						<span class="muted">{fmtDur(cleaned.after_duration)}</span>
					</div>
					<audio src={backend.mediaUrl(cleaned.cleaned)} controls preload="metadata"></audio>
					<p class="ok small">
						Done! Before: {fmtDur(cleaned.before_duration)} → after: {fmtDur(
							cleaned.after_duration
						)}. Both versions are in your Media Bank.
					</p>
				</div>
			{/if}

			{#if error}<p class="err">⚠️ {error}</p>{/if}

			<button class="secondary" onclick={reset}>🎙️ Record another</button>
		{/if}
	</div>
</div>
