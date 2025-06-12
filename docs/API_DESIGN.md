# Suno Maker API設計書

## 📋 概要

Suno MakerのAPIインターフェース設計書です。Phase 2で実装された各ユースケースのAPI仕様を定義します。

## 🎯 Phase 2 実装済みAPI

### 1. プロンプト生成API

#### `POST /api/prompt/generate`

**説明**: インテリジェントプロンプト生成（Phase 2.1実装済み）

**リクエスト**:
```typescript
interface GeneratePromptRequest {
  genres: string[]        // 最大5個のジャンル
  language: string        // 言語コード
  mood?: string[]         // ムードマトリックス（25種類から選択）
  instruments?: string[]  // 楽器セレクター（70+種類から選択）
  parameters?: {          // パラメータスライダー
    energy?: number       // 1-10
    complexity?: number   // 1-10
    tempo?: number       // 1-10
    emotional_intensity?: number // 1-10
  }
  customStyle?: string   // カスタムスタイル
}
```

**レスポンス**:
```typescript
interface GeneratePromptResponse {
  prompt: {
    id: string
    title: string
    genre: string[]
    language: string
    styleField: string
    isPublic: boolean
    createdAt: string
  }
  optimizations: string[]
  qualityScore: number    // 0-100
  warnings: string[]
  suggestions: string[]
}
```

**実装状況**: ✅ 完了
- 232ジャンル対応済み
- 25ムード二次元マッピング実装済み
- 70+楽器セレクター実装済み
- 4パラメータスライダー実装済み

### 2. 歌詞最適化API

#### `POST /api/lyrics/optimize`

**説明**: 歌詞構造タグ自動挿入・最適化（Phase 2.2実装済み）

**リクエスト**:
```typescript
interface OptimizeLyricsRequest {
  lyrics: string
  language: string
  targetStructure?: {
    name: string
    sections: string[]
  }
  optimizationOptions?: {
    autoInsertTags: boolean        // 構造タグ自動挿入
    optimizeForJapanese: boolean   // 日本語最適化
    optimizeForSuno: boolean       // Suno特化最適化
    maxLength: number             // デフォルト3000文字
    enforceStructure: boolean
  }
}
```

**レスポンス**:
```typescript
interface OptimizeLyricsResponse {
  optimizedLyrics: {
    id: string
    title: string
    content: string
    language: string
    createdAt: string
  }
  structure: {
    sections: Array<{
      type: string
      content: string
      startLine: number
      endLine: number
    }>
    template?: {
      name: string
      description: string
      sections: string[]
      isPopular: boolean
    }
  }
  optimizations: string[]
  warnings: string[]
  suggestions: string[]
  qualityScore: number
}
```

**実装状況**: ✅ 完了
- LyricsStructure値オブジェクト実装済み
- 6種類の構造テンプレート実装済み
- 基本日本語最適化実装済み
- 自動タグ挿入実装済み

### 3. プロンプト最適化API

#### `POST /api/prompt/optimize`

**説明**: 120文字スタイルフィールド最適化（Phase 2.3実装済み）

**リクエスト**:
```typescript
interface OptimizePromptRequest {
  prompt: {
    id: string
    title: string
    genre: string[]
    language: string
    styleField: string
  }
  targetLength?: number          // デフォルト120文字
  optimizationMode: 'suno' | 'general' | 'creative'
  preserveGenres: boolean
  preserveLanguage: boolean
  customPriorities?: {
    genres: number      // 1-10
    instruments: number // 1-10
    mood: number       // 1-10
    technical: number  // 1-10
  }
}
```

**レスポンス**:
```typescript
interface OptimizePromptResponse {
  optimizedPrompt: {
    id: string
    title: string
    genre: string[]
    language: string
    styleField: string
    isPublic: boolean
    createdAt: string
  }
  originalLength: number
  optimizedLength: number
  compressionRatio: number
  optimizations: Array<{
    type: 'removed' | 'shortened' | 'reordered' | 'merged'
    description: string
    originalText?: string
    optimizedText?: string
  }>
  warnings: string[]
  qualityScore: number
  suggestions: string[]
}
```

**実装状況**: ✅ 完了
- 120文字制限最適化実装済み
- ジャンル競合検出実装済み
- 成功率予測アルゴリズム実装済み
- カスタム優先度対応済み

---

このAPI設計に基づき、Phase 2で実装された全機能をWebAPIとして公開し、フロントエンドとの完全な統合を実現できます。