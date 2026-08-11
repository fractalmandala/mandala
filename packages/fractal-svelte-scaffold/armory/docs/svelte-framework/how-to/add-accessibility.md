---
title: "Add accessibility"
description: "Build interactive Svelte components with semantic HTML, keyboard support, and reviewable ARIA."
type: how-to
---

# Add accessibility

Activate the `frontend-a11y` surface for every interactive component or form.

## Start with HTML semantics

- Use `<button>` for actions.
- Use `<a href>` for navigation.
- Use `<label>` for inputs.
- Use `<dialog>` or a well-defined dialog pattern for modals.
- Use real headings and landmarks.

Only add ARIA when the native element does not express the widget state.

## Verify widget behavior

For accordions, tabs, menus, dialogs, and comboboxes, verify:

- keyboard reachability and activation;
- arrow, Home, End, and Escape behavior where the pattern requires it;
- stable IDs for `aria-controls`, `aria-labelledby`, and descriptions;
- visible focus indicators;
- focus restoration after closing overlays; and
- screen-reader announcements for asynchronous state.

Treat Svelte `a11y-*` compiler warnings as issues. Use an explicit `svelte-ignore` only
with a reason.

## Review motion and color

Do not encode meaning with color alone. Provide text or status semantics. Respect
`prefers-reduced-motion` for non-essential transitions and ambient animation.

## Receipt evidence

Record whether checks were static, compiler-based, keyboard/manual, DOM-level, or axe-based.
Do not describe a static grep as an interaction test.
