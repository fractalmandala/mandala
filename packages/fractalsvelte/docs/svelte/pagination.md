---
title: Pagination
description: A Pagination component leveraging **SvelteKit** `goto()` for seamless client-side SPA navigation without full page reloads, powered by **Svelte 5 Runes** (`$derived`, `$props`).
---


## Component Implementation (`Pagination.svelte`)

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  type Props = {
    totalPages: number;
    paramName?: string; // Query param name e.g. "page"
  };

  let { totalPages = 10, paramName = 'page' }: Props = $props();

  // Reactive derived current page from SvelteKit page state
  let currentPage = $derived(
    Number(page.url.searchParams.get(paramName)) || 1
  );

  let pages = $derived(Array.from({ length: totalPages }, (_, i) => i + 1));

  function navigateTo(p: number) {
    const url = new URL(page.url);
    url.searchParams.set(paramName, String(p));
    goto(url.toString(), { keepFocus: true, noScroll: true });
  }
</script>

<nav class="[ pagination ]" aria-label="Pagination Navigation">
  <ul class="[ pagination__list ] [ row ycenter gap4 margin0 pad0 ]">
    <li>
      <button
        class="[ pagination__btn ] [ row ycenter xcenter width36 height36 radius6 bdr text-sm bold ]"
        disabled={currentPage === 1}
        onclick={() => navigateTo(currentPage - 1)}
        aria-label="Previous Page"
      >
        &laquo;
      </button>
    </li>

    {#each pages as p}
      <li>
        <button
          class="[ pagination__btn ] [ row ycenter xcenter width36 height36 radius6 bdr text-sm bold ]"
          class:pagination__btn--active={p === currentPage}
          onclick={() => navigateTo(p)}
          aria-current={p === currentPage ? 'page' : undefined}
        >
          {p}
        </button>
      </li>
    {/each}

    <li>
      <button
        class="[ pagination__btn ] [ row ycenter xcenter width36 height36 radius6 bdr text-sm bold ]"
        disabled={currentPage === totalPages}
        onclick={() => navigateTo(currentPage + 1)}
        aria-label="Next Page"
      >
        &raquo;
      </button>
    </li>
  </ul>
</nav>

<style lang="sass">
  .pagination__list
    list-style: none

  .pagination__btn
    cursor: pointer
    color: var(--foreground10, #0f172a)
    border-color: var(--border, #cbd5e1)
    background-color: var(--background10, #ffffff)
    transition: background-color 0.15s ease

    &:hover:not(:disabled)
      background-color: var(--background20, #f1f5f9)

    &--active
      background-color: var(--brand-primary, #2563eb) !important
      color: #ffffff !important
      border-color: var(--brand-primary, #2563eb) !important

    &:disabled
      opacity: 0.5
      cursor: not-allowed
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Pagination from './Pagination.svelte';
</script>

<Pagination totalPages={5} />
```
