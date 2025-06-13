# 🎵 Suno Maker

**AI音楽生成のためのインテリジェントプロンプト＆歌詞作成ツール**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-06B6D4)](https://tailwindcss.com/)
[![Biome](https://img.shields.io/badge/Biome-1.9.4-60A5FA)](https://biomejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2.3-6E9F18)](https://vitest.dev/)

## 🎶 このツールについて

「Sunoで、もっといい曲を作りたい！」

Suno Makerは、そんなあなたのための相棒です。
AIが最高のパフォーマンスを発揮できるように、音楽理論や成功パターンを詰め込んだ「魔法の呪文（プロンプト）」を一緒に考えたり、グッとくる歌詞作りをお手伝いします。

面倒なことはツールに任せて、あなたは創造的な部分に集中してください。

## ✨ Phase 2 実装完了機能

### 🎯 インテリジェントプロンプトジェネレーター
- **🎼 232ジャンル対応**: 階層化分類による包括的ジャンルシステム
- **🎛️ パラメータスライダー**: Energy、Complexity、Tempo、Emotional Intensity
- **🎸 70+楽器セレクター**: 6カテゴリ、弦楽器・管楽器・打楽器・電子楽器・伝統楽器対応
- **💭 25ムードマトリックス**: 感情の二次元マッピング（エネルギー×感情価）

### 📝 歌詞作成支援機能
- **🏗️ 構造タグ自動挿入**: [Verse], [Chorus], [Bridge]等の自動配置
- **🇯🇵 日本語最適化**: ひらがな推奨、発音最適化、助詞調整
- **📊 6構造テンプレート**: Pop Standard、Rock Classic、Ballad等
- **📏 3000文字制限管理**: 自動短縮・重複除去機能

### ⚡ プロンプト最適化エンジン
- **✂️ 120文字最適化**: 重複除去、同義語短縮、冗長語削除
- **⚠️ ジャンル競合検出**: 相反するジャンル組み合わせの警告
- **📈 成功率予測**: 品質スコア算出と改善提案
- **🎯 カスタム優先度**: ジャンル・楽器・ムード・技術要素の優先度設定

## 🏗️ アーキテクチャ

### DDD（ドメイン駆動設計）+ TDD（テスト駆動開発）
```
src/
├── domain/                 # ドメイン層（ビジネスロジック）
│   ├── entities/          # エンティティ（Prompt, Lyrics, Song）
│   ├── valueObjects/      # 値オブジェクト（Genre, StyleField, LyricsStructure）
│   └── repositories/      # リポジトリインターフェース
├── application/           # アプリケーション層（ユースケース）
│   ├── usecases/         # GeneratePrompt, OptimizeLyrics, OptimizePrompt
│   └── services/         # アプリケーションサービス
├── infrastructure/       # インフラ層（外部依存）
│   ├── repositories/     # リポジトリ実装
│   └── external/        # 外部API
└── presentation/         # プレゼンテーション層（UI）
    ├── components/      # UIコンポーネント
    └── hooks/          # React Hooks
```

## 🧪 テスト品質

- **✅ 147テスト全通過**: Domain層の完全なテストカバレッジ
- **📊 TDD開発**: Red-Green-Refactorサイクルによる高品質実装
- **🔒 型安全性**: TypeScript厳密モード100%準拠

## 🚀 クイックスタート

### 必要な環境
- **Node.js**: 18.17以上
- **Bun**: 1.2.10以上（推奨パッケージマネージャー）

### インストール
```bash
# リポジトリクローン
git clone https://github.com/your-username/suno-maker.git
cd suno-maker

# 依存関係インストール（Bun推奨）
bun install

# 開発サーバー起動
bun dev
```

### 開発コマンド
```bash
# 開発サーバー起動（Turbopack使用）
bun dev

# 本番ビルド
bun run build

# テスト実行
bun test
bun test:watch    # ウォッチモード

# コード品質
bun run lint      # Biomeリンティング
bun run format    # Biomeフォーマット

# shadcn/ui コンポーネント追加
bun x shadcn@latest add [component-name]
```

## 📚 ドキュメント

- **[アーキテクチャ設計書](./docs/ARCHITECTURE.md)**: DDD設計詳細
- **[プロジェクト計画書](./docs/PROJECT_PLAN.md)**: Phase別実装計画
- **[API設計書](./docs/API_DESIGN.md)**: APIインターフェース仕様
- **[開発ガイド](./CLAUDE.md)**: 開発環境・ツール設定

## 🛠️ 技術スタック

### フレームワーク・ライブラリ
- **[Next.js 15](https://nextjs.org/)**: App Router + Turbopack
- **[React 19](https://react.dev/)**: 最新React機能
- **[TypeScript 5](https://www.typescriptlang.org/)**: 厳密な型システム
- **[Tailwind CSS v4](https://tailwindcss.com/)**: ユーティリティファースト
- **[shadcn/ui](https://ui.shadcn.com/)**: モダンUIコンポーネント

### 開発ツール
- **[Biome](https://biomejs.dev/)**: 高速リンティング・フォーマット
- **[Vitest](https://vitest.dev/)**: 高速テストランナー
- **[Bun](https://bun.sh/)**: 高速パッケージマネージャー
- **[Husky](https://typicode.github.io/husky/)**: Git hooks

### 状態管理・データ
- **[Zustand](https://zustand-demo.pmnd.rs/)**: 軽量状態管理
- **[Zod](https://zod.dev/)**: スキーマバリデーション
- **LocalStorage**: クライアントサイドデータ永続化

## 🎨 デザインシステム

### カラーパレット
- **プライマリ**: Purple-Blue グラデーション（音楽創造性表現）
- **セカンダリ**: Warm Gray（可読性重視）
- **アクセント**: Vibrant Orange（アクション要素）

### タイポグラフィ
- **フォント**: Geist Sans & Geist Mono
- **階層**: 明確な情報階層とコントラスト
- **アクセシビリティ**: WCAG 2.1 AA準拠

## 📊 実装統計

| 機能領域 | 実装項目数 | テスト通過率 | 品質スコア |
|---------|-----------|-------------|-----------|
| ジャンルシステム | 232種類 | 100% | A+ |
| ムードマトリックス | 25種類 | 100% | A+ |
| 楽器セレクター | 70+種類 | 100% | A+ |
| 歌詞構造解析 | 6テンプレート | 100% | A+ |
| プロンプト最適化 | 4アルゴリズム | 100% | A+ |

## 🗺️ ロードマップ

### ✅ Phase 1: 基盤構築（完了）
- DDD設計・TDD環境
- 基本UI・レスポンシブ対応

### ✅ Phase 2: コア機能実装（完了）
- インテリジェントプロンプトジェネレーター
- 歌詞作成支援機能
- プロンプト最適化エンジン

### 🚧 Phase 3: 高度機能・コミュニティ（計画中）
- テンプレートライブラリ
- 成功事例データベース
- コミュニティ機能

### 🔮 Phase 4: AI統合・自動化（将来）
- AI推奨システム
- 自動品質向上
- リアルタイム最適化

<!--
## 🤝 コントリビューション

### 開発参加
1. **Fork** このリポジトリ
2. **ブランチ作成**: `git checkout -b feature/amazing-feature`
3. **変更コミット**: `git commit -m 'Add amazing feature'`
4. **プッシュ**: `git push origin feature/amazing-feature`
5. **Pull Request** 作成

### コード品質基準
- **DDD設計原則** 遵守
- **TDD開発手法** 適用
- **TypeScript厳密モード** 100%
- **Biome品質チェック** 通過

## 📄 ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) ファイルを参照
-->

## 🙏 謝辞

- **[Suno AI](https://suno.ai/)**: 革新的な音楽生成プラットフォーム
- **[Next.js](https://nextjs.org/)**: 優れたReactフレームワーク
- **[shadcn/ui](https://ui.shadcn.com/)**: 美しいUIコンポーネント

---

**🎵 音楽制作の未来を、一緒に作りましょう！**
