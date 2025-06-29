import { expect, test } from "../fixtures/test-fixtures";
import {
  CompliancePage,
  HomePage,
  LyricsPage,
  PromptPage,
  SuccessExamplesPage,
} from "../pages";

test.describe("Navigation Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should navigate to all main pages from home", async ({ page }) => {
    const homePage = new HomePage(page);

    // ホームページの基本要素確認
    await expect(page).toHaveTitle(/suno-maker/i);

    const buttons = await homePage.areButtonsVisible();
    expect(buttons.prompt).toBe(true);
    expect(buttons.lyrics).toBe(true);
    expect(buttons.compliance).toBe(true);
    expect(buttons.successExamples).toBe(true);
  });

  test("should navigate to prompt page and back", async ({ page }) => {
    const homePage = new HomePage(page);
    const promptPage = new PromptPage(page);

    // プロンプトページへ移動
    await homePage.clickPromptButton();
    await expect(page).toHaveURL("/prompt");

    // プロンプトページの要素確認
    const components = await promptPage.areComponentsVisible();
    expect(components.genreSelector).toBe(true);
    expect(components.moodMatrix).toBe(true);
    expect(components.generateButton).toBe(true);

    // ホームに戻る
    await promptPage.clickBackButton();
    await expect(page).toHaveURL("/");
  });

  test("should navigate to lyrics page and back", async ({ page }) => {
    const homePage = new HomePage(page);
    const lyricsPage = new LyricsPage(page);

    // 歌詞ページへ移動
    await homePage.clickLyricsButton();
    await expect(page).toHaveURL("/lyrics");

    // 歌詞ページの要素確認
    const components = await lyricsPage.areComponentsVisible();
    expect(components.lyricsTextarea).toBe(true);
    expect(components.optimizeButton).toBe(true);

    // ホームに戻る
    await lyricsPage.clickBackButton();
    await expect(page).toHaveURL("/");
  });

  test("should navigate to compliance page and back", async ({ page }) => {
    const homePage = new HomePage(page);
    const compliancePage = new CompliancePage(page);

    // コンプライアンスページへ移動
    await homePage.clickComplianceButton();
    await expect(page).toHaveURL("/compliance");

    // コンプライアンスページの要素確認
    const components = await compliancePage.areComponentsVisible();
    expect(components.contentInput).toBe(true);
    expect(components.checkButton).toBe(true);

    // ホームに戻る
    await compliancePage.clickBackButton();
    await expect(page).toHaveURL("/");
  });

  test("should navigate to success examples page and back", async ({
    page,
  }) => {
    const homePage = new HomePage(page);
    const successExamplesPage = new SuccessExamplesPage(page);

    // 成功事例ページへ移動
    await homePage.clickSuccessExamplesButton();
    await expect(page).toHaveURL("/success-examples");

    // 成功事例ページの要素確認
    const components = await successExamplesPage.areComponentsVisible();
    expect(components.searchInput).toBe(true);
    expect(components.examplesList).toBe(true);

    // ホームに戻る
    await successExamplesPage.clickBackButton();
    await expect(page).toHaveURL("/");
  });
});
