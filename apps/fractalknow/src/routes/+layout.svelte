<script lang="ts">
  import { browser, dev } from '$app/environment';
  import { Agentation } from 'fractal-agentation';

  let { children } = $props();

  const workspaceRoot = '/Users/amrit/mandala';
</script>

{@render children?.()}

{#if browser}
  <Agentation {workspaceRoot} />
{/if}
