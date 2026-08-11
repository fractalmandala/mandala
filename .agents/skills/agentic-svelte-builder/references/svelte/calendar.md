# Svelte 5 Native Calendar & Date Grid

A reactive Calendar component powered by **Svelte 5 Runes** (`$state`, `$derived`, `$props`). Computes month date grids dynamically using JavaScript `Date` math and reactive derived states.

---

## Component Implementation (`Calendar.svelte`)

```svelte
<script lang="ts">
  type Props = {
    value?: Date;
    onselect?: (date: Date) => void;
  };

  let { value = $bindable(new Date()), onselect }: Props = $props();

  let viewDate = $state(new Date(value.getFullYear(), value.getMonth(), 1));

  // Reactive derived calculations for month grid
  let currentMonthName = $derived(
    viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  );

  let daysInMonth = $derived(
    new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
  );

  let startDayOfWeek = $derived(
    new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()
  );

  let calendarGrid = $derived.by(() => {
    const grid: (number | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) grid.push(null);
    for (let d = 1; d <= daysInMonth; d++) grid.push(d);
    return grid;
  });

  function prevMonth() {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  }

  function nextMonth() {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  }

  function selectDate(day: number) {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    value = selected;
    onselect?.(selected);
  }

  function isSelected(day: number): boolean {
    return (
      value.getDate() === day &&
      value.getMonth() === viewDate.getMonth() &&
      value.getFullYear() === viewDate.getFullYear()
    );
  }
</script>

<div class="[ calendar ] [ box maxw320 ] [ pad16 radius8 bdr ]">
  <header class="[ calendar__header ] [ row ycenter xbetween marginbot16 ]">
    <button class="button" data-variant="ghost" data-size="sm" onclick={prevMonth}>&larr;</button>
    <span class="[ calendar__title ] [ text-sm bold ]">{currentMonthName}</span>
    <button class="button" data-variant="ghost" data-size="sm" onclick={nextMonth}>&rarr;</button>
  </header>

  <div class="[ calendar__weekdays ] [ grid grid-cols-7 text-center text-xs bold marginbot8 ]">
    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
  </div>

  <div class="[ calendar__grid ] [ grid grid-cols-7 gap4 ]">
    {#each calendarGrid as day}
      {#if day === null}
        <div class="calendar__empty"></div>
      {:else}
        <button
          class="[ calendar__day ] [ row ycenter xcenter radius4 text-sm ]"
          class:calendar__day--selected={isSelected(day)}
          onclick={() => selectDate(day)}
        >
          {day}
        </button>
      {/if}
    {/each}
  </div>
</div>

<style lang="sass">
  .calendar
    background-color: var(--background10, #ffffff)

  .calendar__day
    width: 2.25rem
    height: 2.25rem
    background: none
    border: none
    cursor: pointer
    color: var(--foreground10, #0f172a)
    &:hover
      background-color: var(--background20, #f1f5f9)

    &--selected
      background-color: var(--brand-primary, #2563eb) !important
      color: #ffffff !important
      font-weight: 600
</style>
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Calendar from './Calendar.svelte';

  let selectedDate = $state(new Date());
</script>

<Calendar bind:value={selectedDate} />
<p>Selected: {selectedDate.toDateString()}</p>
```
