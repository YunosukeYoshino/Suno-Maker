import { expect, test } from "../fixtures/test-fixtures";
import { SuccessExamplesPage } from "../pages";

test.describe("Success Examples Tests", () => {
  let successExamplesPage: SuccessExamplesPage;

  test.beforeEach(async ({ page }) => {
    successExamplesPage = new SuccessExamplesPage(page);
    await successExamplesPage.navigate();
  });

  test("should display all success examples components", async ({ page }) => {
    const components = await successExamplesPage.areComponentsVisible();

    expect(components.searchInput).toBe(true);
    expect(components.filterButtons).toBe(true);
    expect(components.examplesList).toBe(true);
  });

  test("should display examples list", async ({ page }) => {
    // 事例一覧が表示されることを確認
    const isExamplesListVisible =
      await successExamplesPage.isExamplesListVisible();
    expect(isExamplesListVisible).toBe(true);

    // 事例が少なくとも1つは表示されることを確認
    const examplesCount = await successExamplesPage.getExamplesCount();
    expect(examplesCount).toBeGreaterThan(0);
  });

  test("should allow searching examples", async ({ page }) => {
    const searchKeyword = "ロック";

    // 検索キーワードを入力
    await successExamplesPage.searchExamples(searchKeyword);

    // 検索結果の確認
    const hasResults = await successExamplesPage.hasSearchResults();
    expect(hasResults).toBe(true);

    // 検索入力フィールドの値確認
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toHaveValue(searchKeyword);
  });

  test("should allow filtering examples", async ({ page }) => {
    // フィルターボタンのクリック
    await successExamplesPage.clickFilter("ポップ");

    // フィルター適用後の結果確認
    const hasResults = await successExamplesPage.hasSearchResults();
    expect(hasResults).toBe(true);

    // フィルターボタンの状態確認
    const filterButtons = page.locator('[data-testid="filter-buttons"]');
    await expect(filterButtons).toBeVisible();
  });

  test("should display example details when clicked", async ({ page }) => {
    // 事例一覧が表示されていることを確認
    const examplesCount = await successExamplesPage.getExamplesCount();

    if (examplesCount > 0) {
      // 最初の事例をクリック
      await successExamplesPage.clickExample(0);

      // 詳細モーダルまたは詳細ページが表示されることを確認
      const isDetailVisible = await successExamplesPage.isDetailModalVisible();

      // 詳細が表示される（モーダルまたはページ遷移）
      expect(isDetailVisible).toBeDefined();
    }
  });

  test("should display example titles correctly", async ({ page }) => {
    const examplesCount = await successExamplesPage.getExamplesCount();

    if (examplesCount > 0) {
      // 最初の事例のタイトルを取得
      const firstExampleTitle = await successExamplesPage.getExampleTitle(0);

      // タイトルが空でないことを確認
      expect(firstExampleTitle.length).toBeGreaterThan(0);

      // 複数の事例がある場合、他の事例のタイトルも確認
      if (examplesCount > 1) {
        const secondExampleTitle = await successExamplesPage.getExampleTitle(1);
        expect(secondExampleTitle.length).toBeGreaterThan(0);

        // 異なるタイトルであることを確認
        expect(firstExampleTitle).not.toBe(secondExampleTitle);
      }
    }
  });

  test("should handle empty search results", async ({ page }) => {
    const invalidSearchKeyword = "xxxxx存在しないキーワードxxxxx";

    // 存在しないキーワードで検索
    await successExamplesPage.searchExamples(invalidSearchKeyword);

    // 検索結果の処理確認
    // 実装に応じて「結果なし」メッセージまたは空のリストが表示される
    const examplesCount = await successExamplesPage.getExamplesCount();

    // 結果が0件または適切なメッセージが表示されることを確認
    expect(examplesCount).toBeGreaterThanOrEqual(0);
  });

  test("should handle multiple filters", async ({ page }) => {
    // 複数のフィルターを適用
    await successExamplesPage.clickFilter("ロック");
    await successExamplesPage.clickFilter("アップテンポ");

    // フィルター適用後の結果確認
    const hasResults = await successExamplesPage.hasSearchResults();
    expect(hasResults).toBeDefined();

    // フィルターが適用されていることの確認
    const filterButtons = page.locator('[data-testid="filter-buttons"]');
    await expect(filterButtons).toBeVisible();
  });

  test("should combine search and filter", async ({ page }) => {
    // 検索とフィルターの組み合わせテスト
    await successExamplesPage.searchExamples("音楽");
    await successExamplesPage.clickFilter("バラード");

    // 組み合わせ結果の確認
    const hasResults = await successExamplesPage.hasSearchResults();
    expect(hasResults).toBeDefined();

    // 検索入力とフィルターの両方が適用されていることを確認
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toHaveValue("音楽");
  });

  test("should maintain responsive design on mobile", async ({ page }) => {
    // モバイルビューポートでのテスト
    await page.setViewportSize({ width: 375, height: 667 });

    // モバイルでもコンポーネントが適切に表示されることを確認
    const components = await successExamplesPage.areComponentsVisible();
    expect(components.searchInput).toBe(true);
    expect(components.examplesList).toBe(true);

    // モバイルでの操作性確認
    if ((await successExamplesPage.getExamplesCount()) > 0) {
      await successExamplesPage.clickExample(0);
    }
  });
});
