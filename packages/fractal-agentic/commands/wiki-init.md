---
description: Initialize the continuous LLM wiki vault — choose path, scaffold raw/wiki/output, write config and AGENTS.md schema with required description frontmatter.
---

# /wiki-init

Interactive setup for the Fractal Agentic continuous LLM wiki.

## Instructions

1. Load [skills/llm-wiki/SKILL.md](../skills/llm-wiki/SKILL.md) and
   [skills/llm-wiki/references/wiki-schema.md](../skills/llm-wiki/references/wiki-schema.md).

2. Ask one question at a time (defaults in parentheses):
   - Vault name (`fractal-wiki`)
   - Parent directory (`~/Documents`)
   - Domain / purpose (free text)
   - Default project slug (optional)

3. Full vault path = `{parent}/{name}`. Expand `~`.

4. Run scaffold:

   ```sh
   skill_dir=<plugin>/skills/llm-wiki
   sh "$skill_dir/scripts/wiki-init.sh" "<vault-path>" "<name>" "<domain>"
   ```

5. Write vault `AGENTS.md` using [agent-config-codex.md](../skills/llm-wiki/references/agent-config-codex.md)
   or [codex.md](../skills/llm-wiki/references/codex.md): embed domain tags and the
   full wiki schema from `## Architecture` onward in wiki-schema.md.
   Stress that every page needs **`description`** (≤120 chars).

6. Optionally write multi-host agent configs (Claude-compatible / Cursor / Gemini / etc.) if the user wants multi-agent support
   (templates under `skills/llm-wiki/references/`).

7. Tell the user:
   ```sh
   export FRACTAL_WIKI_ROOT=<absolute-vault-path>
   ```
   Config was also written under `~/.config/fractal-agentic/wiki.json` when missing.

8. Next steps: clip sources into `raw/`, run `/wiki-ingest`; orchestrate will append
   episodes under `raw/fractal/` when capture is enabled.

**Non-blocking:** if the user declines init, continue product work without a vault.
