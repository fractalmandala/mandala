<script lang="ts">
  import "../app.css";
  import { browser } from '$app/environment';
	import { Agentation } from 'fractal-agentation'
	import type { Annotation, AnnotationPayload } from 'fractal-agentation'
  let { children } = $props();

	function handleAnnotationAdd(annotation: Annotation) {
		console.log('New annotation added:', annotation);
	}

	function handleCopy(markdown: string, payload: AnnotationPayload) {
		console.log('Notes copied:', markdown, payload);
	}

</script>

{#if browser}
	<Agentation onAnnotationAdd={handleAnnotationAdd} onCopy={handleCopy} />
{/if}

{@render children()}
