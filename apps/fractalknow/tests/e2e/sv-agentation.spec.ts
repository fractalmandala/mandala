import { test, expect, type Page, type Locator } from "@playwright/test";

export class AgentationPage {
  readonly page: Page;
  readonly toolbar: Locator;
  readonly captureBtn: Locator;
  readonly layoutBtn: Locator;
  readonly copyBtn: Locator;
  readonly settingsBtn: Locator;
  readonly clearBtn: Locator;
  readonly popup: Locator;
  readonly textarea: Locator;
  readonly saveBtn: Locator;
  readonly marker: Locator;
  readonly palette: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toolbar = page.locator('[data-sv-agentation-toolbar="true"]');
    this.captureBtn = page.locator('[data-testid="toolbar-capture-btn"]');
    this.layoutBtn = page.locator('[data-testid="toolbar-layout-btn"]');
    this.copyBtn = page.locator('[data-testid="toolbar-copy-btn"]');
    this.settingsBtn = page.locator('[data-testid="toolbar-settings-btn"]');
    this.clearBtn = page.locator('[data-testid="toolbar-clear-btn"]');
    this.popup = page.locator('.annotationPopupCSS');
    this.textarea = page.locator('.annotationPopupCSS textarea');
    this.saveBtn = page.locator('.annotationPopupCSS .saveBtn');
    this.marker = page.locator('.annotationMarker');
    this.palette = page.locator('.sv-palette-container');
  }

  async goto() {
    await this.page.goto("http://127.0.0.1:5174/", { waitUntil: "networkidle" });
  }

  async enableCapture() {
    await this.captureBtn.click();
  }

  async enableLayoutMode() {
    await this.layoutBtn.click();
  }

  async addAnnotation(comment: string) {
    await this.enableCapture();
    await this.page.mouse.click(300, 300);
    await this.textarea.waitFor({ state: "visible" });
    await this.textarea.fill(comment);
    await this.saveBtn.click();
  }
}

test.describe("sv-agentation E2E Suite", () => {
  let agentationPage: AgentationPage;

  test.beforeEach(async ({ page }) => {
    agentationPage = new AgentationPage(page);
    await agentationPage.goto();
  });

  test("1. Floating Toolbar Visibility", async ({ page }) => {
    await expect(agentationPage.toolbar).toBeVisible();
    await page.screenshot({ path: "artifacts/e2e/01-toolbar-visible.png" });
  });

  test("2. Interactive Capture & Marker Placement", async ({ page }) => {
    await agentationPage.addAnnotation("E2E Test Feedback: Fix margin spacing on main heading");
    await expect(agentationPage.marker.first()).toBeVisible();
    await page.screenshot({ path: "artifacts/e2e/02-annotation-marker-created.png" });
  });

  test("3. Layout / Design Mode Palette Rendering", async ({ page }) => {
    await agentationPage.enableLayoutMode();
    await expect(agentationPage.palette).toBeVisible();
    await page.screenshot({ path: "artifacts/e2e/03-design-mode-palette.png" });
  });

  test("4. Settings Modal Toggle", async ({ page }) => {
    await agentationPage.settingsBtn.click();
    await expect(page.locator(".settingsPanelModal")).toBeVisible();
    await page.screenshot({ path: "artifacts/e2e/04-settings-modal.png" });
  });

  test("5. Copy & Clear Workflow", async ({ page }) => {
    await agentationPage.addAnnotation("Test comment to clear");
    await expect(agentationPage.marker.first()).toBeVisible();
    await agentationPage.clearBtn.click();
    await expect(agentationPage.marker).toHaveCount(0);
    await page.screenshot({ path: "artifacts/e2e/05-cleared-annotations.png" });
  });
});
