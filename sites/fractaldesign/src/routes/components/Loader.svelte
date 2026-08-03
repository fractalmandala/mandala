<script lang="ts">
  let {
    size = 16,
    class: className = '',
    ...rest
  }: {
    size?: number;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<span class="loader {className}" style="--loader-size: {size}px" role="status" aria-label="Loading" {...rest}>
  <svg class="loader-icon" viewBox="0 0 16 16" aria-hidden="true" fill="none">
    <path class="loader-spoke" style="opacity: 1.0" d="M8 1.5V3" />
    <path class="loader-spoke" style="opacity: 0.5" d="M8 13V14.5" />
    <path class="loader-spoke" style="opacity: 0.9" d="M3.35 3.35L4.4 4.4" />
    <path class="loader-spoke" style="opacity: 0.1" d="M11.6 11.6L12.65 12.65" />
    <path class="loader-spoke" style="opacity: 0.4" d="M1.5 8H3" />
    <path class="loader-spoke" style="opacity: 0.6" d="M13 8H14.5" />
    <path class="loader-spoke" style="opacity: 0.2" d="M4.4 11.6L3.35 12.65" />
    <path class="loader-spoke" style="opacity: 0.7" d="M12.65 3.35L11.6 4.4" />
  </svg>
</span>

<style lang="sass">
  .loader
    display: inline-flex
    align-items: center
    justify-content: center
    animation: loader-spin 0.8s linear infinite

    @keyframes loader-spin
      to
        transform: rotate(360deg)

    @media (prefers-reduced-motion: reduce)
      animation-duration: 3s

  .loader-icon
    width: var(--loader-size, 1rem)
    height: var(--loader-size, 1rem)
    stroke-linejoin: round
    color: currentColor

  .loader-spoke
    stroke: currentColor
    stroke-width: 1.5
    fill: none
    vector-effect: non-scaling-stroke
</style>
