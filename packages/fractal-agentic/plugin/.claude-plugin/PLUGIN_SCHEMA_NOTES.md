# Claude-compatible plugin manifest notes

Keep `.claude-plugin/plugin.json` lean. Undocumented validators often reject unknown fields.

## Safe pattern

```json
{
  "name": "fractal-agentic",
  "version": "2.4.0",
  "description": "…",
  "author": { "name": "…" }
}
```

## Tips

- Prefer **version** always present  
- Component paths may be declared in root `plugin.json` (`skills`, etc.) depending on host  
- Optional hooks are **not** auto-merged; see `hooks/hooks.claude.json` and `hooks/README.md`  
- Shared instructions: `AGENTS.md` + `SOUL.md` (via `CLAUDE.md` shim)  
