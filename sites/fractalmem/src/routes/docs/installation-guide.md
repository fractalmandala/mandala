---
title: Installation Guide
description: How to install this system in any project.
id: 2
---


## Prerequisites
- Python 3.10+
- `uv` recommended (falls back to `python3 -m venv` automatically if not
  found)
- `sqlite3` CLI on your PATH if you want to run `smriti-metrics.sh`
  (everything else only needs Python's built-in `sqlite3` module, which
  is always present)
- An MCP-capable client: Claude Desktop, Claude Code, or Cowork

## Steps

1. **Get the package onto disk.** Unzip `skaa-package.zip` (or clone the
   directory) somewhere convenient — it does not need to live inside the
   project you're installing it into.

2. **Run the installer, pointing at your target project:**
   ```bash
   ./skaa-package/scripts/install.sh /path/to/your/project
   ```
   This copies the server, scripts, docs, and config into
   `<project>/.skaa/`, sets up a Python environment there, initializes
   `.skaa/smriti.db`, runs a self-test, and logs the install itself into
   smriti. It prints an MCP config block at the end — copy that, it has
   your real absolute paths already filled in.

3. **Register the MCP server.** Paste the printed block into:
   - Claude Desktop: `claude_desktop_config.json` under `mcpServers`
     (path varies by OS — see `config/mcp.config.example.json` for both)
   - Claude Code: your project's `.mcp.json`, or `claude mcp add`
   - Cowork: however your Cowork setup registers project-local MCP
     servers (check `config/mcp.config.example.json` either way — the
     JSON shape is the same everywhere, only the file it goes in differs)

4. **Restart the client / reload MCP servers.** Then call `skaa_status`
   — you should get back `tool_count: 4` and the entry count from step 2.

5. **Do one real read/write.** Not the install self-test — an actual
   `skaa_memory_write` about something you're working on, then a
   `skaa_memory_query` for it. This is the fastest way to catch a
   misconfigured path before smriti has anything real in it.

6. **Set up the measurement harness.**
   - Open `.skaa/scripts/memory-probes.yaml` and add 2-3 probes specific
     to your project (see the commented templates at the bottom of the
     file).
   - Run `.skaa/scripts/run_probes.py` and `.skaa/scripts/behavioral_probes.py`
     once now, then again on whatever cadence you want (CHECKLIST.md has
     a suggested day-3/week-1/week-4 rhythm).
   - Run `.skaa/scripts/smriti-metrics.sh` for a fast sqlite3-only health
     check any time.
   - All three append rows to `docs/metrics/SMRITI-LOG.md` at your
     project root (not inside `.skaa/`, so it sits next to your other
     project docs).

7. **Read the docs, once, up front.** `docs/ARCHITECTURE.md` explains the
   data model and why it's shaped this way; `docs/SUTRAS.md` is the short
   rulebook (quote sutra IDs like "SYS-03" instead of re-explaining them);
   `docs/ADR-001-schema.md` is the storage decision record.

## Uninstalling
```bash
./skaa-package/scripts/uninstall.sh /path/to/your/project        # keeps smriti.db
./skaa-package/scripts/uninstall.sh /path/to/your/project --purge # deletes everything
```

## Reinstalling / upgrading
Re-running `install.sh` overwrites `.skaa/server`, `.skaa/scripts`,
`.skaa/docs`, and `.skaa/config`, but never touches `.skaa/smriti.db` —
your actual memory survives a reinstall. If you've edited
`memory-probes.yaml` with project-specific probes, back that file up
first; a reinstall replaces it with the package's starter version.

## Troubleshooting
- **`skaa_status` isn't showing up as a tool at all** — the MCP client
  didn't pick up the config; double-check the JSON is valid (no trailing
  commas) and that you restarted the client, not just the conversation.
- **Self-test fails during install** — run it manually with more output:
  `SKAA_DB_PATH=/path/.skaa/smriti.db uv run --directory /path/.skaa/server skaa_server.py --selftest`
- **`run_probes.py` says "No module named yaml"** — `pip install pyyaml`
  in whatever environment you're running the script with (the MCP server
  itself doesn't need PyYAML, only the probe scripts do — SYS-06).
- **`smriti-metrics.sh` says sqlite3 not found** — install the sqlite3
  CLI package for your OS; it's unrelated to Python's sqlite3 module,
  which the server itself already uses fine.
