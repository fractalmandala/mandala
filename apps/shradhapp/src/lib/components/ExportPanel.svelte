<script lang="ts">
	import { DownloadSimpleIcon } from 'phosphor-svelte';
	import type { ExportPreset } from '$lib/backend/types';

	interface Props {
		preset: ExportPreset;
		onPresetChange: (preset: ExportPreset) => void;
		onOpenExport: () => void;
	}

	let { preset, onPresetChange, onOpenExport }: Props = $props();
</script>

<p class="eyebrow">Export</p>
<p class="rail-empty">Choose a size, then save your finished video.</p>
<div class="export-choices">
	<button
		class:active={preset === 'mp4-full'}
		class="choice"
		onclick={() => onPresetChange('mp4-full')}>
		<strong>Full quality</strong>
		<small>1080p</small>
	</button>
	<button
		class:active={preset === 'mp4-small'}
		class="choice"
		onclick={() => onPresetChange('mp4-small')}>
		<strong>Small</strong>
		<small>Easy to send</small>
	</button>
</div>
<button class="button button-primary" onclick={onOpenExport}>
	<DownloadSimpleIcon size={16} /> Export video
</button>
