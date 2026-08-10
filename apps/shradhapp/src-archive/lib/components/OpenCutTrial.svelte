<script lang="ts">
	import { browser } from '$app/environment';

	const openCutUrl = 'https://opencut.app/projects';

	function openStandalone() {
		if (!browser) return;
		window.open(openCutUrl, '_blank', 'noopener,noreferrer');
	}
</script>

<div class="video-editor-shell box">
	<div class="video-editor-status row ycenter xbetween">
		<span>OpenCut classic trial running from opencut.app</span>
		<button class="btn-std" type="button" onclick={openStandalone}>Open standalone</button>
	</div>
	<div class="video-editor-frame">
		{#if browser}
			<iframe
				title="OpenCut classic video editor trial"
				src={openCutUrl}
				allow="autoplay; clipboard-read; clipboard-write; fullscreen; camera; microphone"
				referrerpolicy="no-referrer"
				style="display: block; width: 100%; height: 100%; border: 0; background: var(--color00);">
			</iframe>
		{:else}
			<p style="margin: 0; padding: 16px; color: var(--text-secondary);">
				Loading OpenCut trial...
			</p>
		{/if}
	</div>
</div>
