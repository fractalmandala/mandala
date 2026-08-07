# scanner

json output
```json
{
  "version": 1,
  "project": {
    "name": "FractalEngine Studio",
    "slug": "fractalengine",
    "tagline": "Spatial canvas, notes wiki, and native IDE for creative developers",
    "date": "2026-07-17"
  },
  "stats": { "agents": 2, "models": 4, "tools": 3, "integrations": 3 },
  "topModels": [
    { "id": "gemini", "label": "Gemini", "domain": "gemini.google.com" },
    { "id": "claude", "label": "Claude", "domain": "claude.ai" },
    { "id": "gpt-4o", "label": "GPT-4o", "domain": "openai.com" }
  ],
  "topTools": [
    { "id": "dictation", "label": "Apple Dictation", "domain": "apple.com" },
    { "id": "tiptap", "label": "TipTap Editor", "domain": "tiptap.dev" },
    { "id": "codemirror", "label": "CodeMirror", "domain": "codemirror.net" }
  ],
  "topIntegrations": [
    { "id": "tauri", "label": "Tauri", "domain": "tauri.app" },
    { "id": "sqlite", "label": "SQLite", "domain": "sqlite.org" },
    { "id": "keychain", "label": "macOS Keychain", "domain": "apple.com" }
  ],
  "graph": {
    "nodes": [
      {
        "id": "routes-layout",
        "label": "SvelteKit Root Layout",
        "kind": "entry",
        "sub": "routes/+layout.svelte",
        "detail": "Root shell bootstraps UI themes, tooltips, and registers menu-event IPC listeners.",
        "sourceRef": "src/routes/+layout.svelte"
      },
      {
        "id": "routes-page",
        "label": "SvelteKit Router Page",
        "kind": "entry",
        "sub": "routes/+page.svelte",
        "detail": "Main entry point routing to classic IDE layout, spatial canvas, or wiki templates.",
        "sourceRef": "src/routes/+page.svelte"
      },
      {
        "id": "agent-copilot",
        "label": "AI Copilot",
        "kind": "agent",
        "sub": "streamApiModel / runLocalModel",
        "group": "AI Copilot",
        "detail": "Answers questions with workspace context, active files, and attached assets.",
        "sourceRef": "src/lib/state/ide.svelte.ts:1700"
      },
      {
        "id": "agent-frontend-designer",
        "label": "Frontend Designer",
        "kind": "agent",
        "sub": "agents/orchestrators",
        "detail": "Orchestrator for Svelte 5 runes, styling guidelines, and feature layout.",
        "sourceRef": "agents/orchestrators/frontend-designer/AGENT.md"
      },
      {
        "id": "model-gemini",
        "label": "Gemini Pro/Flash",
        "kind": "model",
        "domain": "gemini.google.com"
      },
      {
        "id": "model-claude",
        "label": "Claude 3.5 Sonnet",
        "kind": "model",
        "domain": "claude.ai"
      },
      {
        "id": "model-gpt4",
        "label": "GPT-4o",
        "kind": "model",
        "domain": "openai.com"
      },
      {
        "id": "model-local",
        "label": "Local GGUF/MLX",
        "kind": "model"
      },
      {
        "id": "service-ai-workspace",
        "label": "AI Workspace Module",
        "kind": "service",
        "sub": "modules/ai",
        "group": "AI Copilot",
        "detail": "Tabbed panels coordinating chat logs, terminal views, and active documents.",
        "sourceRef": "src/lib/modules/ai/state/ai.svelte.ts"
      },
      {
        "id": "service-model-registry",
        "label": "Model Registry",
        "kind": "service",
        "sub": "modelRegistry.svelte.ts",
        "group": "AI Copilot",
        "detail": "Manages BYOK keys, endpoints, and local model file selections.",
        "sourceRef": "src/lib/state/modelRegistry.svelte.ts"
      },
      {
        "id": "service-dictation",
        "label": "Dictation Bridge",
        "kind": "service",
        "sub": "macOS dictation.rs",
        "detail": "On-device macOS speech recognition bridge for accessible typing.",
        "sourceRef": "src-tauri/src/dictation.rs"
      },
      {
        "id": "service-undo-engine",
        "label": "Undo Engine",
        "kind": "service",
        "sub": "UndoHistory.transact()",
        "detail": "App-wide composite undo/redo manager via snapshot boundaries.",
        "sourceRef": "src/lib/state/undoHistory.svelte.ts"
      },
      {
        "id": "service-classic-ide",
        "label": "IDE Classic Layout",
        "kind": "service",
        "sub": "modules/ide",
        "group": "Editor & Wiki",
        "detail": "File tree, editor panels using CodeMirror/Monaco, and terminal console launcher.",
        "sourceRef": "src/lib/modules/ide/components/ClassicIdeLayout.svelte"
      },
      {
        "id": "service-browser-engine",
        "label": "Browser Engine",
        "kind": "service",
        "sub": "modules/browser",
        "group": "Browser & Vault",
        "detail": "Multi-tab embedded browser window utilizing native WebViews.",
        "sourceRef": "src-tauri/src/browser/mod.rs"
      },
      {
        "id": "service-password-vault",
        "label": "Password Vault",
        "kind": "service",
        "sub": "AES-256-GCM envelope",
        "group": "Browser & Vault",
        "detail": "Provides secure password management and autofill actions in web pages.",
        "sourceRef": "src/lib/modules/browser/state/vault.svelte.ts"
      },
      {
        "id": "service-designer-canvas",
        "label": "Designer Canvas",
        "kind": "service",
        "sub": "modules/designer",
        "group": "Editor & Wiki",
        "detail": "Visual workspace supporting spatial tile placement, layout designs, and art.",
        "sourceRef": "src/lib/modules/designer/state/canvas.svelte.ts"
      },
      {
        "id": "service-notes-wiki",
        "label": "Notes & Wiki",
        "kind": "service",
        "sub": "modules/notes",
        "group": "Editor & Wiki",
        "detail": "Interactive wiki editor built on TipTap supporting rich text and images.",
        "sourceRef": "src/lib/modules/notes/state/notes.svelte.ts"
      },
      {
        "id": "service-media-library",
        "kind": "service",
        "label": "Media Library",
        "sub": "modules/media",
        "detail": "Discovers and catalogs image, audio, and video assets in designated folders.",
        "sourceRef": "src/lib/modules/media/state/media.svelte.ts"
      },
      {
        "id": "service-bookmarks-manager",
        "kind": "service",
        "label": "Bookmarks Manager",
        "sub": "modules/bookmarks",
        "detail": "Manages browser bookmarks with hierarchical folders and description search.",
        "sourceRef": "src/lib/modules/bookmarks/state/bookmarks.svelte.ts"
      },
      {
        "id": "service-contribution-registry",
        "kind": "service",
        "label": "Contributions Registry",
        "sub": "contributions.svelte.ts",
        "detail": "Global registry for custom commands, menu actions, and keybindings.",
        "sourceRef": "src/lib/state/contributions.svelte.ts"
      },
      {
        "id": "service-ipc-gateway",
        "kind": "service",
        "label": "Tauri IPC Gateway",
        "sub": "ipc.ts Gateway",
        "detail": "Single entry point for all frontend to Rust native communications.",
        "sourceRef": "src/lib/ipc.ts"
      },
      {
        "id": "store-passwords-json",
        "label": "passwords.json",
        "kind": "store",
        "group": "Browser & Vault",
        "detail": "Secure database of saved accounts and credentials."
      },
      {
        "id": "store-browser-session",
        "label": "browser-session.json",
        "kind": "store",
        "group": "Browser & Vault",
        "detail": "Restores open tabs, view states, and window configurations."
      },
      {
        "id": "store-project-memory",
        "label": "Project SQLite DB",
        "kind": "store",
        "group": "AI Copilot",
        "detail": "SQLite database storage containing message threads and checkpoints."
      },
      {
        "id": "store-media-db",
        "label": "Media SQLite DB",
        "kind": "store",
        "detail": "Media asset library metadata storage catalog."
      },
      {
        "id": "store-app-db",
        "label": "App SQLite DB",
        "kind": "store",
        "group": "Editor & Wiki",
        "detail": "Global search index database using FTS5 virtual tables."
      },
      {
        "id": "store-keychain",
        "label": "OS Keychain",
        "kind": "store",
        "detail": "Stores master AES key for decrypting local passwords and BYOK keys."
      }
    ],
    "edges": [
      { "from": "routes-layout", "to": "service-ipc-gateway", "kind": "calls" },
      { "from": "routes-page", "to": "service-classic-ide", "kind": "triggers" },
      { "from": "routes-page", "to": "service-designer-canvas", "kind": "triggers" },
      { "from": "routes-page", "to": "service-notes-wiki", "kind": "triggers" },
      { "from": "routes-page", "to": "service-ai-workspace", "kind": "triggers" },
      { "from": "service-ai-workspace", "to": "agent-copilot", "kind": "triggers" },
      { "from": "agent-copilot", "to": "service-model-registry", "kind": "reads" },
      { "from": "agent-copilot", "to": "service-ipc-gateway", "kind": "calls", "label": "invokes LLM streams" },
      { "from": "service-ipc-gateway", "to": "model-gemini", "kind": "calls" },
      { "from": "service-ipc-gateway", "to": "model-claude", "kind": "calls" },
      { "from": "service-ipc-gateway", "to": "model-gpt4", "kind": "calls" },
      { "from": "service-ipc-gateway", "to": "model-local", "kind": "calls", "label": "spawns local sidecar" },
      { "from": "service-model-registry", "to": "store-keychain", "kind": "reads", "label": "validates BYOK keys" },
      { "from": "agent-copilot", "to": "store-project-memory", "kind": "writes", "label": "saves and loads chat" },
      { "from": "service-browser-engine", "to": "service-password-vault", "kind": "calls", "label": "autofills fields" },
      { "from": "service-password-vault", "to": "store-passwords-json", "kind": "writes", "label": "saves credential" },
      { "from": "store-passwords-json", "to": "store-keychain", "kind": "reads", "label": "AES-GCM key lookup" },
      { "from": "service-browser-engine", "to": "store-browser-session", "kind": "writes", "label": "saves active tabs" },
      { "from": "service-notes-wiki", "to": "store-app-db", "kind": "writes", "label": "indexes wiki pages" },
      { "from": "service-bookmarks-manager", "to": "store-app-db", "kind": "writes", "label": "indexes bookmarks" },
      { "from": "service-classic-ide", "to": "store-app-db", "kind": "reads", "label": "FTS5 global search" },
      { "from": "service-classic-ide", "to": "service-undo-engine", "kind": "calls", "label": "undo-redo transaction" },
      { "from": "service-designer-canvas", "to": "service-undo-engine", "kind": "calls" },
      { "from": "service-notes-wiki", "to": "service-undo-engine", "kind": "calls" },
      { "from": "service-media-library", "to": "store-media-db", "kind": "writes", "label": "catalogs import" },
      { "from": "service-classic-ide", "to": "service-dictation", "kind": "triggers" },
      { "from": "service-dictation", "to": "service-ipc-gateway", "kind": "calls" },
      { "from": "agent-frontend-designer", "to": "service-designer-canvas", "kind": "calls" },
      { "from": "agent-frontend-designer", "to": "service-notes-wiki", "kind": "calls" },
      { "from": "agent-frontend-designer", "to": "service-classic-ide", "kind": "calls" }
    ]
  }
}
```

prompt

```
Analyze THIS repository and publish a shareable "codebase scan" to foglamp —
a map of how the codebase works and how it uses AI. You produce only the data
(a small JSON object); a fixed renderer draws the scan. Write no HTML or CSS.

## Steps
1. Investigate the repo and build the JSON below. Write it to .foglamp/scan.json.
2. Upload it (see "Publish") and capture the JSON response.
3. Save the response to .foglamp/scan.lock.json (so a later run updates the same
   URL). Make sure .foglamp/ is gitignored — the edit token is a secret.
4. Open the returned url and give it to the user.

## How to investigate
- Find where AI runs: generateText / streamText / generateObject / streamObject,
  @ai-sdk/* providers, agent loops, tool definitions (tool({...})).
- Identify the models and their provider (OpenAI, Anthropic, Google, …).
- Identify tools models can call (Exa, Firecrawl, Parallel, DB queries, internal
  functions) and external integrations/services.
- Map the product logic too: the internal services/pipelines the product is
  built from (functions, features, background workers, storage, rust) — these
  become "service" nodes, and the interesting sentence goes on the edge
  (e.g. "uses only SASS for styling").
- Map the main flows: entry points (routes, webhooks, pages, CLIs), scheduled jobs
  (crons/queues/workers), the agents, the models/tools they use, and the
  datastores/services they read and write.

## Output contract — write EXACTLY this shape to .foglamp/scan.json
{
  "version": 1,
  "project": {
    "name": "string (<=48)",
    "slug": "lowercase-dashed (<=48)",
    "tagline": "one line (<=80, optional)",
    "iconDomain": "favicon domain for the project, e.g. acme.com (optional)",
    "date": "YYYY-MM-DD"
  },
  "stats": { "agents": 0, "models": 0, "tools": 0, "integrations": 0 },
  "topModels":       [ { "id": "gpt-4o", "label": "GPT-4o", "domain": "openai.com" } ],
  "topTools":        [ { "id": "exa", "label": "Exa", "domain": "exa.ai" } ],
  "topIntegrations": [ { "id": "stripe", "label": "Stripe", "domain": "stripe.com" } ],
  "graph": {
    "nodes": [
      { "id": "chat", "label": "Dashboard chat", "kind": "entry", "sub": "/api/chat" },
      { "id": "agent", "label": "Support agent", "kind": "agent", "sub": "streamText",
        "sourceRef": "src/agents/support.ts:42",
        "detail": "Answers tickets with order lookups (<=200, optional)" },
      { "id": "gpt4o", "label": "GPT-4o", "kind": "model", "domain": "openai.com" },
      { "id": "billing", "label": "Billing service", "kind": "service",
        "sourceRef": "src/services/billing.ts" },
      { "id": "pg", "label": "Postgres", "kind": "store", "domain": "postgresql.org" }
    ],
    "edges": [
      { "from": "chat", "to": "agent", "kind": "triggers" },
      { "from": "agent", "to": "gpt4o", "kind": "calls" },
      { "from": "billing", "to": "pg", "kind": "writes", "label": "charges on trial end" }
    ]
  }
}

## Rules (these keep every scan consistent — do not break them)
- Caps: topModels <= 3, topTools <= 10, topIntegrations <= 10, graph.nodes <= 60,
  graph.edges <= 120. One map holds everything — AI flows AND product logic.
  Big maps are welcome (the viewer pans); aim for 20-40 nodes on a substantial
  codebase. Rich, not sparse — but every node must earn its place.
- Give every distinct agent its OWN node when there are <= 10 agents; only
  merge agents into one node when they are numerous and near-identical (then
  say so in sub, e.g. "12 near-identical scrapers"). Chain agents with
  agent->agent edges when one feeds the next.
- group (optional, <=24): tag related nodes with a shared group name — those
  nodes render as one labeled vertical stack. Group by feature/domain the way a
  team would say it ("Billing", "Ingestion", "Setup pipeline"), not by file
  layout. Use 2-3 groups of 3-6 nodes; leave hub-and-spoke nodes ungrouped.
- Node labels <= 28 chars, sub <= 40, edge labels <= 24.
- kind is one of: entry (trigger/route/page/CLI), cron (scheduled job), agent,
  model, tool, service (internal business-logic module/pipeline the project
  owns), store (DB/cache/index), external (3rd-party API).
- Edge kind (optional): "calls" | "reads" | "writes" | "triggers" — what the
  connection does. Prefer setting it; it's shown quietly (revealed when a flow
  is traced). Add a label only when a specific phrase says more (e.g. "charges
  on trial end" — put the business logic on edges); labels are always visible.
- domain is a favicon domain with no scheme (openai.com, anthropic.com, exa.ai,
  clickhouse.com). Add it to anything a recognizable company/product owns; omit it
  for purely internal nodes (entries, crons, services, internal tools). Use the
  product domain for models (gemini.google.com for Gemini, claude.ai for Claude).
- detail (optional, <=200) is shown when a node is clicked — one sentence of
  what it does. sourceRef (optional, <=120) is the repo path (plus :line) where
  the node lives, e.g. "src/agents/support.ts:42" — add it to internal nodes so
  teammates can jump to code.
- Every edge's from/to must reference an existing node id; ids unique.
- Use today's date for project.date.

## Publish
First run (no .foglamp/scan.lock.json):
  curl -sS -X POST https://api.foglamp.dev/scan \
    -H 'content-type: application/json' --data @.foglamp/scan.json

Update run (a .foglamp/scan.lock.json exists) — keep the same URL:
  jq -n --slurpfile d .foglamp/scan.json \
        --arg t "$(jq -r .editToken .foglamp/scan.lock.json)" \
        '{data: $d[0], editToken: $t}' \
  | curl -sS -X POST https://api.foglamp.dev/scan \
      -H 'content-type: application/json' --data @-

The response is JSON: { "slug", "url", "editToken", "expiresAt" }. Save it to
.foglamp/scan.lock.json, then open url. On a 422 error, fix .foglamp/scan.json
to satisfy the rules and retry.
```


```
Analyze THIS repository's change history and code shape, and produce a
"code health scan" — a heat map of where risk concentrates (files that
change often AND are hard to change safely). You produce only the data
(a small JSON object); a fixed renderer draws the scan. Write no HTML or CSS.

## Steps
1. Run the recipes below and build the JSON. Write it to .healthscan/scan.json.
2. Report the file path and your 3 most important findings to the user.

## Window
Use the last 12 months of git history. If the repo is younger, use its full
history and set project.windowDays accordingly.

## Recipes
- Per-file commits, authors, last-touch date, and lines changed — ONE pass:
    git log --no-renames --since="12 months ago" \
      --pretty=tformat:"%ae%x09%ad" --date=short --numstat
  Parse blocks: a line "email<TAB>date" starts a commit; following
  "added<TAB>removed<TAB>path" lines belong to it. Aggregate per path:
  commit count, unique author set, max date, added+removed (linesChanged).
- Tracked files and LOC:  git ls-files  then  wc -l  (current worktree).
- Complexity proxy per file (branch-token density):
    rg -c '\b(if|elif|else if|for|while|case|catch|switch|match)\b|&&|\|\|' <file>
  complexity = clamp(round(tokens / loc * 100 * 5), 0, 100)   # 20 tokens/100 LOC => 100
  Then for the top 15 files by commits*loc, READ the file and adjust the
  score with judgment (long functions, deep nesting, mutable global state,
  god-objects raise it; simple declarative code lowers it).

## Exclude
Lockfiles (package-lock, pnpm-lock, yarn.lock, Cargo.lock, Gemfile.lock),
generated/vendored/minified code, build output, binaries and media,
anything under 20 LOC.

## Caps
files <= 400 (keep the highest commits*loc), notes <= 6, summaries only for
the top 12 files. Every path repo-relative with forward slashes.

## Output contract — write EXACTLY this shape to .healthscan/scan.json
{
  "version": 1,
  "scan": "health",
  "project": {
    "name": "string (<=48)",
    "slug": "lowercase-dashed (<=48)",
    "tagline": "one line (<=80, optional)",
    "date": "YYYY-MM-DD",
    "windowDays": 365,
    "commitCount": 0
  },
  "stats": { "files": 0, "loc": 0, "commits": 0, "authors": 0 },
  "notes": [
    { "title": "short finding (<=48)",
      "body": "evidence from the numbers (<=200)",
      "severity": "info | warn | alert",
      "path": "repo/path/if/about-one-file (optional)" }
  ],
  "files": [
    { "path": "src/state/ide.svelte.ts",
      "loc": 2400,
      "commits": 87,
      "linesChanged": 5600,
      "authors": 2,
      "lastCommit": "YYYY-MM-DD",
      "complexity": 72,
      "summary": "what this file owns, one line (<=80, top-12 files only)" }
  ]
}

## Rules
- notes must be grounded in the computed numbers (e.g. "3 files absorb 58%
  of all churn", "single-author + high churn = bus-factor risk",
  "high complexity + zero churn = stable but scary"). No vague advice.
- severity: alert = act soon, warn = watch, info = context.
- stats.authors = unique authors across the whole window; stats.commits =
  commits that touched included files; stats.files/stats.loc = after excludes.
- Do NOT compute risk scores or rankings — the renderer does that uniformly.
- Use today's date for project.date.
```