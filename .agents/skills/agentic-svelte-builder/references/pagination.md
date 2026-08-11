# Pagination (Tier 2 Native Component)

The **Pagination** component renders page selection controls natively using HTML `<a>` links (`?page=N`), styled with **`fractals-styler`** primitives (`row`, `ycenter`, `gap4`, `width36`, `height36`, `radius6`, `bdr`, `text-sm`, `bold`).

---

## Component Code (`Pagination.svelte`)

```svelte
<script lang="ts">
  type Props = {
    currentPage: number;
    totalPages: number;
    baseUrl?: string; // e.g. "/items"
  };

  let { currentPage = 1, totalPages = 10, baseUrl = '' }: Props = $props();

  let pages = $derived(Array.from({ length: totalPages }, (_, i) => i + 1));
</script>

<nav class="[ pagination ]" aria-label="Pagination Navigation">
  <ul class="[ pagination__list ] [ row ycenter gap4 margin0 pad0 ]">
    <li>
      <a
        href="{baseUrl}?page={Math.max(1, currentPage - 1)}"
        class="[ pagination__link ] [ row ycenter xcenter width36 height36 radius6 bdr text-sm bold ]"
        class:pagination__link--disabled={currentPage === 1}
        aria-label="Previous Page"
      >
        &laquo;
      </a>
    </li>

    {#each pages as page}
      <li>
        <a
          href="{baseUrl}?page={page}"
          class="[ pagination__link ] [ row ycenter xcenter width36 height36 radius6 bdr text-sm bold ]"
          class:pagination__link--active={page === currentPage}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </a>
      </li>
    {/each}

    <li>
      <a
        href="{baseUrl}?page={Math.min(totalPages, currentPage + 1)}"
        class="[ pagination__link ] [ row ycenter xcenter width36 height36 radius6 bdr text-sm bold ]"
        class:pagination__link--disabled={currentPage === totalPages}
        aria-label="Next Page"
      >
        &raquo;
      </a>
    </li>
  </ul>
</nav>

<style lang="sass">
  .pagination
    &__list
      list-style: none

    &__link
      color: var(--foreground10, #0f172a)
      text-decoration: none
      border-color: var(--border, #cbd5e1)
      background-color: var(--background10, #ffffff)
      transition: background-color 0.15s ease

      &:hover:not(&--disabled)
        background-color: var(--background20, #f1f5f9)

      &--active
        background-color: var(--brand-primary, #2563eb)
        color: #ffffff
        border-color: var(--brand-primary, #2563eb)

      &--disabled
        opacity: 0.5
        pointer-events: none
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Pagination from './Pagination.svelte';
</script>

<Pagination currentPage={2} totalPages={5} baseUrl="/products" />
```
