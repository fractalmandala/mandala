<script lang="ts">
	let {
		query = $bindable(''),
		active = $bindable(''),
		chips = []
	}: {
		query?: string;
		active?: string;
		chips?: string[];
	} = $props();

	function toggle(chip: string) {
		active = active === chip ? '' : chip;
	}
</script>

<div class="filter-bar">
	<input
		class="filter-input"
		type="search"
		placeholder="Filter by name or keyword…"
		aria-label="Filter entries"
		bind:value={query}
	/>
	{#if chips.length > 0}
		<div class="chip-row">
			<button
				class="chip-btn"
				class:active={active === ''}
				type="button"
				onclick={() => (active = '')}
			>
				all
			</button>
			{#each chips as chip (chip)}
				<button
					class="chip-btn"
					class:active={active === chip}
					type="button"
					onclick={() => toggle(chip)}
				>
					{chip}
				</button>
			{/each}
		</div>
	{/if}
</div>
