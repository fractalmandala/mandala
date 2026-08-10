<script lang="ts">
	import { WaveformIcon } from 'phosphor-svelte';
	import type { MediaItem } from '$lib/backend/types';
	import Recorder from './Recorder.svelte';

	interface Props {
		audioMedia: MediaItem[];
		voiceoverMediaId: string | null;
		showVoiceoverSelector: boolean;
		onSetVoiceover: (id: string) => void;
		onReviewVoiceover: () => void;
	}

	let {
		audioMedia,
		voiceoverMediaId,
		showVoiceoverSelector,
		onSetVoiceover,
		onReviewVoiceover
	}: Props = $props();
</script>

<Recorder />
{#if showVoiceoverSelector && audioMedia.length}
	<label class="eyebrow" for="voiceover">Voiceover</label>
	<select
		id="voiceover"
		value={voiceoverMediaId ?? ''}
		onchange={(event) => onSetVoiceover(event.currentTarget.value)}>
		<option value="">No voiceover yet</option>
		{#each audioMedia as item (item.id)}
			<option value={item.id}>
				{item.filename}
			</option>
		{/each}
	</select>
	<button class="button button-quiet" onclick={onReviewVoiceover}>
		<WaveformIcon size={16} /> Review voiceover
	</button>
{/if}
