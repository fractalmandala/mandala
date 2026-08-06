#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const DEFAULT_INTERVAL_HOURS = 48;
const DEFAULT_TIMEOUT_MS = 20 * 60 * 1000;
const MAX_OUTPUT = 12 * 1024 * 1024;

function root() {
  return path.resolve(__dirname, '..');
}

function configPath() {
  return process.env.FRACTAL_ESSAY_CONFIG ||
    path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'),
      'fractal-agentic', 'periodic-essay.json');
}

function stateDir(config) {
  return resolvePath(config.state_dir ||
    path.join(process.env.XDG_STATE_HOME || path.join(os.homedir(), '.local', 'state'),
      'fractal-agentic', 'periodic-essay'));
}

function resolvePath(value, context) {
  if (!value || typeof value !== 'string') return value;
  const ctx = context || {};
  let result = value
    .replace(/\{plugin_root\}/g, ctx.pluginRoot || root())
    .replace(/\{wiki_root\}/g, ctx.wikiRoot || '')
    .replace(/\{output_dir\}/g, ctx.outputDir || '')
    .replace(/\{state_dir\}/g, ctx.stateDir || '')
    .replace(new RegExp('\\x24\\{HOME\\}|\\x24HOME', 'g'), os.homedir());
  if (result === '~') result = os.homedir();
  if (result.startsWith('~' + path.sep)) result = path.join(os.homedir(), result.slice(2));
  return path.resolve(result);
}

function expandArg(value, context) {
  if (typeof value !== 'string') return value;
  const ctx = context || {};
  let result = value
    .replace(/\{plugin_root\}/g, ctx.pluginRoot || root())
    .replace(/\{wiki_root\}/g, ctx.wikiRoot || '')
    .replace(/\{output_dir\}/g, ctx.outputDir || '')
    .replace(/\{state_dir\}/g, ctx.stateDir || '')
    .replace(new RegExp('\\x24\\{HOME\\}|\\x24HOME', 'g'), os.homedir());
  if (result === '~') result = os.homedir();
  if (result.startsWith('~' + path.sep)) result = path.join(os.homedir(), result.slice(2));
  return result;
}

function defaults() {
  return {
    version: 1,
    enabled: false,
    interval_hours: DEFAULT_INTERVAL_HOURS,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
    output_dir: '',
    wiki_root: '',
    require_wiki: true,
    state_dir: path.join(process.env.XDG_STATE_HOME || path.join(os.homedir(), '.local', 'state'),
      'fractal-agentic', 'periodic-essay'),
    lock_ttl_hours: 6,
    capture: { enabled: true, strict_result: true, verify_files: true },
    sources: { paths: [], memory_paths: [], transcript_paths: [], include_wiki: true },
    article: { min_words: 700, max_words: 2200, min_tags: 2, max_tags: 4 },
    skills: {
      grand_writer: path.join(os.homedir(), '.codex', 'skills', 'grand-writer', 'SKILL.md'),
      human_writing: path.join(root(), 'skills', 'human-writing', 'SKILL.md')
    },
    agent: {
      executable: process.env.FRACTAL_ESSAY_AGENT || 'claude',
      timeout_minutes: 20,
      capture_args: [
        '--print', '--no-session-persistence', '--output-format', 'json',
        '--plugin-dir={plugin_root}', '--add-dir={wiki_root}',
        '--permission-mode=acceptEdits', '--allowedTools=Read,Write,Edit'
      ],
      article_args: [
        '--print', '--no-session-persistence', '--output-format', 'json',
        '--plugin-dir={plugin_root}', '--add-dir={wiki_root}', '--allowedTools=Read'
      ]
    }
  };
}

function merge(base, extra) {
  if (!extra || typeof extra !== 'object') return base;
  for (const [key, value] of Object.entries(extra)) {
    if (value && typeof value === 'object' && !Array.isArray(value) &&
      base[key] && typeof base[key] === 'object') {
      base[key] = merge({ ...base[key] }, value);
    } else {
      base[key] = value;
    }
  }
  return base;
}

function loadConfig(file) {
  const target = file || configPath();
  if (!fs.existsSync(target)) {
    throw new Error('Periodic essay config not found: ' + target + '. Run essay-init first.');
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(target, 'utf8'));
    const result = merge(defaults(), parsed);
    result.__path = target;
    return result;
  } catch (error) {
    throw new Error('Could not read periodic essay config ' + target + ': ' + error.message);
  }
}

function mkdir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function atomicJson(file, value) {
  mkdir(path.dirname(file));
  const temp = file + '.' + process.pid + '.' + crypto.randomBytes(4).toString('hex') + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
  fs.renameSync(temp, file);
}

function initialState() {
  return {
    version: 1, run_count: 0, pending: false, last_started_at: null,
    last_completed_at: null, next_due_at: null, last_output: null,
    last_topic: null, last_error: null
  };
}

function readState(config) {
  const file = path.join(stateDir(config), 'state.json');
  if (!fs.existsSync(file)) return initialState();
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error('Could not read state file ' + file + ': ' + error.message);
  }
}

function writeState(config, state) {
  atomicJson(path.join(stateDir(config), 'state.json'), state);
  return state;
}
function due(config, state, date) {
  if (state.pending || !state.last_completed_at) return true;
  const completed = Date.parse(state.last_completed_at);
  if (!Number.isFinite(completed)) return true;
  const hours = Number(config.interval_hours);
  const interval = (Number.isFinite(hours) && hours > 0 ? hours : DEFAULT_INTERVAL_HOURS) *
    60 * 60 * 1000;
  return (date || new Date()).getTime() - completed >= interval;
}

function nextDue(config, completedAt) {
  const completed = Date.parse(completedAt);
  if (!Number.isFinite(completed)) return null;
  const hours = Number(config.interval_hours);
  const interval = (Number.isFinite(hours) && hours > 0 ? hours : DEFAULT_INTERVAL_HOURS) *
    60 * 60 * 1000;
  return new Date(completed + interval).toISOString();
}

function localDate(date, timezone) {
  if (!timezone) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') +
      '-' + String(date.getDate()).padStart(2, '0');
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return values.year + '-' + values.month + '-' + values.day;
}

function context(config, wiki) {
  const outputDir = config.output_dir ? resolvePath(config.output_dir) : '';
  const state = stateDir(config);
  return {
    pluginRoot: root(),
    outputDir,
    stateDir: state,
    wikiRoot: wiki || (config.wiki_root ? resolvePath(config.wiki_root) : '')
  };
}

function lock(config) {
  const directory = path.join(stateDir(config), 'run.lock');
  mkdir(path.dirname(directory));
  const hours = Number(config.lock_ttl_hours);
  const ttl = (Number.isFinite(hours) && hours > 0 ? hours : 6) * 60 * 60 * 1000;
  try {
    fs.mkdirSync(directory);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    let stale = false;
    try { stale = Date.now() - fs.statSync(directory).mtimeMs > ttl; } catch {}
    if (!stale) throw new Error('Periodic essay run is already locked: ' + directory);
    fs.rmSync(directory, { recursive: true, force: true });
    fs.mkdirSync(directory);
  }
  fs.writeFileSync(path.join(directory, 'owner.json'),
    JSON.stringify({ pid: process.pid, started_at: new Date().toISOString() }) + '\n',
    { mode: 0o600 });
  return directory;
}

function unlock(directory) {
  if (directory) fs.rmSync(directory, { recursive: true, force: true });
}

function findWikiRoot(config, ctx) {
  if (ctx.wikiRoot) return ctx.wikiRoot;
  const resolver = path.join(root(), 'skills', 'llm-wiki', 'scripts', 'wiki-resolve-root.sh');
  if (!fs.existsSync(resolver)) return null;
  const result = spawnSync('sh', [resolver], { encoding: 'utf8', timeout: 10000 });
  if (result.status !== 0) return null;
  const line = String(result.stdout || '').trim().split(/\r?\n/)[0];
  return line ? path.resolve(line) : null;
}

function walk(target, depth, files) {
  if (!target || files.length >= 500 || depth > 8 || !fs.existsSync(target)) return;
  let stat;
  try { stat = fs.statSync(target); } catch { return; }
  if (stat.isFile()) {
    files.push({ path: target, size: stat.size, modified_at: new Date(stat.mtimeMs).toISOString() });
    return;
  }
  if (!stat.isDirectory()) return;
  let entries;
  try { entries = fs.readdirSync(target, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    if (files.length >= 500) break;
    if (['.git', 'node_modules', '.svelte-kit', '.next', 'dist'].includes(entry.name)) continue;
    walk(path.join(target, entry.name), depth + 1, files);
  }
}

function sourceManifest(config, ctx, wiki, since) {
  const source = config.sources || {};
  const roots = [
    ...(Array.isArray(source.paths) ? source.paths : []),
    ...(Array.isArray(source.memory_paths) ? source.memory_paths : []),
    ...(Array.isArray(source.transcript_paths) ? source.transcript_paths : [])
  ].filter(Boolean).map((item) => resolvePath(item, { ...ctx, wikiRoot: wiki }));
  if (source.include_wiki && wiki) {
    roots.push(path.join(wiki, 'raw'));
    roots.push(path.join(wiki, 'wiki'));
  }
  const files = [];
  for (const target of [...new Set(roots)]) walk(target, 0, files);
  const sinceAt = since ? Date.parse(since) : NaN;
  const changed = Number.isFinite(sinceAt)
    ? files.filter((item) => Date.parse(item.modified_at) >= sinceAt ||
      item.path.includes(path.sep + 'index.md'))
    : files;
  return {
    roots: [...new Set(roots)],
    since: since || null,
    files: (changed.length ? changed : files).slice(0, 500)
  };
}

function snapshotTree(directory) {
  const files = [];
  if (directory) walk(directory, 0, files);
  return new Map(files.map((item) => [item.path, item.modified_at + ':' + item.size]));
}

function changedFiles(before, after, prefix) {
  const changed = [];
  for (const [file, signature] of after.entries()) {
    if (!prefix || file === prefix || file.startsWith(prefix + path.sep)) {
      if (before.get(file) !== signature) changed.push(file);
    }
  }
  return changed;
}

function readSkill(file, label) {
  const target = resolvePath(file);
  if (!target || !fs.existsSync(target)) throw new Error(label + ' skill not found: ' + target);
  return fs.readFileSync(target, 'utf8');
}

function capturePrompt(ctx, wiki, data, state) {
  const roots = data.roots.length ? data.roots.join('\n') : '(none configured)';
  const warning = data.roots.length ? '' :
    '\nNo transcript or memory paths are configured. Record that limitation instead of inventing chat history.';
  return 'You are the knowledge-maintenance worker in a local scheduled essay pipeline.\n\n' +
    'Read the Fractal Agentic llm-wiki skill and the wiki-capture/wiki-ingest command instructions first. Work only inside this wiki root:\n' +
    wiki + '\n\n' +
    'Configured source roots:\n' + roots + warning + '\n\n' +
    'Perform all of these steps:\n' +
    '1. Review the listed roots for new or relevant chat/session history, memory, project notes, and wiki material since ' +
    (state.last_completed_at || 'the beginning of the configured archive') + '.\n' +
    '2. Create one append-only raw Fractal episode under ' + path.join(wiki, 'raw', 'fractal') +
    '. Never rewrite an existing raw episode. Do not include credentials or unnecessary private data.\n' +
    '3. Ingest unprocessed raw material into the structured wiki and update its indexes/log according to the instructions.\n' +
    '4. Recommend one grounded essay topic based on what was actually found.\n' +
    '5. Do not write the public essay or touch ' + (ctx.outputDir || '(no post directory)') + '.\n\n' +
    'Return JSON only: {"captured":true,"ingested":true,"topic":"...","summary":"...","tags":["...","..."]}.\n' +
    'Set captured or ingested false if it was not completed. Do not use a Markdown fence.\n\n' +
    'Source manifest:\n' + JSON.stringify(data, null, 2);
}
function articlePrompt(config, ctx, wiki, data, capture) {
  const grand = readSkill(config.skills.grand_writer, 'Grand Writer');
  const human = readSkill(config.skills.human_writing, 'Human Writing');
  const minWords = Number(config.article && config.article.min_words) || 700;
  const maxWords = Number(config.article && config.article.max_words) || 2200;
  const minTags = Number(config.article && config.article.min_tags) || 2;
  const maxTags = Number(config.article && config.article.max_tags) || 4;
  return 'You are the scheduled essay writer. Write one original, source-grounded essay for a local Fractal Design posts folder.\n\n' +
    'Topic guidance: ' + (capture && capture.topic || 'Choose the strongest grounded topic from the available material.') + '\n' +
    'Capture summary: ' + (capture && capture.summary || 'Inspect the source material directly.') + '\n' +
    'Read source files from the manifest. Do not invent personal experiences, project facts, quotations, or citations. If material is thin, write a modest essay around the strongest supported idea.\n\n' +
    'Write ' + minWords + '-' + maxWords + ' words with a clear title, direct opening, useful progression, and concrete final implication. Use headings only when they improve the flow. Do not make the essay list-heavy.\n\n' +
    'Apply these contracts in order:\n--- GRAND WRITER ---\n' + grand +
    '\n--- HUMAN WRITING ---\n' + human +
    '\n--- END CONTRACTS ---\n\n' +
    'Grand Writer is the primary voice. Use its technology/dystopia register for technical subjects rather than forcing civilizational language into a SvelteKit essay. Human Writing removes AI tells without flattening the voice. The contracts\' prohibitions outrank illustrative examples. Scan for forbidden patterns, especially em dashes and generic meta openings.\n\n' +
    'Return JSON only with exactly: {"title":"...","tags":["tag-one","tag-two"],"description":"...","body":"..."}.\n' +
    'Use ' + minTags + '-' + maxTags + ' short tags. Keep description to one sentence under 180 characters. Do not include YAML frontmatter in body, do not use a code fence, and do not mention this pipeline or the skills.\n\n' +
    'Source manifest:\n' + JSON.stringify(data, null, 2);
}
function runAgent(config, phase, prompt, ctx) {
  const settings = config.agent || {};
  const configured = phase === 'capture' ? settings.capture_args : settings.article_args;
  const selected = Array.isArray(configured) ? configured : settings.args || [];
  const args = selected.map((item) => expandArg(item, ctx));
  const minutes = Number(settings.timeout_minutes);
  const timeout = (Number.isFinite(minutes) && minutes > 0 ? minutes : 20) * 60 * 1000;
  const result = spawnSync(settings.executable || 'claude', [...args, prompt], {
    cwd: ctx.wikiRoot || ctx.outputDir || ctx.pluginRoot,
    env: {
      ...process.env,
      FRACTAL_AGENTIC_ROOT: ctx.pluginRoot,
      FRACTAL_WIKI_ROOT: ctx.wikiRoot || '',
      FRACTAL_ESSAY_OUTPUT_DIR: ctx.outputDir || ''
    },
    encoding: 'utf8',
    timeout,
    maxBuffer: MAX_OUTPUT,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  if (result.error) throw new Error(phase + ' agent failed to start: ' + result.error.message);
  if (result.status !== 0) {
    const stderr = String(result.stderr || '').trim().slice(-3000);
    throw new Error(phase + ' agent exited with status ' + result.status + (stderr ? ': ' + stderr : ''));
  }
  return String(result.stdout || '').trim();
}

function textFromAgent(value) {
  const text = String(value || '').trim();
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === 'string') return parsed;
    if (typeof parsed.result === 'string') return parsed.result;
    if (Array.isArray(parsed.content)) {
      return parsed.content.map((item) => typeof item === 'string' ? item : item && item.text || '')
        .filter(Boolean).join('\n');
    }
    if (parsed.message && typeof parsed.message.content === 'string') return parsed.message.content;
  } catch {}
  return text;
}

function jsonPayload(value) {
  const fence = String.fromCharCode(96).repeat(3);
  const text = textFromAgent(value)
    .replace(new RegExp('^' + fence + '(?:json)?\\s*', 'i'), '')
    .replace(new RegExp('\\s*' + fence + '$'), '')
    .trim();
  const candidates = [text];
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) candidates.push(text.slice(start, end + 1));
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {}
  }
  return null;
}

function yamlValue(value) {
  const text = String(value || '').trim();
  if ((text.startsWith('"') && text.endsWith('"')) ||
      (text.startsWith("'") && text.endsWith("'"))) {
    try { return text.startsWith('"') ? JSON.parse(text) : text.slice(1, -1).replace(/''/g, "'"); }
    catch { return text.slice(1, -1); }
  }
  return text;
}

function markdownArticle(value) {
  const match = textFromAgent(value).match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return null;
  const result = { tags: [], body: match[2].trim() };
  let tags = false;
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^\s*-\s*(.+)$/);
    if (tags && item) {
      result.tags.push(yamlValue(item[1]));
      continue;
    }
    const field = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!field) continue;
    tags = field[1] === 'tags';
    if (!tags) result[field[1]] = yamlValue(field[2]);
  }
  return result;
}
function normalizeArticle(raw, config) {
  const value = raw && typeof raw === 'object' ? raw : {};
  const title = String(value.title || '').trim();
  const description = String(value.description || '').trim().replace(/\s+/g, ' ');
  const body = String(value.body || value.content || '').trim();
  const tags = Array.isArray(value.tags) ? value.tags.map((tag) => String(tag).trim()).filter(Boolean) : [];
  const minTags = Number(config.article && config.article.min_tags) || 2;
  const maxTags = Number(config.article && config.article.max_tags) || 4;
  const minWords = Number(config.article && config.article.min_words) || 700;
  const maxWords = Number(config.article && config.article.max_words) || 2200;
  const words = body ? body.split(/\s+/).length : 0;
  if (!title || title.length > 180) throw new Error('Article title is missing or too long.');
  if (!description || description.length > 180) throw new Error('Article description is missing or too long.');
  if (tags.length < minTags || tags.length > maxTags) {
    throw new Error('Article must contain ' + minTags + '-' + maxTags + ' tags.');
  }
  if (!body) throw new Error('Article body is empty.');
  if (words < minWords || words > maxWords) {
    throw new Error('Article body is ' + words + ' words; expected ' + minWords + '-' + maxWords + '.');
  }
  return { title, description, tags, body };
}

function render(article, date) {
  return [
    '---',
    'title: ' + JSON.stringify(article.title),
    'tags:',
    ...article.tags.map((tag) => '  - ' + JSON.stringify(tag)),
    'group: scheduledpost',
    'description: ' + JSON.stringify(article.description),
    'date: ' + date,
    '---',
    '',
    article.body,
    ''
  ].join('\n');
}

function parsePost(contents) {
  const match = String(contents).match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) throw new Error('Post does not begin with YAML frontmatter.');
  const result = { tags: [], body: match[2].trim() };
  let tags = false;
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^\s*-\s*(.+)$/);
    if (tags && item) {
      result.tags.push(yamlValue(item[1]));
      continue;
    }
    const field = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!field) continue;
    tags = field[1] === 'tags';
    if (!tags) result[field[1]] = yamlValue(field[2]);
  }
  return result;
}

function validate(contents, expectedDate) {
  const value = parsePost(contents);
  for (const key of ['title', 'group', 'description', 'date']) {
    if (!value[key]) throw new Error('Post frontmatter is missing ' + key + '.');
  }
  if (value.group !== 'scheduledpost') throw new Error('Post group must be scheduledpost.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.date)) throw new Error('Post date must be YYYY-MM-DD.');
  if (expectedDate && value.date !== expectedDate) throw new Error('Post date must be ' + expectedDate + '.');
  if (!Array.isArray(value.tags) || value.tags.length < 2) throw new Error('Post needs at least two tags.');
  if (!value.body) throw new Error('Post body is empty.');
  return value;
}

function slug(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) ||
    'scheduled-essay';
}

function writePost(ctx, article, date) {
  if (!ctx.outputDir) throw new Error('output_dir is not configured.');
  mkdir(ctx.outputDir);
  const base = date + '-' + slug(article.title);
  let file = path.join(ctx.outputDir, base + '.md');
  let suffix = 2;
  while (fs.existsSync(file)) file = path.join(ctx.outputDir, base + '-' + suffix++ + '.md');
  const contents = render(article, date);
  validate(contents, date);
  const temp = file + '.' + process.pid + '.' + crypto.randomBytes(4).toString('hex') + '.tmp';
  fs.writeFileSync(temp, contents, { mode: 0o644 });
  fs.renameSync(temp, file);
  return file;
}

function run(config, options) {
  const opts = options || {};
  const state = readState(config);
  if (!config.enabled && !opts.force) {
    throw new Error('Periodic essay pipeline is disabled. Run essay-init first.');
  }
  if (opts.ifDue && !due(config, state)) return { skipped: true, reason: 'not-due', state };
  const ctx = context(config);
  if (!ctx.outputDir) throw new Error('output_dir is not configured.');
  const lockDirectory = lock(config);
  let current = state;
  try {
    if (opts.ifDue && !due(config, current)) return { skipped: true, reason: 'not-due', state: current };
    const wiki = findWikiRoot(config, ctx);
    if (config.require_wiki !== false && !wiki) {
      throw new Error('No wiki root resolved. Set wiki_root or run wiki-init first.');
    }
    if (wiki && !fs.existsSync(wiki)) throw new Error('Configured wiki root does not exist: ' + wiki);
    const resolved = context(config, wiki);
    if (opts.dryRun) return { skipped: false, dry_run: true, output_dir: resolved.outputDir, wiki_root: wiki };

    current = writeState(config, {
      ...current,
      pending: true,
      last_started_at: new Date().toISOString(),
      last_error: null
    });

    const dataBefore = sourceManifest(config, resolved, wiki, current.last_completed_at);
    let capture = null;
    if (!config.capture || config.capture.enabled !== false) {
      if (!wiki) throw new Error('A wiki root is required when capture is enabled.');
      const wikiBefore = snapshotTree(wiki);
      capture = jsonPayload(runAgent(config, 'capture',
        capturePrompt(resolved, wiki, dataBefore, current), { ...resolved, wikiRoot: wiki }));
      if (config.capture.strict_result !== false &&
        (!capture || capture.captured !== true || capture.ingested !== true)) {
        throw new Error('Capture agent did not confirm captured=true and ingested=true. No essay was written.');
      }
      if (config.capture.verify_files !== false) {
        const wikiAfter = snapshotTree(wiki);
        const rawPrefix = path.join(wiki, 'raw', 'fractal');
        const structuredPrefix = path.join(wiki, 'wiki');
        if (!changedFiles(wikiBefore, wikiAfter, rawPrefix).length) {
          throw new Error('Capture agent reported success but created no new raw/fractal episode. No essay was written.');
        }
        if (!changedFiles(wikiBefore, wikiAfter, structuredPrefix).length) {
          throw new Error('Ingest agent reported success but changed no structured wiki file. No essay was written.');
        }
      }
    }

    const dataAfter = sourceManifest(config, resolved, wiki, current.last_completed_at);
    const raw = runAgent(config, 'article',
      articlePrompt(config, resolved, wiki, dataAfter, capture), { ...resolved, wikiRoot: wiki });
    const rawArticle = jsonPayload(raw) || markdownArticle(raw);
    const article = normalizeArticle(rawArticle, config);
    const output = writePost(resolved, article, localDate(new Date(), config.timezone));
    const completed = new Date().toISOString();
    current = writeState(config, {
      ...current,
      version: 1,
      run_count: (Number(current.run_count) || 0) + 1,
      pending: false,
      last_completed_at: completed,
      next_due_at: nextDue(config, completed),
      last_output: output,
      last_topic: capture && capture.topic || article.title,
      last_error: null
    });
    return { skipped: false, output, article, capture, state: current };
  } catch (error) {
    writeState(config, { ...current, pending: true, last_error: error.message });
    throw error;
  } finally {
    unlock(lockDirectory);
  }
}
function init(file, args) {
  const outputIndex = args.indexOf('--output-dir');
  if (outputIndex < 0 || !args[outputIndex + 1]) {
    throw new Error('essay-init requires --output-dir PATH.');
  }
  const config = defaults();
  config.enabled = true;
  config.output_dir = resolvePath(args[outputIndex + 1]);
  const wikiIndex = args.indexOf('--wiki-root');
  const agentIndex = args.indexOf('--agent');
  const stateIndex = args.indexOf('--state-dir');
  const sourceIndex = args.indexOf('--source-path');
  const memoryIndex = args.indexOf('--memory-path');
  const transcriptIndex = args.indexOf('--transcript-path');
  if (wikiIndex >= 0 && args[wikiIndex + 1]) config.wiki_root = resolvePath(args[wikiIndex + 1]);
  if (agentIndex >= 0 && args[agentIndex + 1]) config.agent.executable = args[agentIndex + 1];
  if (stateIndex >= 0 && args[stateIndex + 1]) config.state_dir = resolvePath(args[stateIndex + 1]);
  if (sourceIndex >= 0 && args[sourceIndex + 1]) config.sources.paths = [resolvePath(args[sourceIndex + 1])];
  if (memoryIndex >= 0 && args[memoryIndex + 1]) config.sources.memory_paths = [resolvePath(args[memoryIndex + 1])];
  if (transcriptIndex >= 0 && args[transcriptIndex + 1]) config.sources.transcript_paths = [resolvePath(args[transcriptIndex + 1])];
  atomicJson(file, config);
  mkdir(config.state_dir);
  process.stdout.write('Initialized ' + file + '\nOutput directory: ' + config.output_dir +
    '\nThe pipeline is enabled; no agent is called until due or manually run.\n');
}

function main(args) {
  const command = args[0] || 'status';
  const file = configPath();
  if (command === 'init') return init(file, args.slice(1));
  const config = loadConfig(file);

  if (command === 'status') {
    const state = readState(config);
    process.stdout.write(JSON.stringify({
      config: file,
      enabled: Boolean(config.enabled),
      interval_hours: config.interval_hours,
      due: Boolean(config.enabled && due(config, state)),
      output_dir: config.output_dir || null,
      wiki_root: findWikiRoot(config, context(config)),
      agent: config.agent && config.agent.executable,
      last_completed_at: state.last_completed_at,
      next_due_at: state.next_due_at,
      last_output: state.last_output,
      last_topic: state.last_topic,
      last_error: state.last_error,
      pending: Boolean(state.pending)
    }, null, 2) + '\n');
    return;
  }

  if (command === 'due') {
    const state = readState(config);
    const isDue = config.enabled && due(config, state);
    if (args.includes('--enqueue') && isDue) writeState(config, { ...state, pending: true });
    process.stdout.write(JSON.stringify({ due: isDue }, null, 2) + '\n');
    return;
  }

  if (command === 'run') {
    const result = run(config, {
      ifDue: args.includes('--if-due'),
      force: args.includes('--force'),
      dryRun: args.includes('--dry-run')
    });
    process.stdout.write(JSON.stringify({
      skipped: result.skipped,
      reason: result.reason,
      dry_run: result.dry_run,
      output: result.output || null,
      next_due_at: result.state && result.state.next_due_at || null
    }, null, 2) + '\n');
    return;
  }

  if (command === 'validate') {
    if (!args[1]) throw new Error('validate requires a Markdown file path.');
    const value = validate(fs.readFileSync(resolvePath(args[1]), 'utf8'));
    process.stdout.write(JSON.stringify({
      valid: true, title: value.title, date: value.date
    }, null, 2) + '\n');
    return;
  }

  throw new Error('Unknown command: ' + command);
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write('periodic-essay-runner: ' + error.message + '\n');
    process.exitCode = 1;
  }
}

module.exports = {
  defaults, due, localDate, normalizeArticle, parsePost, render, slug, validate
};
