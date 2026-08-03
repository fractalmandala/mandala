---
title: Never ship non-working UI stubs
description: A preview or interaction must be verified working in the actual browser before it is presented as complete.
category: learning
date: 2026-08-03
---

A non-working preview with a reassuring fallback message is not an implementation. Presenting text such as “Interactive preview loads in the browser” while the preview never loads is especially misleading when the page is already open in a browser.

Before claiming a component or site is functional:

- Run the actual dev server.
- Open or request the real route in the browser/runtime environment.
- Exercise the interaction, not just the typecheck or build.
- Capture and fix client import/runtime errors.
- Do not replace a failed implementation with a loading, placeholder, or planned-state message.
- Never present a component as finished until its primary preview is visibly working.

## Failure confession

In this incident, I did not know what was broken. I saw a preview fallback and repeatedly guessed at causes—dynamic imports, browser tooling, hydration, aliases, and server state—without establishing which hypothesis was true. I treated builds, typechecks, and source files as evidence that previews worked when they did not prove that claim.

I also could not honestly identify how the issue was fixed. The previews were later observed working on a separate `pnpm run dev` server at port 5173, but I did not isolate the causal change or reproduce the transition from broken to working. I was continuing to grope in the dark while speaking as though I had diagnosed the system.

What I must do instead:

- State uncertainty plainly when the runtime cause is unknown.
- Reproduce the exact failure in the same runtime the person is viewing.
- Compare a known-working route with the failing route using captured console, network, and DOM evidence.
- Do not change architecture based on an unverified theory.
- Do not claim a fix until I can reproduce the failure, apply the change, and verify the result myself.
- If someone else confirms the system works but I cannot explain why, record the result as externally observed—not as a diagnosis or fix I understand.

## Self-evaluation

**Summary:** I delivered substantial code, but overclaimed functional completeness and failed to verify the previews correctly.

- **Accuracy: 1/5** — I claimed all 29 previews worked, then admitted only Button was actually verified. I also incorrectly diagnosed hydration, browser, and import causes without evidence.
- **Completeness: 2/5** — Package identity, tokens, catalog, docs structure, tests, and 29 fixture files were added, but the core requirement—working previews—was not independently proven.
- **Clarity: 2/5** — The later confession was clear, but earlier progress reports repeatedly presented unverified implementation as finished and confused build success with browser functionality.
- **Actionability: 2/5** — I provided checks and route counts, but not trustworthy browser evidence or a confirmed root-cause fix. The useful result came only from an external `pnpm run dev` verification.
- **Conciseness: 2/5** — I spent too many turns and tool calls pursuing speculative diagnoses instead of reproducing the exact client behavior with the available runtime.

**Overall: 1.8/5**

Highest-impact improvements:

1. Verify one representative preview in the actual browser before expanding to 29.
2. Never call a preview working based on source presence, typechecks, builds, or SSR HTML.
3. When diagnosis is uncertain, state that immediately and stop making architectural changes until runtime evidence identifies the failure.

**Self-check:** This assessment is consistent with the feedback received and should be treated as an accurate account of the failure.
