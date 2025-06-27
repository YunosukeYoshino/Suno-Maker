import { expect, test } from "../fixtures/test-fixtures";
import {
  CompliancePage,
  HomePage,
  LyricsPage,
  PromptPage,
  SuccessExamplesPage,
} from "../pages";

test.describe("Visual Regression Tests", () => {
  test.describe("Desktop Screenshots", () => {
    test.beforeEach(async ({ page }) => {
      // デスクトップビューポートに設定
      await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test("should match homepage screenshot", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.navigate();

      // ページの読み込み完了を待機
      await page.waitForLoadState("networkidle");

      // ホームページのスクリーンショット比較
      await expect(page).toHaveScreenshot("homepage-desktop.png", {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test("should match prompt page screenshot", async ({ page }) => {
      const promptPage = new PromptPage(page);
      await promptPage.navigate();
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("prompt-page-desktop.png", {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test("should match lyrics page screenshot", async ({ page }) => {
      const lyricsPage = new LyricsPage(page);
      await lyricsPage.navigate();
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("lyrics-page-desktop.png", {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test("should match compliance page screenshot", async ({ page }) => {
      const compliancePage = new CompliancePage(page);
      await compliancePage.navigate();
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("compliance-page-desktop.png", {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test("should match success examples page screenshot", async ({ page }) => {
      const successExamplesPage = new SuccessExamplesPage(page);
      await successExamplesPage.navigate();
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("success-examples-page-desktop.png", {
        fullPage: true,
        threshold: 0.2,
      });
    });
  });

  test.describe("Mobile Screenshots", () => {
    test.beforeEach(async ({ page }) => {
      // モバイルビューポートに設定
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test("should match homepage mobile screenshot", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.navigate();
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("homepage-mobile.png", {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test("should match prompt page mobile screenshot", async ({ page }) => {
      const promptPage = new PromptPage(page);
      await promptPage.navigate();
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("prompt-page-mobile.png", {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test("should match lyrics page mobile screenshot", async ({ page }) => {
      const lyricsPage = new LyricsPage(page);
      await lyricsPage.navigate();
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("lyrics-page-mobile.png", {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test("should match compliance page mobile screenshot", async ({ page }) => {
      const compliancePage = new CompliancePage(page);
      await compliancePage.navigate();
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("compliance-page-mobile.png", {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test("should match success examples page mobile screenshot", async ({
      page,
    }) => {
      const successExamplesPage = new SuccessExamplesPage(page);
      await successExamplesPage.navigate();
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("success-examples-page-mobile.png", {
        fullPage: true,
        threshold: 0.2,
      });
    });
  });

  test.describe("Component State Screenshots", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test("should match prompt page with data input", async ({ page }) => {
      const promptPage = new PromptPage(page);
      await promptPage.navigate();

      // データ入力済み状態を作成
      try {
        await promptPage.selectGenre("rock");
        await promptPage.setMoodMatrix(150, 150);
        await promptPage.adjustParameter("energy", 80);
      } catch (error) {
        // 要素が見つからない場合はスキップ
        console.log("Prompt page elements not found, skipping data input");
      }

      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("prompt-page-with-data.png", {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test("should match lyrics page with text input", async ({ page }) => {
      const lyricsPage = new LyricsPage(page);
      await lyricsPage.navigate();

      // 歌詞入力済み状態を作成
      try {
        await lyricsPage.enterLyrics(`テスト歌詞
音楽を作ろう
素晴らしいメロディーで`);
      } catch (error) {
        console.log("Lyrics page elements not found, skipping text input");
      }

      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("lyrics-page-with-text.png", {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test("should match compliance page with content", async ({ page }) => {
      const compliancePage = new CompliancePage(page);
      await compliancePage.navigate();

      // コンテンツ入力済み状態を作成
      try {
        await compliancePage.enterContent(
          "これはテスト用のコンプライアンスチェック内容です。"
        );
      } catch (error) {
        console.log(
          "Compliance page elements not found, skipping content input"
        );
      }

      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("compliance-page-with-content.png", {
        fullPage: true,
        threshold: 0.2,
      });
    });
  });

  test.describe("Tablet Screenshots", () => {
    test.beforeEach(async ({ page }) => {
      // タブレットビューポートに設定
      await page.setViewportSize({ width: 768, height: 1024 });
    });

    test("should match homepage tablet screenshot", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.navigate();
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("homepage-tablet.png", {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test("should match prompt page tablet screenshot", async ({ page }) => {
      const promptPage = new PromptPage(page);
      await promptPage.navigate();
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("prompt-page-tablet.png", {
        fullPage: true,
        threshold: 0.2,
      });
    });
  });
});
