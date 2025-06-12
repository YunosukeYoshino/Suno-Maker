# Suno Maker API設計書

## 🎯 API設計原則

### RESTful設計
- **リソース中心**: エンティティを明確なリソースとして表現
- **HTTPメソッド**: GET（取得）、POST（作成）、PUT（更新）、DELETE（削除）
- **ステータスコード**: 適切なHTTPステータスコードの使用
- **冪等性**: 同じリクエストを複数回送信しても同じ結果

### レスポンス形式
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    timestamp: string
    requestId: string
    version: string
  }
}
```

## 🔌 エンドポイント設計

### 1. プロンプト関連API

#### GET /api/prompts
プロンプト一覧取得

**クエリパラメータ**:
```typescript
interface GetPromptsQuery {
  page?: number           // ページ番号（デフォルト: 1）
  limit?: number          // 取得件数（デフォルト: 20、最大: 100）
  genre?: string[]        // ジャンルフィルター
  language?: string       // 言語フィルター
  isPublic?: boolean      // 公開フィルター
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'qualityScore'
  sortOrder?: 'asc' | 'desc'
  search?: string         // 全文検索
}
```

**レスポンス**:
```typescript
interface GetPromptsResponse {
  prompts: PromptSummary[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface PromptSummary {
  id: string
  title: string
  genre: string
  language: string
  qualityScore: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
}
```

#### GET /api/prompts/:id
特定プロンプト取得

**レスポンス**:
```typescript
interface GetPromptResponse {
  prompt: {
    id: string
    title: string
    genre: string
    language: string
    styleField: string
    tags: string[]
    description: string
    isPublic: boolean
    qualityScore: number
    usageStats: {
      generatedCount: number
      successfulGenerations: number
      averageRating: number
    }
    createdAt: string
    updatedAt: string
  }
}
```

#### POST /api/prompts
プロンプト作成

**リクエストボディ**:
```typescript
interface CreatePromptRequest {
  title: string
  genre: string | string[]    // 単一または複数ジャンル
  language: string
  styleField: string
  tags?: string[]
  description?: string
  isPublic?: boolean
}
```

**レスポンス**:
```typescript
interface CreatePromptResponse {
  prompt: {
    id: string
    title: string
    genre: string
    language: string
    styleField: string
    qualityScore: number
    optimizations: string[]
    warnings: string[]
  }
}
```

#### PUT /api/prompts/:id
プロンプト更新

**リクエストボディ**:
```typescript
interface UpdatePromptRequest {
  title?: string
  genre?: string | string[]
  language?: string
  styleField?: string
  tags?: string[]
  description?: string
  isPublic?: boolean
}
```

#### DELETE /api/prompts/:id
プロンプト削除

**レスポンス**: `204 No Content`

#### POST /api/prompts/generate
プロンプト自動生成

**リクエストボディ**:
```typescript
interface GeneratePromptRequest {
  genre: string | string[]
  language: string
  mood?: string[]
  instruments?: string[]
  energy?: 'low' | 'medium' | 'high'
  complexity?: 'simple' | 'moderate' | 'complex'
  customInstructions?: string
}
```

**レスポンス**:
```typescript
interface GeneratePromptResponse {
  prompt: {
    title: string
    styleField: string
    optimizedStyleField: string
    qualityScore: number
    optimizations: string[]
    suggestions: string[]
  }
  alternatives: {
    styleField: string
    qualityScore: number
  }[]
}
```

#### POST /api/prompts/:id/optimize
プロンプト最適化

**リクエストボディ**:
```typescript
interface OptimizePromptRequest {
  target?: 'quality' | 'suno' | 'creativity'
  constraints?: {
    maxLength?: number
    priorityElements?: string[]
  }
}
```

**レスポンス**:
```typescript
interface OptimizePromptResponse {
  original: string
  optimized: string
  improvements: {
    type: 'length' | 'structure' | 'clarity' | 'genre'
    description: string
    impact: 'low' | 'medium' | 'high'
  }[]
  qualityScoreChange: number
}
```

### 2. 歌詞関連API

#### GET /api/lyrics
歌詞一覧取得

**クエリパラメータ**:
```typescript
interface GetLyricsQuery {
  page?: number
  limit?: number
  language?: string
  hasStructure?: boolean
  minLength?: number
  maxLength?: number
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'characterCount'
  sortOrder?: 'asc' | 'desc'
}
```

#### GET /api/lyrics/:id
特定歌詞取得

#### POST /api/lyrics
歌詞作成

**リクエストボディ**:
```typescript
interface CreateLyricsRequest {
  title: string
  content: string
  language: string
  tags?: string[]
  description?: string
  isPublic?: boolean
}
```

#### PUT /api/lyrics/:id
歌詞更新

#### DELETE /api/lyrics/:id
歌詞削除

#### POST /api/lyrics/:id/optimize
歌詞最適化

**リクエストボディ**:
```typescript
interface OptimizeLyricsRequest {
  target: 'suno' | 'pronunciation' | 'structure'
  language: string
  options?: {
    preserveRhyme?: boolean
    maintainMeaning?: boolean
    enhanceStructure?: boolean
  }
}
```

**レスポンス**:
```typescript
interface OptimizeLyricsResponse {
  original: string
  optimized: string
  changes: {
    line: number
    original: string
    optimized: string
    reason: string
    type: 'pronunciation' | 'structure' | 'length' | 'clarity'
  }[]
  improvements: {
    pronunciationScore: number
    structureScore: number
    sunoCompatibility: number
  }
  warnings: string[]
}
```

#### POST /api/lyrics/analyze
歌詞分析

**リクエストボディ**:
```typescript
interface AnalyzeLyricsRequest {
  content: string
  language: string
}
```

**レスポンス**:
```typescript
interface AnalyzeLyricsResponse {
  analysis: {
    characterCount: number
    wordCount: number
    lineCount: number
    sectionCount: number
    structure: {
      sections: {
        type: string
        lineCount: number
        characterCount: number
      }[]
      hasVerse: boolean
      hasChorus: boolean
      hasBridge: boolean
    }
    language: {
      detected: string
      confidence: number
      complexity: 'simple' | 'moderate' | 'complex'
      pronunciationIssues: string[]
    }
    quality: {
      overall: number
      breakdown: {
        structure: number
        language: number
        length: number
        clarity: number
      }
    }
  }
  suggestions: string[]
  warnings: string[]
}
```

### 3. 楽曲関連API

#### GET /api/songs
楽曲一覧取得

#### GET /api/songs/:id
特定楽曲取得

#### POST /api/songs
楽曲作成

**リクエストボディ**:
```typescript
interface CreateSongRequest {
  title: string
  promptId: string
  lyricsId?: string
  tags?: string[]
  description?: string
  isPublic?: boolean
}
```

#### PUT /api/songs/:id
楽曲更新

#### DELETE /api/songs/:id
楽曲削除

#### POST /api/songs/:id/generate
楽曲生成（Suno連携）

**リクエストボディ**:
```typescript
interface GenerateSongRequest {
  options?: {
    creativity?: 'low' | 'medium' | 'high'
    structure?: 'simple' | 'standard' | 'complex'
    referenceMode?: boolean
  }
}
```

**レスポンス**:
```typescript
interface GenerateSongResponse {
  generationId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  estimatedWaitTime?: number
  sunoUrl?: string
  message?: string
}
```

#### GET /api/songs/:id/generation-status
生成状況確認

**レスポンス**:
```typescript
interface GenerationStatusResponse {
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress?: number
  sunoUrl?: string
  downloadUrl?: string
  error?: string
  completedAt?: string
}
```

### 4. テンプレート関連API

#### GET /api/templates
テンプレート一覧取得

**クエリパラメータ**:
```typescript
interface GetTemplatesQuery {
  type?: 'prompt' | 'lyrics' | 'combined'
  genre?: string
  language?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  popularity?: 'trending' | 'popular' | 'new'
}
```

**レスポンス**:
```typescript
interface GetTemplatesResponse {
  templates: {
    id: string
    name: string
    description: string
    type: 'prompt' | 'lyrics' | 'combined'
    genre: string
    language: string
    difficulty: string
    usageCount: number
    rating: number
    preview: {
      prompt?: string
      lyrics?: string
    }
    tags: string[]
  }[]
}
```

#### GET /api/templates/:id
特定テンプレート取得

#### POST /api/templates/:id/use
テンプレート使用

**リクエストボディ**:
```typescript
interface UseTemplateRequest {
  customizations?: {
    genre?: string
    language?: string
    mood?: string
    [key: string]: any
  }
}
```

### 5. 統計・分析API

#### GET /api/analytics/overview
全体統計

**レスポンス**:
```typescript
interface AnalyticsOverviewResponse {
  totals: {
    prompts: number
    lyrics: number
    songs: number
    generations: number
  }
  trends: {
    period: 'day' | 'week' | 'month'
    promptsCreated: number[]
    lyricsCreated: number[]
    songsGenerated: number[]
  }
  popular: {
    genres: { name: string; count: number }[]
    languages: { code: string; name: string; count: number }[]
    templates: { id: string; name: string; usageCount: number }[]
  }
}
```

#### GET /api/analytics/genres
ジャンル分析

#### GET /api/analytics/languages
言語分析

#### GET /api/analytics/quality
品質分析

### 6. ユーティリティAPI

#### GET /api/genres
サポートジャンル一覧

**レスポンス**:
```typescript
interface GetGenresResponse {
  genres: {
    main: {
      id: string
      name: string
      description: string
      subGenres: {
        id: string
        name: string
        description: string
      }[]
    }[]
  }
}
```

#### GET /api/languages
サポート言語一覧

**レスポンス**:
```typescript
interface GetLanguagesResponse {
  languages: {
    code: string
    name: string
    nativeName: string
    qualityLevel: 'highest' | 'high' | 'medium' | 'basic'
    recommendedScript: string
    mixCompatible: string[]
  }[]
}
```

#### POST /api/validate/prompt
プロンプトバリデーション

**リクエストボディ**:
```typescript
interface ValidatePromptRequest {
  styleField: string
  genre: string
  language: string
}
```

**レスポンス**:
```typescript
interface ValidatePromptResponse {
  isValid: boolean
  errors: string[]
  warnings: string[]
  qualityScore: number
  suggestions: string[]
}
```

#### POST /api/validate/lyrics
歌詞バリデーション

**リクエストボディ**:
```typescript
interface ValidateLyricsRequest {
  content: string
  language: string
  target?: 'suno' | 'general'
}
```

## 🔐 認証・認可

### JWT認証
```typescript
interface AuthTokenPayload {
  userId: string
  email: string
  role: 'user' | 'premium' | 'admin'
  plan: 'free' | 'pro' | 'premium'
  iat: number
  exp: number
}
```

### APIキー認証（将来実装）
```http
Authorization: Bearer sk_live_xxxxxxxxxxxxx
X-API-Version: 2024-12-01
```

### レート制限
```typescript
interface RateLimit {
  free: {
    prompts: '10/hour',
    lyrics: '5/hour',
    generations: '2/day'
  },
  pro: {
    prompts: '100/hour',
    lyrics: '50/hour', 
    generations: '20/day'
  },
  premium: {
    prompts: '500/hour',
    lyrics: '200/hour',
    generations: '100/day'
  }
}
```

## 🔄 WebSocket API（リアルタイム機能）

### 楽曲生成進捗
```typescript
// クライアント → サーバー
interface SubscribeGenerationRequest {
  type: 'subscribe_generation'
  songId: string
}

// サーバー → クライアント
interface GenerationProgressUpdate {
  type: 'generation_progress'
  songId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  message?: string
  sunoUrl?: string
}
```

### リアルタイム協力編集（将来実装）
```typescript
interface CollaborationUpdate {
  type: 'content_update'
  documentId: string
  userId: string
  changes: {
    operation: 'insert' | 'delete' | 'retain'
    position: number
    content?: string
    length?: number
  }[]
  timestamp: number
}
```

## 📊 エラーハンドリング

### 標準エラーレスポンス
```typescript
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: {
      field?: string
      value?: any
      constraint?: string
    }
  }
  meta: {
    timestamp: string
    requestId: string
  }
}
```

### エラーコード一覧
```typescript
enum ErrorCodes {
  // 認証・認可
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // バリデーション
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_GENRE = 'INVALID_GENRE',
  INVALID_LANGUAGE = 'INVALID_LANGUAGE',
  CONTENT_TOO_LONG = 'CONTENT_TOO_LONG',
  
  // リソース
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  
  // レート制限
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // 外部サービス
  SUNO_API_ERROR = 'SUNO_API_ERROR',
  GENERATION_FAILED = 'GENERATION_FAILED',
  
  // システム
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}
```

## 📝 OpenAPI仕様書（抜粋）

```yaml
openapi: 3.0.3
info:
  title: Suno Maker API
  description: AI音楽プロンプト＆歌詞ジェネレーターAPI
  version: 1.0.0
  
servers:
  - url: https://api.sunomaker.com/v1
    description: 本番環境
  - url: https://api-staging.sunomaker.com/v1
    description: ステージング環境

paths:
  /prompts:
    get:
      summary: プロンプト一覧取得
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetPromptsResponse'
                
    post:
      summary: プロンプト作成
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreatePromptRequest'
      responses:
        '201':
          description: 作成成功
        '400':
          description: バリデーションエラー
        '401':
          description: 認証エラー

components:
  schemas:
    CreatePromptRequest:
      type: object
      required:
        - title
        - genre
        - language
        - styleField
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 100
        genre:
          oneOf:
            - type: string
            - type: array
              items:
                type: string
        language:
          type: string
          pattern: '^[a-z]{2}$'
        styleField:
          type: string
          maxLength: 120
        tags:
          type: array
          items:
            type: string
          maxItems: 10
        description:
          type: string
          maxLength: 500
        isPublic:
          type: boolean
          default: false
          
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      
security:
  - BearerAuth: []
```

## 🧪 API テスト戦略

### 単体テスト（Jest）
```typescript
describe('POST /api/prompts', () => {
  it('should create prompt with valid data', async () => {
    const response = await request(app)
      .post('/api/prompts')
      .send({
        title: 'Test Prompt',
        genre: 'Rock',
        language: 'en',
        styleField: 'Rock, energetic, electric guitar'
      })
      .expect(201)
      
    expect(response.body.success).toBe(true)
    expect(response.body.data.prompt.id).toBeDefined()
  })
  
  it('should reject invalid genre', async () => {
    await request(app)
      .post('/api/prompts')
      .send({
        title: 'Test Prompt',
        genre: 'InvalidGenre',
        language: 'en',
        styleField: 'Test style'
      })
      .expect(400)
  })
})
```

### 統合テスト（Playwright）
```typescript
test('Prompt creation flow', async ({ page, request }) => {
  // API経由でユーザー作成
  const user = await request.post('/api/auth/register', {
    data: { email: 'test@example.com', password: 'password' }
  })
  
  // UIでプロンプト作成
  await page.goto('/prompt-generator')
  await page.fill('[data-testid=title]', 'Test Prompt')
  await page.selectOption('[data-testid=genre]', 'Rock')
  await page.click('[data-testid=create-button]')
  
  // API経由で作成確認
  const prompts = await request.get('/api/prompts')
  expect(prompts.data.prompts).toHaveLength(1)
})
```

## 📈 パフォーマンス最適化

### キャッシュ戦略
```typescript
// Redis キャッシュ
interface CacheStrategy {
  genres: 'cache-aside, TTL: 1hour',
  languages: 'cache-aside, TTL: 1hour',
  templates: 'write-through, TTL: 30min',
  prompts: 'write-behind, TTL: 15min',
  analytics: 'cache-aside, TTL: 5min'
}
```

### データベース最適化
```sql
-- インデックス戦略
CREATE INDEX idx_prompts_genre_language ON prompts(genre, language);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_lyrics_language_public ON lyrics(language, is_public);
CREATE INDEX idx_songs_rating_plays ON songs(rating DESC, play_count DESC);

-- パーティショニング（将来）
PARTITION TABLE prompts BY RANGE (created_at);
```

---

この API 設計により、スケーラブルで使いやすい Suno Maker API の実現を目指します。