# Path Aliases Documentation

## Overview

このプロジェクトでは、TypeScriptとNext.jsのパスエイリアス機能を活用して、importパスを簡潔かつ分かりやすくしています。

## 設定済みエイリアス

### 基本エイリアス

| エイリアス | 解決先 | 説明 |
|-----------|--------|------|
| `@/*` | `./*` | プロジェクトルートからの絶対パス |
| `~/*` | `./src/*` | srcディレクトリからの絶対パス |

### 特定ディレクトリエイリアス

| エイリアス | 解決先 | 説明 |
|-----------|--------|------|
| `@/components/*` | `./components/*` | shadcn/uiコンポーネント |
| `@/src/*` | `./src/*` | ソースコードディレクトリ |
| `@/lib/*` | `./lib/*` | ユーティリティライブラリ |
| `@/domain/*` | `./src/domain/*` | ドメイン層（DDD） |
| `@/application/*` | `./src/application/*` | アプリケーション層（DDD） |
| `@/infrastructure/*` | `./src/infrastructure/*` | インフラ層（DDD） |
| `@/presentation/*` | `./src/presentation/*` | プレゼンテーション層（DDD） |

## 使用例

### Before（相対パス）
```typescript
import { Genre } from '../../domain/valueObjects/Genre';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
```

### After（エイリアスパス）
```typescript
import { Genre } from '@/domain/valueObjects/Genre';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
```

## 設定ファイル

### tsconfig.json
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "~/*": ["./src/*"],
      "@/components/*": ["./components/*"],
      "@/src/*": ["./src/*"],
      "@/lib/*": ["./lib/*"],
      "@/domain/*": ["./src/domain/*"],
      "@/application/*": ["./src/application/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"],
      "@/presentation/*": ["./src/presentation/*"]
    }
  }
}
```

### vitest.config.ts
```typescript
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "~": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/src": path.resolve(__dirname, "./src"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/domain": path.resolve(__dirname, "./src/domain"),
      "@/application": path.resolve(__dirname, "./src/application"),
      "@/infrastructure": path.resolve(__dirname, "./src/infrastructure"),
      "@/presentation": path.resolve(__dirname, "./src/presentation"),
    },
  },
});
```

### components.json（shadcn/ui）
```json
{
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

## レイヤー別インポートガイドライン

### ドメイン層
```typescript
// ✅ 推奨
import { Genre } from '@/domain/valueObjects/Genre';
import { IPromptRepository } from '@/domain/repositories/IPromptRepository';

// ❌ 非推奨（ドメイン層は他の層に依存してはいけない）
import { DatabaseConnection } from '@/infrastructure/database';
```

### アプリケーション層
```typescript
// ✅ 推奨
import { Genre } from '@/domain/valueObjects/Genre';
import { GeneratePromptUseCase } from '@/application/usecases/GeneratePromptUseCase';

// ⚠️ 注意（プレゼンテーション層への依存は最小限に）
import { MusicParameters } from '@/presentation/components/ParameterSliders';
```

### プレゼンテーション層
```typescript
// ✅ 推奨
import { Button } from '@/components/ui/button';
import { Genre } from '@/domain/valueObjects/Genre';
import { GeneratePromptUseCase } from '@/application/usecases/GeneratePromptUseCase';
```

### インフラ層
```typescript
// ✅ 推奨
import { IPromptRepository } from '@/domain/repositories/IPromptRepository';
import { Prompt } from '@/domain/entities/Prompt';
```

## 利点

1. **可読性向上**: パスが短く、意図が明確
2. **保守性向上**: ディレクトリ構造変更時の修正箇所が少ない
3. **開発効率**: IDEの自動補完がより効果的
4. **DDD準拠**: レイヤー間の依存関係が視覚的に明確
5. **一貫性**: プロジェクト全体で統一されたインポート形式

## ベストプラクティス

1. **エイリアスの優先使用**: 可能な限り相対パスではなくエイリアスを使用
2. **レイヤー固有エイリアス**: `@/domain/*`、`@/application/*` などを積極活用
3. **UIコンポーネント**: shadcn/uiコンポーネントは `@/components/ui/*` を使用
4. **ユーティリティ**: `@/lib/utils` などの共通ユーティリティを活用
5. **テスト**: テストファイルでも同じエイリアスルールを適用

## トラブルシューティング

### IDEで補完が効かない場合
1. TypeScriptの言語サーバーを再起動
2. `tsconfig.json` の設定を確認
3. ワークスペースをリロード

### テストでインポートエラーが発生する場合
1. `vitest.config.ts` のalias設定を確認
2. テストランナーを再起動
3. キャッシュをクリア（`bun test --clearCache`）

### ビルドエラーが発生する場合
1. Next.jsの設定を確認
2. `next.config.ts` でのエイリアス設定（必要に応じて）
3. `.next` フォルダを削除して再ビルド