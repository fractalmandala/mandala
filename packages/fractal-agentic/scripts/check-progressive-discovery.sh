#!/bin/sh
# Non-mutating structural and scoped-link guard for progressive-discovery docs.

set -eu

pass() { printf '%s\n' "PASS: $*"; }
fail() { printf '%s\n' "FAIL: $*" >&2; exit 1; }

script_dir=$(CDPATH= cd "$(dirname "$0")" && pwd) || exit 1
plugin_dir=$(CDPATH= cd "$script_dir/.." && pwd) || exit 1
# Repo root: walk up to the .git boundary. The plugin may be nested more than
# one level below the root (e.g. packages/fractal-agentic in the mandala monorepo).
repo_dir=$plugin_dir
while [ "$repo_dir" != "/" ] && [ ! -e "$repo_dir/.git" ]; do
  repo_dir=$(CDPATH= cd "$repo_dir/.." && pwd) || exit 1
done
[ -e "$repo_dir/.git" ] || fail "cannot locate repository root above $plugin_dir"
rel_plugin=$(python3 -c 'import os, sys; print(os.path.relpath(sys.argv[2], sys.argv[1]))' "$repo_dir" "$plugin_dir") || exit 1
router=$plugin_dir/AGENTS.md
root_trampoline=$repo_dir/AGENTS.md
bosses='design code agent svelte creator workflow meta'

[ -f "$root_trampoline" ] || fail "missing root trampoline: $root_trampoline"
[ -f "$router" ] || fail "missing plugin router: $router"

router_lines=$(wc -l < "$router" | tr -d ' ')
[ "$router_lines" -le 180 ] || fail "plugin router is $router_lines lines (maximum 180)"
pass "plugin router is $router_lines lines (maximum 180)"

if ! grep -Fq "(./$rel_plugin/AGENTS.md)" "$root_trampoline"; then fail "root trampoline does not link to $rel_plugin/AGENTS.md"; fi
if ! grep -Fq "$rel_plugin/docs/bosses/INDEX.md" "$root_trampoline"; then fail "root trampoline does not link to boss hub"; fi
pass "root trampoline links to plugin router and boss hub"

if ! grep -Fq 'skills/boss-orchestration/SKILL.md' "$router"; then fail "plugin router does not link to runtime skill"; fi
if ! grep -Fq 'skills/INDEX.md' "$router"; then fail "plugin router does not link to live skills index"; fi
if ! grep -Fq 'agents/INDEX.md' "$router"; then fail "plugin router does not link to live agents index"; fi
if ! grep -Fq 'commands/INDEX.md' "$router"; then fail "plugin router does not link to live commands index"; fi

for boss in $bosses; do
  nested=$plugin_dir/docs/bosses/$boss/INDEX.md
  obsolete=$plugin_dir/docs/bosses/$boss.md
  [ -f "$nested" ] || fail "missing nested boss playbook: $nested"
  [ ! -e "$obsolete" ] || fail "obsolete flat boss page remains: $obsolete"
  if ! grep -Fq "docs/bosses/$boss/INDEX.md" "$router"; then fail "plugin router does not link to $boss playbook"; fi
done
pass "all seven nested boss playbooks exist; obsolete flat pages are absent"
pass "plugin router links to all seven boss playbooks and live indexes"

resolved_plugin_dir=$(sh "$plugin_dir/scripts/resolve-plugin-root.sh") || fail "plugin-root resolver rejected the complete progressive-discovery tree"
[ "$resolved_plugin_dir" = "$plugin_dir" ] || fail "plugin-root resolver returned unexpected root: $resolved_plugin_dir"
pass "plugin-root resolver accepts the complete progressive-discovery tree"

command -v python3 >/dev/null 2>&1 || fail "python3 is required for scoped Markdown link checks"

python3 - "$repo_dir" "$root_trampoline" "$router" "$plugin_dir/docs/bosses/INDEX.md" "$plugin_dir/docs/orchestration/INDEX.md" "$plugin_dir/docs/orchestration/runtime.md" "$plugin_dir/docs/orchestration/capability-lanes.md" "$plugin_dir/docs/bosses/design/INDEX.md" "$plugin_dir/docs/bosses/code/INDEX.md" "$plugin_dir/docs/bosses/agent/INDEX.md" "$plugin_dir/docs/bosses/svelte/INDEX.md" "$plugin_dir/docs/bosses/creator/INDEX.md" "$plugin_dir/docs/bosses/workflow/INDEX.md" "$plugin_dir/docs/bosses/meta/INDEX.md" <<'PY'
from pathlib import Path
import json
import re
import sys

repo = Path(sys.argv[1]).resolve()
files = [Path(value).resolve() for value in sys.argv[2:]]
plugin_dir = Path(sys.argv[3]).resolve().parent
link = re.compile(r'!?\[[^\]]*\]\(([^)\n]+)\)')
scheme = re.compile(r'^[A-Za-z][A-Za-z0-9+.-]*:')
errors: list[str] = []

for source in files:
    if not source.is_file():
        errors.append(f"missing checked page: {source}")
        continue
    for line_number, line in enumerate(source.read_text(encoding='utf-8').splitlines(), 1):
        for raw_target in link.findall(line):
            target = raw_target.strip()
            if target.startswith('<') and '>' in target:
                target = target[1:target.index('>')]
            else:
                target = target.split(maxsplit=1)[0]
            target = target.split('#', 1)[0]
            if not target or target.startswith(('/', '#')) or scheme.match(target):
                continue
            if target.startswith('$') or '<' in target or '>' in target:
                continue
            resolved = (source.parent / target).resolve()
            try:
                resolved.relative_to(repo)
            except ValueError:
                errors.append(f"{source}:{line_number}: link escapes repository: {raw_target}")
                continue
            if not resolved.exists():
                errors.append(f"{source}:{line_number}: missing target: {raw_target}")

if errors:
    print('FAIL: scoped Markdown links do not resolve:', file=sys.stderr)
    print('\n'.join(errors), file=sys.stderr)
    raise SystemExit(1)

print(f"PASS: scoped Markdown links resolve across {len(files)} router, boss, and orchestration pages")

stale_patterns = {
    "obsolete AGENTS section pointer": re.compile(r"AGENTS(?:\.md)?\s+§+[0-7]"),
    "obsolete flat boss page": re.compile(
        r"docs/bosses/(?:design|code|agent|svelte|creator|workflow|meta)\.md"
    ),
    "obsolete monolithic domain-map wording": re.compile(
        r"Domain map:\s*AGENTS\.md\s*\(bosses \+ armory\)|"
        r"Boss map \+ contracts|"
        r"Full decision tree and playbooks:|"
        r"AGENTS\.md remains the domain map|"
        r"docs/bosses/\*\.md are routing cards only",
        re.IGNORECASE,
    ),
}

ignored_parts = {
    ".git",
    ".ignore",
    ".svelte-kit",
    ".vercel",
    "node_modules",
    "dist",
    "build",
}
checked_suffixes = {".md", ".json", ".yaml", ".yml", ".js", ".ts", ".svelte", ".sh"}
stale_errors: list[str] = []

for source in repo.rglob("*"):
    if not source.is_file() or source.suffix not in checked_suffixes:
        continue
    if any(part in ignored_parts for part in source.parts):
        continue
    if source.resolve() == (plugin_dir / "scripts/check-progressive-discovery.sh").resolve():
        continue
    try:
        content = source.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    for line_number, line in enumerate(content.splitlines(), 1):
        for label, pattern in stale_patterns.items():
            if pattern.search(line):
                stale_errors.append(f"{source.relative_to(repo)}:{line_number}: {label}: {line.strip()}")

if stale_errors:
    print("FAIL: stale monolithic-discovery references remain:", file=sys.stderr)
    print("\n".join(stale_errors), file=sys.stderr)
    raise SystemExit(1)

print("PASS: repository text contains no stale AGENTS sections or flat boss-page references")

workflow_path = repo / ".codehq/workflows/boss-orchestrator-armory.json"
if workflow_path.is_file():
    workflow = json.loads(workflow_path.read_text(encoding="utf-8"))
    workflow_errors: list[str] = []
    workflow_purpose = str(workflow.get("purpose", ""))
    if re.search(r"documented in plugin/AGENTS\.md|AGENTS(?:\.md)?\s+§", workflow_purpose):
        workflow_errors.append(f"obsolete workflow purpose: {workflow_purpose}")

    def inspect_workflow(value: object) -> None:
        if isinstance(value, dict):
            if value.get("file") == "plugin/AGENTS.md":
                symbol = str(value.get("symbol", ""))
                description = str(value.get("description", ""))
                if "§" in symbol:
                    workflow_errors.append(f"obsolete plugin/AGENTS.md symbol: {symbol}")
                if re.search(r"domain map|full (?:mission|inventory)|shared armory", description, re.IGNORECASE):
                    workflow_errors.append(
                        f"plugin/AGENTS.md is described as monolithic: {description}"
                    )
            for child in value.values():
                inspect_workflow(child)
        elif isinstance(value, list):
            for child in value:
                inspect_workflow(child)

    inspect_workflow(workflow)
    steps_by_id = {
        step.get("id"): step
        for step in workflow.get("steps", [])
        if isinstance(step, dict)
    }
    for boss in ("design", "code", "agent", "svelte", "creator", "workflow", "meta"):
        step = steps_by_id.get(f"{boss}-boss")
        expected = f"plugin/docs/bosses/{boss}/INDEX.md"
        sources = step.get("sources", []) if isinstance(step, dict) else []
        source_files = {
            source.get("file")
            for source in sources
            if isinstance(source, dict)
        }
        if expected not in source_files:
            workflow_errors.append(f"{boss}-boss does not source {expected}")
    if workflow_errors:
        print("FAIL: CodeHQ workflow contradicts progressive discovery:", file=sys.stderr)
        print("\n".join(workflow_errors), file=sys.stderr)
        raise SystemExit(1)
    print("PASS: CodeHQ workflow treats plugin/AGENTS.md as a compact router")
PY

printf '%s\n' 'PROGRESSIVE DISCOVERY CHECK PASSED.'
