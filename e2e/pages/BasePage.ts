import type { Locator, Page } from "@playwright/test";
import { waitForElement, waitForPageLoad } from "../utils/test-helpers";

export abstract class BasePage {
  protected constructor(protected page: Page) {}

  /**
   * 指定されたパスに移動
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await waitForPageLoad(this.page);
  }

  /**
   * ページタイトルを取得
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * 要素が表示されるまで待機
   */
  async waitForElement(selector: string): Promise<void> {
    await waitForElement(this.page, selector);
  }

  /**
   * 要素をクリック
   */
  async click(locator: Locator): Promise<void> {
    await locator.click();
    await waitForPageLoad(this.page);
  }

  /**
   * テキストを入力
   */
  async fill(locator: Locator, text: string): Promise<void> {
    await locator.fill(text);
  }

  /**
   * 要素のテキストを取得
   */
  async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) || "";
  }

  /**
   * 要素が表示されているかチェック
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * スクリーンショットを撮影（VRT用）
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `e2e/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * ページのスクリーンショット比較（VRT用）
   */
  async expectScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `e2e/screenshots/${name}-actual.png`,
      fullPage: true,
    });
  }
}
