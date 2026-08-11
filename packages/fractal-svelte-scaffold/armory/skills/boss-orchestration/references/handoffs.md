# Handoff protocol (orchestration compress)

Startup router: [AGENTS.md](../../../AGENTS.md). Authoritative boss playbooks:
[docs/bosses/INDEX.md](../../../docs/bosses/INDEX.md).

## Decision tree

```
UI craft / tokens / a11y / motion / visual polish?  → Design Boss
Svelte / SvelteKit implementation?                  → Svelte Boss
Porting shadcn / fractalsvelte?                     → Svelte Boss (port lane)
Security / audit / tests / debt / docs-from-code?   → Code Boss
Agent harness / memory / eval / MCP in product?     → Agent Boss
New app / site / package scaffold → build → ship?   → Creator Boss
My habits / hooks / cost / instincts / pruning?     → Workflow Boss
ECC install / skill inventory / comply / promote?   → Meta Boss
Unclear?                                            → Creator Boss (executive) or Workflow (observe first)
```

## Handoff table

| From → To               | When                                                           |
| ----------------------- | -------------------------------------------------------------- |
| Svelte → Design         | Implementation done; needs visual polish, tokens, a11y, motion |
| Design → Svelte         | Design decided; needs runes, routes, SASS components           |
| Svelte / Creator → Code | Before ship: security, tests, quality-gate, tech debt          |
| Creator → Svelte        | Scaffold exists; app body is SvelteKit                         |
| Creator → Agent         | Product needs AI copilots, harness, memory, MCP tools          |
| Agent → Code            | Product agent touches secrets, tools, or user data             |
| Any → Meta              | Skill portfolio health, ECC install, promote/prune, compliance |
| Workflow → Agent        | Personal automation becomes a product feature                  |
| Any → Creator           | Scope expands to new app/site/package                          |

## Orchestration behavior on handoff

1. Finish or pause the current five-part lane cleanly (report STATUS).
2. Switch ACTIVE BOSS in the next contract; re-inject boss-prompts constraints.
3. Do not abandon verification evidence; carry VERIFICATION EVIDENCE into the next
   phase and into the final review packet.
4. Creator may pull any armory without a formal handoff; still record ACTIVE BOSS
   slices in each worker contract for ownership clarity.

## Agent vs Workflow hard split

| Concern                                                      | Owner         |
| ------------------------------------------------------------ | ------------- |
| Building/evaluating agent systems **inside product code**    | Agent Boss    |
| **Personal** session habits, instincts, hooks, daily pruning | Workflow Boss |
| ECC install / skill portfolio                                | Meta Boss     |

## Shared armory

- `/quality-gate`
- `/security-scan` + security-reviewer
- code-reviewer + `/code-review`
- `/santa-loop` (Code primary for product release; Agent when reviewing agent output)
