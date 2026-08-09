# MemClaw — Agent Trust Levels

## 4. Agent Trust Levels

MemClaw enforces a 4-tier trust system for agents. Agents are auto-registered on their first `memclaw_write` call at trust level 1.

| Level | Name          | Permissions                                                       |
| ----- | ------------- | ----------------------------------------------------------------- |
| 0     | `restricted`  | No read or write access. Use to temporarily disable an agent      |
| 1     | `standard`    | Read and write within own fleet only (default for new agents)     |
| 2     | `cross_fleet` | Read across all fleets in the tenant; write within own fleet only |
| 3     | `admin`       | Read and write across all fleets; can delete memories             |

### How it works

- On first write, the agent is auto-registered with trust level 1 and the `fleet_id` from that write becomes its "home fleet"
- Trust level is enforced on every API call — an agent at level 1 attempting a cross-fleet search gets a 403
- The admin API key bypasses all trust enforcement

### Managing trust levels

**Via the Manage page** (`/ui/tenant-admin.html`): The Agents tab shows all registered agents with their trust levels, home fleets, and last-seen timestamps. Click to adjust trust.

**Via API:**

| Endpoint                                     | Method | Purpose                                              |
| -------------------------------------------- | ------ | ---------------------------------------------------- |
| `/api/v1/agents?tenant_id=`                  | GET    | List all registered agents with trust levels         |
| `/api/v1/agents/{agent_id}?tenant_id=`       | GET    | Single agent detail (trust level, home fleet, stats) |
| `/api/v1/agents/{agent_id}/trust?tenant_id=` | PATCH  | Update trust level (body: `{"trust_level": 2}`)      |

### The Manage page

The Manage page (`/ui/tenant-admin.html`) is the tabbed tenant admin dashboard, accessible after sign-in. Usage stats are always visible at the top, with four tabs:

- **Agents** — view all registered agents, their trust levels, home fleets, and activity; adjust trust levels
- **API Keys** — create and revoke tenant-scoped API keys
- **Configuration** — per-tenant settings in three cards: **Models** (unified LLM provider/model for enrichment, recall, entity extraction + configurable fallback LLM for automatic failover + embedding provider/model), **Features** (enrichment, entity extraction, recall synthesis, graph retrieval, recall boost, semantic dedup, auto-crystallize, lifecycle automation, auto-chunking, agent approval), and **API Keys** (encrypted at rest). Agents can also self-tune their own search retrieval parameters (top_k, min_similarity, fts_weight, freshness, recall boost, graph hops, etc.) via the `memclaw_tune` tool
- **Crystallizer** — memory health + crystallization results: overall health score, hygiene issues, coverage metrics, type/status distributions, recall stats, crystallization actions taken, and report history. Run on-demand or nightly
- **Activity** — full audit trail of writes, deletes, and admin actions

