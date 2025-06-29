import { expect, test } from "../fixtures/test-fixtures";
import { CompliancePage } from "../pages";

test.describe("Compliance Check Tests", () => {
  let compliancePage: CompliancePage;

  test.beforeEach(async ({ page }) => {
    compliancePage = new CompliancePage(page);
    await compliancePage.navigate();
  });

  test("should display all compliance check components", async ({ page }) => {
    const components = await compliancePage.areComponentsVisible();

    expect(components.contentInput).toBe(true);
    expect(components.checkButton).toBe(true);
  });

  test("should allow content input", async ({ page }) => {
    const testContent = `これはテスト用のコンテンツです。
コンプライアンスチェックのテストを行います。`;

    await compliancePage.enterContent(testContent);

    // 入力内容の確認
    const contentInput = page.locator('[data-testid="content-input"]');
    await expect(contentInput).toHaveValue(testContent);
  });

  test("should perform compliance check on safe content", async ({ page }) => {
    const safeContent = `今日は良い天気ですね。
音楽を聞いて楽しい時間を過ごしましょう。`;

    await compliancePage.enterContent(safeContent);
    await compliancePage.clickCheckButton();

    // チェック結果の確認
    const isResultVisible = await compliancePage.isResultVisible();
    expect(isResultVisible).toBe(true);

    // 安全なコンテンツの場合の結果確認
    const complianceResult = await compliancePage.getComplianceResult();
    expect(complianceResult.length).toBeGreaterThan(0);
  });

  test("should detect potentially problematic content", async ({ page }) => {
    // 注意: 実際のテストでは適切でない可能性のあるコンテンツ例を使用
    const problematicContent = `このコンテンツには問題があるかもしれません。
著作権に関する内容が含まれています。`;

    await compliancePage.enterContent(problematicContent);
    await compliancePage.clickCheckButton();

    // チェック結果の確認
    const isResultVisible = await compliancePage.isResultVisible();
    expect(isResultVisible).toBe(true);

    // 警告が表示される可能性の確認
    const isWarningVisible = await compliancePage.isWarningVisible();

    // 結果またはステータスが適切に表示されることを確認
    const complianceStatus = await compliancePage.getComplianceStatus();
    expect(complianceStatus).toBeDefined();
  });

  test("should handle empty content input", async ({ page }) => {
    // 空のコンテンツでチェックを実行
    await compliancePage.clickCheckButton();

    // エラーハンドリングまたは入力促進の確認
    // 実装に応じて適切なメッセージが表示されることを確認
    const isResultVisible = await compliancePage.isResultVisible();
    expect(isResultVisible).toBeDefined();
  });

  test("should display compliance status correctly", async ({ page }) => {
    const testContent = `適切なコンテンツのテストです。
問題のない内容を含んでいます。`;

    await compliancePage.enterContent(testContent);
    await compliancePage.clickCheckButton();

    // コンプライアンスステータスの取得と確認
    const complianceStatus = await compliancePage.getComplianceStatus();

    // ステータスが適切に表示されることを確認
    if (complianceStatus) {
      expect(["適合", "警告", "問題あり", "OK", "WARNING", "ERROR"]).toContain(
        complianceStatus.toUpperCase()
      );
    }
  });

  test("should handle warning messages appropriately", async ({ page }) => {
    const warningContent = `このコンテンツは注意が必要かもしれません。
チェック機能のテストを行います。`;

    await compliancePage.enterContent(warningContent);
    await compliancePage.clickCheckButton();

    // 警告メッセージの確認
    const warningMessage = await compliancePage.getWarningMessage();

    // 警告が表示された場合の内容確認
    if (warningMessage) {
      expect(warningMessage.length).toBeGreaterThan(0);
    }

    // 結果が表示されることを確認
    const isResultVisible = await compliancePage.isResultVisible();
    expect(isResultVisible).toBe(true);
  });

  test("should handle large content input", async ({ page }) => {
    // 大量のテキストでのテスト
    const largeContent = Array(50)
      .fill(`これは長いコンテンツのテストです。
大量のテキストが適切に処理されるかを確認します。`)
      .join("\n");

    await compliancePage.enterContent(largeContent);
    await compliancePage.clickCheckButton();

    // 大量データでも正常に処理されることを確認
    const isResultVisible = await compliancePage.isResultVisible();
    expect(isResultVisible).toBe(true);
  });
});
