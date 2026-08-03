<script lang="ts">
  export let label = 'Header 1';
  export let href = '#';
  export let active = false;
</script>

<a class:active href={href}>{label}</a>

<style>
  a { display: flex; align-items: center; width: 100%; min-height: 24px; color: #1d1d1d; font-size: 12px; font-weight: 500; letter-spacing: -0.14px; line-height: 19px; text-decoration: none; }
  a:hover, a.active { color: var(--shell-accent); }
</style>
