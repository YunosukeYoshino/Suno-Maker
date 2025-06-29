import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  // ページ要素のセレクタ
  private readonly promptButton: Locator;
  private readonly lyricsButton: Locator;
  private readonly complianceButton: Locator;
  private readonly successExamplesButton: Locator;
  private readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.promptButton = page
      .locator('[data-testid="prompt-button"]')
      .or(page.getByRole("button", { name: /プロンプト/i }));
    this.lyricsButton = page
      .locator('[data-testid="lyrics-button"]')
      .or(page.getByRole("button", { name: /歌詞/i }));
    this.complianceButton = page
      .locator('[data-testid="compliance-button"]')
      .or(page.getByRole("button", { name: /コンプライアンス/i }));
    this.successExamplesButton = page
      .locator('[data-testid="success-examples-button"]')
      .or(page.getByRole("button", { name: /成功事例/i }));
    this.pageTitle = page.locator("h1");
  }

  /**
   * ホームページに移動
   */
  async navigate(): Promise<void> {
    await this.goto("/");
  }

  /**
   * プロンプト作成ボタンをクリック
   */
  async clickPromptButton(): Promise<void> {
    await this.click(this.promptButton);
  }

  /**
   * 歌詞作成ボタンをクリック
   */
  async clickLyricsButton(): Promise<void> {
    await this.click(this.lyricsButton);
  }

  /**
   * コンプライアンスチェックボタンをクリック
   */
  async clickComplianceButton(): Promise<void> {
    await this.click(this.complianceButton);
  }

  /**
   * 成功事例ライブラリボタンをクリック
   */
  async clickSuccessExamplesButton(): Promise<void> {
    await this.click(this.successExamplesButton);
  }

  /**
   * ページタイトルを取得
   */
  async getPageTitle(): Promise<string> {
    return await this.getText(this.pageTitle);
  }

  /**
   * 各ボタンが表示されているかチェック
   */
  async areButtonsVisible(): Promise<{
    prompt: boolean;
    lyrics: boolean;
    compliance: boolean;
    successExamples: boolean;
  }> {
    return {
      prompt: await this.isVisible(this.promptButton),
      lyrics: await this.isVisible(this.lyricsButton),
      compliance: await this.isVisible(this.complianceButton),
      successExamples: await this.isVisible(this.successExamplesButton),
    };
  }
}
