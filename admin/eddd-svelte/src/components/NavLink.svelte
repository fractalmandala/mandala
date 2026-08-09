<script>
  let { href = '', text = '', active = false } = $props();
</script>

<a
  {href}
  class="px-3 py-1.5 text-sm rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 {active
    ? 'text-green-700 bg-green-50 dark:bg-green-950/40 font-medium dark:text-green-400'
    : 'text-neutral-600 dark:text-neutral-400 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40'}"
>
  {text}
</a>
