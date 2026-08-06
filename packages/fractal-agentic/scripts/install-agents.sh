#!/bin/sh
# Install Fractal Agentic's shipped custom-agent templates without changing Codex config.

set -eu

usage() {
  cat <<'USAGE'
Usage: install-agents.sh [--target-dir <path>] [--check]

Install the three Fractal Agentic capability-lane custom-agent templates into the target
directory (disk only — layer B). Without --target-dir, the target is
"$CODEX_HOME/agents" when CODEX_HOME is set, otherwise "$HOME/.codex/agents".
The script never overwrites a differing file.

This does NOT guarantee the current Codex task can spawn those types (layer C).
Hosts often load custom agents at task start — open a new task later if you want
spawn discovery. Product work must not wait on that; see docs/progression.md.

Options:
  --target-dir <path>  Explicit destination directory (absolute or relative).
  --check              Verify that every destination file already matches exactly;
                       do not create or copy anything.
  --help               Show this help text.
USAGE
}

fail() {
  printf '%s\n' "ERROR: $*" >&2
  exit 1
}

script_dir=$(CDPATH= cd "$(dirname "$0")" && pwd) || exit 1
template_dir=$script_dir/../agents

if [ -n "${CODEX_HOME-}" ]; then
  target_dir=$CODEX_HOME/agents
else
  [ -n "${HOME-}" ] || fail "HOME is unset and CODEX_HOME was not supplied; pass --target-dir explicitly."
  target_dir=$HOME/.codex/agents
fi

check_only=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --target-dir)
      [ "$#" -ge 2 ] || fail "--target-dir requires a path."
      [ -n "$2" ] || fail "--target-dir requires a non-empty path."
      case "$2" in
        --*) fail "--target-dir path must be explicit; prefix a relative option-like name with ./ or use an absolute path." ;;
      esac
      target_dir=$2
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
      fail "unknown argument: $1 (run with --help for usage)."
      ;;
  esac
done

case "$target_dir" in
  /*) ;;
  *) target_dir=$(pwd -P)/$target_dir ;;
esac

[ "$target_dir" != "/" ] || fail "refusing to use the filesystem root as an agent target directory."

agent_files='fractal-agentic-routine-implementer.toml fractal-agentic-complex-implementer.toml fractal-agentic-fresh-reviewer.toml'

for agent_file in $agent_files; do
  template=$template_dir/$agent_file
  [ -f "$template" ] && [ ! -L "$template" ] || fail "shipped template is missing or not a regular file: $template"
done

preflight_failed=0
if [ -e "$target_dir" ] || [ -L "$target_dir" ]; then
  if [ ! -d "$target_dir" ] || [ -L "$target_dir" ]; then
    printf '%s\n' "ERROR: target directory is not a real directory: $target_dir" >&2
    preflight_failed=1
  fi
fi

for agent_file in $agent_files; do
  template=$template_dir/$agent_file
  destination=$target_dir/$agent_file

  if [ -e "$destination" ] || [ -L "$destination" ]; then
    if [ ! -f "$destination" ] || [ -L "$destination" ]; then
      printf '%s\n' "ERROR: destination is not a regular file and will not be replaced: $destination" >&2
      preflight_failed=1
    elif cmp -s "$template" "$destination"; then
      :
    else
      printf '%s\n' "ERROR: destination differs from the shipped template and will not be overwritten: $destination" >&2
      printf '%s\n' "       Inspect $template and resolve the conflict deliberately, then rerun --check." >&2
      preflight_failed=1
    fi
  elif [ "$check_only" -eq 1 ]; then
    printf '%s\n' "ERROR: required installed agent file is missing: $destination" >&2
    printf '%s\n' "       Run $0 without --check after reviewing the target directory." >&2
    preflight_failed=1
  fi
done

[ "$preflight_failed" -eq 0 ] || exit 1

if [ "$check_only" -eq 1 ]; then
  printf '%s\n' "CHECK PASSED: all Fractal Agentic agent files exactly match $template_dir."
  printf '%s\n' "NOTE: This is disk install health only (layer B). It does not prove the current Codex task exposes spawn types (layer C)."
  printf '%s\n' "      If types are missing mid-session, continue work degraded (pins: unverified) or start a new task later for rediscovery."
  printf '%s\n' "      Policy: docs/progression.md — product work must never wait on pins."
  exit 0
fi

if [ ! -d "$target_dir" ]; then
  mkdir -p "$target_dir" || fail "could not create target directory: $target_dir"
fi

for agent_file in $agent_files; do
  template=$template_dir/$agent_file
  destination=$target_dir/$agent_file

  if [ -e "$destination" ] || [ -L "$destination" ]; then
    if [ -f "$destination" ] && [ ! -L "$destination" ] && cmp -s "$template" "$destination"; then
      printf '%s\n' "ALREADY CURRENT: $destination"
      continue
    fi
    fail "destination changed after preflight and will not be overwritten: $destination"
  fi

  staged=$(mktemp "$target_dir/.fractal-agentic-agent.XXXXXX") || fail "could not stage template for installation: $destination"
  if ! cp "$template" "$staged"; then
    rm -f "$staged"
    fail "could not stage template for installation: $destination"
  fi

  if ln "$staged" "$destination"; then
    rm -f "$staged" || fail "could not remove staged template after installation: $staged"
  else
    rm -f "$staged" || fail "could not remove staged template after conflict: $staged"
    if [ -f "$destination" ] && [ ! -L "$destination" ] && cmp -s "$template" "$destination"; then
      printf '%s\n' "ALREADY CURRENT: $destination"
      continue
    fi
    fail "destination changed after preflight and will not be overwritten: $destination"
  fi

  printf '%s\n' "INSTALLED: $destination"
done

for agent_file in $agent_files; do
  template=$template_dir/$agent_file
  destination=$target_dir/$agent_file
  cmp -s "$template" "$destination" || fail "post-install exactness check failed: $destination"
done

printf '%s\n' "INSTALL PASSED: all Fractal Agentic agent files exactly match $template_dir."
printf '%s\n' ""
printf '%s\n' "What this means:"
printf '%s\n' "  • Layer B (disk): templates are installed under $target_dir"
printf '%s\n' "  • Layer C (session): this task may NOT list them until Codex rescans (often a new task)"
printf '%s\n' ""
printf '%s\n' "Next steps (optional — do not block product work):"
printf '%s\n' "  1. Start a new Codex task in the workspace if you want spawn types rediscovered."
printf '%s\n' "  2. Until then, agents should continue with capability_mode=degraded (pins: unverified)."
printf '%s\n' "  3. See plugin docs/progression.md for the three-layer model."
printf '%s\n' ""
printf '%s\n' "Installed agent_type names (from TOML name= fields):"
printf '%s\n' "  fractal_agentic_routine_implementer"
printf '%s\n' "  fractal_agentic_complex_implementer"
printf '%s\n' "  fractal_agentic_fresh_reviewer"
