<script>
  import { useSvelteFlow } from '@xyflow/svelte';
  let { token } = $props();
  const { fitView } = useSvelteFlow();
  $effect(() => {
    token;
    const t = setTimeout(() => fitView({ padding: 0.12, duration: 350 }), 60);
    return () => clearTimeout(t);
  });
</script>