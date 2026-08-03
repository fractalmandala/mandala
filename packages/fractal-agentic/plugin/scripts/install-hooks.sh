#!/bin/sh
# Install Fractal Agentic optional hooks into a host or project config (user-facing).
# Mirrors install-agents.sh / wiki-init: disk setup only, never required for delivery.

set -eu

usage() {
  cat <<'USAGE'
Usage: install-hooks.sh [options]

Install or check Fractal Agentic optional hooks for coding-agent hosts.
Does NOT run during product work gates. Safe to skip entirely.

Options:
  --target <name>     claude | cursor | project | config | all
                      (default: config — write preference only; use claude/cursor to materialize)
  --project-dir <path> Project root for --target project|cursor|all (default: cwd)
  --profile <name>    minimal | standard | strict (default: minimal)
  --check             Verify expected files/config without writing
  --force             Overwrite managed Fractal hook block when merging settings
  --help              Show this help

Environment:
  FRACTAL_AGENTIC_ROOT  Plugin root (auto-detected from this script if unset)
  HOME                  Used for ~/.claude and ~/.config/fractal-agentic

What gets written:
  config   → ~/.config/fractal-agentic/hooks.json + env.sh snippet
  claude   → merge hooks into ~/.claude/settings.json (or create)
  cursor   → <project>/.cursor/hooks.json from hooks.cursor.json template
  project  → <project>/.fractal-agentic/hooks.claude.json (absolute paths) + marker
  all      → config + claude + cursor + project

Non-blocking: missing node, missing host dirs, or merge conflicts print WARN and
continue other targets; --check returns non-zero only when expected installs missing.
USAGE
}

fail() {
  printf '%s\n' "ERROR: $*" >&2
  exit 1
}

warn() {
  printf '%s\n' "WARN: $*" >&2
}

pass() {
  printf '%s\n' "OK: $*"
}

script_dir=$(CDPATH= cd "$(dirname "$0")" && pwd) || exit 1
plugin_dir=$(CDPATH= cd "$script_dir/.." && pwd) || exit 1

if [ -z "${FRACTAL_AGENTIC_ROOT-}" ]; then
  FRACTAL_AGENTIC_ROOT=$plugin_dir
  export FRACTAL_AGENTIC_ROOT
fi

# Normalize root
case "$FRACTAL_AGENTIC_ROOT" in
  /*) ;;
  *) FRACTAL_AGENTIC_ROOT=$(CDPATH= cd "$FRACTAL_AGENTIC_ROOT" && pwd) || fail "FRACTAL_AGENTIC_ROOT not a directory" ;;
esac

hooks_dir=$FRACTAL_AGENTIC_ROOT/hooks
[ -f "$hooks_dir/README.md" ] || fail "hooks package missing at $hooks_dir (is FRACTAL_AGENTIC_ROOT the plugin directory?)"

target=config
project_dir=$(pwd -P)
profile=minimal
check_only=0
force=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --target)
      [ "$#" -ge 2 ] || fail "--target requires a value"
      target=$2
      shift 2
      ;;
    --project-dir)
      [ "$#" -ge 2 ] || fail "--project-dir requires a path"
      project_dir=$2
      shift 2
      ;;
    --profile)
      [ "$#" -ge 2 ] || fail "--profile requires a value"
      profile=$2
      shift 2
      ;;
    --check)
      check_only=1
      shift
      ;;
    --force)
      force=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      fail "unknown argument: $1"
      ;;
  esac
done

case "$profile" in
  minimal|standard|strict) ;;
  *) fail "profile must be minimal|standard|strict (got: $profile)" ;;
esac

case "$project_dir" in
  /*) ;;
  *) project_dir=$(CDPATH= cd "$project_dir" && pwd -P) || fail "project-dir not found" ;;
esac

config_dir=${XDG_CONFIG_HOME:-$HOME/.config}/fractal-agentic
config_file=$config_dir/hooks.json
env_file=$config_dir/env.sh
claude_settings=$HOME/.claude/settings.json
cursor_hooks=$project_dir/.cursor/hooks.json
project_marker=$project_dir/.fractal-agentic/hooks-installed.json
project_claude=$project_dir/.fractal-agentic/hooks.claude.json

failures=0

write_config() {
  mkdir -p "$config_dir" || fail "cannot create $config_dir"
  if [ "$check_only" -eq 1 ]; then
    if [ -f "$config_file" ]; then
      pass "config present: $config_file"
    else
      printf '%s\n' "FAIL: missing $config_file" >&2
      failures=1
    fi
    return 0
  fi
  cat >"$config_file" <<EOF
{
  "version": 1,
  "profile": "$profile",
  "plugin_root": "$FRACTAL_AGENTIC_ROOT",
  "installed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date)",
  "targets": {
    "config": true
  }
}
EOF
  cat >"$env_file" <<EOF
# Fractal Agentic — source from shell rc if desired (optional)
#   echo 'source $env_file' >> ~/.zshrc
export FRACTAL_AGENTIC_ROOT="$FRACTAL_AGENTIC_ROOT"
export FRACTAL_HOOK_PROFILE="$profile"
EOF
  pass "wrote $config_file (profile=$profile)"
  pass "wrote $env_file (export FRACTAL_AGENTIC_ROOT + FRACTAL_HOOK_PROFILE)"
}

# Rewrite hooks.claude.json with absolute node paths for this machine
materialize_claude_hooks_json() {
  out=$1
  mkdir -p "$(dirname "$out")"
  # Use node if available for robust rewrite; else sed
  if command -v node >/dev/null 2>&1; then
    ROOT="$FRACTAL_AGENTIC_ROOT" OUT="$out" node <<'NODE'
const fs = require('fs');
const path = require('path');
const root = process.env.ROOT;
const src = path.join(root, 'hooks', 'hooks.claude.json');
const raw = fs.readFileSync(src, 'utf8');
const expanded = raw.split('${FRACTAL_AGENTIC_ROOT}').join(root);
// Prefer absolute paths without relying on env at hook time
const abs = expanded.replace(
  /node "\$\{?FRACTAL_AGENTIC_ROOT\}?\/hooks\/scripts\//g,
  `node "${root}/hooks/scripts/`
).replace(
  /node "\$FRACTAL_AGENTIC_ROOT\/hooks\/scripts\//g,
  `node "${root}/hooks/scripts/`
);
// Our template already uses ${FRACTAL_AGENTIC_ROOT} — expand fully:
const final = raw.replace(/\$\{FRACTAL_AGENTIC_ROOT\}/g, root);
fs.writeFileSync(process.env.OUT, final);
NODE
  else
    # shell fallback
    sed "s|\${FRACTAL_AGENTIC_ROOT}|$FRACTAL_AGENTIC_ROOT|g" \
      "$hooks_dir/hooks.claude.json" >"$out"
  fi
}

merge_claude_settings() {
  if [ "$check_only" -eq 1 ]; then
    if [ -f "$claude_settings" ] && grep -q 'fractal-hooks\|hooks/scripts/pre-bash-safety' "$claude_settings" 2>/dev/null; then
      pass "claude settings appear to reference Fractal hooks: $claude_settings"
    elif [ -f "$project_claude" ]; then
      pass "project claude hooks materialization present: $project_claude"
    else
      printf '%s\n' "FAIL: Claude hooks not installed (no settings merge / project materialization)" >&2
      failures=1
    fi
    return 0
  fi

  if ! command -v node >/dev/null 2>&1; then
    warn "node not found — writing project materialization only ($project_claude)"
    materialize_claude_hooks_json "$project_claude"
    pass "wrote $project_claude — merge into host settings manually (see hooks/README.md)"
    return 0
  fi

  mkdir -p "$HOME/.claude" "$project_dir/.fractal-agentic"
  materialize_claude_hooks_json "$project_claude"

  CLAUDE_SETTINGS="$claude_settings" HOOKS_SRC="$project_claude" FORCE="$force" ROOT="$FRACTAL_AGENTIC_ROOT" node <<'NODE'
const fs = require('fs');
const path = require('path');
const settingsPath = process.env.CLAUDE_SETTINGS;
const hooksSrc = process.env.HOOKS_SRC;
const force = process.env.FORCE === '1';
const root = process.env.ROOT;

let settings = {};
if (fs.existsSync(settingsPath)) {
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (e) {
    console.error('WARN: existing settings.json not valid JSON — writing side-by-side fractal-hooks.json instead');
    const side = path.join(path.dirname(settingsPath), 'fractal-hooks.json');
    fs.copyFileSync(hooksSrc, side);
    console.log('OK: wrote ' + side + ' (merge manually into settings.json)');
    process.exit(0);
  }
}

const fractalHooks = JSON.parse(fs.readFileSync(hooksSrc, 'utf8'));
const marker = 'fractal-agentic-hooks';

// Store under a namespaced key some hosts ignore, AND merge into hooks if empty/force
if (!settings.hooks || force) {
  settings.hooks = fractalHooks.hooks || fractalHooks;
  settings._fractalAgentic = {
    id: marker,
    plugin_root: root,
    installed_at: new Date().toISOString(),
    note: 'Managed by install-hooks.sh — re-run with --force to refresh'
  };
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  console.log('OK: merged Fractal hooks into ' + settingsPath);
} else {
  // Do not clobber foreign hooks without --force
  const side = path.join(path.dirname(settingsPath), 'fractal-hooks.json');
  fs.copyFileSync(hooksSrc, side);
  settings._fractalAgentic = settings._fractalAgentic || {
    id: marker,
    plugin_root: root,
    note: 'hooks already present; fractal-hooks.json written for manual merge. Re-run with --force to replace settings.hooks'
  };
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  console.log('OK: existing hooks preserved; wrote ' + side + ' (use --force to replace settings.hooks)');
}
NODE
  # marker for project
  cat >"$project_marker" <<EOF
{
  "version": 1,
  "target": "claude",
  "profile": "$profile",
  "plugin_root": "$FRACTAL_AGENTIC_ROOT",
  "claude_settings": "$claude_settings",
  "materialized": "$project_claude"
}
EOF
  pass "project marker $project_marker"
}

install_cursor() {
  if [ "$check_only" -eq 1 ]; then
    if [ -f "$cursor_hooks" ] && grep -q 'fractal-agentic\|hooks/scripts' "$cursor_hooks" 2>/dev/null; then
      pass "cursor hooks present: $cursor_hooks"
    else
      printf '%s\n' "FAIL: missing Cursor hooks at $cursor_hooks" >&2
      failures=1
    fi
    return 0
  fi
  mkdir -p "$project_dir/.cursor"
  if command -v node >/dev/null 2>&1; then
    ROOT="$FRACTAL_AGENTIC_ROOT" OUT="$cursor_hooks" node <<'NODE'
const fs = require('fs');
const path = require('path');
const root = process.env.ROOT;
const src = path.join(root, 'hooks', 'hooks.cursor.json');
let raw = fs.readFileSync(src, 'utf8');
raw = raw.replace(/\$\{FRACTAL_AGENTIC_ROOT\}/g, root);
fs.writeFileSync(process.env.OUT, raw);
console.log('OK: wrote ' + process.env.OUT);
NODE
  else
    sed "s|\${FRACTAL_AGENTIC_ROOT}|$FRACTAL_AGENTIC_ROOT|g" \
      "$hooks_dir/hooks.cursor.json" >"$cursor_hooks"
    pass "wrote $cursor_hooks"
  fi
}

install_project() {
  if [ "$check_only" -eq 1 ]; then
    if [ -f "$project_claude" ]; then
      pass "project hooks materialization: $project_claude"
    else
      printf '%s\n' "FAIL: missing $project_claude" >&2
      failures=1
    fi
    return 0
  fi
  mkdir -p "$project_dir/.fractal-agentic"
  materialize_claude_hooks_json "$project_claude"
  cat >"$project_dir/.fractal-agentic/README.md" <<EOF
# Fractal Agentic project install

- **Hooks materialization:** \`hooks.claude.json\` (absolute paths for this machine)
- **Plugin root:** \`$FRACTAL_AGENTIC_ROOT\`
- **Profile:** \`$profile\` (env: \`FRACTAL_HOOK_PROFILE\`)

Re-run:
\`\`\`sh
sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" --target project --project-dir "$project_dir" --profile $profile
\`\`\`

Optional review fan-out: see \`workflows/review-fanout.workflow.md\` and \`/review-fanout\`.
EOF
  pass "wrote $project_claude and .fractal-agentic/README.md"
}

run_target() {
  case "$1" in
    config) write_config ;;
    claude) write_config; merge_claude_settings ;;
    cursor) write_config; install_cursor ;;
    project) write_config; install_project ;;
    all)
      write_config
      merge_claude_settings
      install_cursor
      install_project
      ;;
    *) fail "unknown target: $1 (claude|cursor|project|config|all)" ;;
  esac
}

printf '%s\n' "Fractal Agentic install-hooks"
printf '%s\n' "  plugin:  $FRACTAL_AGENTIC_ROOT"
printf '%s\n' "  target:  $target"
printf '%s\n' "  profile: $profile"
printf '%s\n' "  project: $project_dir"
printf '%s\n' "  mode:    $([ "$check_only" -eq 1 ] && echo check || echo install)"

run_target "$target"

if [ "$check_only" -eq 1 ]; then
  if [ "$failures" -ne 0 ]; then
    printf '%s\n' "HOOKS CHECK FAILED ($failures)" >&2
    exit 1
  fi
  printf '%s\n' "HOOKS CHECK PASSED."
  exit 0
fi

printf '%s\n' ""
printf '%s\n' "Next steps:"
printf '%s\n' "  1. export FRACTAL_AGENTIC_ROOT=$FRACTAL_AGENTIC_ROOT"
printf '%s\n' "  2. export FRACTAL_HOOK_PROFILE=$profile"
printf '%s\n' "  3. source $env_file   # optional, add to shell rc"
printf '%s\n' "  4. Restart the agent host so hooks reload"
printf '%s\n' "  5. Optional: /review-fanout for multi-dimension review (no native Workflow API required)"
printf '%s\n' "Docs: $FRACTAL_AGENTIC_ROOT/docs/hooks.md"
printf '%s\n' "Non-blocking: hooks are optional — product work never waits on this install."
