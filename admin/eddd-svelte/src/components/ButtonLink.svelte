<script>
  let { href = '', textColor = 'neutral-500', hoverText = 'neutral-100', svgContent = '' } = $props();
</script>

<a
  {href}
  class="rounded-md text-{textColor} p-2 hover:bg-{hoverText} transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 active:scale-95"
>
  {@html svgContent}
</a>
