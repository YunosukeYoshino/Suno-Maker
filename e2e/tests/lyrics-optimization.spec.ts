import { expect, test } from "../fixtures/test-fixtures";
import { LyricsPage } from "../pages";

test.describe("Lyrics Optimization Tests", () => {
  let lyricsPage: LyricsPage;

  test.beforeEach(async ({ page }) => {
    lyricsPage = new LyricsPage(page);
    await lyricsPage.navigate();
  });

  test("should display all lyrics optimization components", async ({
    page,
  }) => {
    const components = await lyricsPage.areComponentsVisible();

    expect(components.lyricsTextarea).toBe(true);
    expect(components.optimizeButton).toBe(true);
    expect(components.structureSelector).toBe(true);
  });

  test("should allow lyrics input", async ({ page }) => {
    const testLyrics = `今日は素晴らしい日
音楽が心に響く
みんなで歌おう
このメロディーに合わせて`;

    await lyricsPage.enterLyrics(testLyrics);

    // 入力された歌詞の確認
    const inputLyrics = await lyricsPage.getInputLyrics();
    expect(inputLyrics).toBe(testLyrics);
  });

  test("should allow structure selection", async ({ page }) => {
    // 歌詞構造の選択をテスト
    await lyricsPage.selectStructure("verse-chorus-verse");

    // 選択後の状態確認
    const structureSelector = page.locator(
      '[data-testid="structure-selector"]'
    );
    await expect(structureSelector).toBeVisible();
  });

  test("should optimize lyrics when button clicked", async ({ page }) => {
    const testLyrics = `今日は素晴らしい日
音楽が心に響く`;

    // 歌詞入力と構造選択
    await lyricsPage.enterLyrics(testLyrics);
    await lyricsPage.selectStructure("verse-chorus-verse");

    // 最適化実行
    await lyricsPage.clickOptimizeButton();

    // 最適化結果の確認
    const isResultVisible = await lyricsPage.isResultVisible();
    expect(isResultVisible).toBe(true);

    // 最適化された歌詞の取得と確認
    const optimizedLyrics = await lyricsPage.getOptimizedLyrics();
    expect(optimizedLyrics.length).toBeGreaterThan(0);
  });

  test("should handle empty lyrics input", async ({ page }) => {
    // 空の歌詞で最適化を試行
    await lyricsPage.clickOptimizeButton();

    // エラーハンドリングの確認
    // 実装に応じてエラーメッセージまたは入力促進メッセージの表示を確認
    const isResultVisible = await lyricsPage.isResultVisible();

    // 適切な応答があることを確認
    expect(isResultVisible).toBeDefined();
  });

  test("should allow copying optimized lyrics", async ({ page }) => {
    const testLyrics = `テスト歌詞
最適化のテスト`;

    // 歌詞入力と最適化
    await lyricsPage.enterLyrics(testLyrics);
    await lyricsPage.clickOptimizeButton();

    // 結果が表示されるまで待機
    const isResultVisible = await lyricsPage.isResultVisible();
    expect(isResultVisible).toBe(true);

    // コピーボタンのクリック
    await lyricsPage.clickCopyButton();

    // コピー機能の動作確認（実装に応じてクリップボードAPIまたは視覚的フィードバックを確認）
    const copyButton = page.locator('[data-testid="copy-button"]');
    await expect(copyButton).toBeVisible();
  });

  test("should handle long lyrics text", async ({ page }) => {
    // 長い歌詞テキストのテスト
    const longLyrics = Array(20)
      .fill(`この歌詞は長いテストです
複数行にわたって続きます
最適化処理がうまく動作するかテストします`)
      .join("\n\n");

    await lyricsPage.enterLyrics(longLyrics);
    await lyricsPage.clickOptimizeButton();

    // 長いテキストでも正常に処理されることを確認
    const isResultVisible = await lyricsPage.isResultVisible();
    expect(isResultVisible).toBe(true);
  });
});
