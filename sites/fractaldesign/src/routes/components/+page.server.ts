import fs from 'fs';
import path from 'path';
import { redirect } from '@sveltejs/kit';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-sass';
import 'prism-svelte';
import type { PageServerLoad } from './$types';

const EXCLUDED = new Set([
  '+page.svelte', '+page.server.ts', '+page.ts',
  '+server.ts', 'index.ts', 'CanvasStore.svelte.ts',
  'CanvasStore.svelte',
]);

// Same Prism pipeline mdsvex runs for /posts, so token colors and the dark
// block chrome match exactly across both docs sections (see prism.css).
function highlightSource(source: string, lang: string): string {
  const grammar = Prism.languages[lang] ?? Prism.languages.markup;
  const html = Prism.highlight(source, grammar, lang);
  return `<pre class="language-${lang}"><code class="language-${lang}">${html}</code></pre>`;
}

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

  // Keep the URL canonical (?c=…) so the sidebar active state always matches.
  if (!url.searchParams.get('c') && components.length) {
    redirect(307, `/components?c=${encodeURIComponent(components[0].name)}`);
  }

  const selected = url.searchParams.get('c') || '';
  let source = '';
  let sourceFile = '';
  let sourceHtml = '';

  if (selected) {
    const found = components.find(c => c.name === selected);
    if (found) {
      sourceFile = found.file;
      source = fs.readFileSync(path.join(dir, found.file), 'utf-8');
      sourceHtml = highlightSource(source, found.file.endsWith('.ts') ? 'typescript' : 'svelte');
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
