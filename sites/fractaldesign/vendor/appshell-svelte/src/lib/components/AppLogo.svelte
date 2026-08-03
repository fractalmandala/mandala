<script lang="ts">
  import logoUrl from '../assets/fractal-agentic-logo.png';

  export let href = '/';
  export let first = 'fractal';
  export let second = 'agentic';
</script>

<a class="logo" {href} aria-label={`${first}${second} home`}>
  <img src={logoUrl} alt="" />
  <span class="wordmark"><span>{first}</span><span class="accent">{second}</span></span>
</a>

<style>
  .logo { display: flex; align-items: center; gap: 8px; color: #000; text-decoration: none; }
  img { width: 32px; height: 32px; object-fit: cover; }
  .wordmark { display: flex; font-size: 16px; font-weight: 700; letter-spacing: -1px; line-height: 20px; }
  .accent { color: var(--shell-accent); }
</style>
