# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「suno-maker」は、TypeScript と Tailwind CSS v4 で構築された Next.js 15 アプリケーションです。モダンな Next.js App Router アーキテクチャを使用し、高速な開発ビルドのために Turbopack が設定されています。

## 必須ツールとコマンド

**重要**: このプロジェクトでは必ず Bun を使用してください。npm や yarn は使用しないでください。

### 開発コマンド
- `bun dev` - 開発サーバーの起動（Turbopack使用、デフォルト: http://localhost:3000）
- `bun run build` - 本番用アプリケーションのビルド
- `bun start` - 本番サーバーの起動
- `bun run lint` - Biome でのリンティング実行
- `bun run format` - Biome でのフォーマット実行
- `bun test` - テストの実行
- `bun test:watch` - テストのウォッチモード実行

## 開発ツール設定

### Biome
- **リンティング**: Biome を使用（ESLint や Prettier の代替）
- **フォーマット**: Biome で統一されたコードフォーマット
- 設定ファイル: `biome.json`

### shadcn/ui
- **コンポーネントライブラリ**: shadcn/ui を使用
- **重要**: UIコンポーネントは `/components/ui/` に配置（`src/components/ui/` ではない）
- インストール: `bun x shadcn@latest add [component-name]`
- 設定ファイル: `components.json`
- インポート: `@/components/ui/component-name`

## アーキテクチャ

- **フレームワーク**: Next.js 15（App Router）
- **スタイリング**: Tailwind CSS v4 + shadcn/ui
- **フォント**: Google Fonts の Geist Sans & Geist Mono
- **ビルドツール**: Turbopack（開発用）
- **TypeScript**: 厳密モード + パスエイリアス（`@/*` → ルート）
- **パッケージマネージャー**: Bun（必須）

## TDD（テスト駆動開発）ルール

### テスト作成の原則
1. **Red → Green → Refactor** のサイクルを厳守
2. まず失敗するテストを書く
3. テストを通すための最小限のコードを実装
4. リファクタリングでコードを改善

### テスト構造
- **単体テスト**: `__tests__/` または `.test.ts` ファイル
- **統合テスト**: `tests/integration/` ディレクトリ
- **E2Eテスト**: `tests/e2e/` ディレクトリ

### テスト命名規則
```typescript
describe('機能名', () => {
  it('期待する動作を説明', () => {
    // テストコード
  });
});
```

## DDD（ドメイン駆動設計）ルール

### ディレクトリ構造
```
src/
├── domain/           # ドメイン層
│   ├── entities/     # エンティティ
│   ├── valueObjects/ # 値オブジェクト
│   └── repositories/ # リポジトリインターfaces
├── application/      # アプリケーション層
│   ├── usecases/     # ユースケース
│   └── services/     # アプリケーションサービス
├── infrastructure/   # インフラ層
│   ├── repositories/ # リポジトリ実装
│   └── external/     # 外部API接続
└── presentation/     # プレゼンテーション層
    ├── components/   # UIコンポーネント
    └── pages/        # ページコンポーネント
```

### DDD 設計原則
1. **ドメインロジックの分離**: ビジネスロジックをドメイン層に集約
2. **依存関係の方向**: 外側の層から内側の層への依存のみ許可
3. **リポジトリパターン**: データアクセスの抽象化
4. **ユースケース駆動**: アプリケーション層でユースケースを明確に定義

### 命名規則
- **エンティティ**: PascalCase（例: `User`, `Song`）
- **値オブジェクト**: PascalCase（例: `Email`, `SongTitle`）
- **ユースケース**: 動詞 + 名詞（例: `CreateSongUseCase`）
- **リポジトリ**: `I` + 名詞 + `Repository`（例: `IUserRepository`）

## 重要なファイル

- `app/layout.tsx` - ルートレイアウト（フォント読み込み、グローバルスタイル）
- `app/page.tsx` - ホームページコンポーネント
- `app/globals.css` - グローバルスタイル（CSS変数、ダークモード対応）
- `components.json` - shadcn/ui 設定
- `biome.json` - Biome 設定
- `next.config.ts` - Next.js 設定

## スタイリングシステム

### CSS変数によるテーマシステム
- `--background` と `--foreground` - プライマリカラー
- `--font-geist-sans` と `--font-geist-mono` - フォントファミリー
- `prefers-color-scheme` による自動ダークモード対応
- Tailwind CSS v4 のインラインテーマ設定

## ドキュメント管理とワークフロー

### ドキュメント自動更新
- **重要**: 新しい機能や変更を実装する際は、関連するdocsファイルを自動的に更新してください
- アーキテクチャ変更時は `ARCHITECTURE.md` を更新
- API変更時は `API_DESIGN.md` を更新
- テスト戦略変更時は `TESTING_STRATEGY.md` を更新
- プロジェクト計画変更時は `PROJECT_PLAN.md` を更新

### ブランチ戦略
- **必須**: 各機能開発は専用ブランチで行ってください
- ブランチ命名規則: `feature/機能名` または `fix/修正内容`
- 例: `feature/genre-value-object`, `fix/prompt-validation`
- 作業開始時に `git checkout -b feature/機能名` でブランチ作成
- 作業完了後は `gh pr create` でプルリクエスト作成

### Git コミットルール
- **必須**: 各作業単位ごとに `gh` コマンドを使用してコミットを作成してください
- コミットメッセージは変更内容を明確に記述
- 関連するissueがある場合は参照を含める
- 例: `git commit -m "feat: Genre値オブジェクトとテストを実装 #123"`

### 作業フロー
1. ブランチ作成 (`git checkout -b feature/機能名`)
2. 機能実装 → テスト作成 → ドキュメント更新 → コミット
3. 各段階で品質チェック（lint, format, test）を実行
4. プルリクエスト作成 (`gh pr create`)
5. レビュー・マージ後にブランチ削除

@/docs/import ARCHITECTURE.md
@/docs/import PROJECT_PLAN.md
@/docs/import API_DESIGN.md
@/docs/import TESTING_STRATEGY.md
@/docs/import README.md
