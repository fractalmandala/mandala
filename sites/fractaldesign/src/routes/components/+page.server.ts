import fs from 'fs';
import path from 'path';
import type { PageServerLoad } from './$types';

const EXCLUDED = new Set([
  '+page.svelte', '+page.server.ts', '+page.ts',
  '+server.ts', 'index.ts', 'CanvasStore.svelte.ts',
  'CanvasStore.svelte',
]);

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

  if (selected) {
    const found = components.find(c => c.name === selected);
    if (found) {
      sourceFile = found.file;
      source = fs.readFileSync(path.join(dir, found.file), 'utf-8');
    }
  }

  return {
    components,
    selected,
    source,
    sourceFile,
  };
};
