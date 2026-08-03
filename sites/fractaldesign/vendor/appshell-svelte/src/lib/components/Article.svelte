<script lang="ts">
  import Body from './Body.svelte';
  import PageTitleArea from './PageTitleArea.svelte';

  export let title = 'Page Title';
  export let sectionTitle = 'Header 2';
  export let sectionText = 'veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
</script>

<article>
  <PageTitleArea {title} />
  <Body />
  <section class="chapter" id="header-2"><h2>{sectionTitle}</h2><p>{sectionText}</p></section>
  <nav class="bottom-nav" aria-label="Document pagination">
    <a href="#previous"><strong>Previous Document</strong><span>← <small>prev</small></span></a>
    <a href="#next" class="next"><strong>Next Document</strong><span><small>next</small> →</span></a>
  </nav>
</article>

<style>
  article { display: flex; flex: 0 1 600px; flex-direction: column; gap: 32px; width: min(600px, 100%); min-width: 0; height: 100%; padding: 64px 0; overflow: auto; }
  .chapter { display: flex; flex-direction: column; gap: 12px; width: 100%; padding-bottom: 50px; }
  h2 { margin: 0; color: #000; font-size: 19px; font-weight: 700; letter-spacing: -0.38px; line-height: 30px; }
  p { margin: 0; color: #121212; font-size: 15px; letter-spacing: -0.3px; line-height: 24px; }
  .bottom-nav { display: flex; align-items: flex-start; justify-content: space-between; width: 100%; min-height: 62px; padding: 20px 0 10px; border-top: 1px solid var(--shell-border); }
  .bottom-nav a { display: flex; flex-direction: column; gap: 2px; color: #121212; font-size: 14px; line-height: 15px; text-decoration: none; }
  .bottom-nav span { color: var(--shell-accent); font-size: 15px; }
  .bottom-nav small { color: #646464; font-size: 11px; }
  .bottom-nav .next { align-items: flex-end; }
  @media (max-width: 900px) { article { padding: 48px 24px; } }
  @media (max-width: 600px) { article { padding: 36px 20px; } }
</style>
