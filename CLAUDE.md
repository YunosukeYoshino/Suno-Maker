# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「suno-maker」は、AI 音楽生成のためのインテリジェントプロンプト＆歌詞作成ツールです。TypeScript と Tailwind CSS v4 で構築された Next.js 15 アプリケーションで、DDD（ドメイン駆動設計）+ TDD（テスト駆動開発）アーキテクチャを採用しています。

## 必須ツールとコマンド

**重要**: このプロジェクトでは必ず Bun を使用してください。npm や yarn は使用しないでください。

### 基本開発コマンド

```bash
# 開発サーバー起動（Turbopack使用）
bun dev

# ビルド・起動
bun run build
bun start

# コード品質チェック
bun run lint      # Biomeリンティング
bun run format    # Biomeフォーマット
bun run check     # lint + format
bun run typecheck # TypeScript型チェック

# テスト実行
bun test          # 全テスト実行
bun test:watch    # テストウォッチモード
bun test:ui       # テストUI表示
bun test:e2e      # E2Eテスト（Playwright）

# 単一ファイルのテスト実行
bun test src/domain/entities/__tests__/Prompt.test.ts

# shadcn/ui コンポーネント追加
bun x shadcn@latest add [component-name]
```

### 必須品質チェック

新機能実装後は必ず以下を実行してください：

1. `bun run check` - コード品質
2. `bun run typecheck` - 型チェック
3. `bun test` - テスト通過確認

**推奨統合チェック:**
`bun run test:types && bun run test:lint && bun test`

## アーキテクチャ

### DDD レイヤー構造

```
src/
├── domain/           # ドメイン層（ビジネスロジック）
│   ├── entities/     # Prompt, Lyrics, Song, Template, SuccessExample
│   ├── valueObjects/ # Genre, StyleField, LyricsStructure, Language
│   └── repositories/ # リポジトリインターフェース
├── application/      # アプリケーション層（ユースケース）
│   ├── usecases/     # GeneratePrompt, OptimizeLyrics, TemplateLibrary等
│   └── services/     # ComplianceService, TemplateSeederService
├── infrastructure/   # インフラ層（外部依存）
│   └── repositories/ # リポジトリ実装
└── presentation/     # プレゼンテーション層（UI）
    └── components/   # GenreSelector, MoodMatrix, ComplianceChecker等
```

### 技術スタック

- **Next.js 15**: App Router + Turbopack
- **TypeScript 5**: 厳密モード + パスエイリアス
- **Tailwind CSS v4**: ユーティリティファースト
- **shadcn/ui**: モダン UI コンポーネント（`/components/ui/`に配置）
- **Biome**: リンティング・フォーマット（ESLint/Prettier 代替）
- **Vitest**: テストフレームワーク + jsdom + React Testing Library
- **Zustand**: 軽量状態管理 + Zod バリデーション

### パスエイリアス

```typescript
"@/*"            -> ルートディレクトリ
"~/*"            -> ./src/
"@/components"   -> ./components/
"@/domain"       -> ./src/domain/
"@/application"  -> ./src/application/
"@/infrastructure" -> ./src/infrastructure/
"@/presentation" -> ./src/presentation/
```

## DDD 設計原則

### SOLID原則の適用

このプロジェクトではSOLID原則を厳密に適用しています：
- **S**ingle Responsibility: 各クラスは単一の責任を持つ
- **O**pen/Closed: 拡張に開いて、修正に閉じている
- **L**iskov Substitution: 基底クラスは派生クラスに置換可能
- **I**nterface Segregation: インターフェースは小さく、具体的に
- **D**ependency Inversion: 抽象に依存し、具象に依存しない

### Factory パターンの統一

オブジェクト生成には統一されたFactoryパターンを使用：
- `create()`: 新規作成時（バリデーション含む）
- `reconstruct()`: 永続化データからの復元時
- すべてのエンティティ・値オブジェクトで一貫した生成方法

### エンティティ実装パターン

```typescript
export class EntityName {
  private constructor(
    private readonly id: EntityId,
    private property: PropertyValueObject
  ) {
    Object.freeze(this);
    Object.freeze(property);
  }

  static create(id: EntityId, property: PropertyValueObject): EntityName {
    return new EntityName(id, property);
  }

  static reconstruct(id: EntityId, property: PropertyValueObject): EntityName {
    return new EntityName(id, property);
  }

  getId(): EntityId {
    return this.id;
  }
  getProperty(): PropertyValueObject {
    return this.property;
  }
}
```

### 値オブジェクト実装パターン

```typescript
export class ValueObjectName {
  private constructor(private readonly value: string) {
    Object.freeze(this);
  }

  static create(value: string): ValueObjectName {
    if (!this.isValid(value)) {
      throw new Error(`Invalid ${ValueObjectName.name}: ${value}`);
    }
    return new ValueObjectName(value);
  }

  private static isValid(value: string): boolean {
    return value.length > 0 && value.length <= 100;
  }

  getValue(): string {
    return this.value;
  }
  equals(other: ValueObjectName): boolean {
    return this.value === other.value;
  }
}
```

### ユースケース実装パターン

```typescript
export class ActionNameUseCase {
  constructor(private readonly repository: IEntityRepository) {}

  async execute(input: ActionNameInput): Promise<ActionNameOutput> {
    // 1. 入力値の検証
    // 2. ドメインオブジェクトの取得・生成
    // 3. ビジネスロジックの実行
    // 4. 永続化
    // 5. 結果の返却
  }
}
```

## TDD 開発ルール

### Red-Green-Refactor サイクル

1. **Red**: まず失敗するテストを書く
2. **Green**: テストを通すための最小限のコードを実装
3. **Refactor**: リファクタリングでコードを改善

### テスト構造

```typescript
describe("機能名", () => {
  beforeEach(() => {
    // セットアップ
  });

  describe("正常系", () => {
    it("期待される動作を説明", () => {
      // Arrange - Act - Assert
    });
  });

  describe("異常系", () => {
    it("エラーケースの説明", () => {
      expect(() => {
        // error triggering code
      }).toThrow("Expected error message");
    });
  });
});
```

### テスト配置ルール

- ドメイン層: `src/domain/**/__tests__/*.test.ts`
- アプリケーション層: `src/application/**/__tests__/*.test.ts`
- プレゼンテーション層: `src/presentation/**/__tests__/*.test.tsx`

## コード品質基準

### 必須チェック項目

- TypeScript 厳密モード 100%準拠（`any`禁止）
- Biome 品質チェック通過
- 全テスト通過（現在 151 テスト合格）
- パスエイリアス活用
- Zod バリデーション使用

### shadcn/ui 使用ルール

- コンポーネントは `/components/ui/` に配置（`src/`内ではない）
- インポート: `@/components/ui/component-name`
- カスタマイズは必要最小限

## ドキュメント管理

### 自動更新対象

新機能実装時は関連ドキュメントを更新：

- アーキテクチャ変更時: `docs/ARCHITECTURE.md`
- API 変更時: `docs/API_DESIGN.md`
- テスト戦略変更時: `docs/TESTING_STRATEGY.md`
- プロジェクト計画変更時: `docs/PROJECT_PLAN.md`

### 知見管理ファイル

- `.claude/project-knowledge.md`: 実装パターン・設計知見
- `.claude/common-patterns.md`: コマンドパターン・テンプレート
- `.claude/project-improvements.md`: 試行錯誤の記録

## 開発ワークフロー

### ブランチ戦略

```bash
# 機能開発
git checkout -b feature/機能名
bun test:watch  # テスト監視開始
# 実装・テスト・コミット
git commit -m "feat: 機能実装"
gh pr create

# バグ修正
git checkout -b fix/問題の説明
git commit -m "fix: 修正内容"
```

### 実装順序

1. ドメイン層（エンティティ・値オブジェクト）から TDD で実装
2. アプリケーション層（ユースケース）の実装
3. プレゼンテーション層（UI）の実装
4. 統合テスト・E2E テスト

**重要**: 新しい実装や重要な決定を行った際は、該当する知見管理ファイルを更新してください。
