---
title: "Self-improving installation (meta layer)"
description: "Audience: dual (Meta + Workflow owners; agents load when running the improvement loop). Status: Phase 1 shipped (/improve-init, /improve-status, scripts/install-improve.sh). Phases 2–4 (observe hooks, digest automation) remain planned."
type: guide
---

# Self-improving installation (meta layer)

**Audience: dual** (Meta + Workflow owners; agents load when running the improvement loop).  
**Status:** Phase 1 **shipped** (`/improve-init`, `/improve-status`, `scripts/install-improve.sh`).  
Phases 2–4 (observe hooks, digest automation) remain planned.

## Goal

Each **install** of Fractal Agentic becomes better with use: it observes how *this* user works, evaluates outcomes, compounds knowledge in the **user wiki**, and gradually improves skills/instincts — **without** blocking product delivery and **without** silently rewriting the shared plugin tree unless the user promotes.

```text
use plugin  →  observe  →  evaluate  →  store (local + wiki)
                    ↑                         │
                    └──── evolve / promote ───┘
```

## Non-negotiables (Fractal doctrine)

| Rule | Why |
| --- | --- |
| **Never block ship** | Learning is best-effort; same as pins/wiki ([progression.md](./progression.md)) |
| **Local first** | Observations stay on the machine; export only instincts/patterns user chooses |
| **Human promote** | Auto-suggest skill/agent changes; user/Meta approves before merging into armory |
| **Project vs global** | Project instincts don’t contaminate other repos (CL-v2 model) |
| **Plugin SSOT** | Shipped `plugin/skills/*` is package truth; install-local evolved skills live in a **user overlay** until promoted |

## You already have the parts

| Capability | Existing asset | Role in the loop |
| --- | --- | --- |
| Observe sessions | `continuous-learning-v2` + observe hooks | Capture tool use / corrections |
| Atomic learning units | instincts + confidence | Intermediate knowledge |
| Extract on demand | `/learn`, `/learn-eval` | Session-end pattern harvest |
| Self-score deliverables | `agent-self-evaluation` | Quality signal after hard tasks |
| Portfolio health | `/skill-health`, `skill-stocktake`, `skill-comply` | Meta: is the armory rotting? |
| Promote / prune | `/promote`, `/prune` | Move mature work up; drop noise |
| Compound memory | `llm-wiki` + `/wiki-*` + orchestrate capture | Long-horizon knowledge the install can re-query |
| Session safety hooks | `hooks/` + `/hooks-init` | Optional triggers for observe / soft eval |
| Domain ownership | Meta Boss / Workflow Boss | Who runs which half of the loop |

What is **missing** is a single **orchestration contract** that says *when* each fires, *where* data lives for Fractal (not only ECC paths), and how wiki + instincts + self-eval connect.

## Ownership split

| Concern | Boss | Scope |
| --- | --- | --- |
| **Install learning** (this machine’s habits, instincts, personal wiki) | **Workflow** | User OS |
| **Plugin portfolio health** (skill quality, stocktake, promote into package) | **Meta** | Product package |
| **Delivery still** | **boss-orchestration** | Unchanged; learning hooks ride beside it |

Creator/Svelte/Code do not own the meta loop; they *generate* episodes that the loop learns from.

## Target architecture

### Data plane (per machine)

```text
~/.config/fractal-agentic/
  self-improvement.json     # profile: off | observe | full
  env.sh                    # already from hooks-init

${XDG_DATA_HOME:-~/.local/share}/fractal-agentic/
  observations/…            # session signals (or reuse CL-v2 store with Fractal root)
  instincts/…               # project + global
  evals/…                   # self-eval scorecards (jsonl)
  evolved/…                 # candidate skills/commands (NOT auto-merged into plugin/)

$FRACTAL_WIKI_ROOT/         # user vault from /wiki-init
  raw/fractal/              # orchestrate episodes (already)
  raw/evals/                # optional: eval summaries
  wiki/…                    # structured pages after /wiki-ingest
```

Prefer one Fractal data root (`fractal-agentic/`) over scattering only under ECC `homunculus` paths — CL-v2 can be **adapted** or **bridged**, not forked into a second philosophy.

### Control plane (profiles)

Like hooks: user opts in.

| Profile | Behavior |
| --- | --- |
| **`off`** (default until init) | No observe hooks; manual `/learn` still works |
| **`observe`** | Hooks append observations; no background rewrite of skills |
| **`full`** | observe + periodic instinct analysis + soft self-eval nudge after non-trivial ship + wiki episode capture when vault exists |

Init: **`/improve-init`** (proposed) — sibling of `/wiki-init` / `/hooks-init`.

### Trigger plane

| Trigger | Mechanism | Action |
| --- | --- | --- |
| Tool use | Hook (PostToolUse / Stop) optional | Append observation |
| Orchestrate ship | boss-orchestration soft step | Optional self-eval + wiki episode (already optional capture) |
| User correction | Observation classifier | Instinct candidate ↑ |
| Weekly / manual | `/improve-digest` or Workflow loop | Cluster instincts; propose skill patches; wiki ingest |
| Portfolio review | Meta `/skill-health` + stocktake | Comply / prune / promote into plugin (human) |

### Improve loop (one cycle)

```text
1. OBSERVE   hooks or /learn        → observations.jsonl
2. EVALUATE  agent-self-evaluation  → evals/*.json (after ship | big task)
3. COMPOUND  wiki-capture/ingest    → raw/ + structured wiki (if vault)
4. DISTILL   observer / /evolve     → instincts with confidence
5. PROPOSE   /improve-digest        → “candidate skill X” report (no silent merge)
6. PROMOTE   user + Meta            → copy into plugin/skills or project skills dir
7. PRUNE     /prune + skill-health  → drop low-confidence / unused
```

Step 6 is always **explicit**. The installation improves in *local overlay* continuously; the **shared package** improves only when someone promotes.

## How this uses “its own” skills

| Skill / command | Use in meta layer |
| --- | --- |
| `continuous-learning-v2` | Observe + instincts backbone |
| `agent-self-evaluation` | Scorecard after non-trivial delivery |
| `verification-loop` | Evidence for eval accuracy axis |
| `llm-wiki` | Long-term memory install re-queries |
| `skill-creator` / `skill-stocktake` / `skill-comply` | Turn proposals into real skills; audit quality |
| `/promote` `/prune` `/skill-health` | Portfolio lifecycle |
| `boss-orchestration` | Soft post-ship hooks only — never gate ship on learning |

## User surface

| Command | Role | Phase |
| --- | --- | --- |
| **`/improve-init`** | Enable profile + data dirs | **1 ✅** |
| **`/improve-status`** | Profile, dirs, wiki link | **1 ✅** |
| **`/improve-digest`** | Distill + propose report | 3 |
| Existing | `/learn`, `/instinct-*`, `/promote`, `/prune`, `/skill-health`, `/wiki-*` | now |

Workflow Boss: personal improve profile.  
Meta Boss: promote proposals into the package / armory health.

## Hooks / workflows (when to add)

| Add | When |
| --- | --- |
| Observe hook id `post:observe:learning` | Profile ≥ observe; async, never block |
| Stop hook soft nudge for self-eval | Profile = full; warn-only if non-trivial task and no scorecard |
| `workflows/improve-digest.workflow.md` | Optional fan-out: cluster instincts ∥ skill-health ∥ wiki lint |

Do **not** require native Workflow engines; command playbooks first (like `/review-fanout`).

## Phased delivery (recommended)

### Phase 0 — Document + wire mentally (this doc)

- Meta + Workflow cards point here  
- Users understand the loop without new code  

### Phase 1 — Fractal config + status ✅

- `~/.config/fractal-agentic/self-improvement.json`  
- `/improve-init`, `/improve-status`  
- Data root: `${XDG_DATA_HOME:-~/.local/share}/fractal-agentic/`  
- Soft post-orchestrate policy in `boss-orchestration` (self-eval + wiki when profile=full)  
- CL-v2 remains available; Fractal data plane documented for Phase 2 observe hooks  

### Phase 2 — Observe profile

- Register observe via `/hooks-init` profile extension or improve-init  
- Default `observer.enabled` opt-in  
- Privacy note in TROUBLESHOOTING  

### Phase 3 — Digest + promote path

- `/improve-digest` produces a single report: instincts to promote, skills to draft, wiki pages to write  
- Human runs `/promote` or skill-creator  
- Meta stocktake uses evals/ + instincts as input  

### Phase 4 — Closed loop (careful)

- High-confidence global instincts auto-suggested at SessionStart (bounded chars)  
- Still no auto-edit of `plugin/skills` without promote  

## Anti-patterns

| Don’t | Do instead |
| --- | --- |
| Rewrite plugin skills every session | Overlay + promote |
| Block `/orchestrate` until eval complete | Soft post-ship only |
| Send transcripts to a cloud “improve service” | Local + optional user export |
| Mix Meta portfolio with personal instincts blindly | Project/global scopes |
| Duplicate CL-v2 under a new brand with no bridge | One data plane, Fractal config |

## Success metrics (per install)

- Observation volume with privacy preserved  
- Instinct count and confidence distribution  
- Self-eval average on ship tasks (trend, not vanity)  
- Wiki pages created from fractal/eval raw  
- Promotions accepted vs proposed  
- Zero increase in “refused work for harness” incidents  

## Related

- [doc-ownership.md](./doc-ownership.md) — where docs live  
- [hooks.md](./hooks.md) — opt-in machine automation  
- [wiki/setup.md](./wiki/setup.md) — vault  
- [progression.md](./progression.md) — non-blocking  
- Meta boss card · Workflow boss card · `continuous-learning-v2` · `agent-self-evaluation`  
