<script lang="ts">
	interface Props {
		statsLabel?: string;
	}

	let { statsLabel = '' }: Props = $props();
</script>

<footer class="site-footer">
	<div class="site-footer__inner">
		<span>Fractal Agentic docs — bosses, orchestration, armory, wiki.</span>
		{#if statsLabel}
			<span class="site-footer__stats">{statsLabel}</span>
		{/if}
	</div>
</footer>
