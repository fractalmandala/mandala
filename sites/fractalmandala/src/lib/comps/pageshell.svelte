<script lang="ts">

  import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		asides?: Snippet;
	}

	let {
		children,
		asides
	}: Props = $props();

</script>

<section class="page-wrapper">
	<div class="page-grid">
		<section class="page-content">
			<article class="note box gap32">
				{@render children()}
			</article>
		</section>
		<aside class="right-sidebar box">
			{#if asides}
				{@render asides()}
			{/if}
		</aside>
	</div>
</section>