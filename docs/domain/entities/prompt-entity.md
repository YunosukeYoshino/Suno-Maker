---
icon: 🎵
schema:
  name:
    type: string
    required: true
    description: エンティティ名
  purpose:
    type: string
    required: true
    description: ビジネス上の目的
  business_rules:
    type: multi-text
    required: true
    description: ビジネスルール一覧
  properties:
    type: multi-text
    description: 主要プロパティ
  validation_rules:
    type: multi-text
    description: 検証ルール
  usage_examples:
    type: multi-text
    description: 使用例
---

# Prompt Entity

## Purpose
AI音楽生成のためのプロンプト管理エンティティ

## Business Rules
- titleは1文字以上100文字以内必須
- GenreとLanguageは必須設定
- 生成統計の自動更新機能
- 品質スコアの自動計算

## Properties
- id: 一意識別子（UUID）
- title: プロンプトタイトル
- genre: 音楽ジャンル（Genre値オブジェクト）
- language: 言語設定（Language値オブジェクト）
- styleField: スタイル設定（StyleField値オブジェクト）

## Validation Rules
- Zodスキーマによる実行時検証
- カスタム値オブジェクト検証
- 言語とジャンルの組み合わせ妥当性チェック

## Usage Examples
- プロンプト作成ページでの新規作成
- テンプレートライブラリでの管理
- 最適化機能での品質向上
```
