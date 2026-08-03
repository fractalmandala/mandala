#!/bin/sh
# Fractal Agentic self-improvement plane (Phase 1): config + data dirs.
# User-facing; never required for delivery. See docs/self-improvement.md

set -eu

usage() {
  cat <<'USAGE'
Usage: install-improve.sh [options]

Enable or check the optional self-improvement plane for this machine.

Options:
  --profile <name>   off | observe | full   (default: observe)
  --check            Verify config + data dirs without writing
  --help             Show this help

Writes:
  ~/.config/fractal-agentic/self-improvement.json
  Appends FRACTAL_IMPROVE_PROFILE to ~/.config/fractal-agentic/env.sh when present
  ${XDG_DATA_HOME:-~/.local/share}/fractal-agentic/{observations,instincts,evals,evolved,README.md}

Environment:
  FRACTAL_AGENTIC_ROOT   Plugin root (auto-detected from this script if unset)

Non-blocking: product work never depends on this install.
USAGE
}

fail() {
  printf '%s\n' "ERROR: $*" >&2
  exit 1
}

pass() {
  printf '%s\n' "OK: $*"
}

warn() {
  printf '%s\n' "WARN: $*" >&2
}

script_dir=$(CDPATH= cd "$(dirname "$0")" && pwd) || exit 1
plugin_dir=$(CDPATH= cd "$script_dir/.." && pwd) || exit 1

if [ -z "${FRACTAL_AGENTIC_ROOT-}" ]; then
  FRACTAL_AGENTIC_ROOT=$plugin_dir
  export FRACTAL_AGENTIC_ROOT
fi

case "$FRACTAL_AGENTIC_ROOT" in
  /*) ;;
  *) FRACTAL_AGENTIC_ROOT=$(CDPATH= cd "$FRACTAL_AGENTIC_ROOT" && pwd) || fail "FRACTAL_AGENTIC_ROOT not a directory" ;;
esac

profile=observe
check_only=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --profile)
      [ "$#" -ge 2 ] || fail "--profile requires a value"
      profile=$2
      shift 2
      ;;
    --check)
      check_only=1
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
  off|observe|full) ;;
  *) fail "profile must be off|observe|full (got: $profile)" ;;
esac

config_dir=${XDG_CONFIG_HOME:-$HOME/.config}/fractal-agentic
config_file=$config_dir/self-improvement.json
env_file=$config_dir/env.sh

data_home=${XDG_DATA_HOME:-$HOME/.local/share}
data_root=$data_home/fractal-agentic

failures=0

check_paths() {
  if [ -f "$config_file" ]; then
    pass "config: $config_file"
    if command -v node >/dev/null 2>&1; then
      node -e "
        const fs=require('fs');
        const c=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
        console.log('OK: profile=' + (c.profile||'?') + ' plugin_root=' + (c.plugin_root||'?'));
      " "$config_file" 2>/dev/null || warn "could not parse $config_file"
    fi
  else
    printf '%s\n' "FAIL: missing $config_file" >&2
    failures=1
  fi
  for d in observations instincts evals evolved; do
    if [ -d "$data_root/$d" ]; then
      pass "data dir: $data_root/$d"
    else
      printf '%s\n' "FAIL: missing $data_root/$d" >&2
      failures=1
    fi
  done
  if [ -f "$data_root/README.md" ]; then
    pass "data README: $data_root/README.md"
  else
    warn "missing $data_root/README.md"
  fi
}

do_install() {
  mkdir -p "$config_dir" \
    "$data_root/observations" \
    "$data_root/instincts/personal" \
    "$data_root/instincts/inherited" \
    "$data_root/evals" \
    "$data_root/evolved/skills" \
    "$data_root/evolved/commands" \
    "$data_root/evolved/agents" \
    "$data_root/projects" || fail "cannot create data dirs under $data_root"

  ts=$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date)

  cat >"$config_file" <<EOF
{
  "version": 1,
  "profile": "$profile",
  "plugin_root": "$FRACTAL_AGENTIC_ROOT",
  "data_root": "$data_root",
  "installed_at": "$ts",
  "options": {
    "self_eval_after_ship": $([ "$profile" = "full" ] && echo true || echo false),
    "wiki_capture_after_ship": true,
    "observe_hooks": $([ "$profile" = "off" ] && echo false || echo true),
    "auto_merge_evolved_into_plugin": false
  },
  "notes": "auto_merge_evolved_into_plugin is always false in Phase 1 — promote is human/Meta only"
}
EOF
  pass "wrote $config_file (profile=$profile)"

  if [ -f "$env_file" ]; then
    if grep -q 'FRACTAL_IMPROVE_PROFILE' "$env_file" 2>/dev/null; then
      # portable in-place-ish rewrite
      tmp=$env_file.tmp.$$
      grep -v 'FRACTAL_IMPROVE_PROFILE' "$env_file" >"$tmp" || true
      printf '%s\n' "export FRACTAL_IMPROVE_PROFILE=\"$profile\"" >>"$tmp"
      printf '%s\n' "export FRACTAL_IMPROVE_DATA=\"$data_root\"" >>"$tmp"
      mv "$tmp" "$env_file"
    else
      {
        printf '%s\n' ""
        printf '%s\n' "# Self-improvement plane (install-improve.sh)"
        printf '%s\n' "export FRACTAL_IMPROVE_PROFILE=\"$profile\""
        printf '%s\n' "export FRACTAL_IMPROVE_DATA=\"$data_root\""
      } >>"$env_file"
    fi
    pass "updated $env_file"
  else
    cat >"$env_file" <<EOF
# Fractal Agentic — optional shell exports
export FRACTAL_AGENTIC_ROOT="$FRACTAL_AGENTIC_ROOT"
export FRACTAL_IMPROVE_PROFILE="$profile"
export FRACTAL_IMPROVE_DATA="$data_root"
EOF
    pass "wrote $env_file"
  fi

  cat >"$data_root/README.md" <<EOF
# Fractal Agentic — install learning data

**Profile:** \`$profile\`  
**Plugin:** \`$FRACTAL_AGENTIC_ROOT\`  
**Config:** \`$config_file\`

## Directories

| Path | Purpose |
| --- | --- |
| \`observations/\` | Session signals (tool use, corrections) — Phase 2+ hooks write here |
| \`instincts/\` | Atomic learned behaviors (or bridge from continuous-learning-v2) |
| \`evals/\` | Self-evaluation scorecards (jsonl) after non-trivial ships |
| \`evolved/\` | Candidate skills/commands/agents — **not** auto-merged into plugin/ |
| \`projects/\` | Per-repo isolation (hash ids), when project scoping is enabled |

## Privacy

- Stays on this machine by default.
- Export only what you choose (\`/instinct-export\`, wiki export).
- Never auto-overwrites \`$FRACTAL_AGENTIC_ROOT/skills\`.

## Related commands

- \`/improve-status\` — health of this plane
- \`/learn\`, \`/instinct-status\`, \`/promote\`, \`/prune\`
- \`/wiki-init\`, \`/wiki-capture\` — long memory
- Docs: \`docs/self-improvement.md\`

## continuous-learning-v2 bridge

If CL-v2 is enabled, its store may still live under XDG \`ecc-homunculus\` or a
custom \`CLV2_HOMUNCULUS_DIR\`. Phase 1 does not migrate that data; treat this
tree as the **Fractal** plane and use CL-v2 skills against either store when
configured. Prefer pointing new observe hooks at this data_root in Phase 2.
EOF
  pass "wrote $data_root/README.md"

  # marker file for empty dirs that some tools ignore
  for d in observations evals; do
    touch "$data_root/$d/.gitkeep" 2>/dev/null || true
  done
}

printf '%s\n' "Fractal Agentic install-improve"
printf '%s\n' "  plugin:  $FRACTAL_AGENTIC_ROOT"
printf '%s\n' "  profile: $profile"
printf '%s\n' "  data:    $data_root"
printf '%s\n' "  mode:    $([ "$check_only" -eq 1 ] && echo check || echo install)"

if [ "$check_only" -eq 1 ]; then
  check_paths
  if [ "$failures" -ne 0 ]; then
    printf '%s\n' "IMPROVE CHECK FAILED" >&2
    exit 1
  fi
  printf '%s\n' "IMPROVE CHECK PASSED."
  exit 0
fi

do_install

printf '%s\n' ""
printf '%s\n' "Next steps:"
printf '%s\n' "  1. source $env_file"
printf '%s\n' "  2. /improve-status  (or: sh scripts/install-improve.sh --check)"
case "$profile" in
  off)
    printf '%s\n' "  3. Profile off — only manual /learn; re-run with --profile observe|full to enable more"
    ;;
  observe)
    printf '%s\n' "  3. Profile observe — use /learn; enable hooks observe in Phase 2 (/hooks-init + learning)"
    printf '%s\n' "  4. Optional: /wiki-init for compound memory"
    ;;
  full)
    printf '%s\n' "  3. Profile full — after non-trivial ship: soft self-eval + wiki capture when vault exists"
    printf '%s\n' "  4. Ensure /wiki-init if you want compound memory"
    printf '%s\n' "  5. agent-self-evaluation skill after hard tasks"
    ;;
esac
printf '%s\n' "Docs: $FRACTAL_AGENTIC_ROOT/docs/self-improvement.md"
printf '%s\n' "Non-blocking: delivery never waits on this plane."
