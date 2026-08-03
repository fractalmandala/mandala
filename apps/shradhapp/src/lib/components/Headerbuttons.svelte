<script lang="ts">
	import { MonitorPlayIcon, MicrophoneIcon, FilmReelIcon } from 'phosphor-svelte';
</script>

<div class="row gap24">
	<button class="btn-icon-text">
		<MonitorPlayIcon size={20} />
		<span class="btn-text text-md">Media Bank</span>
	</button>
	<button class="btn-icon-text">
		<MicrophoneIcon size={20} />
		<span class="btn-text text-md">Record Audio</span>
	</button>
	<button class="btn-icon-text">
		<FilmReelIcon size={20} />
		<span class="btn-text text-md">Make Video</span>
	</button>
</div>
