# LLM Wiki — config & root resolve

## Resolve order

1. Env `FRACTAL_WIKI_ROOT` if set and directory exists (or will be created by init)
2. User config file (first hit):
   - `$XDG_CONFIG_HOME/fractal-agentic/wiki.json`
   - `~/.config/fractal-agentic/wiki.json`
   - `~/.fractal-agentic/wiki.json`
3. Project marker (optional): walk up from cwd for `.fractal-wiki` file whose contents
   are an absolute path, or for a directory that contains `.fractal-wiki.json` + `wiki/`

If none resolve: wiki is **disabled** for the session (non-blocking).

## User config shape (`wiki.json`)

```json
{
  "version": 1,
  "wiki_root": "/Users/you/Documents/fractal-wiki",
  "capture": {
    "orchestrate": true,
    "boss_handoff": false,
    "santa_ship": true
  },
  "defaults": {
    "project": null
  }
}
```

## Vault metadata (`.fractal-wiki.json` in vault root)

Written by `/wiki-init`:

```json
{
  "version": 1,
  "name": "fractal-wiki",
  "domain": "Engineering work across fractal monorepo",
  "created": "2026-08-02",
  "schema": "fractal-agentic/llm-wiki"
}
```

## Scripts

| Script | Purpose |
|---|---|
| `scripts/wiki-resolve-root.sh` | Print absolute vault root or exit 1 |
| `scripts/wiki-init.sh` | Scaffold raw/wiki/output + index/log |

## Non-blocking

Missing root, missing dirs, or write errors must never stop `/orchestrate` or feature work.
State once and continue.
