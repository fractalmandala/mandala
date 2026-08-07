import fs from 'fs';
import path from 'path';

const TARGET_AREAS = [
  'designer',
  'browser',
  'notes',
  'ide',
  'ai',
  'annotations',
  'bookmarks',
  'kernel',
  'undo-system',
  'contributions',
  'ipc-and-data-layer',
  'shell-and-routes',
  'security-boundaries',
  'styling-system',
  'fractaldocs',
  'media',
  'dev',
  'newdesign'
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

function assignArea(filePath) {
  const p = filePath.replace(/\\/g, '/');
  
  if (p.includes('.DS_Store') || p.includes('tsconfig.json')) return null;

  if (p.includes('src/lib/modules/designer/')) return 'designer';
  if (p.includes('src/lib/modules/browser/')) return 'browser';
  if (p.includes('src/lib/modules/notes/')) return 'notes';
  if (p.includes('src/lib/modules/ide/')) return 'ide';
  if (p.includes('src/lib/modules/ai/')) return 'ai';
  if (p.includes('src/lib/modules/annotations/')) return 'annotations';
  if (p.includes('src/lib/modules/bookmarks/')) return 'bookmarks';
  if (p.includes('src/lib/modules/fractaldocs/')) return 'fractaldocs';
  if (p.includes('src/lib/modules/media/')) return 'media';
  if (p.includes('src/lib/modules/dev/')) return 'dev';
  if (p.includes('src/lib/modules/newdesign/')) return 'newdesign';
  
  if (p === 'src/lib/components/AIChat.svelte' || 
      p.includes('src/lib/components/ai-elements/') || 
      p === 'src/lib/components/PromptInput.svelte') {
    return 'ai';
  }
  
  if (p === 'src/lib/state/ide.svelte.ts' || 
      p === 'src/lib/state/browser.svelte.ts' || 
      p === 'src/lib/state/settings.svelte.ts' ||
      p === 'src/lib/data/aiProviders.ts') {
    return 'kernel';
  }
  
  if (p === 'src/lib/state/undoHistory.svelte.ts' || 
      p === 'src/lib/state/undo.svelte.ts' || 
      p === 'src/lib/state/historyClock.ts') {
    return 'undo-system';
  }
  
  if (p === 'src/lib/state/contributions.svelte.ts' || 
      p === 'src/lib/state/coreContributions.ts') {
    return 'contributions';
  }
  
  if (p === 'src/lib/ipc.ts' || 
      p === 'src/lib/ipc-mock.ts') {
    return 'ipc-and-data-layer';
  }
  
  if (p === 'src/lib/sanitizeHtml.ts' || 
      p === 'src/lib/pathValidation.ts') {
    return 'security-boundaries';
  }
  
  if (p.startsWith('src/lib/styles/')) {
    return 'styling-system';
  }
  
  if (p === 'src/lib/editorTheme.ts') return 'ide';
  if (p === 'src/lib/errors.ts') return 'kernel';
  if (p === 'src/lib/totp.ts') return 'kernel';
  if (p === 'src/lib/state/ai.svelte.ts') return 'ai';
  if (p === 'src/lib/state/modelRegistry.svelte.ts') return 'ai';
  if (p === 'src/lib/state/modelRegistry.contract.ts') return 'ai';
  
  if (p.startsWith('src/routes/') || 
      p === 'src/lib/state/app.svelte.ts' ||
      p === 'src/lib/state/shell.svelte.ts' ||
      p === 'src/lib/state/canvas.svelte.ts' ||
      p.startsWith('src/lib/components/') || 
      p.startsWith('src/lib/data/') || 
      p.startsWith('src/lib/actions/')) {
    return 'shell-and-routes';
  }
  
  if (p.startsWith('src-tauri/src/')) {
    if (p.includes('src/browser/')) return 'browser';
    if (p.includes('storage.rs') || p.includes('memory.rs') || p.includes('annotations.rs') || p.includes('crypto.rs') || p.includes('main.rs') || p.includes('lib.rs') || p.includes('docs_index.rs')) {
      return 'ipc-and-data-layer';
    }
  }
  
  if (p.startsWith('tests/')) {
	if (p.includes('browser-')) return 'browser';
    if (p.includes('design.spec.ts')) return 'designer';
    if (p.includes('ide.spec.ts')) return 'ide';
    if (p.includes('bookmarks.spec.ts')) return 'bookmarks';
    if (p.includes('bookmarks-state.test.ts')) return 'bookmarks';
    if (p.includes('style-contracts.test.ts')) return 'styling-system';
    if (p.includes('ipc-contract.test.ts')) return 'ipc-and-data-layer';
    if (p.includes('data-layer-mock.test.ts')) return 'ipc-and-data-layer';
    if (p.includes('ipc-credential-history.test.ts')) return 'ipc-and-data-layer';
    if (p.includes('setup.ts')) return 'kernel';
    if (p.includes('security-config.test.ts')) return 'security-boundaries';
    if (p.includes('frontmatter.test.ts')) return 'security-boundaries';
    if (p.includes('codegen-sanitizer.test.ts')) return 'security-boundaries';
    if (p.includes('pathValidation.test.ts')) return 'security-boundaries';
    if (p.includes('html-boundary.test.ts')) return 'security-boundaries';
    if (p.includes('contribution-contracts.test.ts')) return 'contributions';
    if (p.includes('undo-history.test.ts')) return 'undo-system';
    if (p.includes('ai-workspace.test.ts')) return 'ai';
	if (p.includes('fractaldocs-state.test.ts')) return 'fractaldocs';
  }
  
  return null;
}

function getOneLiner(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      const line = lines[i].trim();
      if (!line) continue;
      // Match // comment
      let m = line.match(/^\/\/\s*(.*)$/);
      if (m) return m[1].trim();
      // Match /* comment */
      m = line.match(/^\/\*\s*(.*?)\s*\*\/$/);
      if (m) return m[1].trim();
      // Match <!-- comment -->
      m = line.match(/^<!--\s*(.*?)\s*-->$/);
      if (m) return m[1].trim();
      // For Rust, doc comments: /// or //!
      m = line.match(/^\/\/\/\s*(.*)$/) || line.match(/^\/\/!\s*(.*)$/);
      if (m) return m[1].trim();
    }
  } catch (e) {
    // Ignore read errors
  }
  return path.basename(filePath);
}

function main() {
  const dirsToWalk = ['src/lib', 'src/routes', 'src-tauri/src', 'tests'];
  let allFiles = [];
  dirsToWalk.forEach(dir => {
    if (fs.existsSync(dir)) {
      allFiles = allFiles.concat(walk(dir));
    }
  });

  const areaFiles = {};
  TARGET_AREAS.forEach(area => {
    areaFiles[area] = [];
  });

  allFiles.forEach(file => {
    const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');
    const area = assignArea(relativePath);
    if (area === null) {
      // Excluded file (like .DS_Store)
      return;
    }
    if (!TARGET_AREAS.includes(area)) {
      console.error(`Error: Path '${relativePath}' mapped to invalid area '${area}'`);
      process.exit(1);
    }
    areaFiles[area].push({
      path: relativePath,
      oneLiner: getOneLiner(file)
    });
  });

  // Verify and write to area docs
  TARGET_AREAS.forEach(area => {
    const docPath = `docs/areas/${area}.md`;
    if (!fs.existsSync(docPath)) {
      console.error(`Error: Doc file for area '${area}' not found at '${docPath}'`);
      process.exit(1);
    }

    let docContent = fs.readFileSync(docPath, 'utf8');
    const beginMarker = '<!-- filetable:begin -->';
    const endMarker = '<!-- filetable:end -->';

    const beginIdx = docContent.indexOf(beginMarker);
    const endIdx = docContent.indexOf(endMarker);

    if (beginIdx === -1 || endIdx === -1 || beginIdx >= endIdx) {
      console.error(`Error: filetable markers missing or invalid in '${docPath}'`);
      process.exit(1);
    }

    // Sort files alphabetically
    const files = areaFiles[area].sort((a, b) => a.path.localeCompare(b.path));

    let tableContent = '\n| File | Description |\n|---|---|\n';
    files.forEach(f => {
      // Escape pipe chars in description
      const desc = f.oneLiner.replace(/\|/g, '\\|');
      tableContent += `| [\`${path.basename(f.path)}\`](file:///${path.resolve(f.path)}) | ${desc} |\n`;
    });
    tableContent += '\n';

    const newContent = docContent.substring(0, beginIdx + beginMarker.length) +
                       tableContent +
                       docContent.substring(endIdx);

    fs.writeFileSync(docPath, newContent, 'utf8');
    console.log(`Updated ${docPath} with ${files.length} files.`);
  });

  console.log('File table generation completed successfully.');
}

main();
