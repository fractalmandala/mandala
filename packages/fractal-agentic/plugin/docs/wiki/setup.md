---
title: "Wiki setup"
description: "Create one local vault, point coding-agent hosts at it, and verify that the wiki can be resolved."
type: guide
---

# Wiki setup

## One vault for all tools

Create the vault **once**. Codex, Grok, Gemini, Claude, etc. share the same folder if they can resolve the path. You do **not** re-init per tool.

## Init

### In agent (recommended)

```text
/wiki-init
```

Answer: name, parent directory, domain, optional project slug.

### Shell

```sh
sh "$FRACTAL_AGENTIC_ROOT/skills/llm-wiki/scripts/wiki-init.sh" \
  ~/Documents/fractal-wiki \
  "fractal-wiki" \
  "Engineering and product knowledge"
```

## Point tools at the vault

**Priority:**

1. `export FRACTAL_WIKI_ROOT=/absolute/path/to/vault`  
2. `~/.config/fractal-agentic/wiki.json` → `"wiki_root"`  
3. Project `.fractal-wiki` marker or existing vault markers  

```sh
# permanent for shell-born agents
echo 'export FRACTAL_WIKI_ROOT="$HOME/Documents/fractal-wiki"' >> ~/.zshrc
```

GUI apps that don’t load zshrc: set the same env in the app, or rely on `wiki.json`.

Check:

```sh
sh "$FRACTAL_AGENTIC_ROOT/skills/llm-wiki/scripts/wiki-resolve-root.sh"
# or /wiki-status
```

## Scaffold created

```text
$FRACTAL_WIKI_ROOT/
  .fractal-wiki.json
  raw/  raw/assets/  raw/fractal/
  wiki/index.md  wiki/log.md
  wiki/sources/  entities/  concepts/  synthesis/
  output/
```

`/wiki-init` also writes vault `AGENTS.md` (librarian rules + schema) when the agent completes the wizard.

## Capture flags (`wiki.json`)

```json
"capture": {
  "orchestrate": true,
  "boss_handoff": false,
  "santa_ship": true
}
```

Turn orchestrate capture off if you only want manual `/wiki-capture`.
