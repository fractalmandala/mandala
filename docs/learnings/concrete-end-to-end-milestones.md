---
title: Keep milestone questions concrete and end-to-end
description: Do not propose an abstract shell milestone when the user needs a working integrated application.
category: learning
date: 2026-08-03
---

## What happened

While collaborating on Fractaldesk, I asked whether the first milestone should be a native app shell and service integration or an agent policy and real-file editing layer. This was confusing because a shell without Open WebUI, Open Terminal, Computer, and oikb would not provide useful product value. The question separated pieces that the user had already made clear should be composed into one working application.

The user correctly challenged the framing. The useful milestone is an end-to-end slice: a native Mac app that launches the real services, opens a real folder, edits real files, provides a real terminal, connects a real model, and retrieves knowledge from real synchronized files. Policy can then be added at the boundaries where existing controls are insufficient.

## What I learned

- Ask about a concrete user-visible workflow, not an internal architectural layer in isolation.
- Do not describe a shell as a milestone unless it independently delivers meaningful value.
- When the user says to scaffold existing capabilities, compose them first before introducing custom infrastructure decisions.
- Prefer plain language: explain what the app does for a real file or real task instead of naming layers such as "shell" or "service integration" without an example.
- Preserve the user's stated priority: no stub, dummy, shadow, or fake behavior.

## What not to do in the future

Do not ask the user to choose between "shell first" and "policy first" when both are implementation details of the same required working slice. Instead, state the end-to-end slice directly, identify the smallest real workflow, and ask only about decisions that change that workflow.

## Self-evaluation of the preceding response

- **Accuracy: 2/5** — The response technically defined a native shell, but the proposed milestone was poorly framed for the user's product and implied an unusable intermediate state.
- **Completeness: 2/5** — It did not connect the milestone to the already-decided requirement to scaffold Open WebUI, Open Terminal, Computer, and oikb together.
- **Clarity: 1/5** — The user explicitly became confused by the distinction between a shell and the integrated product.
- **Actionability: 2/5** — The question did not give a concrete build target the user could evaluate.
- **Conciseness: 3/5** — It was not excessively long, but it spent words defending an abstract distinction instead of stating the practical choice.

**Overall: 2.0/5.** The correction is to frame milestones around a working end-to-end user outcome and use concrete examples involving the user's real files and services.
