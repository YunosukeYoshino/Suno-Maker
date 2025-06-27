import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class SuccessExamplesPage extends BasePage {
  // ページ要素のセレクタ
  private readonly searchInput: Locator;
  private readonly filterButtons: Locator;
  private readonly examplesList: Locator;
  private readonly exampleItems: Locator;
  private readonly backButton: Locator;
  private readonly detailModal: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page
      .locator('[data-testid="search-input"]')
      .or(page.locator('input[type="search"]'));
    this.filterButtons = page.locator('[data-testid="filter-buttons"]');
    this.examplesList = page.locator('[data-testid="examples-list"]');
    this.exampleItems = page.locator('[data-testid="example-item"]');
    this.backButton = page
      .locator('[data-testid="back-button"]')
      .or(page.getByRole("button", { name: /戻る/i }));
    this.detailModal = page.locator('[data-testid="detail-modal"]');
  }

  /**
   * 成功事例ページに移動
   */
  async navigate(): Promise<void> {
    await this.goto("/success-examples");
  }

  /**
   * 検索キーワードを入力
   */
  async searchExamples(keyword: string): Promise<void> {
    await this.fill(this.searchInput, keyword);
  }

  /**
   * フィルターボタンをクリック
   */
  async clickFilter(filterName: string): Promise<void> {
    const filterButton = this.filterButtons
      .locator(`[data-filter="${filterName}"]`)
      .or(this.page.getByRole("button", { name: filterName }));
    await this.click(filterButton);
  }

  /**
   * 指定されたインデックスの事例をクリック
   */
  async clickExample(index: number): Promise<void> {
    const example = this.exampleItems.nth(index);
    await this.click(example);
  }

  /**
   * 戻るボタンをクリック
   */
  async clickBackButton(): Promise<void> {
    await this.click(this.backButton);
  }

  /**
   * 事例一覧が表示されているかチェック
   */
  async isExamplesListVisible(): Promise<boolean> {
    return await this.isVisible(this.examplesList);
  }

  /**
   * 詳細モーダルが表示されているかチェック
   */
  async isDetailModalVisible(): Promise<boolean> {
    return await this.isVisible(this.detailModal);
  }

  /**
   * 表示されている事例の数を取得
   */
  async getExamplesCount(): Promise<number> {
    return await this.exampleItems.count();
  }

  /**
   * 指定されたインデックスの事例タイトルを取得
   */
  async getExampleTitle(index: number): Promise<string> {
    const example = this.exampleItems.nth(index);
    const titleElement = example
      .locator('[data-testid="example-title"]')
      .or(example.locator("h3"));
    return await this.getText(titleElement);
  }

  /**
   * 検索結果が表示されているかチェック
   */
  async hasSearchResults(): Promise<boolean> {
    const count = await this.getExamplesCount();
    return count > 0;
  }

  /**
   * 主要コンポーネントが表示されているかチェック
   */
  async areComponentsVisible(): Promise<{
    searchInput: boolean;
    filterButtons: boolean;
    examplesList: boolean;
  }> {
    return {
      searchInput: await this.isVisible(this.searchInput),
      filterButtons: await this.isVisible(this.filterButtons),
      examplesList: await this.isVisible(this.examplesList),
    };
  }
}
