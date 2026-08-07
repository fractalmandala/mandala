<script lang="ts">

	let { collapsed = false } = $props()

</script>

<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.25 2.5H3.75C3.05964 2.5 2.5 3.05964 2.5 3.75V16.25C2.5 16.9404 3.05964 17.5 3.75 17.5H16.25C16.9404 17.5 17.5 16.9404 17.5 16.25V3.75C17.5 3.05964 16.9404 2.5 16.25 2.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
{#if !collapsed}
<path d="M7.5 2.5V17.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
{/if}
<path d="M4.58334 2.5H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4.58334 17.5H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path id="rotating" d="M13.3333 8.3335L11.6667 10.0002L13.3333 11.6668" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class:rotated={collapsed}/>
</svg>

<style>

#rotating {
	transform-origin: center center;
	transition: var(--transition-quick);
}

.rotated {
	transform: rotate(180deg);
}

</style>