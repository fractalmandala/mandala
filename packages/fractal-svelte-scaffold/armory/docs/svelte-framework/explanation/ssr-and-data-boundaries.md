---
title: "SSR and data boundaries"
description: "Why the framework records route files, serializability, browser APIs, and guards."
type: explanation
---

# SSR and data boundaries

SvelteKit renders a page from route data and component code. A safe scaffold makes the
boundary visible before implementation.

Server data belongs in server load functions and must be transportable to the browser.
Public universal data may use `+page.ts`. Browser-only effects belong after mount or
behind an explicit guard.

The boundary is especially important during React conversion: `getServerSideProps`,
private environment access, database reads, and auth data must not accidentally become
client code.

The receipt turns this into a decision that another agent can audit rather than a hidden
assumption buried in a generated component.
