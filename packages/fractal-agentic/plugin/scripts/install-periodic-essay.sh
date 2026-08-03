#!/usr/bin/env bash
set -e

usage() {
  echo "Usage: install-periodic-essay.sh --output-dir PATH [--wiki-root PATH] [--memory-path PATH] [--transcript-path PATH] [--agent COMMAND] [--install-scheduler]"
  echo "       install-periodic-essay.sh --remove-scheduler"
}

script_root="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
runner="$script_root/periodic-essay-runner.js"
node_bin="$(command -v node)"
config_file="$HOME/.config/fractal-agentic/periodic-essay.json"
output_dir=""
wiki_root=""
agent_command=""
memory_path=""
transcript_path=""
source_path=""
install_scheduler=0
remove_scheduler=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --output-dir)
      output_dir="$2"
      shift 2
      ;;
    --wiki-root)
      wiki_root="$2"
      shift 2
      ;;
    --agent)
      agent_command="$2"
      shift 2
      ;;
    --source-path)
      source_path="$2"
      shift 2
      ;;
    --memory-path)
      memory_path="$2"
      shift 2
      ;;
    --transcript-path)
      transcript_path="$2"
      shift 2
      ;;
    --install-scheduler)
      install_scheduler=1
      shift
      ;;
    --remove-scheduler)
      remove_scheduler=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

plist="$HOME/Library/LaunchAgents/com.fractal-agentic.periodic-essay.plist"
label="com.fractal-agentic.periodic-essay"

if [ "$remove_scheduler" -eq 1 ]; then
  launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
  rm -f "$plist"
  echo "Removed scheduler: $plist"
  exit 0
fi

if [ -z "$output_dir" ]; then
  echo "--output-dir is required." >&2
  usage >&2
  exit 2
fi

init_args=(init --output-dir "$output_dir")
if [ -n "$wiki_root" ]; then init_args+=(--wiki-root "$wiki_root"); fi
if [ -n "$agent_command" ]; then init_args+=(--agent "$agent_command"); fi
if [ -n "$source_path" ]; then init_args+=(--source-path "$source_path"); fi
if [ -n "$memory_path" ]; then init_args+=(--memory-path "$memory_path"); fi
if [ -n "$transcript_path" ]; then init_args+=(--transcript-path "$transcript_path"); fi
FRACTAL_ESSAY_CONFIG="$config_file" "$node_bin" "$runner" "${init_args[@]}"

if [ "$install_scheduler" -eq 1 ]; then
  if [ "$(uname -s)" != "Darwin" ]; then
    echo "The launchd scheduler is macOS-only." >&2
    exit 2
  fi
  mkdir -p "$(dirname -- "$plist")"
  "$node_bin" - "$node_bin" "$runner" "$config_file" "$plist" "$label" <<'NODE'
const fs = require('node:fs');
const [nodePath, runnerPath, configPath, plistPath, label] = process.argv.slice(2);
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
  '<plist version="1.0"><dict>',
  '<key>Label</key><string>' + label + '</string>',
  '<key>ProgramArguments</key><array>',
  '<string>' + nodePath + '</string>',
  '<string>' + runnerPath + '</string>',
  '<string>run</string><string>--if-due</string>',
  '</array>',
  '<key>EnvironmentVariables</key><dict>',
  '<key>FRACTAL_ESSAY_CONFIG</key><string>' + configPath + '</string>',
  '</dict>',
  '<key>StartInterval</key><integer>900</integer>',
  '<key>RunAtLoad</key><false/>',
  '<key>ProcessType</key><string>Background</string>',
  '</dict></plist>',
  ''
].join('\n');
fs.writeFileSync(plistPath, xml, { mode: 0o600 });
NODE
  launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
  launchctl bootstrap "gui/$(id -u)" "$plist"
  echo "Installed scheduler: $plist"
  echo "It checks every 15 minutes and runs the pipeline only when the 48-hour state is due."
fi
