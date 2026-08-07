<script lang="ts">
	let { label, onRestore }: { label: string; onRestore: () => void } = $props();
</script>

<div class="checkpoint-row">
	<span class="checkpoint-line"></span>
	<button class="checkpoint-btn" onclick={onRestore} title="Restore conversation to this checkpoint">
		<span class="checkpoint-dot"></span>
		<span class="checkpoint-label">{label}</span>
		<span class="checkpoint-action">Restore</span>
	</button>
	<span class="checkpoint-line"></span>
</div>
