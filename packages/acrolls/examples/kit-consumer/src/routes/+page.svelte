<script lang="ts">
	import Article from '../content/index.md';
	import { Callout, Figure } from '@acrolls/svelte';
</script>

<svelte:head>
	<title>Peer state · Acrolls example</title>
</svelte:head>

<Article />

<!-- Extra primitives demo (host composition outside the md module) -->
<section class="extra">
	<div class="acrolls">
		<Callout variant="insight" title="Host composition">
			<p>
				You can also compose <code>Callout</code>, <code>Figure</code>, and friends in
				<code>.svelte</code> routes — not only inside mdsvex files.
			</p>
		</Callout>
		<Figure caption="Placeholder figure for the example host.">
			<img
				src="https://placehold.co/800x320/f0efe8/171714?text=Acrolls+figure"
				alt="Placeholder diagram for Acrolls figure demo"
			/>
		</Figure>
	</div>
</section>

<style>
	.extra {
		max-width: 70ch;
		margin: 2rem auto 0;
	}
</style>
