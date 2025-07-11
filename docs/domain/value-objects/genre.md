---
icon: 🎶
schema:
  name: string
  valid_values: multi-text
  business_purpose: string
  validation_rules: multi-text
---

# Genre Value Object

## Valid Values
- Pop, Rock, Jazz, Classical
- J-Pop, J-Rock（日本語用推奨）
- Electronic, Hip-Hop, Country

## Business Purpose
音楽ジャンルの型安全な表現と検証

## Validation Rules
- 事前定義済み値のみ許可
- 文字列の大文字小文字区別
- 配列・単一値の両方サポート
```
