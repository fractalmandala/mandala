<script lang="ts">
	import { annotations } from '../state/annotations.svelte';

	function pinStyle(x: number, y: number): string {
		return `left:${x}px;top:${y - window.scrollY}px;`;
	}
</script>

{#each annotations.items as annotation (annotation.id)}
	{@const position = annotation.snapshot.element.position}
	{#if position}
		<button
			type="button"
			class="shared-annotation-pin"
			class:active={annotations.selectedId === annotation.id}
			style={pinStyle(position.x, position.y)}
			aria-label={`Annotation by ${annotation.author}: ${annotation.snapshot.comment}`}
			onclick={() => annotations.select(annotation.id)}
		>
			{annotation.author.slice(0, 1).toUpperCase()}
		</button>
	{/if}
{/each}

{#if annotations.selected}
	{@const annotation = annotations.selected}
	<aside class="shared-annotation-card" aria-label="Shared annotation">
		<div class="shared-annotation-card-header">
			<strong>{annotation.author}</strong>
			<button type="button" class="btn-icon" aria-label="Close annotation" onclick={() => annotations.select(null)}>×</button>
		</div>
		<p>{annotation.snapshot.comment}</p>
		<small>{annotation.snapshot.targetLabel || annotation.snapshot.targetSummary}</small>
	</aside>
{/if}
