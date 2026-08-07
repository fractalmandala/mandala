import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// The wiki content lives in the monorepo at `repowiki/` (two levels up from
// this app). It is reached through the `src/content` symlink so Vite glob
// patterns stay inside the project root; `server.fs.allow` lets the dev
// server serve and watch the real directory behind the symlink.
const wikiRoot = fileURLToPath(new URL('../../repowiki', import.meta.url));

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			allow: [wikiRoot]
		}
	}
});
