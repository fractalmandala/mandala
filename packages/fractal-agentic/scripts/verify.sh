#!/bin/sh
# Repository-local verification for Fractal Agentic orchestration + custom-agent companions.

set -eu

pass() {
  printf '%s\n' "PASS: $*"
}

fail() {
  printf '%s\n' "FAIL: $*" >&2
  exit 1
}

hash_agents() {
  shasum -a 256 \
    "$1/fractal-agentic-routine-implementer.toml" \
    "$1/fractal-agentic-complex-implementer.toml" \
    "$1/fractal-agentic-fresh-reviewer.toml" | shasum -a 256 | awk '{print $1}'
}

script_dir=$(CDPATH= cd "$(dirname "$0")" && pwd) || exit 1
plugin_dir=$(CDPATH= cd "$script_dir/.." && pwd) || exit 1
installer=$script_dir/install-agents.sh
runtime_inspector=$script_dir/inspect-agent-runtime.sh
armory_check=$script_dir/check-armory.sh
nonblocking_check=$script_dir/check-nonblocking-policy.sh
templates=$plugin_dir/agents
manifest=$plugin_dir/plugin.json
codex_manifest=$plugin_dir/.codex-plugin/plugin.json
skill=$plugin_dir/skills/boss-orchestration/SKILL.md
contracts=$plugin_dir/skills/boss-orchestration/references/role-contracts.md
capability_mode=$plugin_dir/skills/boss-orchestration/references/capability-mode.md
progression_doc=$plugin_dir/docs/progression.md
openai_yaml=$plugin_dir/skills/boss-orchestration/agents/openai.yaml
orchestrate_cmd=$plugin_dir/commands/orchestrate.md
code_review_cmd=$plugin_dir/commands/code-review.md

tmp_base=${TMPDIR:-/tmp}
case "$tmp_base" in
  /*) ;;
  *) tmp_base=/tmp ;;
esac
tmp_dir=''

cleanup() {
  if [ -n "$tmp_dir" ] && [ -d "$tmp_dir" ]; then
    case "$tmp_dir" in
      "$tmp_base"/fractal-agentic-verify.*)
        rm -rf "$tmp_dir"
        ;;
      *)
        printf '%s\n' "REFUSING cleanup of unexpected directory: $tmp_dir" >&2
        ;;
    esac
  fi
}

trap cleanup 0 HUP INT TERM

tmp_dir=$(mktemp -d "$tmp_base/fractal-agentic-verify.XXXXXX") || fail "could not create disposable verification directory"
case "$tmp_dir" in
  "$tmp_base"/fractal-agentic-verify.*) ;;
  *) fail "mktemp returned an unexpected directory: $tmp_dir" ;;
esac

test -f "$installer" || fail "installer missing: $installer"
test -f "$runtime_inspector" || fail "runtime inspector missing: $runtime_inspector"
test -f "$armory_check" || fail "armory check missing: $armory_check"
test -f "$nonblocking_check" || fail "nonblocking policy check missing: $nonblocking_check"
test -f "$manifest" || fail "plugin manifest missing: $manifest"
test -f "$skill" || fail "skill missing: $skill"
test -f "$contracts" || fail "role contracts missing: $contracts"
test -f "$capability_mode" || fail "capability-mode.md missing: $capability_mode"
test -f "$progression_doc" || fail "progression.md missing: $progression_doc"
test -f "$openai_yaml" || fail "openai.yaml missing: $openai_yaml"
test -f "$orchestrate_cmd" || fail "orchestrate command missing: $orchestrate_cmd"
test -f "$code_review_cmd" || fail "code-review command missing: $code_review_cmd"

if command -v jq >/dev/null 2>&1; then
  jq empty "$manifest"
  pass "plugin manifest JSON is valid"
  if [ -f "$codex_manifest" ]; then
    jq empty "$codex_manifest"
    pass "codex plugin manifest JSON is valid"
  fi
else
  python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$manifest"
  pass "plugin manifest JSON is valid (python)"
fi

sh "$armory_check"
pass "armory check"

# Explicit non-blocking guard (also invoked from check-armory; re-run for clear verify step)
sh "$nonblocking_check"
pass "non-blocking policy check"

python3 - "$templates" <<'PY'
from pathlib import Path
import sys

try:
    import tomllib
except ModuleNotFoundError as exc:
    raise SystemExit("Python 3.11+ with tomllib is required for TOML validation") from exc

templates = Path(sys.argv[1])
expected = {
    "fractal-agentic-routine-implementer.toml": {
        "name": "fractal_agentic_routine_implementer",
        "model": "gpt-5.6-luna",
        "model_reasoning_effort": "max",
    },
    "fractal-agentic-complex-implementer.toml": {
        "name": "fractal_agentic_complex_implementer",
        "model": "gpt-5.6-terra",
        "model_reasoning_effort": "high",
    },
    "fractal-agentic-fresh-reviewer.toml": {
        "name": "fractal_agentic_fresh_reviewer",
        "model": "gpt-5.6-sol",
        "model_reasoning_effort": "high",
        "sandbox_mode": "read-only",
    },
}

for filename, pins in expected.items():
    path = templates / filename
    data = tomllib.loads(path.read_text(encoding="utf-8"))
    for field in ("name", "description", "developer_instructions"):
        value = data.get(field)
        if not isinstance(value, str) or not value.strip():
            raise SystemExit(f"{path}: missing or empty required {field!r}")
    for field, expected_value in pins.items():
        if data.get(field) != expected_value:
            raise SystemExit(
                f"{path}: {field}={data.get(field)!r}, expected {expected_value!r}"
            )

print("TOML templates and exact role pins are valid")
PY
pass "custom-agent TOML validity and exact role pins"

# Skill names must appear in contracts
grep -q 'fractal_agentic_routine_implementer' "$contracts" || fail "contracts missing routine agent type"
grep -q 'fractal_agentic_complex_implementer' "$contracts" || fail "contracts missing complex agent type"
grep -q 'fractal_agentic_fresh_reviewer' "$contracts" || fail "contracts missing reviewer agent type"
grep -q 'ship | fix-first | rethink' "$contracts" || grep -q 'ship|fix-first|rethink' "$contracts" || fail "contracts missing verdict set"
grep -q 'IMPLEMENTATION RECEIPT' "$contracts" || fail "contracts missing implementation receipt"
grep -q 'OWNED PATHS:' "$contracts" || fail "receipt missing owned paths"
grep -q 'CHANGED PATHS:' "$contracts" || fail "receipt missing changed paths"
grep -q 'COMMAND RESULTS:' "$contracts" || fail "receipt missing command results"
grep -q 'RESIDUAL RISK:' "$contracts" || fail "receipt missing residual risk"
grep -q 'PROPOSED VERDICT:' "$contracts" || fail "receipt missing proposed verdict"
pass "role contracts name exact agent types, verdicts, and implementation receipt"

grep -q 'fractal_agentic_routine_implementer' "$skill" || fail "SKILL.md missing routine agent type"
grep -q 'install-agents.sh' "$skill" || fail "SKILL.md missing installer preflight"
grep -q 'implementation receipt' "$skill" || fail "SKILL.md missing implementation receipt verification"
pass "SKILL.md preflight, lanes, and implementation receipt verification"

# Command structure validation — ensure all registered commands have valid frontmatter
for cmd_file in "$plugin_dir"/commands/*.md; do
  [ -f "$cmd_file" ] || continue
  basename=$(basename "$cmd_file")
  # INDEX.md is the inventory page, not a command — no frontmatter required
  [ "$basename" = "INDEX.md" ] && continue
  # Each command must have a YAML frontmatter with description
  head -3 "$cmd_file" | grep -q '^---' || fail "command missing frontmatter: $basename"
  head -3 "$cmd_file" | grep -q '^description:' || fail "command missing description in frontmatter: $basename"
done
pass "command structure validation (frontmatter + description)"

clean_target=$tmp_dir/clean-install
sh "$installer" --target-dir "$clean_target"
for agent_file in fractal-agentic-routine-implementer.toml fractal-agentic-complex-implementer.toml fractal-agentic-fresh-reviewer.toml; do
  cmp -s "$templates/$agent_file" "$clean_target/$agent_file" || fail "clean install is not byte-for-byte exact: $agent_file"
done
pass "installer clean install and byte-for-byte final copies"

missing_check_target=$tmp_dir/missing-check
if sh "$installer" --target-dir "$missing_check_target" --check; then
  fail "--check accepted a missing target"
fi
test ! -e "$missing_check_target" || fail "--check created a missing target directory"
pass "installer --check refuses missing files without mutation"

codex_home_target=$tmp_dir/codex-home
CODEX_HOME="$codex_home_target" sh "$installer"
for agent_file in fractal-agentic-routine-implementer.toml fractal-agentic-complex-implementer.toml fractal-agentic-fresh-reviewer.toml; do
  cmp -s "$templates/$agent_file" "$codex_home_target/agents/$agent_file" || fail "CODEX_HOME target is not byte-for-byte exact: $agent_file"
done
test ! -e "$codex_home_target/config.toml" || fail "installer unexpectedly created config.toml"
pass "installer honors a pre-existing CODEX_HOME without editing config"

relative_parent=$tmp_dir/relative-parent
mkdir "$relative_parent"
(
  cd "$relative_parent"
  sh "$installer" --target-dir explicit-agents
)
for agent_file in fractal-agentic-routine-implementer.toml fractal-agentic-complex-implementer.toml fractal-agentic-fresh-reviewer.toml; do
  cmp -s "$templates/$agent_file" "$relative_parent/explicit-agents/$agent_file" || fail "explicit relative target is not byte-for-byte exact: $agent_file"
done
pass "installer accepts an explicit relative target directory"

before_repeat=$(hash_agents "$clean_target")
sh "$installer" --target-dir "$clean_target"
after_repeat=$(hash_agents "$clean_target")
[ "$before_repeat" = "$after_repeat" ] || fail "idempotent repeat changed an installed template"
pass "installer idempotent repeat"

before_check=$(hash_agents "$clean_target")
sh "$installer" --target-dir "$clean_target" --check
after_check=$(hash_agents "$clean_target")
[ "$before_check" = "$after_check" ] || fail "--check altered an installed template"
pass "installer --check"

conflict_target=$tmp_dir/conflict
mkdir "$conflict_target"
printf '%s\n' 'intentionally conflicting custom-agent template' > "$conflict_target/fractal-agentic-routine-implementer.toml"
if sh "$installer" --target-dir "$conflict_target"; then
  fail "installer accepted a differing destination file"
fi
test ! -e "$conflict_target/fractal-agentic-complex-implementer.toml" || fail "conflict refusal partially installed the complex template"
test ! -e "$conflict_target/fractal-agentic-fresh-reviewer.toml" || fail "conflict refusal partially installed the reviewer template"
pass "installer conflict refusal without partial mutation"

if ! command -v jq >/dev/null 2>&1; then
  pass "runtime inspector tests skipped (jq not installed)"
  printf '%s\n' "VERIFY PASSED: Fractal Agentic orchestration core is healthy (runtime inspect tests skipped without jq)."
  exit 0
fi

runtime_sessions=$tmp_dir/runtime-sessions
runtime_day=$runtime_sessions/2026/08/01
mkdir -p "$runtime_day"
runtime_success_id=11111111-1111-7111-8111-111111111111
runtime_success_rollout=$runtime_day/rollout-2026-08-01T00-00-00-$runtime_success_id.jsonl
printf '%s\n' \
  '{"type":"response_item","payload":{"prompt":"DO_NOT_LEAK_PROMPT","token":"DO_NOT_LEAK_TOKEN"}}' \
  '{"type":"event_msg","payload":{"environment":{"SECRET_ENV":"DO_NOT_LEAK_ENV"},"config":{"api_key":"DO_NOT_LEAK_CONFIG"}}}' \
  "{\"type\":\"session_meta\",\"payload\":{\"id\":\"$runtime_success_id\",\"parent_thread_id\":\"00000000-0000-7000-8000-000000000000\",\"agent_role\":\"fractal_agentic_routine_implementer\",\"agent_path\":\"/root/fixture\",\"model_provider\":\"openai\",\"cwd\":\"/fixture/cwd\",\"base_instructions\":\"DO_NOT_LEAK_INSTRUCTIONS\"}}" \
  '{"type":"turn_context","payload":{"model":"gpt-5.6-luna","effort":"max","sandbox_policy":{"type":"danger-full-access","hidden":"DO_NOT_LEAK_SANDBOX"},"permission_profile":{"type":"disabled","hidden":"DO_NOT_LEAK_PERMISSION"},"cwd":"/fixture/cwd","summary":"DO_NOT_LEAK_SUMMARY"}}' \
  > "$runtime_success_rollout"
runtime_output=$(sh "$runtime_inspector" --sessions-dir "$runtime_sessions" "$runtime_success_id")
if ! printf '%s\n' "$runtime_output" | jq -e --arg id "$runtime_success_id" '
  type == "object"
  and (keys | sort) == ["agent_path", "agent_role", "cwd", "effort", "model", "model_provider", "parent_thread_id", "permission_profile_type", "sandbox_policy_type", "thread_id"]
  and .thread_id == $id
  and .agent_role == "fractal_agentic_routine_implementer"
  and .model == "gpt-5.6-luna"
  and .effort == "max"
  and .sandbox_policy_type == "danger-full-access"
  and .permission_profile_type == "disabled"
' >/dev/null; then
  fail "runtime inspector did not return the expected safe routing object"
fi
if printf '%s\n' "$runtime_output" | grep -Fq 'DO_NOT_LEAK'; then
  fail "runtime inspector leaked fixture prompt or secret content"
fi
pass "runtime inspector safe allowlisted extraction"

if sh "$runtime_inspector" --sessions-dir "$runtime_sessions" not-a-thread-id >/dev/null 2>&1; then
  fail "runtime inspector accepted an invalid thread id"
fi
pass "runtime inspector invalid-id refusal"

runtime_zero_id=22222222-2222-7222-8222-222222222222
if sh "$runtime_inspector" --sessions-dir "$runtime_sessions" "$runtime_zero_id" >/dev/null 2>&1; then
  fail "runtime inspector accepted a thread id with no rollout"
fi
pass "runtime inspector zero-match refusal"

printf '%s\n' "VERIFY PASSED: Fractal Agentic orchestration core is healthy."