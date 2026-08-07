<script lang="ts">
  let {
    open = false,
    type = 'fade' as const,
    title,
    onclose,
    class: className = '',
    children,
    ...rest
  }: {
    open?: boolean;
    type?: 'fade' | 'scale' | 'slide' | 'blur';
    title?: string;
    onclose?: () => void;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose?.();
  }
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
  <div class="modal-dialog-overlay {className}" role="presentation" onclick={onclose} data-type={type}>
    <div class="modal-dialog" data-type={type} role="dialog" aria-modal="true" aria-label={title} onclick={(e) => e.stopPropagation()} {...rest}>
      {#if title}
        <div class="modal-dialog__header">
          <h3 class="modal-dialog__title">{title}</h3>
          <button class="modal-dialog__close" type="button" aria-label="Close" onclick={onclose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      {/if}
      <div class="modal-dialog__body">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}

<style lang="sass">
  .modal-dialog-overlay
    position: fixed
    inset: 0
    z-index: 100
    display: flex
    align-items: center
    justify-content: center
    background-color: hsl(0 0% 0% / 0.5)
    backdrop-filter: blur(2px)
    -webkit-backdrop-filter: blur(2px)
    animation: overlay-in 200ms ease-out forwards

    &[data-type="blur"]
      backdrop-filter: blur(8px)
      -webkit-backdrop-filter: blur(8px)

  .modal-dialog
    position: relative
    width: calc(100% - 2rem)
    max-width: 28rem
    max-height: 85vh
    background-color: hsl(0 0% 100%)
    border-radius: 0.75rem
    box-shadow: 0 25px 50px -12px hsl(0 0% 0% / 0.25)
    overflow: hidden
    display: flex
    flex-direction: column

    &[data-type="fade"]
      animation: modal-fade-in 200ms ease-out forwards
    &[data-type="scale"]
      animation: modal-scale-in 250ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards
    &[data-type="slide"]
      animation: modal-slide-in 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards
    &[data-type="blur"]
      animation: modal-fade-in 300ms ease-out forwards

    &__header
      display: flex
      align-items: center
      justify-content: space-between
      padding: 1rem 1.5rem
      border-bottom: 1px solid hsl(214 32% 91%)

    &__title
      margin: 0
      font-size: 1.125rem
      font-weight: 600

    &__close
      display: inline-flex
      align-items: center
      justify-content: center
      width: 2rem
      height: 2rem
      border: none
      border-radius: 0.375rem
      background: transparent
      color: hsl(215 16% 47%)
      cursor: pointer
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)
      &:hover
        background-color: hsl(210 40% 96%)

    &__body
      padding: 1.5rem
      overflow-y: auto

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      color: hsl(210 40% 98%)
      &__header
        border-bottom-color: hsl(217 33% 17%)
      &__close:hover
        background-color: hsl(217 33% 17%)

  @keyframes overlay-in
    from
      opacity: 0
    to
      opacity: 1

  @keyframes modal-fade-in
    from
      opacity: 0
    to
      opacity: 1

  @keyframes modal-scale-in
    from
      opacity: 0
      transform: scale(0.9)
    to
      opacity: 1
      transform: scale(1)

  @keyframes modal-slide-in
    from
      opacity: 0
      transform: translateY(30px)
    to
      opacity: 1
      transform: translateY(0)
</style>
