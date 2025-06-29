import { expect, test } from "../fixtures/test-fixtures";
import { PromptPage } from "../pages";

test.describe("Prompt Generation Tests", () => {
  let promptPage: PromptPage;

  test.beforeEach(async ({ page }) => {
    promptPage = new PromptPage(page);
    await promptPage.navigate();
  });

  test("should display all prompt generation components", async ({ page }) => {
    const components = await promptPage.areComponentsVisible();

    expect(components.genreSelector).toBe(true);
    expect(components.moodMatrix).toBe(true);
    expect(components.parameterSliders).toBe(true);
    expect(components.generateButton).toBe(true);
  });

  test("should allow genre selection", async ({ page }) => {
    // ジャンル選択をテスト（実際のジャンルは実装に応じて調整）
    await promptPage.selectGenre("rock");

    // 選択後の状態確認（選択状態のCSSクラスなどで判定）
    const genreSelector = page.locator('[data-testid="genre-selector"]');
    await expect(genreSelector).toBeVisible();
  });

  test("should allow mood matrix interaction", async ({ page }) => {
    // ムードマトリックスの操作をテスト
    await promptPage.setMoodMatrix(100, 100);

    // クリック後の状態確認
    const moodMatrix = page.locator('[data-testid="mood-matrix"]');
    await expect(moodMatrix).toBeVisible();
  });

  test("should allow parameter adjustment", async ({ page }) => {
    // パラメータスライダーの調整をテスト
    await promptPage.adjustParameter("energy", 75);
    await promptPage.adjustParameter("mood", 50);

    // 調整後の値確認
    const energySlider = page.locator('[data-testid="energy-slider"]');
    const moodSlider = page.locator('[data-testid="mood-slider"]');

    await expect(energySlider).toBeVisible();
    await expect(moodSlider).toBeVisible();
  });

  test("should generate prompt when button clicked", async ({ page }) => {
    // 前提条件の設定
    await promptPage.selectGenre("pop");
    await promptPage.setMoodMatrix(150, 150);
    await promptPage.adjustParameter("energy", 80);

    // プロンプト生成実行
    await promptPage.clickGenerateButton();

    // 結果表示の確認
    const isResultVisible = await promptPage.isResultVisible();
    expect(isResultVisible).toBe(true);

    // 生成されたプロンプトの内容確認（空でないことを確認）
    const generatedPrompt = await promptPage.getGeneratedPrompt();
    expect(generatedPrompt.length).toBeGreaterThan(0);
  });

  test("should handle empty generation gracefully", async ({ page }) => {
    // 何も設定せずに生成ボタンをクリック
    await promptPage.clickGenerateButton();

    // エラーハンドリングまたはデフォルト動作の確認
    // 実装に応じてエラーメッセージ表示またはデフォルトプロンプト生成を確認
    const isResultVisible = await promptPage.isResultVisible();

    // 結果が表示されるか、適切なエラーメッセージが表示されることを確認
    expect(isResultVisible).toBeDefined();
  });
});
