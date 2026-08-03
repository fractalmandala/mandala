<script lang="ts">

  import type { Snippet } from 'svelte';
	interface Props {
		paddingtop?: string;	
		paddingbottom?: string;
		limited?: boolean;
		children?: Snippet;
	}

	let { children, paddingtop = "0", paddingbottom = "0", limited = true}: Props = $props();
</script>

<section class="box site-padding" style="padding-top: {paddingtop}px; padding-bottom: {paddingbottom}px">
	<div class="insider" class:limited={limited}>
		{#if children}{@render children()}{/if}
	</div>
</section>