import { rmSync } from 'node:fs';
import { basename, isAbsolute, resolve, sep } from 'node:path';

const projectRoot = process.cwd();
const configured = process.env.FRACTALENGINE_BUILD_OUT_DIR || '.svelte-kit';
const generatedRoot = resolve(projectRoot, configured);
const relativeRoot = generatedRoot.slice(projectRoot.length + 1);

if (isAbsolute(configured) || !generatedRoot.startsWith(projectRoot + sep) || relativeRoot.includes(sep)
	|| !basename(generatedRoot).startsWith('.svelte-kit')) {
	throw new Error(`Refusing to clean an unsafe SvelteKit output path: ${configured}`);
}

rmSync(resolve(generatedRoot, 'output'), {
	recursive: true,
	force: true,
	maxRetries: 20,
	retryDelay: 100,
});

// Finder can leave a .DS_Store in the static adapter destination. Removing the
// destination immediately before Vite starts prevents adapter-static's own
// cleanup from failing with ENOTEMPTY when that metadata is present.
rmSync(resolve(projectRoot, 'build'), {
	recursive: true,
	force: true,
	maxRetries: 20,
	retryDelay: 100,
});
