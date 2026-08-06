# Tooling reference (optional)

| Tool | Install | Use |
|---|---|---|
| Obsidian Web Clipper | Browser store | Save articles into vault `raw/` |
| summarize | `npm i -g @steipete/summarize` | Summarize URLs/files before ingest |
| qmd | `npm i -g @tobilu/qmd` | Hybrid search when wiki is large (~100+ pages) |
| agent-browser | `npm i -g agent-browser && agent-browser install` | Web research when fetch fails |

v1 Fractal wiki search defaults to `wiki/index.md` + ripgrep. Use `qmd` when available:

```bash
qmd search "query" --path "$FRACTAL_WIKI_ROOT/wiki"
```
