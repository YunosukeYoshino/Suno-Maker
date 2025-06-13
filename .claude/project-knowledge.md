# Project Knowledge

## 技術的知見・ベストプラクティス

### Next.js 15 & App Router
- **フレームワーク**: Next.js 15（App Router）
- **ビルドツール**: Turbopack（開発用）
- Turbopack を開発環境で使用 (`bun dev`)
- Server Components を優先的に使用
- Client Components は必要最小限に限定
- App Router の規約に従ったファイル配置

### 技術スタック詳細
- **スタイリング**: Tailwind CSS v4 + shadcn/ui
- **フォント**: Google Fonts の Geist Sans & Geist Mono
- **TypeScript**: 厳密モード + パスエイリアス（`@/*` → ルート）
- **パッケージマネージャー**: Bun（必須）
- **テストフレームワーク**: Vitest + jsdom + React Testing Library
- **状態管理**: Zustand + Zod for validation
- **国際化**: next-intl

### パスエイリアス設定
```typescript
"@/*"           -> ルートディレクトリ
"~/*"           -> ./src/
"@/components"  -> ./components/
"@/lib"         -> ./lib/
"@/domain"      -> ./src/domain/
"@/application" -> ./src/application/
"@/infrastructure" -> ./src/infrastructure/
"@/presentation" -> ./src/presentation/
```

### Biome 設定
- **リンティング**: Biome を使用（ESLint や Prettier の代替）
- **フォーマット**: Biome で統一されたコードフォーマット
- 設定ファイル: `biome.json`
- **コードスタイル**:
  - インデント: スペース2つ
  - クォート: ダブルクォート
  - 行末: LF
  - トレイリングカンマ: ES5形式

### shadcn/ui 設定
- **コンポーネントライブラリ**: shadcn/ui を使用
- **重要**: UIコンポーネントは `/components/ui/` に配置（`src/components/ui/` ではない）
- インストール: `bun x shadcn@latest add [component-name]`
- 設定ファイル: `components.json`
- インポート: `@/components/ui/component-name`

### TypeScript 設計パターン
- 厳密な型チェックを実施
- パスエイリアス活用 (`@/*`, `~/*`)
- Zod によるランタイム型検証
- 型安全性を最優先

### DDD アーキテクチャ構造
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

### DDD 命名規則
- **エンティティ**: PascalCase（例: `User`, `Song`）
- **値オブジェクト**: PascalCase（例: `Email`, `SongTitle`）
- **ユースケース**: 動詞 + 名詞（例: `CreateSongUseCase`）
- **リポジトリ**: `I` + 名詞 + `Repository`（例: `IUserRepository`）

### DDD 実装パターン
```typescript
// エンティティ例
export class Song {
  private constructor(
    private readonly id: SongId,
    private title: SongTitle,
    private genre: Genre
  ) {}
}

// 値オブジェクト例
export class Genre {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Genre {
    if (!this.isValid(value)) {
      throw new Error('Invalid genre');
    }
    return new Genre(value);
  }
}

// リポジトリインターフェース例
export interface ISongRepository {
  save(song: Song): Promise<void>;
  findById(id: SongId): Promise<Song | null>;
}
```

### TDD 実装パターン
#### テスト作成の原則
1. **Red → Green → Refactor** のサイクルを厳守
2. まず失敗するテストを書く
3. テストを通すための最小限のコードを実装
4. リファクタリングでコードを改善

#### テスト構造
- **単体テスト**: `__tests__/` または `.test.ts` ファイル
- **統合テスト**: `tests/integration/` ディレクトリ
- **E2Eテスト**: `tests/e2e/` ディレクトリ

#### テスト命名規則
```typescript
describe('機能名', () => {
  it('期待する動作を説明', () => {
    // テストコード
  });
});
```

### 重要なファイル構成
- `app/layout.tsx` - ルートレイアウト（フォント読み込み、グローバルスタイル）
- `app/page.tsx` - ホームページコンポーネント
- `app/globals.css` - グローバルスタイル（CSS変数、ダークモード対応）
- `components.json` - shadcn/ui 設定
- `biome.json` - Biome 設定
- `next.config.ts` - Next.js 設定
- `vitest.config.ts` - Vitest テスト設定（パスエイリアス含む）
- `test-setup.ts` - テスト環境セットアップファイル

### スタイリングシステム
#### CSS変数によるテーマシステム
- `--background` と `--foreground` - プライマリカラー
- `--font-geist-sans` と `--font-geist-mono` - フォントファミリー
- `prefers-color-scheme` による自動ダークモード対応
- Tailwind CSS v4 のインラインテーマ設定

### Zustand パターン
- ドメインごとにストアを分離
- Actions と Selectors を明確に分離
- Immer 使用によるイミュータブル更新

### shadcn/ui 活用パターン
- コンポーネントは `/components/ui/` に配置
- カスタマイズは必要最小限に留める
- Tailwind CSS v4 との組み合わせを活用

### テスト戦略
- 単体テスト: ドメインロジックを重点的にテスト
- 統合テスト: ユースケース層のテスト
- E2Eテスト: 重要なユーザーフローのテスト
- モック活用: 外部依存の抽象化

### パフォーマンス最適化
- 動的インポートによるコード分割
- 画像最適化 (Next.js Image コンポーネント)
- メモ化パターン (React.memo, useMemo, useCallback)
- バンドルサイズ分析とプルーニング

### 国際化対応
- next-intl による多言語対応
- メッセージキーの命名規則統一
- 動的ルーティングとロケール処理

## 学習済みパターン・知見

### エラーハンドリング
- ドメイン層: カスタム例外クラス
- アプリケーション層: Result パターン
- プレゼンテーション層: Error Boundary

### 状態管理
- ローカル状態: useState, useReducer
- グローバル状態: Zustand
- サーバー状態: React Query (将来導入予定)

### セキュリティ
- 入力値検証: Zod スキーマ
- XSS 対策: React の標準エスケープ
- CSRF 対策: Next.js の標準対応