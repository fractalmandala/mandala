<script lang="ts">

	let { collapsed = false } = $props()

</script>

<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.5 3.75C2.5 3.05965 3.05965 2.5 3.75 2.5H16.25C16.9404 2.5 17.5 3.05965 17.5 3.75V16.25C17.5 16.9404 16.9404 17.5 16.25 17.5H3.75C3.05965 17.5 2.5 16.9404 2.5 16.25V3.75Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
{#if !collapsed}
<path d="M13.3333 2.5V17.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
{/if}
<path id="rotating" d="M6.66669 8.3335L8.33335 10.0002L6.66669 11.6668" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class:rotated={collapsed}/>
<path d="M10.8333 2.5H15.8333" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.8333 17.5H15.8333" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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