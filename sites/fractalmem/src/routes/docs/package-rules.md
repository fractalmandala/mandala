---
title: Package Rules
description: The sutras of our system
id: 5
---

Short, numbered, and meant to be quoted by ID (e.g. "per SYS-03") rather
than re-explained every time. If you fork this package and change one of
these, update the number's meaning here rather than deleting it, so old
references in your own smriti still resolve to something.

**SYS-01 — Every write carries a pramana, with no default.**
`skaa_memory_write` has no fallback value for `pramana`; a missing or
invalid value is a hard error (`skaa/db.py::SmritiStore.write`). The
schema enforces the same four values everywhere: `pratyaksa`, `anumana`,
`sabda`, `upamana` (see `skaa/models.py::Pramana`).

**SYS-02 — karta and karma are mandatory; everything else is detail.**
These two fields anchor the grammatical sentence an entry represents —
who did it, to/for what. The other four karaka fields (`karana`,
`sampradana`, `apadana`, `adhikarana`) default to empty string and may
stay empty indefinitely; don't force-fill them just to look thorough.

**SYS-03 — Samskara proposals are staged, never auto-applied.**
`skaa_session_close` calls `mine_proposals()`, which only ever calls
`store.stage_proposal(...)` (status=`pending`). Promotion to a durable
rule happens exclusively through an explicit `skaa_samskara_apply` call
naming specific `proposal_ids`. No code path in this package auto-applies
a proposal. If you extend the samskara miner, keep this invariant — it is
the difference between a memory system that suggests conventions and one
that silently rewrites its own behavior.

**SYS-04 — pramana is not a quality score.**
`PRAMANA_WEIGHT` exists only so `pramana_min` can filter a query
(`skaa/models.py`). Treat "anumana" and "sabda" entries as differently
*sourced*, not lower quality — an inference can be more reliable than a
sloppy direct observation. Don't build downstream logic that silently
discounts non-pratyaksa entries.

**SYS-05 — dhatu_cluster names the verbal root of the action, not the
subject matter.**
"cit" (to perceive/think) tags a design/ideation entry regardless of
whether the subject was a pptx deck or a database migration; it should
NOT be used as a topic tag (that's what `tags` is for). The July 29, 2026
audit found this distinction collapsing in practice — most entries just
defaulted to "kr" regardless of what kind of action they described. If
you can't name the verbal root confidently, leave `dhatu_cluster` empty
rather than defaulting to "kr" out of habit — an honest empty field is
more useful later than a mistagged one.

**SYS-06 — the measurement harness is recommended, not enforced.**
Nothing in `skaa_server.py` requires `run_probes.py` or
`behavioral_probes.py` to run before a session closes. This is a
deliberate choice to keep the server itself dependency-light (no PyYAML
requirement inside the MCP process). Wire the probes into your own cadence
— see CHECKLIST.md — the server won't do it for you, and won't stop you
from skipping it either.

**SYS-07 — skaa_execute is a routing stub, not an orchestrator.**
It classifies an instruction into one of the four dhatu categories and
logs the decision; it does not call any other tool, model, or API on your
behalf. Anyone extending it into a real orchestrator should keep the
audit-logging behavior (every dispatch decision recorded as a pratyaksa
entry) — that property is what makes the router's own decisions
reviewable later, and losing it quietly would make SYS-03-style trust
harder to maintain for whatever `skaa_execute` grows into.

**SYS-08 — deleting code is safe; deleting smriti.db is not.**
`uninstall.sh` defaults to preserving `.skaa/smriti.db` and only deletes
it with an explicit `--purge` flag. Anyone building tooling around this
package should keep that asymmetry: code and scripts are reproducible
from this repo, the memory itself is not.
