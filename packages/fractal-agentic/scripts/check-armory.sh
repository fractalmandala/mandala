#!/bin/sh
# Non-mutating armory health check for Fractal Agentic skills and orchestration assets.

set -eu

pass() {
  printf '%s\n' "PASS: $*"
}

fail() {
  printf '%s\n' "FAIL: $*" >&2
  exit 1
}

warn() {
  printf '%s\n' "WARN: $*"
}

script_dir=$(CDPATH= cd "$(dirname "$0")" && pwd) || exit 1
plugin_dir=$(CDPATH= cd "$script_dir/.." && pwd) || exit 1
skills_dir=$plugin_dir/skills
orch=$skills_dir/boss-orchestration

failures=0

require_file() {
  if [ -f "$1" ]; then
    pass "present: $1"
  else
    printf '%s\n' "FAIL: missing file: $1" >&2
    failures=1
  fi
}

require_file "$plugin_dir/AGENTS.md"
require_file "$plugin_dir/SOUL.md"
require_file "$plugin_dir/TROUBLESHOOTING.md"
require_file "$plugin_dir/hooks/README.md"
require_file "$plugin_dir/hooks/profiles.json"
require_file "$plugin_dir/hooks/scripts/lib.js"
require_file "$plugin_dir/hooks/scripts/pre-bash-safety.js"
require_file "$plugin_dir/scripts/install-hooks.sh"
require_file "$plugin_dir/commands/hooks-init.md"
require_file "$plugin_dir/commands/hooks-status.md"
require_file "$plugin_dir/commands/review-fanout.md"
require_file "$plugin_dir/scripts/install-improve.sh"
require_file "$plugin_dir/commands/improve-init.md"
require_file "$plugin_dir/commands/improve-status.md"
require_file "$plugin_dir/docs/self-improvement.md"
require_file "$plugin_dir/workflows/review-fanout.workflow.md"
require_file "$plugin_dir/docs/02-install.md"
require_file "$plugin_dir/docs/troubleshooting.md"
require_file "$plugin_dir/docs/hooks.md"
require_file "$orch/SKILL.md"
require_file "$orch/agents/openai.yaml"
require_file "$orch/references/role-contracts.md"
require_file "$orch/references/routing-matrix.md"
require_file "$orch/references/handoffs.md"
require_file "$orch/references/boss-prompts.md"
require_file "$plugin_dir/agents/fractal-agentic-routine-implementer.toml"
require_file "$plugin_dir/agents/fractal-agentic-complex-implementer.toml"
require_file "$plugin_dir/agents/fractal-agentic-fresh-reviewer.toml"
require_file "$plugin_dir/scripts/install-agents.sh"
require_file "$plugin_dir/scripts/inspect-agent-runtime.sh"
require_file "$plugin_dir/scripts/verify.sh"
require_file "$plugin_dir/commands/orchestrate.md"
require_file "$plugin_dir/commands/code-review.md"
require_file "$plugin_dir/project-integration/AGENTS-SNIPPET.md"
require_file "$plugin_dir/scripts/resolve-plugin-root.sh"
require_file "$plugin_dir/scripts/check-nonblocking-policy.sh"
require_file "$plugin_dir/scripts/check-progressive-discovery.sh"
require_file "$plugin_dir/docs/progression.md"
require_file "$plugin_dir/docs/handoffs.md"
require_file "$plugin_dir/docs/INDEX.md"
require_file "$plugin_dir/docs/doc-ownership.md"
require_file "$plugin_dir/docs/bosses/INDEX.md"
# Repo layout lives at root (optional for sparse plugin-only installs)
if [ -f "$plugin_dir/../LAYOUT.md" ]; then
  pass "present: $plugin_dir/../LAYOUT.md (repo root)"
else
  warn "LAYOUT.md missing at repo root (ok for plugin-only sparse install)"
fi
require_file "$plugin_dir/skills/boss-orchestration/references/capability-mode.md"

# Critical skills for monorepo defaults — warn if missing, fail if SKILL unreadable when present as link
critical='svelte-5-runes svelte-styling-patterns sveltekit-architecture design-system coding-standards port-component continuous-agent-loop'
for name in $critical; do
  path=$skills_dir/$name
  if [ -e "$path" ]; then
    if [ -f "$path/SKILL.md" ] || [ -L "$path" ]; then
      if [ -f "$path/SKILL.md" ]; then
        pass "critical skill resolves: $name"
      else
        # symlink dir without readable SKILL yet
        if [ -e "$path/SKILL.md" ]; then
          pass "critical skill resolves: $name"
        else
          warn "critical skill path exists but SKILL.md unreadable: $name"
        fi
      fi
    else
      warn "critical skill path exists but has no SKILL.md: $name"
    fi
  else
    warn "critical skill missing (domain armory incomplete): $name"
  fi
done

# Broken symlinks under skills/
broken=0
# portable: find -type l and test -e
for link in "$skills_dir"/*; do
  [ -L "$link" ] || continue
  if [ ! -e "$link" ]; then
    printf '%s\n' "FAIL: broken skill symlink: $link" >&2
    broken=1
    failures=1
  fi
done
[ "$broken" -eq 0 ] && pass "no broken skill symlinks at skills/*"

# openai.yaml shape (POSIX grep checks — no python or heredoc dependency)
openai_yaml="$orch/agents/openai.yaml"
if [ -f "$openai_yaml" ]; then
  missing=""
  for key in "display_name:" "short_description:" "default_prompt:"; do
    grep -q "$key" "$openai_yaml" || missing="$missing $key"
  done
  if [ -n "$missing" ]; then
    printf '%s\n' "FAIL: openai.yaml missing keys:$missing" >&2
    failures=1
  elif ! grep -q -e "boss-orchestration" -e "Fractal Agentic" "$openai_yaml"; then
    printf '%s\n' "FAIL: openai.yaml does not reference Fractal Agentic orchestration" >&2
    failures=1
  else
    pass "openai.yaml shape valid"
  fi
else
  printf '%s\n' "FAIL: missing file: $openai_yaml" >&2
  failures=1
fi

exit "$failures"
    print("FAIL: openai.yaml does not reference Fractal Agentic orchestration",