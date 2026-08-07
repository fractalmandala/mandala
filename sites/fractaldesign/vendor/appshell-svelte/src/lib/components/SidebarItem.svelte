<script lang="ts">
  export let label = 'Sidebar Item';
  export let href = '#';
  export let active = false;
  export let emphasis = false;
</script>

<a class:active class:emphasis href={href}>{label}</a>

<style>
  a { display: flex; align-items: center; width: fit-content; height: 24px; padding: 4px 8px; border-radius: 6px; color: #000; font-size: 13px; font-weight: 400; letter-spacing: -0.13px; line-height: 16px; text-decoration: none; white-space: nowrap; }
  a:hover, a.active { background: var(--shell-soft); }
  a.emphasis { font-size: 14px; line-height: 18px; }
</style>
