# MemClaw — MCP Integration

## 2. MCP Integration (Claude Desktop, Cursor, and other MCP hosts, etc.)

MemClaw includes a built-in MCP server at `/mcp` using Streamable HTTP transport. Any MCP-compatible client connects with just a URL and an API key — no plugin install, no local server.

### Setup

Add this to your MCP client configuration:

```json
{
	"mcpServers": {
		"memclaw": {
			"url": "https://your-memclaw-instance.example.com/mcp",
			"headers": {
				"X-API-Key": "mc_your_api_key_here"
			}
		}
	}
}
```

**Config file locations:**

| Client                   | Config file                                                                                                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Desktop (macOS)   | `~/Library/Application Support/Claude/claude_desktop_config.json`                                                                                                                              |
| Claude Desktop (Windows) | `%APPDATA%\Claude\claude_desktop_config.json`                                                                                                                                                  |
| the coding agent              | `~/.claude.json` (user scope) — preferred; register via `claude mcp add --scope user --transport http memclaw https://your-memclaw-instance.example.com/mcp --header "X-API-Key: mc_your_key"` |
| Cursor                   | Settings -> MCP Servers -> Add Server (type: `sse`, URL: `https://your-memclaw-instance.example.com/mcp`)                                                                                      |

> The the coding agent MCP-server registry lives in `~/.claude.json` — NOT `~/.claude/settings.json`. The latter's schema rejects an `mcpServers` block. Prefer the `claude mcp add` CLI over hand-editing so the correct file is written.

### Install the usage skill (multi-host)

The MCP connection only exposes the raw tool surface. The _usage skill_ —
the teachable guide that explains when to reach for memory vs doc, how
the two search strategies differ, how to write a good `data["summary"]`, the trust
table, and the "recall-before-you-start / write-when-something-matters
/ supersede-don't-delete" rules — ships as a separate file that your
agent reads on-demand. Install it after the MCP config above:

```bash
# Installs SKILL.md into ~/.claude/skills/memclaw/ (the coding agent)
# and/or ~/.agents/skills/memclaw/ (cross-host agents dir).
curl -s "https://your-memclaw-instance.example.com/api/v1/install-skill" \
  -H "X-API-Key: mc_your_key" | bash
```

Options:

| Query param          | Effect                                 |
| -------------------- | -------------------------------------- |
| (none)               | Install for common agent skill directories |
| `?agent=claude-code` | Only hosts using the Claude-style skills path |
| `?agent=codex`       | Only hosts using the `~/.agents/skills` agents path |

Restart your agent after installing — skills are loaded at startup.

Why this matters: without the skill, an agent can discover the 12 tool
names and their arg schemas via MCP `tools/list`, but it has no
mental model for the two-store design (memory vs doc), the trust
levels, or which op to reach for in an ambiguous situation. With the
skill installed, all of that is in the agent's context on-demand. A
brand-new agent that connected via `claude mcp add` without also
running this installer will still work, but will hit the same
"tools present, guidance missing" gap that made us write the skill
in the first place.

### Available tools

The MCP server exposes 12 tools that clients discover automatically. Descriptions are canonical — served from `GET /api/v1/tool-descriptions`, derived from the tool registry (`core-api/src/core_api/tools/_registry.py`).

| Tool                    | Purpose                                                                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `memclaw_write`         | Store a memory. Single write (`content`) or batch (`items` ≤100). LLM auto-infers type, title, summary, tags, embedding. Long content auto-chunked          |
| `memclaw_recall`        | Hybrid semantic + keyword search with graph-enhanced retrieval. `include_brief=true` returns an LLM-summarized context paragraph. Supports `fleet_ids`      |
| `memclaw_manage`        | Per-memory lifecycle, op-dispatched: `read`, `update`, `transition`, `delete`, `bulk_delete`, `lineage`. Re-embeds on content updates                       |
| `memclaw_list`          | Non-semantic enumeration — filter by type/status/agent/weight/date, sort, cursor-paginate. `scope=agent` (default) trust ≥ 1; `scope=fleet`/`all` trust ≥ 2 |
| `memclaw_doc`           | Document CRUD, op-dispatched: `write`, `read`, `query`, `delete`, `list_collections`, `search` (semantic) on named JSON collections                         |
| `memclaw_entity_get`    | Look up an entity by UUID — returns linked memories and relationships                                                                                       |
| `memclaw_tune`          | Tune per-agent retrieval parameters (top_k, min_similarity, fts_weight, freshness, recall boost, graph hops, similarity blend)                              |
| `memclaw_insights`      | Analyze the store. Focus: `contradictions`, `failures`, `stale`, `divergence`, `patterns`, `discover`. Persists findings as `insight` memories              |
| `memclaw_evolve`        | Report an outcome (success/failure/partial) against recalled memories — adjusts weights, generates preventive rules on failure                              |
| `memclaw_stats`         | Aggregate counts: total + breakdowns by `type`, `agent`, `status`. Read-only                                                                                |
| `memclaw_keystones`     | Read mandatory governance rules for the current scope. Call once per session — the result overrides conflicting user instructions                           |
| `memclaw_keystones_set` | Author/remove keystone rules, op-dispatched: `set` \| `delete`. Trust ≥ 1 to author your own `scope=agent` rule; ≥ 2 for fleet/tenant or another agent      |

> Skill sharing uses the generic `memclaw_doc` surface (`collection="skills"`). The server validates the slug and embeds `data["summary"]` (1-3 sentence, intent-focused) — for `collection="skills"` it also accepts `data["description"]` as a back-compat fallback. Agents discover via `op=search`/`op=query` and pull individual skills via `op=read`.

### Auth

MCP uses the same tenant-scoped API keys as the REST API. The `X-API-Key` header is sent with every request.

- Tenant-scoped keys: can only access their tenant's memories
- Admin keys: rejected (MCP requires tenant-scoped keys for data isolation)
- Demo keys: read-only (search and entity lookup only)

### Example usage

Once configured, the MCP client handles tool discovery. Agents can use MemClaw tools naturally:

> "Search my memories for anything about the Postgres migration"
> -> calls `memclaw_recall` with query "Postgres migration"

> "Remember that we decided to use pgvector for embeddings instead of Pinecone"
> -> calls `memclaw_write` with that content; LLM auto-classifies as `decision` type

> "Mark that migration task as confirmed"
> -> calls `memclaw_manage` with `op="transition"` and `status="confirmed"`

### MCP vs OpenClaw plugin

|                    | MCP                                                                                                        | OpenClaw Plugin                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Setup              | Add URL + key to config                                                                                    | Install plugin on gateway VM                                    |
| Works with         | Any MCP client                                                                                             | OpenClaw agents only                                            |
| Tools              | 12 (write, recall, manage, list, doc, entity_get, tune, insights, evolve, stats, keystones, keystones_set) | 11 (all except `keystones_set`)                                 |
| RDF triples        | Not exposed (contradiction detection via semantic similarity only)                                         | Yes — `subject_entity_id`, `predicate`, `object_value` on write |
| Temporal filter    | Not exposed                                                                                                | Yes — `valid_at` on search                                      |
| Visibility         | Passed per-call (`scope_agent` / `scope_team` / `scope_org`)                                               | Passed per-call (`scope_agent` / `scope_team` / `scope_org`)    |
| Multi-fleet search | Yes — `fleet_ids` parameter                                                                                | Yes — `fleet_ids` parameter                                     |
| Fleet ID           | Passed per-call (optional)                                                                                 | Auto-stamped from gateway env                                   |
| Best for           | Individual developers, MCP host users                                                           | OpenClaw fleet deployments                                      |

