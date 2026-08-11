import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import type { Args } from './util.js';
import { exists } from './util.js';

export async function detectHost(root: string) {
  const pkgPath = join(root, 'package.json');
  if (!(await exists(pkgPath))) {
    return { kind: 'unknown' as const, pkg: null as null | Record<string, unknown> };
  }
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as Record<string, unknown>;
  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined)
  };
  const hasKit = Boolean(deps['@sveltejs/kit']);
  const hasMdsvex = Boolean(deps['mdsvex']);
  const hasSvelte = Boolean(deps['svelte']);
  const hasAcrolls = Boolean(deps['@acrolls/svelte'] || deps['@acrolls/mdsvex']);
  return {
    kind: hasKit ? ('sveltekit' as const) : hasSvelte ? ('svelte' as const) : ('node' as const),
    pkg,
    deps,
    hasKit,
    hasMdsvex,
    hasSvelte,
    hasAcrolls,
    svelteConfig: (await exists(join(root, 'svelte.config.js')))
      ? 'svelte.config.js'
      : (await exists(join(root, 'svelte.config.ts')))
        ? 'svelte.config.ts'
        : null,
    layout:
      (await exists(join(root, 'src/routes/+layout.svelte')))
        ? 'src/routes/+layout.svelte'
        : (await exists(join(root, 'src/app.html')))
          ? 'src/app.html'
          : null
  };
}

const SVELTE_CONFIG_SNIPPET = `import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createAcrollsSvelteKitMdsvexPreprocessor } from '@acrolls/sveltekit';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.svx', '.md'],
  preprocess: [
    vitePreprocess(),
    createAcrollsSvelteKitMdsvexPreprocessor()
  ],
  kit: {
    adapter: adapter()
  }
};

export default config;
`;

function ensureStyleImport(source: string, mode: string): { next: string; changed: boolean } {
  const importLine = `import '@acrolls/styles/${mode}.css';`;
  if (source.includes('@acrolls/styles/')) {
    return { next: source, changed: false };
  }
  // Prefer after existing imports
  const scriptMatch = source.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    const body = scriptMatch[1] ?? '';
    const injected = `${body.trim() ? body.replace(/^\n?/, '\n') : '\n'}\t${importLine}\n`;
    const next = source.replace(scriptMatch[0], scriptMatch[0].replace(body, injected));
    return { next, changed: true };
  }
  const next = `<script>\n\t${importLine}\n</script>\n\n${source}`;
  return { next, changed: true };
}

function patchSvelteConfig(source: string): { next: string; changed: boolean; notes: string[] } {
  const notes: string[] = [];
  let next = source;
  let changed = false;

  const hasAcrollsPreprocessor = next.includes('createAcrollsSvelteKitMdsvexPreprocessor');
  if (!next.includes('mdsvex') && !hasAcrollsPreprocessor) {
    notes.push('add Acrolls mdsvex preprocessor (manual merge recommended if config is complex)');
  }
  if (!next.includes('@acrolls/sveltekit') && !next.includes('createAcrolls')) {
    notes.push('wire createAcrollsSvelteKitMdsvexPreprocessor()');
  }
  if (!next.includes("'.svx'") && !next.includes('".svx"')) {
    if (next.includes('extensions:')) {
      next = next.replace(
        /extensions:\s*\[([^\]]*)\]/,
        (full, inner: string) => {
          if (inner.includes('svx')) return full;
          const trimmed = inner.trim().replace(/,?$/, '');
          changed = true;
          return `extensions: [${trimmed}${trimmed ? ', ' : ''}'.svx', '.md']`;
        }
      );
      notes.push('extended extensions with .svx, .md');
    } else {
      notes.push('add extensions: [\'.svelte\', \'.svx\', \'.md\']');
    }
  }

  if (!hasAcrollsPreprocessor && next.includes('preprocess:')) {
    // try inject mdsvex into preprocess array
    if (next.includes('preprocess: [')) {
      next = next.replace(
        /preprocess:\s*\[/,
        `preprocess: [\n    createAcrollsSvelteKitMdsvexPreprocessor(),\n    `
      );
      const hasPreprocessorImport = /createAcrollsSvelteKitMdsvexPreprocessor\s*[,}]/.test(next);
      if (!hasPreprocessorImport && next.includes("from '@acrolls/sveltekit'")) {
        next = next.replace(
          /import\s*\{([^}]*)\}\s*from\s*'@acrolls\/sveltekit';/,
          (_full, names: string) =>
            `import {${names.trim()}, createAcrollsSvelteKitMdsvexPreprocessor} from '@acrolls/sveltekit';`
        );
      } else if (!hasPreprocessorImport && next.includes('from "@acrolls/sveltekit"')) {
        next = next.replace(
          /import\s*\{([^}]*)\}\s*from\s*"@acrolls\/sveltekit";/,
          (_full, names: string) =>
            `import {${names.trim()}, createAcrollsSvelteKitMdsvexPreprocessor} from "@acrolls/sveltekit";`
        );
      } else if (!hasPreprocessorImport) {
        next =
          `import { createAcrollsSvelteKitMdsvexPreprocessor } from '@acrolls/sveltekit';\n` + next;
      }
      changed = true;
      notes.push('injected createAcrollsSvelteKitMdsvexPreprocessor() into preprocess');
    }
  }

  return { next, changed, notes };
}

export async function cmdIntegrate(args: Args) {
  const dry = Boolean(args.flags['dry-run']);
  const mode = String(args.flags.mode ?? 'default');
  if (!['foundation', 'default'].includes(mode)) {
    console.error('Invalid --mode. Use foundation or default.');
    return 2;
  }
  const root = process.cwd();
  const host = await detectHost(root);
  const actions: string[] = [];

  console.log(`Host: ${host.kind}`);
  console.log(`Mode: ${mode}`);
  console.log('Plan:');
  console.log('  1. Ensure packages: @acrolls/{svelte,styles,mdsvex,sveltekit} + mdsvex + @acrolls/cli');
  console.log(
    `  2. ${host.svelteConfig ? `Patch ${host.svelteConfig}` : 'Create svelte.config.js'}`
  );
  console.log(
    `  3. ${host.layout ? `Import styles in ${host.layout}` : 'Create src/routes/+layout.svelte with styles'}`
  );
  console.log('  4. Snapshot originals to .acrolls/backup/ before writes');

  if (dry) {
    console.log('\n[dry-run] no files changed');
    if (!host.hasAcrolls) {
      console.log(
        '\nInstall when ready:\n  pnpm add @acrolls/svelte @acrolls/styles @acrolls/mdsvex @acrolls/sveltekit\n  pnpm add -D @acrolls/cli mdsvex'
      );
    }
    return 0;
  }

  if (!args.flags.yes) {
    console.log('\nRe-run with --yes to apply (reviewed non-interactive apply).');
    console.log(
      'Packages:\n  pnpm add @acrolls/svelte @acrolls/styles @acrolls/mdsvex @acrolls/sveltekit\n  pnpm add -D @acrolls/cli mdsvex'
    );
    return 0;
  }

  const backupDir = join(root, '.acrolls/backup', String(Date.now()));
  await mkdir(backupDir, { recursive: true });

  // svelte.config
  if (!host.svelteConfig) {
    const target = join(root, 'svelte.config.js');
    await writeFile(target, SVELTE_CONFIG_SNIPPET, 'utf8');
    actions.push(`created ${relative(root, target)}`);
  } else {
    const path = join(root, host.svelteConfig);
    const original = await readFile(path, 'utf8');
    await writeFile(join(backupDir, host.svelteConfig.replaceAll('/', '__')), original, 'utf8');
    const { next, changed, notes } = patchSvelteConfig(original);
    if (changed) {
      await writeFile(path, next, 'utf8');
      actions.push(`patched ${host.svelteConfig} (${notes.join('; ')})`);
    } else {
      actions.push(`left ${host.svelteConfig} unchanged — ${notes.join('; ') || 'already wired or needs manual merge'}`);
      // still write guide notes
      await writeFile(
        join(backupDir, 'svelte.config.notes.txt'),
        notes.join('\n') || 'no automatic changes',
        'utf8'
      );
    }
  }

  // layout styles
  const layoutPath = host.layout
    ? join(root, host.layout)
    : join(root, 'src/routes/+layout.svelte');

  if (await exists(layoutPath)) {
    const original = await readFile(layoutPath, 'utf8');
    await writeFile(
      join(backupDir, relative(root, layoutPath).replaceAll('/', '__')),
      original,
      'utf8'
    );
    if (layoutPath.endsWith('.svelte')) {
      const { next, changed } = ensureStyleImport(original, mode);
      if (changed) {
        await writeFile(layoutPath, next, 'utf8');
        actions.push(`imported @acrolls/styles/${mode}.css in ${relative(root, layoutPath)}`);
      } else {
        actions.push(`styles already present in ${relative(root, layoutPath)}`);
      }
    } else {
      actions.push(`skipped auto-edit of ${host.layout} (not a .svelte layout) — import CSS in root layout manually`);
    }
  } else {
    await mkdir(join(root, 'src/routes'), { recursive: true });
    const content = `<script>
\timport '@acrolls/styles/${mode}.css';
\tlet { children } = $props();
</script>

{@render children()}
`;
    await writeFile(layoutPath, content, 'utf8');
    actions.push(`created ${relative(root, layoutPath)}`);
  }

  // content launchpad if missing
  const contentCandidates = ['content/blog', 'src/content', 'posts'];
  let hasContent = false;
  for (const c of contentCandidates) {
    if (await exists(join(root, c))) {
      hasContent = true;
      break;
    }
  }
  if (!hasContent) {
    await mkdir(join(root, 'content/blog'), { recursive: true });
    actions.push('created content/blog');
  }

  console.log('\nApplied:');
  actions.forEach((a) => console.log(`  • ${a}`));
  console.log(`\nBackups: ${relative(root, backupDir)}`);
  console.log(
    '\nInstall packages if missing:\n  pnpm add @acrolls/svelte @acrolls/styles @acrolls/mdsvex @acrolls/sveltekit\n  pnpm add -D @acrolls/cli mdsvex'
  );
  return 0;
}
