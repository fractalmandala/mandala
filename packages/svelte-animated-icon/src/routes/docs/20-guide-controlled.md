---
title: Parent-Controlled Animation
id: 20
group: guides-and-advanced
description: "Bind animation to your own state (toggles, selection, async status)."
---

`trigger="controlled"` decouples the animation from mouse events and ties it to a boolean you control. This is the right mode whenever the animation reflects **state**, not a direct user gesture.

## The shape

```svelte
<SomeIcon trigger="controlled" active={someBoolean} />
```

When `someBoolean` flips to `true`, the animation runs. When it flips to `false`, the animation is cancelled and the icon returns to its rest state. The transition is automatic - no method calls required.

## Toggle pattern

```svelte
<script>
  import { ArrowRight } from 'svelte-animated-icon/phosphor';
  let isOpen = $state(false);
</script>

<button onclick={() => (isOpen = !isOpen)}>
  {isOpen ? 'Close' : 'Open'}
  <ArrowRight template="flip" trigger="controlled" active={isOpen} />
</button>
```

Click the button → arrow flips to point left → click again → flips back. The animation timing is built into `flip`; you only flip the boolean.

## Selection pattern

```svelte
<script>
  import { Gear, Bell, User } from 'svelte-animated-icon/phosphor';

  let activeTab = $state<'settings' | 'notifications' | 'profile'>('settings');

  const tabs = [
    { id: 'settings',      icon: Gear,  label: 'Settings' },
    { id: 'notifications', icon: Bell,  label: 'Notifications' },
    { id: 'profile',       icon: User,  label: 'Profile' }
  ] as const;
</script>

<nav>
  {#each tabs as t}
    <button onclick={() => (activeTab = t.id)}>
      <t.icon
        template="jelly"
        trigger="controlled"
        active={activeTab === t.id}
      />
      {t.label}
    </button>
  {/each}
</nav>
```

The icon "jelly"s on whichever tab you pick. Nothing animates on hover - feedback is reserved for the active selection.

## Async status pattern

```svelte
<script>
  import { Gear, Check, X } from 'svelte-animated-icon/phosphor';

  type Status = 'idle' | 'loading' | 'success' | 'error';
  let status = $state<Status>('idle');

  async function save() {
    status = 'loading';
    try {
      await api.save();
      status = 'success';
    } catch {
      status = 'error';
    }
  }
</script>

<button onclick={save} disabled={status === 'loading'}>
  {#if status === 'loading'}
    <Gear template="iris" trigger="controlled" active={true} loop size={20} />
  {:else if status === 'success'}
    <Check template="tada" trigger="controlled" active={true} size={20} />
  {:else if status === 'error'}
    <X template="stamp" trigger="controlled" active={true} size={20} />
  {:else}
    Save
  {/if}
</button>
```

Three icons, three states, all driven from one `status` variable. The loader is the only one with `loop` - the others play once and reset.

## Persistence across mounts

If you re-render the same icon (e.g. switching `template` reactively), the engine cancels and re-runs the animation. If you flip `active` true → false → true quickly, only the latest state wins; intermediate `true`s may not produce a visible play. This is intentional - it avoids a queue of overlapping animations.

For "always play when active flips true" semantics, see [Imperative Control](/docs/17-imperative-control).

## Multiple icons from one signal

```svelte
<script>
  import { Gear, Bell, User, Heart } from 'svelte-animated-icon/phosphor';
  let hasUpdate = $state(true);
</script>

<Bell  template="tada"  trigger="controlled" active={hasUpdate} loop />
<Gear  template="spin"  trigger="controlled" active={hasUpdate} />
<User  template="jelly" trigger="controlled" active={hasUpdate} />
<Heart template="pulse" trigger="controlled" active={hasUpdate} />
```

One `hasUpdate` boolean drives a coordinated animation across the whole UI. Flip it on when something needs attention; off when the user has acknowledged it.