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

## 🎯 Phase 3 実装済みAPI

### 4. テンプレートライブラリAPI

#### `GET /api/templates`

**説明**: テンプレート一覧取得（Phase 3.1実装済み）

**クエリパラメータ**:
```typescript
interface GetTemplatesQuery {
  genre?: string          // ジャンルフィルター
  language?: string       // 言語フィルター  
  category?: TemplateCategory // カテゴリフィルター
  minQualityScore?: number    // 最小品質スコア
  sortBy?: 'quality' | 'popularity' | 'latest' // ソート順
  limit?: number          // 取得件数（デフォルト20）
  offset?: number         // オフセット
}
```

**レスポンス**:
```typescript
interface GetTemplatesResponse {
  templates: Array<{
    id: string
    name: string
    description: string
    genre: string
    language: string
    styleField: string
    lyricsStructure: string
    tags: string[]
    category: TemplateCategory
    qualityScore: number
    usageCount: number
    createdAt: string
    updatedAt: string
  }>
  totalCount: number
  hasMore: boolean
}
```

**実装状況**: ✅ 完了
- 25+プロフェッショナルテンプレート実装済み
- 4カテゴリ分類（genre-specific, language-specific, mood-specific, custom）
- 13ジャンル対応済み
- 4言語対応済み（英語、日本語、韓国語、スペイン語、フランス語）

#### `POST /api/templates/use`

**説明**: テンプレート使用・プロンプト生成（Phase 3.1実装済み）

**リクエスト**:
```typescript
interface UseTemplateRequest {
  templateId: string
}
```

**レスポンス**:
```typescript
interface UseTemplateResponse {
  template: {
    id: string
    name: string
    description: string
    genre: string
    language: string
    styleField: string
    lyricsStructure: string
    tags: string[]
    category: TemplateCategory
    qualityScore: number
    usageCount: number
  }
  prompt: {
    id: string
    title: string
    genre: string[]
    language: string
    styleField: string
    description: string
    tags: string[]
    isPublic: boolean
    createdAt: string
  }
}
```

**実装状況**: ✅ 完了
- 使用回数自動追跡実装済み
- Prompt自動生成実装済み
- 品質スコア85-95の高品質テンプレート

#### `POST /api/templates/custom`

**説明**: カスタムテンプレート作成（Phase 3.1実装済み）

**リクエスト**:
```typescript
interface CreateCustomTemplateRequest {
  name: string
  description: string
  genre: string
  language: string
  styleField: string
  lyricsStructure: string
  tags: string[]
}
```

**レスポンス**:
```typescript
interface CreateCustomTemplateResponse {
  template: {
    id: string
    name: string
    description: string
    genre: string
    language: string
    styleField: string
    lyricsStructure: string
    tags: string[]
    category: 'custom'
    qualityScore: number
    usageCount: number
    createdAt: string
    updatedAt: string
  }
}
```

**実装状況**: ✅ 完了
- カスタムテンプレート作成機能実装済み
- バリデーション実装済み
- 品質スコア自動計算実装済み

#### `GET /api/templates/search`

**説明**: テンプレート検索・推奨（Phase 3.1実装済み）

**クエリパラメータ**:
```typescript
interface SearchTemplatesQuery {
  query?: string          // セマンティック検索クエリ
  filters?: {
    genre?: string
    language?: string
    category?: TemplateCategory
    tags?: string[]
    minQualityScore?: number
  }
  sortBy?: 'relevance' | 'quality' | 'popularity'
  limit?: number
}
```

**レスポンス**:
```typescript
interface SearchTemplatesResponse {
  templates: Template[]
  totalCount: number
  searchStats: {
    processingTime: number
    matchedCriteria: string[]
  }
}
```

**実装状況**: ✅ 完了
- 高度なフィルタリング実装済み
- マルチ条件検索実装済み
- 推奨アルゴリズム実装済み

#### `GET /api/templates/statistics`

**説明**: テンプレート統計情報取得（Phase 3.1実装済み）

**レスポンス**:
```typescript
interface TemplateStatisticsResponse {
  totalTemplates: number
  categoryCounts: {
    'genre-specific': number
    'language-specific': number
    'mood-specific': number
    'custom': number
  }
  topGenres: Array<{
    genre: string
    count: number
  }>
  topLanguages: Array<{
    language: string
    count: number
  }>
  averageQualityScore: number
  totalUsage: number
  popularTemplates: Array<{
    id: string
    name: string
    usageCount: number
    qualityScore: number
  }>
}
```

**実装状況**: ✅ 完了
- 統計分析機能実装済み
- リアルタイム集計実装済み
- ダッシュボード対応済み

---

## 📊 実装完了状況サマリー

### Phase 2 コア機能 ✅ 完了
- **インテリジェントプロンプトジェネレーター**: 232ジャンル、25ムード、70+楽器対応
- **歌詞最適化エンジン**: 構造タグ自動挿入、日本語最適化、3000文字制限管理
- **プロンプト最適化**: 120文字最適化、ジャンル競合検出、成功率予測

### Phase 3 テンプレートライブラリ ✅ 完了
- **テンプレート管理**: 25+プロフェッショナルテンプレート、4カテゴリ分類
- **検索・推奨**: 高度フィルタリング、セマンティック検索、品質スコア管理
- **カスタマイズ**: ユーザー作成テンプレート、使用回数追跡、統計分析

### 実装品質指標
- **テストカバレッジ**: Domain層151テスト全通過
- **型安全性**: TypeScript厳密モード100%準拠
- **アーキテクチャ**: DDD設計完全実装、TDD開発手法確立
- **パフォーマンス**: 高品質テンプレート（品質スコア85-95）

このAPI設計に基づき、Phase 2-3で実装された全機能をWebAPIとして公開し、フロントエンドとの完全な統合を実現できます。