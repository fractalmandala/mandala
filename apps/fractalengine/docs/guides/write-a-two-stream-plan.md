---
id: write-a-two-stream-plan
title: Writing a Two-Stream Plan
type: guide
tags: [workflow, planning, guide]
relates_to: []
summary: Guide on compiling disjoint two-stream execution plans to coordinate multi-agent tasks.
updated: 2026-07-15
---

# Writing a Two-Stream Plan

To coordinate parallel AI coding runs, we follow a strict two-stream execution standard.

## Playbook & Steps

### 1. Scoping & Phase 0
- Define the Phase 0 frozen contracts before any branch runs.
- Map exact target interface signatures or file layouts to prevent drift between agents.

### 2. Disjoint Ownership
- List files owned exclusively by Stream A (Agent A) and Stream B (Agent B).
- Explicitly list "stay-behind" folders or touch-points that must not be modified by either stream to avoid merge conflicts.

### 3. Clear Execution Steps
- Structure Stream A and Stream B tasks sequentially with clear goals.
- Define exit gates for each stream (e.g., compile checks, unit tests passing).

### 4. Phase 3 Integration
- Detail the post-merge checklist:
  - Integration verification.
  - Parity tests.
  - Regression/mutation testing.
  - Walkthrough reviews.

## Verification Checklist

- [ ] Ensure files lists for Stream A and Stream B do not intersect.
- [ ] Verify test boundaries cover both streams' outputs.
