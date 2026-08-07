<script lang="ts">
  let {
    src,
    alt = '',
    preview = false,
    zoomable = false,
    class: className = '',
    ...rest
  }: {
    src?: string;
    alt?: string;
    preview?: boolean;
    zoomable?: boolean;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<img
  class="image {preview ? 'image--preview' : ''} {zoomable ? 'image--zoomable' : ''} {className}"
  {src}
  {alt}
  {...rest}
/>

<style lang="sass">
  .image
    display: block
    max-width: 100%
    height: auto
    overflow: hidden
    border-radius: 0.375rem
    background-color: transparent
    object-fit: contain

    &.image--preview
      max-height: 22rem
      object-fit: cover

    &.image--zoomable
      cursor: zoom-in
      transition: transform 200ms ease, box-shadow 200ms ease
      &:hover
        transform: scale(1.01)
        box-shadow: 0 4px 12px hsl(0 0% 0% / 0.12)
</style>
