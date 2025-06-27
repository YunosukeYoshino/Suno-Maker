import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class PromptPage extends BasePage {
  // ページ要素のセレクタ
  private readonly genreSelector: Locator;
  private readonly moodMatrix: Locator;
  private readonly parameterSliders: Locator;
  private readonly generateButton: Locator;
  private readonly resultArea: Locator;
  private readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.genreSelector = page.locator('[data-testid="genre-selector"]');
    this.moodMatrix = page.locator('[data-testid="mood-matrix"]');
    this.parameterSliders = page.locator('[data-testid="parameter-sliders"]');
    this.generateButton = page
      .locator('[data-testid="generate-button"]')
      .or(page.getByRole("button", { name: /生成/i }));
    this.resultArea = page.locator('[data-testid="result-area"]');
    this.backButton = page
      .locator('[data-testid="back-button"]')
      .or(page.getByRole("button", { name: /戻る/i }));
  }

  /**
   * プロンプトページに移動
   */
  async navigate(): Promise<void> {
    await this.goto("/prompt");
  }

  /**
   * ジャンルを選択
   */
  async selectGenre(genre: string): Promise<void> {
    const genreOption = this.genreSelector
      .locator(`[data-value="${genre}"]`)
      .or(this.page.getByText(genre));
    await this.click(genreOption);
  }

  /**
   * ムードマトリックスで値を設定
   */
  async setMoodMatrix(x: number, y: number): Promise<void> {
    await this.moodMatrix.click({ position: { x, y } });
  }

  /**
   * パラメータスライダーを調整
   */
  async adjustParameter(parameterName: string, value: number): Promise<void> {
    const slider = this.parameterSliders.locator(
      `[data-testid="${parameterName}-slider"]`
    );
    await slider.fill(value.toString());
  }

  /**
   * プロンプト生成ボタンをクリック
   */
  async clickGenerateButton(): Promise<void> {
    await this.click(this.generateButton);
  }

  /**
   * 戻るボタンをクリック
   */
  async clickBackButton(): Promise<void> {
    await this.click(this.backButton);
  }

  /**
   * 生成結果が表示されているかチェック
   */
  async isResultVisible(): Promise<boolean> {
    return await this.isVisible(this.resultArea);
  }

  /**
   * 生成されたプロンプトテキストを取得
   */
  async getGeneratedPrompt(): Promise<string> {
    await this.waitForElement('[data-testid="result-area"]');
    return await this.getText(this.resultArea);
  }

  /**
   * 主要コンポーネントが表示されているかチェック
   */
  async areComponentsVisible(): Promise<{
    genreSelector: boolean;
    moodMatrix: boolean;
    parameterSliders: boolean;
    generateButton: boolean;
  }> {
    return {
      genreSelector: await this.isVisible(this.genreSelector),
      moodMatrix: await this.isVisible(this.moodMatrix),
      parameterSliders: await this.isVisible(this.parameterSliders),
      generateButton: await this.isVisible(this.generateButton),
    };
  }
}
