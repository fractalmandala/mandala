import { defineConfig, devices } from '@playwright/test';

/** Browser coverage deliberately targets the design surface: it is deterministic,
 * needs no Tauri filesystem bridge, and exercises both shipped color themes and
 * the compact dialog composition. */
export default defineConfig({
	testDir: './tests/visual',
	timeout: 30_000,
	use: {
		baseURL: 'http://localhost:4174',
		colorScheme: 'light',
		locale: 'en-US'
	},
	webServer: {
		command: 'pnpm exec vite dev --host localhost --port 4174',
		url: 'http://localhost:4174/design',
		reuseExistingServer: !process.env.CI,
		timeout: 60_000
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
