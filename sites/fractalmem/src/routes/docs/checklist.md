---
title: Installation Checklist
description: The steps to begin using this package.
id: 3
---

Generalized from the milestone cadence in the original July 15, 2026
FractalEngine integration plan (day 3 / weeks 1-4), which per the July 29
audit was never actually followed through on. Use this one for real.

## Day 0 — install
- [ ] Run `scripts/install.sh /path/to/project`
- [ ] Self-test printed `OK — SKAA core is working.`
- [ ] Added the printed MCP config block to Claude Desktop / Claude Code
- [ ] Restarted the client, called `skaa_status`, got `tool_count: 4`
- [ ] Did one real `skaa_memory_write` + `skaa_memory_query` round trip
      (not just the install self-test entries)

## Day 3 — first real signal
- [ ] Run `scripts/smriti-metrics.sh` — confirm entries are accumulating
      from actual work, not just install-time entries
- [ ] Run `scripts/run_probes.py` once — both starter probes
      (`harness-self-check`, `schema-decision`) should pass; if they don't,
      something about the install is wrong, fix it now before more smriti
      piles up on a broken foundation
- [ ] Add at least 2 project-specific probes to `memory-probes.yaml`
      (see the commented templates in that file) — generic probes alone
      don't tell you anything about whether recall works for YOUR work

## Week 1 — behavioral signal
- [ ] Run `scripts/behavioral_probes.py`
- [ ] Review any duplicate-work candidates it flags — did recall actually
      fail to prevent redoing something, or is the flag a false positive?
- [ ] Review any conflicts it flags — same domain, opposing stated rules
- [ ] Call `skaa_samskara_proposals` — review anything staged; apply what's
      worth promoting via `skaa_samskara_apply`, ignore the rest (leaving
      a proposal pending forever is fine, it costs nothing)

## Weeks 2-4 — drift check
- [ ] Re-run `smriti-metrics.sh` — look at the pramana distribution: if
      it's still ~100% `pratyaksa`, that's the tagging-collapse pattern
      the July 29 audit found; consider whether any recent entries were
      actually inferences (`anumana`) or reported secondhand (`sabda`)
      and should have been tagged that way
- [ ] Look at the dhatu_cluster distribution: if one value (typically
      "kr") dominates everything, see SYS-05 — either the taxonomy isn't
      being used deliberately, or your project's work really is
      homogeneous enough that one root is honestly correct. Decide which.
- [ ] Decide whether any applied samskara_rules should be written into an
      actual project doc (CLAUDE.md, CONTRIBUTING.md, a style guide) so
      they don't depend on smriti recall to be honored
- [ ] Prune any stub/test/junk entries that crept into real smriti during
      setup (SYS-08 still applies — don't delete the whole db, just the
      noise rows)

## Ongoing
- [ ] Run `smriti-metrics.sh` on whatever cadence fits (weekly is a
      reasonable default; wire it into a cron/CI job if you want it to
      happen without remembering to run it)
- [ ] Re-run `run_probes.py` + `behavioral_probes.py` weekly; watch
      `docs/metrics/SMRITI-LOG.md` for a probe-pass-rate trend, not just
      a single snapshot
