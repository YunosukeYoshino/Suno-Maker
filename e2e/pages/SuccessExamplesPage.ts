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
  private readonly tabsList: Locator;

  constructor(page: Page) {
    super(page);
    // 実際のUIに基づいたセレクタに修正
    this.searchInput = page.locator(
      'input[placeholder*="プロンプト、歌詞、タグで検索"]'
    );
    this.filterButtons = page.locator('[role="tablist"]'); // Tabs要素
    this.examplesList = page.locator(".grid"); // グリッドレイアウトの要素
    this.exampleItems = page.locator('[role="tabpanel"] .grid > div'); // カード要素
    this.backButton = page
      .locator('[data-testid="back-button"]')
      .or(page.getByRole("button", { name: /戻る/i }));
    this.detailModal = page.locator('[data-testid="detail-modal"]');
    this.tabsList = page.locator('[role="tablist"]');
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
    // Tabsのボタンをクリック
    const filterButton = this.page.getByRole("tab", { name: filterName });
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
    // グリッドまたは空の状態メッセージのいずれかが表示されていることを確認
    const gridVisible = await this.isVisible(this.examplesList);
    const emptyStateVisible = await this.isVisible(
      this.page.locator("text=成功事例が見つかりませんでした")
    );
    return gridVisible || emptyStateVisible;
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
    // カード要素またはスケルトン要素の数を取得
    const cardCount = await this.page
      .locator(".grid > .cursor-pointer, .grid > .animate-pulse")
      .count();
    return cardCount;
  }

  /**
   * 指定されたインデックスの事例タイトルを取得
   */
  async getExampleTitle(index: number): Promise<string> {
    const example = this.page
      .locator(".grid > .cursor-pointer, .grid > .animate-pulse")
      .nth(index);
    const titleElement = example.locator(".text-lg"); // CardTitleのクラス
    return await this.getText(titleElement);
  }

  /**
   * 検索結果が表示されているかチェック
   */
  async hasSearchResults(): Promise<boolean> {
    // カード、スケルトン、または空の状態メッセージのいずれかが表示されていることを確認
    const count = await this.getExamplesCount();
    const emptyStateVisible = await this.isVisible(
      this.page.locator("text=成功事例が見つかりませんでした")
    );
    return count > 0 || emptyStateVisible;
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
      filterButtons: await this.isVisible(this.tabsList),
      examplesList: await this.isExamplesListVisible(),
    };
  }
}
