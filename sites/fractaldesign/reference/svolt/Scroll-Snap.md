---
created: 2026-06-22T23:47:19 (UTC +05:30)
tags: []
source: https://sveltoui.dev/animations/scroll-snap
author: SveltoUI
---

# Scroll Snap

> ## Excerpt
> Browse Scroll Snap components for Svelte 5. Animation components you can copy into your project.

---
ScrollSnap01.svelte

```
<!-- @free -->
<!-- @medium -->
<!-- @description Scroll Snap - Horizontal Card Carousel -->
<!-- Scroll Snap - Horizontal Card Carousel -->
<script>
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";

  let scrollContainer;

  function scrollLeft() {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
    scrollContainer?.scrollBy({ left: -320, behavior });
  }

  function scrollRight() {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
    scrollContainer?.scrollBy({ left: 320, behavior });
  }

  function handleKeyDown(e) {
    if (!scrollContainer) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = reducedMotion ? 'auto' : 'smooth';

    switch(e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        scrollContainer.scrollBy({ left: -320, behavior });
        break;
      case 'ArrowRight':
        e.preventDefault();
        scrollContainer.scrollBy({ left: 320, behavior });
        break;
      case 'Home':
        e.preventDefault();
        scrollContainer.scrollTo({ left: 0, behavior });
        break;
      case 'End':
        e.preventDefault();
        scrollContainer.scrollTo({
          left: scrollContainer.scrollWidth,
          behavior
        });
        break;
    }
  }

  const cards = [
    { title: "Mountain Retreat", location: "Swiss Alps", price: "$250/night", image: "photo-1506905925346-21bda4d32df4" },
    { title: "Beach Paradise", location: "Maldives", price: "$450/night", image: "photo-1514282401047-d79a71a590e8" },
    { title: "City Loft", location: "New York", price: "$180/night", image: "photo-1502672260266-1c1ef2d93688" },
    { title: "Forest Cabin", location: "Oregon", price: "$120/night", image: "photo-1449158743715-0a90ebb6d2d8" },
    { title: "Desert Oasis", location: "Morocco", price: "$200/night", image: "photo-1489749798305-4fea3ae63d43" },
  ];
</script>

<div
  role="region"
  aria-roledescription="carousel"
  aria-label="Featured accommodations"
  class="relative max-w-3xl"
>
  <!-- Navigation Buttons -->
  <button
    onclick={scrollLeft}
    aria-label="Scroll to previous cards"
    aria-controls="card-carousel"
    class="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-4 flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border shadow-lg hover:bg-muted transition-colors"
  >
    <ChevronLeft class="h-5 w-5" aria-hidden="true" />
  </button>

  <button
    onclick={scrollRight}
    aria-label="Scroll to next cards"
    aria-controls="card-carousel"
    class="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-4 flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border shadow-lg hover:bg-muted transition-colors"
  >
    <ChevronRight class="h-5 w-5" aria-hidden="true" />
  </button>

  <!-- Scrollable Container -->
  <div
    bind:this={scrollContainer}
    id="card-carousel"
    onkeydown={handleKeyDown}
    tabindex="0"
    role="group"
    aria-label="Scrollable accommodations, use arrow keys to navigate"
    class="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scroll-container pb-4"
    style="scrollbar-width: none; -ms-overflow-style: none;"
  >
    {#each cards as card}
      <div class="flex-shrink-0 w-72 snap-start">
        <div class="group overflow-hidden rounded-xl border border-border bg-card">
          <div class="aspect-[4/3] overflow-hidden">
            <img
              src="https://images.unsplash.com/{card.image}?w=400&h=300&fit=crop"
              alt="{card.title} accommodation in {card.location}"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div class="p-4">
            <h3 class="font-semibold">{card.title}</h3>
            <p class="text-sm text-muted-foreground">{card.location}</p>
            <p class="mt-2 font-medium text-primary">{card.price}</p>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .scroll-container::-webkit-scrollbar {
    display: none;
  }

  button:focus-visible {
    outline: 2px solid hsl(var(--primary));
    outline-offset: 2px;
    border-radius: var(--badge-radius);
  }

  .scroll-container:focus-visible {
    outline: 2px solid hsl(var(--primary));
    outline-offset: -2px;
    border-radius: 0.75rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .scroll-smooth {
      scroll-behavior: auto !important;
    }

    img {
      transition: none !important;
    }

    .group:hover img {
      transform: none !important;
    }
  }
</style>
```
