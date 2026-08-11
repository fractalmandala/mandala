---
title: "Use DOM integrations"
description: "Add tooltips, third-party DOM libraries, raw HTML, actions, and canvas behavior safely."
type: how-to
---

# Use DOM integrations

Activate `svelte-template-directives` when the request needs `@attach`, `{@html}`,
`{@render}`, `{@const}`, `{@debug}`, canvas, or a third-party DOM library.

## Prefer `@attach` for reactive integrations

Attachments can re-run when their dependencies change and can return cleanup functions.
Use them for behavior that belongs to an element rather than putting DOM work at module
scope.

## Treat raw HTML as a security boundary

Use `{@html}` only with trusted or sanitized content. Record the source and sanitization
decision in the receipt.

## Keep SSR safe

Browser-only libraries must be loaded or initialized inside a browser-safe effect or
attachment. List the API and cleanup in the SSR section of the receipt.

## Verify

Compile server and client output, test teardown, and run a browser check when the
integration changes focus, layout, or interaction.
