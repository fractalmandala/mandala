---
task: open-design-product-fork-strip
status: done
path: /Users/amrit/backup-fractalsvelte/open-design-main
updated: 2026-08-10
---

# Handoff — Product fork strip (Open Design moorings)

## Done this pass

Control plane: `apps/web/src/features/productFork.ts` (`PRODUCT_FORK_MODE = true`).

| Area | Change |
|---|---|
| Defaults | Local OpenAI-compatible `:8000/v1`, key `local`, empty model, protocol `openai` |
| Provider catalog | Only Local MLX / Ollama / custom OpenAI-compatible |
| Protocol tabs | openai + ollama only |
| Suggested models | Gemma MLX ids + local ollama list |
| Telemetry | off by default |
| Agent order | opencode first; no amr |
| Cloud agent | still blocked (daemon + UI) |
| first-party hosts | empty; bridge never treats openfractal.ai as ours |
| Handoff | no vela/amr target |
| Config migrate | rewrites Anthropic/Claude stock defaults on load |

## Docs

- `PRODUCT-FORK.md` (primary)
- `BYOK-ONLY.md` still valid; superseded by product fork

## Not deleted (kept for build / later)

Vela routes, wallet UI source, full UPSTREAM_KNOWN_PROVIDERS array, design systems, skills, Studio.

## Next (user)

1. Clear `openfractal:config` localStorage once if UI still shows Claude defaults.  
2. Embed mandala design systems / Svelte skills / code-to-design.  
3. Optional deep delete of Vela packages after host is stable.

## Verify

```bash
fnm use 24
cd /Users/amrit/backup-fractalsvelte/open-design-main
# rebuild better-sqlite3 if needed
pnpm tools-dev run web
```

Settings should show OpenAI-compatible + Ollama, base `http://127.0.0.1:8000/v1`.
