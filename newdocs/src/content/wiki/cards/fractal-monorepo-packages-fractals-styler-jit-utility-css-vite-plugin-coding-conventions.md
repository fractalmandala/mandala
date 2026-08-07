---
title: Fractals Styler — JIT Utility CSS Vite Plugin — Coding Conventions
description: - Utility class resolution is centralized in registry.ts via a static STATICUTILITIES map plus a longest-prefix-matching DYNAMICPREFIXES array sorted by descending prefix length, so longer prefixes l…
tags: [packages/fractals_styler]
type: card
module: packages/fractals_styler
path: packages/fractals_styler
created: 2026-08-05
updated: 2026-08-06
---

- Utility class resolution is centralized in registry.ts via a static STATIC_UTILITIES map plus a longest-prefix-matching DYNAMIC_PREFIXES array sorted by descending prefix length, so longer prefixes like padtop win over shorter ones like pad.
- Breakpoint suffixes are handled uniformly: a -(xs|sm|bs|lg|xl) suffix is stripped before declaration lookup, and matched breakpoints are emitted inside @media blocks ordered by BREAKPOINT_ORDER.
- The Vite plugin marks itself with enforce: pre and uses a backslash-0-prefixed virtual module id to intercept Vite's built-in CSS pipeline and avoid SSR crashes on query-suffixed ids.
- Dev server hot reload is implemented by listening to server.watcher.on(all), filtering on WATCHED_EXT_RE, and calling server.moduleGraph.invalidateModule followed by server.ws.send({ type: full-reload }).
- CLI commands parse process.argv manually, treating arguments starting with -- as flags and positional args as values, with a simple command === init dispatch pattern.
