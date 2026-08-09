# MemClaw — Agent Prompts and Examples

## 5. Agent Prompts and Examples

### Agent system prompt

Add this to your agent's system prompt (or use Agent Education to let agents self-configure):

```
You have access to MemClaw, a shared memory system used by all agents.

BEFORE starting any task:
- Use memclaw_recall for semantic + keyword search with graph expansion
- Set include_brief=true when you want a concise LLM-summarized paragraph
  instead of raw results
- Include fleet_id to scope to this fleet, omit for tenant-wide search
- Filter by status="active" to skip deleted/archived memories
- Use valid_at for point-in-time queries (OpenClaw plugin and REST API only)

AFTER completing work:
- Store findings with memclaw_write — just provide content
- For batch writes, pass items=[...] (up to 100) to the same tool — batches
  embeddings and enrichment for much lower latency than looped single writes
- Type, weight, status, title, summary, tags are auto-inferred by LLM
- Dates auto-extracted: "deadline March 30" → ts_valid_end
- Contradictions auto-detected: conflicting older memories marked outdated
- Long content (>2000 chars) is auto-chunked into atomic facts
- Set visibility: "scope_agent" (you only), "scope_team" (default), "scope_org" (all fleets)
- Optionally override memory_type, weight, status
- RDF triples (subject_entity_id, predicate, object_value) available via OpenClaw plugin and REST API

MANAGING EXISTING MEMORIES:
- Use memclaw_manage with op="update" to correct content or metadata
- Use memclaw_manage with op="transition" to change status
- Use memclaw_manage with op="delete" to soft-delete
- Use memclaw_manage with op="read" to inspect a single memory by id
- Only provide fields you want to change — others are preserved
- If content changes, embedding and entities are re-extracted automatically
- You can only modify your own memories unless you have admin trust level

STATUS LIFECYCLE:
- Use memclaw_manage op="transition" when things change
- confirmed (done), cancelled (abandoned), outdated (superseded)
- Search status="pending" for unresolved items

VISIBILITY & CROSS-FLEET:
- Default visibility is "scope_team" — shared within your fleet
- Set visibility: "scope_org" to share across all fleets in the organization
- Set visibility: "scope_agent" for agent-only notes
- Use fleet_ids in recall to query multiple fleets at once

ENTITIES & GRAPH:
- Auto-extracted from every write — no manual creation needed
- Fuzzy entity matching: "OpenAI" and "Open AI" are auto-merged (cosine similarity ≥ 0.85)
- Recall automatically expands through entity relations (up to 2 hops)
  Example: searching "Project Atlas" also finds memories about people who work on Atlas
- Use memclaw_entity_get for direct relationship and linked memory inspection

OUTCOME REPORTING (Karpathy Loop):
- After acting on recalled memories, report what happened with memclaw_evolve
- outcome_type: "success" / "failure" / "partial"; pass related_ids=[...]
- Successful recalls get reinforced; failures generate preventive rules
- Use memclaw_insights periodically to surface contradictions, stale
  knowledge, cross-agent divergence, and emerging patterns
```

### Example: Multi-agent workflow

> **Note:** `tenant_id` is resolved from your API key (MCP) or auto-filled from the plugin env — agents never need to pass it. `agent_id` is also auto-filled (defaults to `"mcp-agent"` for MCP or the plugin env value for OpenClaw).

**Scenario:** Researcher discovers info, Planner uses it, Support benefits later.

**Step 1 — Researcher stores a finding (visible to all fleets):**

```json
{
	"tool": "memclaw_write",
	"parameters": {
		"content": "Customer X uses PostgreSQL 16 in production on GKE. They process 2M transactions/day.",
		"source_uri": "crm://customer-x/infrastructure",
		"visibility": "scope_org"
	}
}
```

LLM enrichment auto-classifies as `fact`, weight `0.9`, title "Customer X: PostgreSQL 16 on GKE", tags `["customer-x", "postgresql", "gke"]`. Entity extraction identifies "Customer X" (org), "PostgreSQL 16" (technology), "GKE" (technology). Visibility `scope_org` means all fleets can see this.

**Step 2 — Planner recalls:**

```json
{
	"tool": "memclaw_recall",
	"parameters": {
		"query": "which customers use PostgreSQL and what is their scale?",
		"memory_type": "fact"
	}
}
```

Returns the researcher's finding. Graph-enhanced retrieval expands through entity relations — memories linked to matching entities get a 1.3x boost, 1-hop neighbors 1.2x, and 2-hop neighbors 1.1x.

**Step 3 — Planner stores a decision:**

```json
{
	"tool": "memclaw_write",
	"parameters": {
		"content": "Customer X should be migrated to managed Postgres in Phase 2 due to high transaction volume."
	}
}
```

**Step 4 — Support agent picks it up:**

```json
{
	"tool": "memclaw_recall",
	"parameters": {
		"query": "Customer X database setup and migration plans"
	}
}
```

Returns both the fact and the decision — full context without agents needing to talk to each other.

### Example: Batch write (after processing a document)

**Scenario:** Agent has extracted several findings and stores them all at once via the batch form of `memclaw_write`.

```json
{
	"tool": "memclaw_write",
	"parameters": {
		"items": [
			{ "content": "Customer A uses PostgreSQL 16 in production on GKE" },
			{ "content": "Customer A processes 2M transactions per day" },
			{ "content": "Customer A's DBA team prefers managed database services" },
			{ "content": "Customer A contract renewal is scheduled for Q3 2026" }
		]
	}
}
```

Returns per-item results with `created`/`duplicate`/`error` status for each item, plus overall counts. Much faster than 4 individual single-`content` calls — embeddings are batched into a single API call and enrichment runs in parallel. Pass the batch form (`items`) exactly when you have more than one memory; `items` is mutually exclusive with `content`.

### Example: Entity lookup

```json
{
	"tool": "memclaw_entity_get",
	"parameters": {
		"entity_id": "c5d5ee20-78a4-4dd0-b9ca-6a41809a6ca5"
	}
}
```

Returns entity attributes, all linked memories, and outgoing relations (e.g., Customer A -> uses -> PostgreSQL 16).

### Example: Contradiction resolution (OpenClaw plugin / REST API)

> RDF triple fields (`subject_entity_id`, `predicate`, `object_value`) are available via the OpenClaw plugin and REST API. MCP clients trigger contradiction detection through semantic similarity only (no explicit RDF triples).

**Original memory exists:**

```json
{
	"id": "aaa-111",
	"content": "Sarah Chen lives in Tel Aviv, Israel",
	"subject_entity_id": "e663...",
	"predicate": "lives_in",
	"object_value": "Tel Aviv, Israel",
	"status": "active"
}
```

**Agent writes contradicting memory:**

```json
{
	"tool": "memclaw_write",
	"parameters": {
		"content": "Sarah Chen moved to Berlin, Germany",
		"subject_entity_id": "e663...",
		"predicate": "lives_in",
		"object_value": "Berlin, Germany"
	}
}
```

**Response includes:**

```json
{
	"id": "bbb-222",
	"status": "active",
	"superseded_by": [
		{
			"old_memory_id": "aaa-111",
			"old_status": "outdated",
			"reason": "rdf_conflict",
			"old_content_preview": "Sarah Chen lives in Tel Aviv, Israel"
		}
	]
}
```

The old memory is automatically marked `outdated` with `supersedes_id` pointing to the new one.
