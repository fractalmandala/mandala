import { test, expect } from '@playwright/test';

// The app always boots into the workspace-template gallery overlay
// (.home-tiles-wrapper) — every test needs to dismiss it before anything else on
// the board is interactable. Picking "fractalCode" (.home-tiles-button.code) loads
// ClassicIdeLayout: a fixed-panel IDE (file explorer, editor, terminal, AI chat),
// which is the app's primary UI and what every other flow in this repo assumes —
// as opposed to the freeform tile/dock canvas (only reachable via the 'blank'
// template, which the gallery doesn't expose as a card), which the previous
// version of this suite incorrectly assumed was the default view.
async function dismissGalleryIntoCodeTemplate(page: import('@playwright/test').Page) {
	// .click() auto-waits for the element to appear (client-side hydration isn't instant) —
	// an upfront .count() check here would race the gallery's mount and silently skip the
	// click on a slow load, leaving the overlay open for the rest of the test.
	await page.locator('.home-tiles-button.code').click();
}

test.describe('FractalEngine IDE UI Verification', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('loads the code workspace with explorer, editor, and AI panel', async ({ page }) => {
		await dismissGalleryIntoCodeTemplate(page);

		// File explorer sidebar
		await expect(page.locator('.sidebar-carrier').first()).toBeVisible();

		// Editor tab bar with at least one open file
		await expect(page.locator('.editor-tab').first()).toBeVisible();
		await expect(page.locator('.cm-content')).toBeVisible();

		// AI Copilot panel
		await expect(page.getByPlaceholder('Ask Copilot...')).toBeVisible();

		// Settings button in the footer
		await expect(page.locator('[title="Open Settings (Cmd+,)"]')).toBeVisible();
	});

	test('switching directly between modules uses the workspace view transition', async ({ page }) => {
		await page.addInitScript(() => {
			let calls = 0;
			Object.defineProperty(document, 'startViewTransition', {
				configurable: true,
				value: (update: () => void) => {
					calls += 1;
					update();
					return {
						finished: Promise.resolve(),
						ready: Promise.resolve(),
						updateCallbackDone: Promise.resolve(),
						skipTransition: () => {},
						types: new Set()
					};
				}
			});
			Object.defineProperty(window, '__moduleTransitionCalls', {
				configurable: true,
				get: () => calls
			});
		});
		await page.goto('/');
		await dismissGalleryIntoCodeTemplate(page);
		await page.getByTitle('Open App Switcher').click();
		await page.locator('.dock-button.dock-2').click();
		await expect(page.getByRole('button', { name: 'Open Vault', exact: true })).toBeVisible();
		expect(await page.evaluate(() => (window as Window & { __moduleTransitionCalls?: number }).__moduleTransitionCalls)).toBe(1);
		await expect(page.locator('html')).not.toHaveClass(/module-wipe-transition/);
	});

	test('can open a file from the explorer into the editor', async ({ page }) => {
		await dismissGalleryIntoCodeTemplate(page);
		// Workspace initialization opens README.md asynchronously. Wait for that default
		// selection before interacting so this test exercises file switching, not startup.
		await expect(page.locator('.editor-file-tab.is-active')).toContainText('README.md');

		const fileItem = page.locator('.tree-file-btn').first();
		await expect(fileItem).toBeVisible();
		const filename = (await fileItem.innerText()).trim();
		await fileItem.click();

		// The editor tab bar now shows the opened file name, and CodeMirror renders it.
		await expect(page.locator('.editor-file-tab.is-active')).toContainText(filename);
		await expect(page.locator('.cm-content')).toBeVisible();
	});

	test('chat prompt area elements and model selector do not spill in the AI panel', async ({ page }) => {
		await dismissGalleryIntoCodeTemplate(page);

		const chatTextarea = page.getByPlaceholder('Ask Copilot...');
		await expect(chatTextarea).toBeVisible();
		await chatTextarea.fill('Hello Playwright Test!');

		const modelTrigger = page.locator('.ai-model-trigger');
		await expect(modelTrigger).toBeVisible();

		// Measure layout widths to verify no overflow / spill occurs
		const container = page.locator('.prompt-textarea-wrapper');
		const containerBox = await container.boundingBox();
		const triggerBox = await modelTrigger.boundingBox();

		if (containerBox && triggerBox) {
			expect(triggerBox.x + triggerBox.width).toBeLessThanOrEqual(containerBox.x + containerBox.width + 1);
		}

		// A fresh workspace must not resurrect the retired seeded provider catalog.
		// Models appear only after the user explicitly configures or discovers them.
		await modelTrigger.click();
		await expect(page.locator('.ai-model-item')).toHaveCount(0);
		await expect(page.getByText('No models match.')).toBeVisible();
	});

	test('settings dialog opens and closes without layout issues', async ({ page }) => {
		const settingsBtn = page.locator('[title="Open Settings (Cmd+,)"]');
		await expect(settingsBtn).toBeVisible();
		await settingsBtn.click();

		// Check settings modal overlay and window are visible
		await expect(page.locator('.settings-overlay')).toBeVisible();
		await expect(page.locator('.settings-dialog')).toBeVisible();

		// Click AI Models tab
		const providerTab = page.locator('.settings-sidebar button:has-text("AI Models")');
		await expect(providerTab).toBeVisible();
		await providerTab.click();

		// Close Settings Dialog
		const cancelBtn = page.locator('.settings-footer button:has-text("Cancel")');
		await expect(cancelBtn).toBeVisible();
		await cancelBtn.click();

		// Ensure overlay is gone
		await expect(page.locator('.settings-overlay')).not.toBeVisible();
	});
});
