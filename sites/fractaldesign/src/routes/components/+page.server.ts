import fs from 'fs';
import path from 'path';
import { getMdsvexShikiHighlighter, type MdsvexHighlighter } from '@mistweaverco/mdsvex-shiki';
import type { PageServerLoad } from './$types';

const EXCLUDED = new Set([
  '+page.svelte', '+page.server.ts', '+page.ts',
  '+server.ts', 'index.ts', 'CanvasStore.svelte.ts',
  'CanvasStore.svelte',
]);

// Dual-theme shiki: light tokens inline, dark tokens behind --shiki-dark,
// switched by [data-theme] rules in _registry.sass.
const highlighter = getMdsvexShikiHighlighter({
  disableCopyButton: true,
  displayLanguage: false,
  displayPath: false,
  shikiOptions: {
    themes: { light: 'github-light', dark: 'github-dark' },
    langs: ['svelte', 'ts', 'typescript', 'sass', 'css'],
  },
}).then((h): MdsvexHighlighter => (code, lang, meta, filename) => {
  const html = h(code, lang, meta, filename);
  // mdsvex-shiki wraps output in its own chrome (header bar etc.) —
  // the registry panel brings its own, so keep only the <pre> block.
  const pre = html.match(/<pre[\s\S]*?<\/pre>/);
  return pre ? pre[0] : html;
});

export const load: PageServerLoad = async ({ url }) => {
  const dir = path.resolve('src/routes/components');
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.svelte') || f.endsWith('.ts'))
    .filter(f => !EXCLUDED.has(f))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  const components = files.map(f => ({
    name: f.replace(/\.(svelte|ts)$/, ''),
    file: f,
  }));

  const selected = url.searchParams.get('c') || components[0]?.name || '';
  let source = '';
  let sourceFile = '';
  let sourceHtml = '';

  if (selected) {
    const found = components.find(c => c.name === selected);
    if (found) {
      sourceFile = found.file;
      source = fs.readFileSync(path.join(dir, found.file), 'utf-8');
      const highlight = await highlighter;
      sourceHtml = highlight(source, found.file.endsWith('.ts') ? 'ts' : 'svelte', null);
    }
  }

  return {
    components,
    selected,
    source,
    sourceFile,
    sourceHtml,
  };
};
