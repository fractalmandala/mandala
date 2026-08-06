#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { skipIfDisabled, allow, warn } = require('./lib');

const HOOK_ID = 'session:handoff-detect';

const FRACTAL_DIR = path.join(os.homedir(), '.fractal', 'sessions');
const ACTIVE_DIR = path.join(FRACTAL_DIR, 'active');
const HANDOFF_FILE = path.join(ACTIVE_DIR, 'handoff.md');
const PLAN_FILE = path.join(ACTIVE_DIR, 'plan-state.json');
const MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

function parseFrontmatter(text) {
  if (!text || !text.startsWith('---')) return {};
  const end = text.indexOf('\n---', 3);
  if (end === -1) {
    // try line-boundary match
    const alt = text.indexOf('---', 3);
    if (alt === -1) return {};
    // verify it's on its own line
    const before = text.lastIndexOf('\n', alt);
    if (before === -1 || before < 3) return {};
    const block = text.slice(3, before).trim();
    return parseBlock(block);
  }
  const block = text.slice(3, end).trim();
  return parseBlock(block);
}

function parseBlock(block) {
  var meta = {};
  var lines = block.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var colon = line.indexOf(':');
    if (colon === -1) continue;
    var key = line.slice(0, colon).trim();
    var value = line.slice(colon + 1).trim();
    value = value.replace(/^['"]|['"]$/g, '');
    if (value) meta[key] = value;
  }
  return meta;
}

function humanAge(ms) {
  var mins = Math.round(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'min ago';
  var hrs = Math.floor(mins / 60);
  var rem = mins % 60;
  return hrs + 'h ' + rem + 'm ago';
}

function extractSection(body, heading, nextHeadings) {
  var pattern = '## ' + heading + '[\\s\\S]*?(?=## (?:' + nextHeadings.join('|') + ')|$)';
  var re = new RegExp(pattern);
  var match = body.match(re);
  if (match) return match[0].replace('## ' + heading, '').trim();
  return '';
}

(async () => {
  skipIfDisabled(HOOK_ID);

  // Step 1: Check if handoff file exists
  var handoffText;
  var handoffStat;
  try {
    handoffStat = fs.statSync(HANDOFF_FILE);
    handoffText = fs.readFileSync(HANDOFF_FILE, 'utf8');
    if (!handoffText || handoffText.trim().length < 10) {
      warn('session-handoff-detect: handoff file exists but is empty or too short, skipping');
      try { fs.rmSync(ACTIVE_DIR, { recursive: true, force: true }); } catch {}
      allow(); return;
    }
  } catch (e) {
    // No handoff — silently skip, this is the normal path
    allow(); return;
  }

  // Step 2: Check age
  var ageMs = Date.now() - handoffStat.mtimeMs;
  if (ageMs > MAX_AGE_MS) {
    warn('session-handoff-detect: handoff is stale (' + humanAge(ageMs) + '), cleaning up');
    try { fs.rmSync(ACTIVE_DIR, { recursive: true, force: true }); } catch {}
    allow(); return;
  }

  // Step 3: Parse frontmatter
  var meta = parseFrontmatter(handoffText);
  var host = meta.host || 'unknown';
  var boss = meta.boss || '';
  var title = meta.title || '';
  var ageStr = humanAge(ageMs);

  warn('session-handoff-detect: found handoff from ' + host + ' (' + ageStr + '): ' + (title || 'untitled'));

  // Step 4: Parse plan state
  var planNote = '';
  try {
    var planRaw = fs.readFileSync(PLAN_FILE, 'utf8');
    var plan = JSON.parse(planRaw);
    var steps = plan.steps || [];
    var done = steps.filter(function(s) { return s.status === 'done'; }).length;
    var total = steps.length;
    if (total > 0) {
      planNote = done + '/' + total + ' plan steps done. ';
    }
  } catch (e) {
    warn('session-handoff-detect: could not read plan-state: ' + e.message);
  }

  // Step 5: Extract sections
  var body = handoffText.replace(/^---[\s\S]*?---/, '').trim();
  var workingOn = extractSection(body, 'Working on', ['Decisions', 'Remaining', 'Notes']);
  var decisions = extractSection(body, 'Decisions', ['Remaining', 'Notes']);
  var remaining = extractSection(body, 'Remaining', ['Notes']);
  var notes = extractSection(body, 'Notes', []);

  // Step 6: Build message
  var msgs = [];
  msgs.push('=== Fractal smart continue: ' + (title || 'untitled') + ' ===');
  msgs.push('From: ' + host + ' (' + ageStr + ')' + (boss ? '. Boss: ' + boss : ''));
  if (planNote) msgs.push('Plan: ' + planNote);
  if (workingOn) { msgs.push(''); msgs.push('## Working on'); msgs.push(workingOn); }
  else { msgs.push(''); msgs.push('(no working-on section in handoff)'); }
  if (decisions) { msgs.push(''); msgs.push('## Decisions made'); msgs.push(decisions); }
  if (remaining) { msgs.push(''); msgs.push('## Remaining'); msgs.push(remaining); }
  if (notes) { msgs.push(''); msgs.push('## Notes'); msgs.push(notes); }
  msgs.push('');
  msgs.push('=== Resume work above. Run /handoff to overwrite. ===');

  var text = msgs.join('\n');

  // Step 7: Output — prefer systemMessage, also stderr for visibility
  try {
    var output = JSON.stringify({
      continue: true,
      systemMessage: text,
      hookSpecificOutput: { additionalContext: text }
    });
    process.stdout.write(output + '\n');
  } catch (e) {
    warn('session-handoff-detect: stdout write failed: ' + e.message);
  }

  warn(text);
  allow();
})().catch(function(e) {
  warn('session-handoff-detect: unexpected error: ' + (e.message || e));
  process.exit(0);
});
