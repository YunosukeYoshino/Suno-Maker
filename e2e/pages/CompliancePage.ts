import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class CompliancePage extends BasePage {
  // ページ要素のセレクタ
  private readonly contentInput: Locator;
  private readonly checkButton: Locator;
  private readonly resultArea: Locator;
  private readonly warningArea: Locator;
  private readonly backButton: Locator;
  private readonly complianceStatus: Locator;

  constructor(page: Page) {
    super(page);
    this.contentInput = page
      .locator('[data-testid="content-input"]')
      .or(page.locator("textarea"));
    this.checkButton = page
      .locator('[data-testid="check-button"]')
      .or(page.getByRole("button", { name: /チェック/i }));
    this.resultArea = page.locator('[data-testid="compliance-result"]');
    this.warningArea = page.locator('[data-testid="warning-area"]');
    this.backButton = page
      .locator('[data-testid="back-button"]')
      .or(page.getByRole("button", { name: /戻る/i }));
    this.complianceStatus = page.locator('[data-testid="compliance-status"]');
  }

  /**
   * コンプライアンスページに移動
   */
  async navigate(): Promise<void> {
    await this.goto("/compliance");
  }

  /**
   * チェック対象のコンテンツを入力
   */
  async enterContent(content: string): Promise<void> {
    await this.fill(this.contentInput, content);
  }

  /**
   * コンプライアンスチェックボタンをクリック
   */
  async clickCheckButton(): Promise<void> {
    await this.click(this.checkButton);
  }

  /**
   * 戻るボタンをクリック
   */
  async clickBackButton(): Promise<void> {
    await this.click(this.backButton);
  }

  /**
   * チェック結果が表示されているかチェック
   */
  async isResultVisible(): Promise<boolean> {
    return await this.isVisible(this.resultArea);
  }

  /**
   * 警告が表示されているかチェック
   */
  async isWarningVisible(): Promise<boolean> {
    return await this.isVisible(this.warningArea);
  }

  /**
   * コンプライアンスチェック結果を取得
   */
  async getComplianceResult(): Promise<string> {
    await this.waitForElement('[data-testid="compliance-result"]');
    return await this.getText(this.resultArea);
  }

  /**
   * コンプライアンスステータスを取得
   */
  async getComplianceStatus(): Promise<string> {
    if (await this.isVisible(this.complianceStatus)) {
      return await this.getText(this.complianceStatus);
    }
    return "";
  }

  /**
   * 警告メッセージを取得
   */
  async getWarningMessage(): Promise<string> {
    if (await this.isVisible(this.warningArea)) {
      return await this.getText(this.warningArea);
    }
    return "";
  }

  /**
   * 主要コンポーネントが表示されているかチェック
   */
  async areComponentsVisible(): Promise<{
    contentInput: boolean;
    checkButton: boolean;
  }> {
    return {
      contentInput: await this.isVisible(this.contentInput),
      checkButton: await this.isVisible(this.checkButton),
    };
  }
}
