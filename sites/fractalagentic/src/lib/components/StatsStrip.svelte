<script lang="ts">
	let { stats }: { stats: { value: string; label: string }[] } = $props();
</script>

<div class="stats-strip row wrap gap40">
	{#each stats as stat (stat.label)}
		<div class="stat">
			<span class="value">{stat.value}</span>
			<span class="label">{stat.label}</span>
		</div>
	{/each}
</div>
