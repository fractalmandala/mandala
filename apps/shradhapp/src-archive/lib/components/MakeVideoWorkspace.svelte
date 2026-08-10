<script lang="ts">
	import TimelineEditorSpike from './TimelineEditorSpike.svelte';
	import Assembler from './Assembler.svelte';

	type MakeMode = 'editor' | 'assembler';

	let mode = $state<MakeMode>('editor');
</script>

<div class="video-workspace box h100">
	<div class="video-workspace-header row ycenter xbetween">
		<div class="video-workspace-tabs row ycenter">
			<button
				class="btn-std"
				class:active={mode === 'editor'}
				aria-pressed={mode === 'editor'}
				onclick={() => (mode = 'editor')}>
				Timeline editor
			</button>
			<button
				class="btn-std"
				class:active={mode === 'assembler'}
				aria-pressed={mode === 'assembler'}
				onclick={() => (mode = 'assembler')}>
				Quick assembler
			</button>
		</div>
		<span class="video-workspace-note text-sm">Build, arrange, preview and export videos</span>
	</div>
	<div class="sectioned" class:active={mode === 'editor'}>
		<TimelineEditorSpike />
	</div>
	<div class="sectioned" class:active={mode === 'assembler'}>
		<Assembler />
	</div>
</div>
