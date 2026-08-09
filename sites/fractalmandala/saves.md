```
<nav class="box rgap16" aria-label="Contents">
  {#each data.accordionData as item, index}
    <div class="accordion-item box" class:active={openIndex === index}>
      <button
        type="button"
        class="accordion-trigger row ycenter gap8 w100 text-sm text-left"
        class:active={openIndex === index}
        onclick={() => toggleAccordion(index)}
        aria-expanded={openIndex === index}
      >
        <img class="bankicon" src="/images/bankicon.png" alt="" />
        <span class="sidebar-bank-label text-sm fw500">{item.bankName}</span>
      </button>
      {#if openIndex === index}
        <div class="accordion-content" transition:slide={{ duration: 250 }}>
          {#if item.posts.length === 0}
            <span class="empty-msg muted text-sm muted">No posts found.</span>
          {:else}
            <ul class="sidebar-items-list box gap8 padtop8">
              {#each item.posts as post, i}
                <li
                  in:fly={{
                    y: 12,
                    duration: ANIM_DURATION,
                    delay: BASE_DELAY + i * STAGGER_MS,
                    easing: backOut,
                  }}
                >
                  <a
                    class="text-sm sec"
                    href="/{item.route}/{post.slug}"
                    onclick={() => (mobileOpen = false)}
                  >
                    {post.title || post.slug}
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/if}
    </div>
  {/each}
  <div class="accordion-item box">
    <a
      class="accordion-trigger row ycenter gap8 w100 text-sm"
      href="/tags"
      onclick={() => (mobileOpen = false)}
    >
      <img class="bankicon" src="/images/bankicon.png" alt="" />
      <span class="sidebar-bank-label">Tags</span>
    </a>
  </div>
  <div class="row ycenter gap8 padtop32 padleft8">
    <button class="blank icon-box" aria-label="GitHub">
      <img src="/images/icon-git.png" alt="github" class="icon16" />
    </button>
    <button class="blank icon-box" aria-label="Twitter">
      <img src="/images/icon-twitter.png" alt="twitter" class="icon16" />
    </button>
  </div>
</nav>
```

```
{#if toc.items.length >= 2}
  <nav class="box rgap8" aria-label="On this page">
    <span class="text-sm tt-c muted">On this page</span>
    {#each toc.items as h (h.id)}
      <a
        class="text-md blank link"
        class:padleft8={h.level === 3}
        class:link={toc.activeId === h.id}
        href="#{h.id}"
        onclick={(e) => {
          e.preventDefault();
          toc.goTo(h.id);
        }}
      >
        <span class="sec">{h.text}</span>
      </a>
    {/each}
  </nav>
{/if}
{#if sidebarExtras.alsoSee.length > 0}
  {#if toc.items.length >= 2}
    <div class="bdr-top padtop16"></div>
  {/if}
  <nav class="box rgap8" aria-label="Also See">
    <span class="text-sm tt-c muted">Also See:</span>
    {#each sidebarExtras.alsoSee as link}
      <a class="text-md blank link" href={link.href}>
        <span class="sec">{link.label}</span>
      </a>
    {/each}
  </nav>
{/if}
```