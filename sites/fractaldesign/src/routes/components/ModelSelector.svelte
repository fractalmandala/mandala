<script lang="ts">
  import ModelSelectorItem from './ModelSelectorItem.svelte';

  let {
    selected,
    models = [] as Array<{id: string; name: string}>,
    onselect,
    class: className = '',
    children,
    ...rest
  }: {
    selected?: string;
    models?: Array<{id: string; name: string}>;
    onselect?: (id: string) => void;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="model-selector {className}" role="listbox" aria-label="Select model" {...rest}>
  {#each models as model}
    <ModelSelectorItem
      name={model.name}
      selected={selected === model.id}
      onclick={() => onselect?.(model.id)}
    />
  {/each}
  {@render children?.()}
</div>

<style lang="sass">
  .model-selector
    display: flex
    flex-direction: column
    gap: 0.125rem
    padding: 0.25rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.5rem
    background-color: hsl(0 0% 100%)
    box-shadow: 0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
    min-width: 12rem

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)
</style>
