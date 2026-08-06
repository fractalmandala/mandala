'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const MAX_STDIN = 1024 * 1024;

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      if (data.length < MAX_STDIN) data += chunk.slice(0, MAX_STDIN - data.length);
    });
    process.stdin.on('end', () => resolve(data));
  });
}

function parseInput(raw) {
  if (!raw || !String(raw).trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { _raw: String(raw).slice(0, 2000) };
  }
}

function pluginRoot() {
  if (process.env.FRACTAL_AGENTIC_ROOT && process.env.FRACTAL_AGENTIC_ROOT.trim()) {
    return path.resolve(process.env.FRACTAL_AGENTIC_ROOT.trim());
  }
  // hooks/scripts -> plugin root
  return path.resolve(__dirname, '..', '..');
}

function loadProfiles() {
  const p = path.join(pluginRoot(), 'hooks', 'profiles.json');
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return { default: 'minimal', profiles: { minimal: [] } };
  }
}

function activeProfile() {
  const name = (process.env.FRACTAL_HOOK_PROFILE || '').trim() || loadProfiles().default || 'minimal';
  return name.toLowerCase();
}

function disabledSet() {
  const raw = process.env.FRACTAL_DISABLED_HOOKS || '';
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

function hookEnabled(hookId) {
  if (disabledSet().has(hookId)) return false;
  const profiles = loadProfiles();
  const list = profiles.profiles[activeProfile()] || profiles.profiles.minimal || [];
  return list.includes(hookId);
}

function toolInput(input) {
  return input.tool_input || input.toolInput || input.params || input.args || input;
}

function toolName(input) {
  return input.tool_name || input.toolName || input.hook_event_name || input.event || '';
}

function commandFrom(input) {
  const ti = toolInput(input);
  return ti.command || ti.cmd || input.command || '';
}

function filePathFrom(input) {
  const ti = toolInput(input);
  return ti.file_path || ti.filePath || ti.path || ti.file || input.path || '';
}

/** Exit 0 continue; exit 2 block (Claude-compatible). */
function allow(message) {
  if (message) process.stderr.write(String(message) + '\n');
  process.exit(0);
}

function block(reason) {
  const payload = {
    decision: 'block',
    reason: String(reason),
    hookSpecificOutput: {
      permissionDecision: 'deny',
      permissionDecisionReason: String(reason)
    }
  };
  try {
    process.stdout.write(JSON.stringify(payload) + '\n');
  } catch {
    /* ignore */
  }
  process.stderr.write('[fractal-hooks] BLOCK: ' + String(reason) + '\n');
  process.exit(2);
}

function warn(message) {
  process.stderr.write('[fractal-hooks] ' + String(message) + '\n');
}

function skipIfDisabled(hookId) {
  if (!hookEnabled(hookId)) {
    process.exit(0);
  }
}

module.exports = {
  readStdin,
  parseInput,
  pluginRoot,
  loadProfiles,
  activeProfile,
  hookEnabled,
  skipIfDisabled,
  toolInput,
  toolName,
  commandFrom,
  filePathFrom,
  allow,
  block,
  warn,
  homedir: () => os.homedir()
};
