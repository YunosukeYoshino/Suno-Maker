# Project Context

## プロジェクト概要
「suno-maker」は、TypeScript と Tailwind CSS v4 で構築された Next.js 15 アプリケーションです。

## 主要な技術スタック
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4 + shadcn/ui
- **パッケージマネージャー**: Bun (必須)
- **開発ツール**: Turbopack, Biome
- **テストフレームワーク**: Vitest + jsdom + React Testing Library
- **状態管理**: Zustand + Zod
- **国際化**: next-intl

## アーキテクチャ制約
- DDD (ドメイン駆動設計) アーキテクチャを採用
- TDD (テスト駆動開発) を実践
- Clean Architecture の原則に従う

## 開発制約・重要なルール
1. **必須**: Bun を使用 (npm/yarn 禁止)
2. **必須**: Biome を使用 (ESLint/Prettier 禁止)
3. **必須**: shadcn/ui コンポーネントは `/components/ui/` に配置
4. **必須**: 各機能開発は専用ブランチで実施
5. **必須**: TDD サイクル (Red → Green → Refactor) を厳守
6. **必須**: DDD 層分離を遵守

## プロジェクト構造
```
src/
├── domain/           # ドメイン層
├── application/      # アプリケーション層
├── infrastructure/   # インフラ層
└── presentation/     # プレゼンテーション層
```

## 重要な設定ファイル
- `biome.json` - コードフォーマット・リンティング設定
- `components.json` - shadcn/ui 設定
- `vitest.config.ts` - テスト設定
- `CLAUDE.md` - Claude Code 向け詳細指示