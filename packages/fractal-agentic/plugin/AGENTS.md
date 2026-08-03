# Fractal Agentic startup router

This is the package startup router, not a full armory or a second runtime manual.
Use it to choose exactly one domain, then load only that domain's playbook.

## Authority and precedence

1. Project-local `AGENTS.md` files and explicit user requirements win for repository
   conventions, architecture, safety, and delivery scope.
2. This router supplies Fractal Agentic process guidance. Each nested
   [`docs/bosses/<boss>/INDEX.md`](./docs/bosses/INDEX.md) is the authoritative,
   self-contained playbook for its boss.
3. [`skills/boss-orchestration/SKILL.md`](./skills/boss-orchestration/SKILL.md) and
   its references are the executable runtime source of truth. Narrative docs link to
   the runtime; they do not replace its contracts.

## Trivial exemption

For a single-sentence answer, a pure explanation with no repository change, or a
simple “what is X?” question, answer directly. Do not load a boss, runtime, pins,
or inventories unless the task later becomes non-trivial.

## Mandatory startup state machine

1. Read applicable project-local instructions and this router.
2. Apply the trivial exemption above; if it applies, **stop reading**.
3. Select **exactly one** boss from the table below.
4. Read that boss's nested `INDEX.md` in full. It supplies its mission, exclusions,
   stack/surface rules, mapped agents/skills/commands, phases, verification defaults,
   and handoffs.
5. **Stop reading other boss playbooks.** Do not pre-load another armory. Read a
   second boss only after an explicit handoff, then make it the active boss.
6. For a non-trivial implementation, review, refactor, scaffold, or completion claim,
   load [`/orchestrate`](./commands/orchestrate.md) and the runtime it names.
7. Keep the primary session responsible for the real diff, verification evidence, and
   final review decision.

## Select one boss

| Task signal | Read exactly this playbook | Activate |
| --- | --- | --- |
| UI craft, tokens, accessibility, motion, visual QA | [Design](./docs/bosses/design/INDEX.md) | [`/activate-boss-design`](./commands/activate-boss-design.md) |
| Svelte, SvelteKit, indented SASS, component porting | [Svelte](./docs/bosses/svelte/INDEX.md) | [`/activate-boss-svelte`](./commands/activate-boss-svelte.md) |
| Security, audits, tests, performance, docs from code | [Code](./docs/bosses/code/INDEX.md) | [`/activate-boss-code`](./commands/activate-boss-code.md) |
| Product agent harness, memory, eval, MCP | [Agent](./docs/bosses/agent/INDEX.md) | [`/activate-boss-agent`](./commands/activate-boss-agent.md) |
| New app, site, or package from scaffold to ship | [Creator](./docs/bosses/creator/INDEX.md) | [`/activate-boss-creator`](./commands/activate-boss-creator.md) |
| Personal habits, hooks, instincts, cost, loops | [Workflow](./docs/bosses/workflow/INDEX.md) | [`/activate-boss-workflow`](./commands/activate-boss-workflow.md) |
| Plugin install, inventory, compliance, promotion, pruning | [Meta](./docs/bosses/meta/INDEX.md) | [`/activate-boss-meta`](./commands/activate-boss-meta.md) |
| Unclear net-new product | [Creator](./docs/bosses/creator/INDEX.md) | [`/activate-boss-creator`](./commands/activate-boss-creator.md) |

Use Svelte's port lane for shadcn/fractalsvelte work. Agent owns systems inside
product code; Workflow owns personal automation; Meta owns the plugin portfolio.

## Stack and surface gate

After choosing the boss, detect Svelte, React, Vue, Flutter, Rust, or Tauri from
package manifests and file extensions. Load the primary reviewers for the detected
stack; keep other stack reviewers secondary unless migrating. This package defaults to
Svelte, but project-local rules override that default. The selected boss defines any
surface-specific gate (Studio, public site, package docs, mobile, or product harness).

## Runtime and review invariant

Use `/orchestrate` for delivery work that changes a repository or claims completion.
The runtime chooses routine/complex/reviewer capability lanes when exposed, has the
primary inspect the diff and rerun verification, and requires the best available final
review with one verdict: **ship | fix-first | rethink**. Load runtime references only
when their decision is needed; `/orchestrate` names the required reading order.

The shared release armory is [`/quality-gate`](./commands/quality-gate.md),
[`/security-scan`](./commands/security-scan.md),
[`/code-review`](./commands/code-review.md), and
[`/santa-loop`](./commands/santa-loop.md). Browse its context, general utilities, and
optional systems through the [armory hub](./docs/armory/INDEX.md), not this router.

## Non-blocking capability rule

**Project work always proceeds.** Capability pins, installers, host hooks, the wiki,
and self-improvement tools improve quality but never gate delivery. Set
`capability_mode` from the current session spawn catalog; if pins are absent or only
partially exposed, use the available path, record `pins: unverified` or partial, and
continue. Canonical policy: [DEGRADATION.md](./docs/DEGRADATION.md).

## Handoffs

- Svelte ↔ Design when implementation and visual craft split.
- Svelte or Creator → Code before security, tests, or release gates.
- Creator → Svelte for the product body; Creator → Agent for in-product AI.
- Agent → Code when tools, secrets, or user data are involved.
- Workflow → Agent when personal automation becomes a product feature.
- Any boss → Meta for install, inventory, compliance, promotion, or prune work.
- Any boss → Creator when scope becomes a new app, site, or package.

On a handoff, preserve evidence, select the new active boss, and read only its
playbook. Creator may pull another armory during a build; other bosses hand back to
Creator or Code for final ship.

## Live inventories and navigation

Open the live [skills](./skills/INDEX.md), [agents](./agents/INDEX.md), and
[commands](./commands/INDEX.md) indexes when you need current availability; never
hardcode inventory counts. The human navigation hubs are
[bosses](./docs/bosses/INDEX.md), [orchestration](./docs/orchestration/INDEX.md), and
[armory](./docs/armory/INDEX.md). Read [`SOUL.md`](./SOUL.md) only when its portable
identity principles are relevant.
