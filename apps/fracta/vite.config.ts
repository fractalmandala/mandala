import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		watch: {
			// Rust build output isn't source — watching it causes reload storms whenever
			// `cargo build`/`tauri dev` runs alongside `pnpm dev`.
			ignored: ['**/src-tauri/target/**', '**/build/**']
		}
	}
});
