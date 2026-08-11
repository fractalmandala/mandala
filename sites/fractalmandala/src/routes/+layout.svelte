<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import type { LayoutData } from "./$types";
  import "$lib/styles/index.sass";
  import "virtual:fractals-styler.css";
  import { themeState, toggleThemeState } from "$lib/utils/globalstores";
  import Sun from "$lib/comps/icon-sun.svelte";
  import Moon from "$lib/comps/icon-moon.svelte";
  import Search from "$lib/comps/search.svelte";
  import { page } from "$app/state";
  import { DocsSidebar } from "@acrolls/docs";

  let { data, children } = $props<{ data: LayoutData; children: any }>();
  let openIndex = $state<number | null>(null);

  // Staggered reveal for accordion post lists
  const STAGGER_MS = 40;
  const BASE_DELAY = 100;
  const ANIM_DURATION = 350;

  function toggleAccordion(index: number) {
    openIndex = openIndex === index ? null : index;
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="appwrapper">
  <header class="appheader row xbetween w100">
    <a class="row ycenter gap8" href="/">
      <img class="logomotif" src="/images/logomotif.png" alt="site logo" />
      <img class="logotype logotype-light" src="/images/logotype-black.png" alt="site logo type" />
      <img class="logotype logotype-dark" src="/images/logotype-white.png" alt="site logo type" />
    </a>
    <div class="row ycenter gap16">
      <div class="desktop-only">
        <Search />
      </div>
      <button
        class="blank icon-box"
        onclick={toggleThemeState}
        aria-label="Toggle theme"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {#if $themeState}
            <Sun color="var(--text-secondary)" />
          {:else}
            <Moon color="var(--text-secondary)" />
          {/if}
        </svg>
      </button>
    </div>
  </header>
  <main class="appbody">
    <aside class="sidebarleft">
    
    </aside>
    <section>
      {@render children()}
    </section>
    <aside class="sidebarright">

    </aside>
  </main>
</div>
