#!/bin/sh
# Fail if orchestration core docs reintroduce hard-gate preflight language.
# Policy: docs/progression.md — harness upgrades quality; never blocks product work.

set -eu

pass() { printf '%s\n' "PASS: $*"; }
fail() { printf '%s\n' "FAIL: $*" >&2; exit 1; }
warn() { printf '%s\n' "WARN: $*"; }

script_dir=$(CDPATH= cd "$(dirname "$0")" && pwd) || exit 1
plugin_dir=$(CDPATH= cd "$script_dir/.." && pwd) || exit 1

# Runtime-binding files only (not progression.md itself, which may quote anti-patterns).
files="
$plugin_dir/skills/boss-orchestration/SKILL.md
$plugin_dir/skills/boss-orchestration/references/role-contracts.md
$plugin_dir/skills/boss-orchestration/references/capability-mode.md
$plugin_dir/commands/orchestrate.md
$plugin_dir/project-integration/AGENTS-SNIPPET.md
"

missing=0
for f in $files; do
  if [ ! -f "$f" ]; then
    printf '%s\n' "FAIL: missing required policy surface: $f" >&2
    missing=1
  fi
done
[ "$missing" -eq 0 ] || exit 1

# Phrases that historically froze sessions. Must not reappear as normative policy.
# (Case-sensitive where historically used as hard gates.)
bad_patterns='
stop the lane
stops the lane
stops the affected lane
stop until they confirm
Exit zero is required
Require the native spawn tool
Require spawn types
must be exposed exactly before any lane may run
Never substitute a built-in
never silently fall back to a built-in
Never work around by choosing another agent
do not start work until
must open a new
forbidden to substitute
If a name is missing, stop
On missing/stale/conflict, stop
'

violations=0
for f in $files; do
  # portable: use grep -F for fixed strings
  while IFS= read -r pat; do
    [ -n "$pat" ] || continue
    if grep -F -n -- "$pat" "$f" >/dev/null 2>&1; then
      printf '%s\n' "FAIL: hard-gate phrase in $f:" >&2
      grep -F -n -- "$pat" "$f" >&2 || true
      printf '%s\n' "       pattern: $pat" >&2
      violations=1
    fi
  done <<EOF
$bad_patterns
EOF
done

# Required positive signals — policy is present, not only “absence of bad phrases”.
required_patterns='
Project work always proceeds
pins: unverified
capability_mode
'

# capability-mode.md uses the term; SKILL must mention non-blocking / proceeds
for pat in "Project work always proceeds" "pins: unverified" "capability_mode"; do
  found=0
  for f in $files; do
    if grep -F -q -- "$pat" "$f" 2>/dev/null; then
      found=1
      break
    fi
  done
  if [ "$found" -eq 0 ]; then
    printf '%s\n' "FAIL: required non-blocking signal missing from orchestration core: $pat" >&2
    violations=1
  else
    pass "required signal present: $pat"
  fi
done

# progression.md must exist and state the one-line principle
deg=$plugin_dir/docs/progression.md
[ -f "$deg" ] || fail "missing $deg"
grep -Fq 'Harness upgrades quality' "$deg" || fail "progression.md missing one-line principle"
pass "progression.md present with principle"

# check-armory / verify must wire this script (prevents dropping the guard)
grep -Fq 'check-nonblocking-policy.sh' "$plugin_dir/scripts/verify.sh" \
  || fail "verify.sh does not invoke check-nonblocking-policy.sh"
grep -Fq 'check-nonblocking-policy.sh' "$plugin_dir/scripts/check-armory.sh" \
  || fail "check-armory.sh does not invoke check-nonblocking-policy.sh"
pass "verify.sh and check-armory.sh wire nonblocking policy check"

[ "$violations" -eq 0 ] || fail "non-blocking policy violations found (see above)"
pass "no hard-gate phrases in orchestration core"
printf '%s\n' "NONBLOCKING POLICY CHECK PASSED."
