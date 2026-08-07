import { expect, test } from '@playwright/test';

async function openDesign(page: import('@playwright/test').Page) {
	await page.goto('/');
	const galleryCard = page.locator('.home-tiles-button.design');
	await galleryCard.click();
	await expect(page.locator('.design-viewport')).toBeVisible();
}

test.describe('FractalDesign interaction regression', () => {
	test.beforeEach(async ({ page }) => {
		await openDesign(page);
	});

	test('loads a valid layer tree and uses a single right-rail header', async ({ page }) => {
		await expect(page.locator('.layer-row')).not.toHaveCount(0);
		await expect(page.locator('.design-block')).not.toHaveCount(0);
		const expandRightRail = page.getByRole('button', { name: 'Toggle design right sidebar', exact: true });
		if (await expandRightRail.isVisible()) await expandRightRail.click();
		await page.getByRole('tab', { name: 'AI', exact: true }).click();
		const rightRail = page.locator('.module-sidebar').last();
		await expect(rightRail.getByPlaceholder('Ask Copilot...')).toBeVisible();
		// One header only: the rail's own tablist. The embedded chat renders headerless.
		await expect(rightRail.locator('.sidebar-header')).toHaveCount(1);
		await expect(rightRail.locator('.sidebar-content-box .sidebar-header')).toHaveCount(0);
	});

	test('canvas context menu actions work and outside pointer dismisses it', async ({ page }) => {
		const block = page.locator('.design-block').first();
		await block.click({ button: 'right', position: { x: 12, y: 12 } });
		await expect(page.locator('.layer-context-menu')).toBeVisible();
		await page.getByRole('button', { name: 'Copy', exact: true }).click();
		await expect(page.locator('.layer-context-menu')).toHaveCount(0);

		await block.click({ button: 'right', position: { x: 12, y: 12 } });
		await page.locator('.layer-context-backdrop').click({ position: { x: 2, y: 2 } });
		await expect(page.locator('.layer-context-menu')).toHaveCount(0);
	});

	test('canvas objects drag and text stays read-only until editing', async ({ page }) => {
		const text = page.locator('.design-block-text').first();
		await expect(text).toHaveAttribute('contenteditable', 'false');
		const block = page.locator('.design-block').first();
		const before = await block.boundingBox();
		expect(before).not.toBeNull();
		await page.mouse.move(before!.x + 10, before!.y + before!.height - 20);
		await page.mouse.down();
		await page.mouse.move(before!.x + 82, before!.y + before!.height + 28, { steps: 8 });
		await page.mouse.up();
		const after = await block.boundingBox();
		expect(after).not.toBeNull();
		expect(Math.abs(after!.x - before!.x) + Math.abs(after!.y - before!.y)).toBeGreaterThan(10);

		await page.keyboard.press('Control+z');
		const undone = await block.boundingBox();
		expect(undone).not.toBeNull();
		expect(Math.abs(undone!.x - before!.x) + Math.abs(undone!.y - before!.y)).toBeLessThan(2);

		await text.dblclick();
		await expect(text).toHaveAttribute('contenteditable', 'true');
		await page.keyboard.press('Escape');
		await expect(text).toHaveAttribute('contenteditable', 'false');
	});

	test('library templates and primitives create blocks when pointer-dropped onto the viewport', async ({ page }) => {
		await page.getByRole('tab', { name: 'Components Components', exact: true }).click();
		const before = await page.locator('.design-block').count();
		const card = page.locator('.library-card').first();
		const viewport = page.locator('.design-viewport');
		const cardBox = await card.boundingBox();
		const viewportBox = await viewport.boundingBox();
		expect(cardBox).not.toBeNull();
		expect(viewportBox).not.toBeNull();
		await page.mouse.move(cardBox!.x + cardBox!.width / 2, cardBox!.y + cardBox!.height / 2);
		await page.mouse.down();
		await page.mouse.move(viewportBox!.x + 300, viewportBox!.y + 300, { steps: 8 });
		await page.mouse.up();
		await expect(page.locator('.design-block')).not.toHaveCount(before);

		await page.getByRole('button', { name: /PRIMITIVES/ }).click();
		const primitive = page.locator('.library-card').first();
		const primitiveBox = await primitive.boundingBox();
		expect(primitiveBox).not.toBeNull();
		const afterTemplate = await page.locator('.design-block').count();
		await page.mouse.move(primitiveBox!.x + primitiveBox!.width / 2, primitiveBox!.y + primitiveBox!.height / 2);
		await page.mouse.down();
		await page.mouse.move(viewportBox!.x + 420, viewportBox!.y + 300, { steps: 8 });
		await page.mouse.up();
		await expect(page.locator('.design-block')).toHaveCount(afterTemplate + 1);
	});

	test('resize handles update selected object geometry', async ({ page }) => {
		await page.locator('.layer-row').first().click();
		const selected = page.locator('.canvas-world > .design-block.selected');
		const before = await selected.boundingBox();
		const handle = selected.locator('.resize-handle.handle-e');
		const handleBox = await handle.boundingBox();
		expect(before).not.toBeNull();
		expect(handleBox).not.toBeNull();
		await page.mouse.move(handleBox!.x + 1, handleBox!.y + handleBox!.height / 2);
		await page.mouse.down();
		await page.mouse.move(handleBox!.x + 45, handleBox!.y + handleBox!.height / 2, { steps: 5 });
		await page.mouse.up();
		const after = await selected.boundingBox();
		expect(after!.width).toBeGreaterThan(before!.width + 10);
	});

	test('does not nest editable controls inside buttons', async ({ page }) => {
		await expect(page.locator('button input, button textarea, button select')).toHaveCount(0);
	});

	test('inspector editing controls expose accessible names', async ({ page }) => {
		const expandRightRail = page.getByRole('button', { name: 'Toggle design right sidebar', exact: true });
		if (await expandRightRail.isVisible()) await expandRightRail.click();
		await page.locator('.layer-row').first().click();
		await expect(page.getByRole('textbox', { name: 'Layer name' })).toBeVisible();
		await expect(page.getByRole('combobox', { name: 'Layer type' })).toBeVisible();
		await expect(page.getByRole('spinbutton', { name: 'Layer width in pixels' })).toBeVisible();
		await expect(page.getByRole('spinbutton', { name: 'Layer height in pixels' })).toBeVisible();
	});

	test('starter template text uses its authored foreground color', async ({ page }) => {
		const welcomeText = page.getByText('Welcome Back!', { exact: true });
		await expect(welcomeText).toHaveCSS('color', 'rgb(0, 102, 255)');
	});

	test('template images load and panel separators are keyboard adjustable and undoable', async ({ page }) => {
		const image = page.locator('.design-block-image');
		await expect(image).toHaveCount(1);
		await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0);
		const separator = page.getByRole('separator', { name: 'Resize sidebar' });
		const before = Number(await separator.getAttribute('aria-valuenow'));
		await separator.focus();
		await separator.press('ArrowRight');
		await expect(separator).toHaveAttribute('aria-valuenow', String(before + 8));
		const block = page.locator('.design-block').first();
		const blockBefore = await block.boundingBox();
		expect(blockBefore).not.toBeNull();
		await page.mouse.move(blockBefore!.x + 10, blockBefore!.y + 10);
		await page.mouse.down();
		await page.mouse.move(blockBefore!.x + 50, blockBefore!.y + 35, { steps: 5 });
		await page.mouse.up();
		await page.keyboard.press('Control+z');
		const blockUndone = await block.boundingBox();
		expect(blockUndone).not.toBeNull();
		expect(Math.abs(blockUndone!.x - blockBefore!.x) + Math.abs(blockUndone!.y - blockBefore!.y)).toBeLessThan(2);
		await expect(separator).toHaveAttribute('aria-valuenow', String(before + 8));
		await page.keyboard.press('Control+z');
		await expect(separator).toHaveAttribute('aria-valuenow', String(before));
	});
});

test('application dock opens FractalDesign from another template', async ({ page }) => {
	await page.goto('/');
	await page.locator('.home-tiles-button.code').click();
	await page.keyboard.press('Meta+Space');
	await expect(page.locator('.appdock')).toHaveClass(/is-active/);
	await page.locator('.dock-button.dock-3').click();
	await expect(page.locator('.design-viewport')).toBeVisible();
});
