# Playwright E2E + VRT テストガイド

## 概要

このプロジェクトでは、Playwright を使用した E2E テストと VRT（Visual Regression Testing）を導入しています。

## 📋 テスト構成

### E2E テスト
- **ナビゲーションテスト**: 全ページ間の遷移確認
- **機能テスト**: プロンプト生成、歌詞最適化、コンプライアンスチェック等
- **クロスブラウザテスト**: Chromium、Firefox、WebKit 対応
- **レスポンシブテスト**: デスクトップ、タブレット、モバイル対応

### VRT（ビジュアル回帰テスト）
- **スクリーンショット比較**: UI の視覚的変更を自動検知
- **マルチデバイス対応**: デスクトップ/モバイル/タブレット
- **差分検知**: 閾値 0.2 での変更検出
- **ベースライン管理**: 自動更新システム

## 🚀 コマンド一覧

### 基本的な E2E テスト実行

```bash
# 全 E2E テスト実行
bun test:e2e

# 特定のブラウザでテスト実行
bun test:e2e --project=chromium
bun test:e2e --project=firefox
bun test:e2e --project=webkit

# 特定のテストファイルのみ実行
bun test:e2e tests/navigation.spec.ts
bun test:e2e tests/prompt-generation.spec.ts

# ブラウザを表示してテスト実行（デバッグ用）
bun test:e2e:headed

# Playwright Test UI でテスト実行
bun test:e2e:ui
```

### VRT（ビジュアル回帰テスト）

```bash
# VRT テスト実行
bun test:vrt

# VRT ベースライン更新
bun test:vrt:update

# 特定の VRT テストのみ実行
bun test:vrt --grep="Desktop Screenshots"
bun test:vrt --grep="Mobile Screenshots"
```

### レポート確認

```bash
# HTML レポート表示
bun playwright show-report

# テスト結果の詳細確認
ls test-results/
ls playwright-report/
```

## 🔧 開発時の使用方法

### 1. 新機能開発時

```bash
# 開発サーバー起動
bun dev

# 別ターミナルで E2E テスト実行
bun test:e2e tests/navigation.spec.ts --headed
```

### 2. UI 変更時

```bash
# VRT でビジュアル変更を確認
bun test:vrt

# 意図的な変更の場合、ベースライン更新
bun test:vrt:update
```

### 3. PR 作成前

```bash
# 全テスト実行
bun test:e2e

# コード品質チェック
bun run check
bun run typecheck
```

## 📊 CI/CD での自動実行

### GitHub Actions

#### PR 作成時
- `.github/workflows/playwright.yml`: E2E テスト自動実行
- `.github/workflows/vrt.yml`: VRT 差分チェック

#### VRT 差分検知時
- PR に自動コメントで差分レポート
- 差分画像をアーティファクトとして保存

#### ベースライン更新
- `update-vrt-baseline` ブランチで自動更新
- コミット後に新しいベースライン設定

## 🛠️ トラブルシューティング

### よくある問題と解決方法

#### 1. テストが失敗する

```bash
# 詳細なエラー情報を確認
bun test:e2e --reporter=list

# スクリーンショットとビデオを確認
ls test-results/
```

#### 2. VRT で誤差分検知

```bash
# 閾値を調整（playwright.config.ts）
expect: {
  toHaveScreenshot: { threshold: 0.3 }, // デフォルト: 0.2
}

# または特定テストで閾値変更
await expect(page).toHaveScreenshot("test.png", { threshold: 0.5 });
```

#### 3. 要素が見つからない

```bash
# Page Object の要素セレクタを確認
# data-testid 属性の追加を推奨

# デバッグモードで要素確認
bun test:e2e:headed
```

#### 4. タイムアウトエラー

```bash
# playwright.config.ts でタイムアウト調整
use: {
  actionTimeout: 10000, // デフォルト: 5000ms
},

# または特定アクションでタイムアウト指定
await page.click("button", { timeout: 10000 });
```

## 📝 テスト作成ガイド

### Page Object Model パターン

```typescript
// e2e/pages/ExamplePage.ts
import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ExamplePage extends BasePage {
  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.submitButton = page.locator('[data-testid="submit-button"]');
  }

  async clickSubmit(): Promise<void> {
    await this.click(this.submitButton);
  }
}
```

### テストケース作成

```typescript
// e2e/tests/example.spec.ts
import { test, expect } from '../fixtures/test-fixtures';
import { ExamplePage } from '../pages';

test.describe('Example Tests', () => {
  test('should perform action', async ({ page }) => {
    const examplePage = new ExamplePage(page);
    await examplePage.navigate();
    await examplePage.clickSubmit();
    
    await expect(page).toHaveURL('/success');
  });
});
```

### VRT テスト作成

```typescript
test('should match visual snapshot', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  await expect(page).toHaveScreenshot('example-page.png', {
    fullPage: true,
    threshold: 0.2,
  });
});
```

## 🎯 ベストプラクティス

### 1. 要素選択
- `data-testid` 属性を使用
- CSS セレクタよりも安定した属性を優先

### 2. 待機処理
- `page.waitForLoadState('networkidle')` でページ読み込み完了を待機
- 動的コンテンツには `page.waitForSelector()` を使用

### 3. テスト分離
- 各テストは独立して実行可能
- 共通処理は `beforeEach` で設定

### 4. VRT 管理
- 意図的な UI 変更時はベースライン更新
- 差分レビューは PR で必ず確認

## 📚 参考資料

- [Playwright 公式ドキュメント](https://playwright.dev/)
- [Visual Testing Guide](https://playwright.dev/docs/test-screenshots)
- [GitHub Actions Integration](https://playwright.dev/docs/ci-intro)
- [Page Object Model](https://playwright.dev/docs/pom)

## 🔗 関連ファイル

- `playwright.config.ts`: Playwright 設定
- `e2e/`: テストディレクトリ
- `e2e/pages/`: Page Object Model
- `e2e/tests/`: テストケース
- `e2e/visual/`: VRT テスト
- `.github/workflows/`: CI/CD 設定