# Graph Engineering Topologies & Architectural Patterns

This guide defines the core graph topologies for multi-agent workflows in Fractal Agentic, based on Anthropic's dynamic workflow research.

## Core Philosophy: Graphs Over Chains

Linear agent pipelines (Step 1 → Step 2 → Step 3) suffer from three primary failure modes as context grows:
1. **Agentic Laziness**: Stopping after partial progress on broad tasks.
2. **Self-Preferential Bias**: Favoring previously produced outputs when self-evaluating.
3. **Goal Drift**: Degraded fidelity to initial constraints over long turns.

Structuring workflows as **Graphs (DAGs)** isolates execution context, tiers model costs, and guarantees adversarial verification before results are accepted.

---

## The 6 Core Topologies

### 1. Fan-Out (Parallel Execution)
- **Use when**: 3+ independent items, files, or subsystems need review, analysis, or repair.
- **Resilience Rule**: Node failure must not crash the run. Design fan-out to resolve failed nodes to empty results (e.g. `Promise.allSettled`), then filter out empties before the next stage.
- **Model Tiering**: Run fan-out nodes on fast/light models (`flash` / `luna`).

### 2. Fan-In at a Barrier (Synchronization)
- **Use when**: A downstream stage strictly requires global set operations (cross-item deduplication, global ranking, or total exit evaluation).
- **Pipeline Rule**: Default to independent item streaming. Use a barrier **only** when cross-set aggregation is essential; never use barriers for cosmetic convenience.

### 3. The Diamond (Fan-Out → Deterministic Reduce → Synthesize)
- **Structure**:
  1. **Fan-Out**: Parallel worker subagents gather breadth across independent sources.
  2. **Deterministic Reduce**: Use **plain code/scripts** (flattening, sorting, deduplication) to compress results. **Never pay rent on plumbing** by using LLMs for deterministic data manipulation.
  3. **Synthesize**: Pass the compressed set to a single high-reasoning node (`pro` / `terra`) to write the final result.

### 4. Classify-and-Act (Code-Driven Routing)
- **Use when**: Execution path depends on input characteristics (e.g. diff size, severity level).
- **Rule**: Model performs classification; **ordinary code** executes the branch routing so the same input always follows predictable paths.

### 5. Adversarial Verification (Edge Guard)
- **Use when**: Results must be verified before reaching reports, PRs, or production.
- **Rule**: Position a dedicated fresh reviewer on the edge before downstream acceptance. The verifier's sole task is attempting to **disprove** findings. Findings that survive pass forward; disproved findings are dropped.

### 6. Converging Cycles (Loop Until Dry)
- **Use when**: Open-ended discovery (e.g. bug hunting, security audits) where findings trigger further investigation.
- **Exit Condition**: Loop until N consecutive rounds return zero new findings.
- **Full History Deduplication**: Track **both accepted AND rejected/disproved findings** across all iterations. Comparing against only accepted items causes rejected items to resurface endlessly in infinite loops.

---

## 2 Bonus Patterns

- **Generate-and-Filter**: Generate a large candidate pool, then filter strictly through an automated rubric before presentation.
- **Tournament**: Pairwise comparative evaluation when selecting the best option among candidate proposals (naming, ranking, architectural trade-offs).

---

## Execution Principles

1. **Workspace Isolation**: When parallel nodes perform edits, run each subagent in an isolated workspace (`workspace: "branch"` or `"share"`) to prevent write collisions.
2. **Model Tiering**:
   - Broad extraction, classification, unit checks → Fast models (`luna` / `flash`)
   - Synthesis, complex implementation, adversarial verification → High-reasoning models (`terra` / `sol` / `pro`)
3. **No LLM Plumbing**: Data merging, array flattening, deduplication, and formatting must be handled deterministically via code.
