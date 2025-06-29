import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LyricsPage extends BasePage {
  // ページ要素のセレクタ
  private readonly lyricsTextarea: Locator;
  private readonly optimizeButton: Locator;
  private readonly resultArea: Locator;
  private readonly copyButton: Locator;
  private readonly backButton: Locator;
  private readonly structureSelector: Locator;

  constructor(page: Page) {
    super(page);
    this.lyricsTextarea = page
      .locator('[data-testid="lyrics-textarea"]')
      .or(page.locator("textarea"));
    this.optimizeButton = page
      .locator('[data-testid="optimize-button"]')
      .or(page.getByRole("button", { name: /最適化/i }));
    this.resultArea = page.locator('[data-testid="lyrics-result"]');
    this.copyButton = page
      .locator('[data-testid="copy-button"]')
      .or(page.getByRole("button", { name: /コピー/i }));
    this.backButton = page
      .locator('[data-testid="back-button"]')
      .or(page.getByRole("button", { name: /戻る/i }));
    this.structureSelector = page.locator('[data-testid="structure-selector"]');
  }

  /**
   * 歌詞ページに移動
   */
  async navigate(): Promise<void> {
    await this.goto("/lyrics");
  }

  /**
   * 歌詞テキストを入力
   */
  async enterLyrics(lyrics: string): Promise<void> {
    await this.fill(this.lyricsTextarea, lyrics);
  }

  /**
   * 歌詞構造を選択
   */
  async selectStructure(structure: string): Promise<void> {
    const structureOption = this.structureSelector
      .locator(`[data-value="${structure}"]`)
      .or(this.page.getByText(structure));
    await this.click(structureOption);
  }

  /**
   * 最適化ボタンをクリック
   */
  async clickOptimizeButton(): Promise<void> {
    await this.click(this.optimizeButton);
  }

  /**
   * コピーボタンをクリック
   */
  async clickCopyButton(): Promise<void> {
    await this.click(this.copyButton);
  }

  /**
   * 戻るボタンをクリック
   */
  async clickBackButton(): Promise<void> {
    await this.click(this.backButton);
  }

  /**
   * 最適化結果が表示されているかチェック
   */
  async isResultVisible(): Promise<boolean> {
    return await this.isVisible(this.resultArea);
  }

  /**
   * 最適化された歌詞テキストを取得
   */
  async getOptimizedLyrics(): Promise<string> {
    await this.waitForElement('[data-testid="lyrics-result"]');
    return await this.getText(this.resultArea);
  }

  /**
   * 入力された歌詞テキストを取得
   */
  async getInputLyrics(): Promise<string> {
    return await this.lyricsTextarea.inputValue();
  }

  /**
   * 主要コンポーネントが表示されているかチェック
   */
  async areComponentsVisible(): Promise<{
    lyricsTextarea: boolean;
    optimizeButton: boolean;
    structureSelector: boolean;
  }> {
    return {
      lyricsTextarea: await this.isVisible(this.lyricsTextarea),
      optimizeButton: await this.isVisible(this.optimizeButton),
      structureSelector: await this.isVisible(this.structureSelector),
    };
  }
}
