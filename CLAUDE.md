# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「suno-maker」は、TypeScript と Tailwind CSS v4 で構築された Next.js 15 アプリケーションです。モダンな Next.js App Router アーキテクチャを使用し、高速な開発ビルドのために Turbopack が設定されています。

## 必須ツールとコマンド

**重要**: このプロジェクトでは必ず Bun を使用してください。npm や yarn は使用しないでください。

基本的な開発コマンドについては `.claude/common-patterns.md` を参照してください。

## 開発ツール設定

詳細な開発ツール設定については `.claude/project-knowledge.md` を参照してください。

## アーキテクチャ

技術スタックとアーキテクチャの詳細については `.claude/project-knowledge.md` を参照してください。

## TDD（テスト駆動開発）ルール

TDDの詳細な実装パターンについては `.claude/project-knowledge.md` を参照してください。

## DDD（ドメイン駆動設計）ルール

DDDの詳細な実装パターンについては `.claude/project-knowledge.md` を参照してください。


## ドキュメント管理とワークフロー

### ドキュメント自動更新
- **重要**: 新しい機能や変更を実装する際は、関連するdocsファイルを自動的に更新してください
- アーキテクチャ変更時は `ARCHITECTURE.md` を更新
- API変更時は `API_DESIGN.md` を更新
- テスト戦略変更時は `TESTING_STRATEGY.md` を更新
- プロジェクト計画変更時は `PROJECT_PLAN.md` を更新

詳細なワークフロー情報については `.claude/common-patterns.md` を参照してください。

@/docs/import ARCHITECTURE.md
@/docs/import PROJECT_PLAN.md
@/docs/import API_DESIGN.md
@/docs/import TESTING_STRATEGY.md
@/docs/import README.md


## 知見管理システム
このプロジェクトでは以下のファイルで知見を体系的に管理しています：

### `.claude/context.md`
- プロジェクトの背景、目的、制約条件
- 技術スタック選定理由
- ビジネス要件や技術的制約

### `.claude/project-knowledge.md`
- 実装パターンや設計決定の知見
- アーキテクチャの選択理由
- 避けるべきパターンやアンチパターン

### `.claude/project-improvements.md`
- 過去の試行錯誤の記録
- 失敗した実装とその原因
- 改善プロセスと結果

### `.claude/common-patterns.md`
- 頻繁に使用するコマンドパターン
- 定型的な実装テンプレート

**重要**: 新しい実装や重要な決定を行った際は、該当するファイルを更新してください。
