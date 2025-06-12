# Suno Maker テスト戦略書

## 🎯 テスト方針

### テスト駆動開発（TDD）の徹底
```mermaid
graph LR
    A[🔴 Red: 失敗するテストを書く] --> B[🟢 Green: 最小限の実装で通す]
    B --> C[🔄 Refactor: コードを改善]
    C --> A
```

### テストピラミッド戦略
```
       🔺 E2E Tests (10%)
      ────────────────────
     🔺🔺 Integration Tests (20%)
    ──────────────────────────────
   🔺🔺🔺 Unit Tests (70%)
  ────────────────────────────────────
```

### 品質目標
- **テストカバレッジ**: 90%以上（ドメイン層100%必須）
- **実行時間**: 単体テスト < 10秒、統合テスト < 30秒、E2E < 2分
- **フレイキーテスト**: 0%（不安定なテストは即座に修正）
- **メンテナンス性**: 1つの機能変更で修正が必要なテスト数 < 3

## 🧪 テスト分類と実装戦略

### 1. 単体テスト（Unit Tests）- 70%

#### 1.1 ドメイン層テスト
**対象**: エンティティ、値オブジェクト、ドメインサービス  
**目標カバレッジ**: 100%

```typescript
// Genre 値オブジェクトテスト例
describe('Genre Value Object', () => {
  describe('作成', () => {
    it('有効なジャンルで作成できる', () => {
      const genre = Genre.create('Rock')
      expect(genre.value).toBe('Rock')
    })

    it('複合ジャンルを作成できる', () => {
      const genre = Genre.create(['Rock', 'Pop'])
      expect(genre.value).toEqual(['Rock', 'Pop'])
    })

    it('空文字列では作成できない', () => {
      expect(() => Genre.create('')).toThrow('ジャンル名は空文字列にできません')
    })
  })

  describe('バリデーション', () => {
    it('サポートされているジャンルを判定できる', () => {
      expect(Genre.isSupported('Rock')).toBe(true)
      expect(Genre.isSupported('InvalidGenre')).toBe(false)
    })

    it('重複ジャンルを検出できる', () => {
      expect(Genre.isValidCombination(['Rock', 'Rock'])).toBe(false)
    })
  })

  describe('プロンプト生成', () => {
    it('優先度付きプロンプト文字列を生成できる', () => {
      const genre = Genre.create('Rock')
      expect(genre.toPromptString({ priority: 'high' })).toBe('ROCK')
    })
  })
})
```

```typescript
// Prompt エンティティテスト例
describe('Prompt Entity', () => {
  let validProps: PromptProps

  beforeEach(() => {
    validProps = {
      title: 'Rock Ballad Prompt',
      genre: Genre.create('Rock'),
      language: Language.create('en'),
      styleField: StyleField.create('Rock, emotional, electric guitar'),
    }
  })

  describe('ビジネスロジック', () => {
    it('プロンプト文字列を生成できる', () => {
      const prompt = Prompt.create(validProps)
      const result = prompt.generatePromptString()
      
      expect(result.style).toContain('Rock')
      expect(result.language).toBe('en')
      expect(result.characterCount).toBeLessThanOrEqual(120)
    })

    it('品質スコアを計算できる', () => {
      const prompt = Prompt.create(validProps)
      const score = prompt.calculateQualityScore()
      
      expect(score.overall).toBeGreaterThan(0)
      expect(score.overall).toBeLessThanOrEqual(100)
      expect(score.breakdown.genreClarity).toBeDefined()
    })

    it('最適化提案を生成できる', () => {
      const prompt = Prompt.create(validProps)
      const optimized = prompt.generateOptimizedPrompt()
      
      expect(optimized.styleField.length).toBeLessThanOrEqual(120)
      expect(optimized.optimizationApplied).toBeArray()
    })
  })

  describe('不変性', () => {
    it('更新時に新しいインスタンスを返す', () => {
      const prompt = Prompt.create(validProps)
      const updated = prompt.updateTitle('New Title')
      
      expect(updated).not.toBe(prompt)
      expect(updated.title).toBe('New Title')
      expect(prompt.title).toBe('Rock Ballad Prompt')
    })
  })
})
```

#### 1.2 アプリケーション層テスト
**対象**: ユースケース、アプリケーションサービス  
**目標カバレッジ**: 95%

```typescript
// GeneratePromptUseCase テスト例
describe('GeneratePromptUseCase', () => {
  let useCase: GeneratePromptUseCase
  let mockRepository: jest.Mocked<IPromptRepository>
  let mockOptimizationService: jest.Mocked<PromptOptimizationService>

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByFilters: jest.fn(),
    } as any

    mockOptimizationService = {
      optimize: jest.fn(),
      calculateQualityScore: jest.fn(),
    } as any

    useCase = new GeneratePromptUseCase(
      mockRepository,
      mockOptimizationService
    )
  })

  describe('プロンプト生成', () => {
    it('有効な入力でプロンプトを生成できる', async () => {
      const input = {
        genre: Genre.create('Rock'),
        language: Language.create('en'),
        mood: ['energetic'],
        instruments: ['electric guitar']
      }

      mockOptimizationService.optimize.mockResolvedValue({
        styleField: 'Rock, energetic, electric guitar',
        optimizations: ['文字数最適化'],
        qualityScore: 85
      })

      const result = await useCase.execute(input)

      expect(result.prompt).toBeInstanceOf(Prompt)
      expect(result.qualityScore).toBe(85)
      expect(mockRepository.save).toHaveBeenCalledWith(result.prompt)
    })

    it('無効なジャンルでエラーをスローする', async () => {
      const input = {
        genre: 'InvalidGenre' as any,
        language: Language.create('en')
      }

      await expect(useCase.execute(input)).rejects.toThrow('無効なジャンルです')
    })

    it('最適化に失敗した場合でも基本プロンプトを返す', async () => {
      const input = {
        genre: Genre.create('Rock'),
        language: Language.create('en')
      }

      mockOptimizationService.optimize.mockRejectedValue(new Error('最適化エラー'))

      const result = await useCase.execute(input)
      
      expect(result.prompt).toBeInstanceOf(Prompt)
      expect(result.warnings).toContain('最適化に失敗しました')
    })
  })
})
```

#### 1.3 プレゼンテーション層テスト
**対象**: React コンポーネント、Hooks  
**目標カバレッジ**: 85%

```typescript
// PromptGenerator コンポーネントテスト例
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PromptGenerator } from '../PromptGenerator'

describe('PromptGenerator Component', () => {
  const mockOnPromptGenerated = jest.fn()

  beforeEach(() => {
    mockOnPromptGenerated.mockClear()
  })

  describe('レンダリング', () => {
    it('必要な要素が表示される', () => {
      render(<PromptGenerator onPromptGenerated={mockOnPromptGenerated} />)
      
      expect(screen.getByLabelText('ジャンル')).toBeInTheDocument()
      expect(screen.getByLabelText('言語')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '生成' })).toBeInTheDocument()
    })

    it('初期値が正しく設定される', () => {
      const initialGenre = Genre.create('Rock')
      
      render(
        <PromptGenerator 
          onPromptGenerated={mockOnPromptGenerated}
          initialGenre={initialGenre}
        />
      )
      
      expect(screen.getByDisplayValue('Rock')).toBeInTheDocument()
    })
  })

  describe('ユーザーインタラクション', () => {
    it('ジャンル選択時に状態が更新される', async () => {
      const user = userEvent.setup()
      
      render(<PromptGenerator onPromptGenerated={mockOnPromptGenerated} />)
      
      const genreSelect = screen.getByLabelText('ジャンル')
      await user.selectOptions(genreSelect, 'Jazz')
      
      expect(genreSelect).toHaveValue('Jazz')
    })

    it('生成ボタンクリック時にプロンプトが生成される', async () => {
      const user = userEvent.setup()
      
      render(<PromptGenerator onPromptGenerated={mockOnPromptGenerated} />)
      
      // フォーム入力
      await user.selectOptions(screen.getByLabelText('ジャンル'), 'Rock')
      await user.selectOptions(screen.getByLabelText('言語'), 'en')
      await user.type(screen.getByLabelText('ムード'), 'energetic')
      
      // 生成実行
      await user.click(screen.getByRole('button', { name: '生成' }))
      
      await waitFor(() => {
        expect(mockOnPromptGenerated).toHaveBeenCalledWith(
          expect.objectContaining({
            genre: expect.any(Object),
            language: expect.any(Object)
          })
        )
      })
    })
  })

  describe('バリデーション', () => {
    it('必須フィールドが未入力時にエラーを表示', async () => {
      const user = userEvent.setup()
      
      render(<PromptGenerator onPromptGenerated={mockOnPromptGenerated} />)
      
      await user.click(screen.getByRole('button', { name: '生成' }))
      
      expect(screen.getByText('ジャンルを選択してください')).toBeInTheDocument()
    })

    it('無効なスタイルフィールド長でエラーを表示', async () => {
      const user = userEvent.setup()
      
      render(<PromptGenerator onPromptGenerated={mockOnPromptGenerated} />)
      
      const longText = 'A'.repeat(121)
      await user.type(screen.getByLabelText('スタイル'), longText)
      
      expect(screen.getByText('120文字以内で入力してください')).toBeInTheDocument()
    })
  })
})
```

### 2. 統合テスト（Integration Tests）- 20%

#### 2.1 API統合テスト
**対象**: エンドポイント、ミドルウェア、データベース連携

```typescript
// プロンプトAPI統合テスト例
describe('Prompts API Integration', () => {
  let app: Express
  let testDb: TestDatabase

  beforeAll(async () => {
    testDb = await setupTestDatabase()
    app = createTestApp(testDb)
  })

  afterAll(async () => {
    await testDb.cleanup()
  })

  beforeEach(async () => {
    await testDb.reset()
  })

  describe('POST /api/prompts', () => {
    it('有効なデータでプロンプトを作成できる', async () => {
      const promptData = {
        title: 'Test Prompt',
        genre: 'Rock',
        language: 'en',
        styleField: 'Rock, energetic, electric guitar'
      }

      const response = await request(app)
        .post('/api/prompts')
        .send(promptData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.prompt.id).toBeDefined()
      expect(response.body.data.prompt.qualityScore).toBeGreaterThan(0)

      // データベース確認
      const savedPrompt = await testDb.prompts.findById(response.body.data.prompt.id)
      expect(savedPrompt).toBeDefined()
      expect(savedPrompt.title).toBe('Test Prompt')
    })

    it('重複タイトルで409エラーを返す', async () => {
      // 既存プロンプト作成
      await testDb.prompts.create({
        title: 'Duplicate Title',
        genre: 'Rock',
        language: 'en',
        styleField: 'Rock'
      })

      const response = await request(app)
        .post('/api/prompts')
        .send({
          title: 'Duplicate Title',
          genre: 'Pop',
          language: 'en',
          styleField: 'Pop'
        })
        .expect(409)

      expect(response.body.error.code).toBe('ALREADY_EXISTS')
    })

    it('無効なジャンルで400エラーを返す', async () => {
      const response = await request(app)
        .post('/api/prompts')
        .send({
          title: 'Test Prompt',
          genre: 'InvalidGenre',
          language: 'en',
          styleField: 'Test'
        })
        .expect(400)

      expect(response.body.error.code).toBe('INVALID_GENRE')
    })
  })

  describe('GET /api/prompts', () => {
    beforeEach(async () => {
      // テストデータ作成
      await testDb.prompts.createMany([
        { title: 'Rock Prompt', genre: 'Rock', language: 'en' },
        { title: 'Pop Prompt', genre: 'Pop', language: 'ja' },
        { title: 'Jazz Prompt', genre: 'Jazz', language: 'en' }
      ])
    })

    it('全プロンプトを取得できる', async () => {
      const response = await request(app)
        .get('/api/prompts')
        .expect(200)

      expect(response.body.data.prompts).toHaveLength(3)
      expect(response.body.data.pagination.total).toBe(3)
    })

    it('ジャンルフィルターが動作する', async () => {
      const response = await request(app)
        .get('/api/prompts?genre=Rock')
        .expect(200)

      expect(response.body.data.prompts).toHaveLength(1)
      expect(response.body.data.prompts[0].genre).toBe('Rock')
    })

    it('ページネーションが動作する', async () => {
      const response = await request(app)
        .get('/api/prompts?page=1&limit=2')
        .expect(200)

      expect(response.body.data.prompts).toHaveLength(2)
      expect(response.body.data.pagination.hasNext).toBe(true)
    })
  })
})
```

#### 2.2 ユースケース統合テスト
**対象**: ユースケースとリポジトリの連携

```typescript
describe('PromptGeneration Integration', () => {
  let dependencies: Dependencies
  let useCase: GeneratePromptUseCase

  beforeEach(() => {
    dependencies = createTestDependencies()
    useCase = new GeneratePromptUseCase(
      dependencies.promptRepository,
      dependencies.optimizationService
    )
  })

  it('エンドツーエンドでプロンプト生成が動作する', async () => {
    const input = {
      genre: Genre.create(['Rock', 'Blues']),
      language: Language.create('en'),
      mood: ['energetic', 'dark'],
      instruments: ['electric guitar', 'drums']
    }

    const result = await useCase.execute(input)

    // 結果検証
    expect(result.prompt).toBeInstanceOf(Prompt)
    expect(result.prompt.genre.value).toEqual(['Rock', 'Blues'])
    expect(result.qualityScore).toBeGreaterThan(70)

    // リポジトリ保存確認
    const savedPrompt = await dependencies.promptRepository.findById(result.prompt.id)
    expect(savedPrompt).toBeDefined()
    expect(savedPrompt.equals(result.prompt)).toBe(true)

    // 最適化検証
    expect(result.optimizations).toContainEqual(
      expect.stringContaining('複合ジャンル最適化')
    )
  })
})
```

### 3. E2Eテスト（End-to-End Tests）- 10%

#### 3.1 ユーザージャーニーテスト
**対象**: 実際のユーザーワークフロー

```typescript
// Playwright E2Eテスト例
import { test, expect } from '@playwright/test'

test.describe('プロンプト作成フロー', () => {
  test('初心者ユーザーがプロンプトを作成できる', async ({ page }) => {
    // ランディングページ
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Suno Maker')
    
    // プロンプト作成開始
    await page.click('text=プロンプトを作成')
    
    // ジャンル選択
    await page.selectOption('[data-testid=genre-selector]', 'Rock')
    await expect(page.locator('[data-testid=genre-preview]')).toContainText('Rock')
    
    // 言語選択
    await page.selectOption('[data-testid=language-selector]', 'en')
    
    // ムード設定
    await page.click('[data-testid=mood-energetic]')
    await page.click('[data-testid=mood-emotional]')
    
    // 楽器選択
    await page.click('[data-testid=instrument-electric-guitar]')
    await page.click('[data-testid=instrument-drums]')
    
    // スタイルフィールド確認
    const styleField = page.locator('[data-testid=style-field-preview]')
    await expect(styleField).toContainText('Rock')
    await expect(styleField).toContainText('energetic')
    await expect(styleField).toContainText('electric guitar')
    
    // 最適化提案確認
    await expect(page.locator('[data-testid=optimization-suggestions]')).toBeVisible()
    
    // プロンプト生成
    await page.click('[data-testid=generate-button]')
    
    // 結果確認
    await expect(page.locator('[data-testid=generated-prompt]')).toBeVisible()
    await expect(page.locator('[data-testid=quality-score]')).toContainText(/\d+/)
    
    // 保存
    await page.fill('[data-testid=prompt-title]', 'My Rock Prompt')
    await page.click('[data-testid=save-button]')
    
    // 成功メッセージ
    await expect(page.locator('[data-testid=success-message]')).toContainText('保存されました')
    
    // 履歴確認
    await page.click('[data-testid=history-tab]')
    await expect(page.locator('[data-testid=prompt-history]')).toContainText('My Rock Prompt')
  })

  test('歌詞作成からSuno連携まで', async ({ page }) => {
    // プロンプト作成（前のテストの流れ）
    await createPrompt(page, {
      genre: 'Pop',
      language: 'ja',
      title: 'J-Pop Ballad'
    })
    
    // 歌詞作成に移動
    await page.click('[data-testid=create-lyrics-button]')
    
    // 歌詞エディター
    const lyricsContent = `[Verse]
やさしい あの ひとの えがお
こころに のこる おもいで

[Chorus]
あいしてる ずっと あいしてる
きみの ことを わすれない`
    
    await page.fill('[data-testid=lyrics-editor]', lyricsContent)
    
    // 構造分析確認
    await expect(page.locator('[data-testid=structure-analysis]')).toContainText('Verse: 2行')
    await expect(page.locator('[data-testid=structure-analysis]')).toContainText('Chorus: 2行')
    
    // 日本語最適化提案
    await expect(page.locator('[data-testid=language-suggestions]')).toContainText('ひらがな表記')
    
    // 歌詞保存
    await page.fill('[data-testid=lyrics-title]', 'やさしい思い出')
    await page.click('[data-testid=save-lyrics-button]')
    
    // 楽曲作成
    await page.click('[data-testid=create-song-button]')
    await page.fill('[data-testid=song-title]', '思い出のメロディー')
    
    // 品質チェック
    const qualityScore = await page.textContent('[data-testid=song-quality-score]')
    expect(parseInt(qualityScore)).toBeGreaterThan(80)
    
    // Suno連携（モック）
    await page.click('[data-testid=generate-with-suno]')
    await expect(page.locator('[data-testid=generation-status]')).toContainText('生成中')
    
    // 生成完了（モック）
    await page.waitForSelector('[data-testid=suno-url]', { timeout: 10000 })
    await expect(page.locator('[data-testid=suno-url]')).toBeVisible()
  })
})

// ヘルパー関数
async function createPrompt(page, options) {
  await page.goto('/prompt-generator')
  await page.selectOption('[data-testid=genre-selector]', options.genre)
  await page.selectOption('[data-testid=language-selector]', options.language)
  await page.click('[data-testid=generate-button]')
  await page.fill('[data-testid=prompt-title]', options.title)
  await page.click('[data-testid=save-button]')
}
```

#### 3.2 パフォーマンステスト

```typescript
test.describe('パフォーマンス', () => {
  test('プロンプト生成が3秒以内に完了する', async ({ page }) => {
    await page.goto('/prompt-generator')
    
    const startTime = Date.now()
    
    await page.selectOption('[data-testid=genre-selector]', 'Rock')
    await page.selectOption('[data-testid=language-selector]', 'en')
    await page.click('[data-testid=generate-button]')
    
    await page.waitForSelector('[data-testid=generated-prompt]')
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    expect(duration).toBeLessThan(3000)
  })

  test('大量データ処理でメモリリークしない', async ({ page }) => {
    await page.goto('/prompt-generator')
    
    // 100回プロンプト生成
    for (let i = 0; i < 100; i++) {
      await page.click('[data-testid=generate-button]')
      await page.waitForSelector('[data-testid=generated-prompt]')
      
      // メモリ使用量チェック
      if (i % 10 === 0) {
        const metrics = await page.evaluate(() => performance.memory)
        expect(metrics.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024) // 50MB
      }
    }
  })
})
```

## 🔧 テスト環境とツール

### テストランナー設定

#### Vitest設定（単体・統合テスト）
```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test-setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'src/domain/': {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100
        }
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

#### Playwright設定（E2Eテスト）
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'bun dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### モック・スタブ戦略

#### リポジトリモック
```typescript
// テストヘルパー
export function createMockPromptRepository(): jest.Mocked<IPromptRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findByFilters: jest.fn(),
    findByGenre: jest.fn(),
    findByLanguage: jest.fn(),
    findByTags: jest.fn(),
    findPublicPrompts: jest.fn(),
    findUserPrompts: jest.fn(),
    findTrendingPrompts: jest.fn(),
    findRecommendedPrompts: jest.fn(),
    getPromptCount: jest.fn(),
    getPublicPromptCount: jest.fn(),
    getGenreDistribution: jest.fn(),
    getLanguageDistribution: jest.fn(),
    getQualityScoreDistribution: jest.fn(),
    saveBatch: jest.fn(),
    deleteBatch: jest.fn(),
    findByIds: jest.fn(),
    searchByText: jest.fn(),
    searchBySimilarity: jest.fn(),
    exists: jest.fn(),
    getLastUpdated: jest.fn(),
    cleanup: jest.fn()
  }
}

// 使用例
describe('テストでのモック使用', () => {
  let mockRepo: jest.Mocked<IPromptRepository>

  beforeEach(() => {
    mockRepo = createMockPromptRepository()
  })

  it('保存が呼ばれることを確認', async () => {
    const prompt = Prompt.create(validProps)
    
    await mockRepo.save(prompt)
    
    expect(mockRepo.save).toHaveBeenCalledWith(prompt)
    expect(mockRepo.save).toHaveBeenCalledTimes(1)
  })
})
```

#### 外部API モック
```typescript
// Suno API モック
export class MockSunoAPI implements ISunoAPI {
  private responses: Map<string, any> = new Map()

  setResponse(endpoint: string, response: any) {
    this.responses.set(endpoint, response)
  }

  async generateSong(prompt: string, lyrics: string): Promise<SunoGenerationResponse> {
    const mockResponse = this.responses.get('generateSong') || {
      id: 'mock-generation-id',
      status: 'completed',
      url: 'https://mock-suno.com/song/123',
      audioUrl: 'https://mock-suno.com/audio/123.mp3'
    }
    
    return mockResponse
  }
}
```

## 📊 テストメトリクス・レポート

### カバレッジレポート
```bash
# カバレッジ実行
bun test --coverage

# レポート生成
bun test --coverage --reporter=html
```

### CI/CD統合
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: bun install
        
      - name: Run unit tests
        run: bun test --coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      
      - name: Start test database
        run: docker-compose up -d test-db
        
      - name: Run integration tests
        run: bun test:integration
        
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      
      - name: Install Playwright
        run: bunx playwright install --with-deps
        
      - name: Build application
        run: bun build
        
      - name: Run E2E tests
        run: bun test:e2e
        
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### パフォーマンス監視
```typescript
// テストパフォーマンス監視
describe('パフォーマンステスト', () => {
  it('プロンプト生成が性能要件を満たす', async () => {
    const iterations = 100
    const times: number[] = []
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      
      await generatePrompt({
        genre: Genre.create('Rock'),
        language: Language.create('en')
      })
      
      const end = performance.now()
      times.push(end - start)
    }
    
    const average = times.reduce((a, b) => a + b) / times.length
    const p95 = times.sort()[Math.floor(times.length * 0.95)]
    
    expect(average).toBeLessThan(100) // 平均100ms以下
    expect(p95).toBeLessThan(200)     // 95%tile 200ms以下
  })
})
```

## 🚀 継続的品質改善

### テストの自動化
- **プリコミットフック**: リント・フォーマット・単体テスト
- **PR時**: 全テストスイート実行
- **マージ時**: E2Eテスト・デプロイ

### 品質ゲート
```typescript
// 品質ゲート設定
const qualityGates = {
  coverage: {
    overall: 90,
    domain: 100,
    application: 95,
    presentation: 85
  },
  performance: {
    unitTestTime: 10000,   // 10秒
    integrationTestTime: 30000, // 30秒
    e2eTestTime: 120000    // 2分
  },
  reliability: {
    flakyTestThreshold: 0,
    testSuccessRate: 99
  }
}
```

### テストメンテナンス
- **週次**: フレイキーテストの確認・修正
- **月次**: テストコードの品質レビュー
- **リリース前**: 全テストスイートの実行・確認

---

この包括的なテスト戦略により、Suno Makerの品質と信頼性を確保し、継続的な改善を実現します。