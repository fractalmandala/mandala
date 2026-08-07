<script lang="ts">

	let { activated = false } = $props();
	import devModels from '$lib/modules/dev/devmodels.json'
	import TheTeam from '$lib/modules/dev/items/meetTheTeam.svelte'

</script>

{#if activated}
<div class="w100 h100 xcenter ycenter box gap16">
	<h2 class="w500" style="font-family: Google Sans Flex, sans-serif">the Team Behind Fracta</h2>
	<div class="grid grid-cols-5 team-meet gap8">
		{#each devModels as dev}
			<div class="box pad16 gap8 ta-c">
				<img class="jittergo team-image" src="{dev.image}" alt={dev.name}/>
				<span class="text-bs">{dev.name}</span>
			</div>
		{/each}
	</div>
</div>
{/if}