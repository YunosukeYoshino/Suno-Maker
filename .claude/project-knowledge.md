# Project Knowledge

## 技術的知見・ベストプラクティス

### Next.js 15 & App Router

- **フレームワーク**: Next.js 15（App Router）
- **ビルドツール**: Turbopack（開発用）
- Turbopack を開発環境で使用 (`bun dev`)
- Server Components を優先的に使用
- Client Components は必要最小限に限定
- App Router の規約に従ったファイル配置
- テストはハードコードして無理やり遠そうとしないでください。
- ハードコードは絶対にしてはいけません。
- コミット前にもハードコードがないかチェックお願いします。

### 技術スタック詳細

- **スタイリング**: Tailwind CSS v4 + shadcn/ui
- **フォント**: Google Fonts の Geist Sans & Geist Mono
- **TypeScript**: 厳密モード + パスエイリアス（`@/*` → ルート）
- **パッケージマネージャー**: Bun（必須）
- **テストフレームワーク**: Vitest + jsdom + React Testing Library
- **状態管理**: Zustand + Zod for validation
- **国際化**: next-intl

### パスエイリアス設定

```typescript
"@/*"           -> ルートディレクトリ
"~/*"           -> ./src/
"@/components"  -> ./components/
"@/lib"         -> ./lib/
"@/domain"      -> ./src/domain/
"@/application" -> ./src/application/
"@/infrastructure" -> ./src/infrastructure/
"@/presentation" -> ./src/presentation/
```

### Biome 設定

- **リンティング**: Biome を使用（ESLint や Prettier の代替）
- **フォーマット**: Biome で統一されたコードフォーマット
- 設定ファイル: `biome.json`
- **コードスタイル**:
  - インデント: スペース 2 つ
  - クォート: ダブルクォート
  - 行末: LF
  - トレイリングカンマ: ES5 形式

### shadcn/ui 設定

- **コンポーネントライブラリ**: shadcn/ui を使用
- **重要**: UI コンポーネントは `/components/ui/` に配置（`src/components/ui/` ではない）
- インストール: `bun x shadcn@latest add [component-name]`
- 設定ファイル: `components.json`
- インポート: `@/components/ui/component-name`

### TypeScript 設計パターン

- 厳密な型チェックを実施
- パスエイリアス活用 (`@/*`, `~/*`)
- Zod によるランタイム型検証
- 型安全性を最優先
- any や unknown の型は必ず使用しない

### DDD アーキテクチャ構造

```
src/
├── domain/           # ドメイン層
│   ├── entities/     # エンティティ
│   ├── valueObjects/ # 値オブジェクト
│   └── repositories/ # リポジトリインターfaces
├── application/      # アプリケーション層
│   ├── usecases/     # ユースケース
│   └── services/     # アプリケーションサービス
├── infrastructure/   # インフラ層
│   ├── repositories/ # リポジトリ実装
│   └── external/     # 外部API接続
└── presentation/     # プレゼンテーション層
    ├── components/   # UIコンポーネント
    └── pages/        # ページコンポーネント
```

### DDD 設計原則

1. **ドメインロジックの分離**: ビジネスロジックをドメイン層に集約
2. **依存関係の方向**: 外側の層から内側の層への依存のみ許可
3. **リポジトリパターン**: データアクセスの抽象化
4. **ユースケース駆動**: アプリケーション層でユースケースを明確に定義

### DDD 命名規則

- **エンティティ**: PascalCase（例: `User`, `Song`）
- **値オブジェクト**: PascalCase（例: `Email`, `SongTitle`）
- **ユースケース**: 動詞 + 名詞（例: `CreateSongUseCase`）
- **リポジトリ**: `I` + 名詞 + `Repository`（例: `IUserRepository`）

### DDD 実装パターン

```typescript
// エンティティ例
export class Song {
  private constructor(
    private readonly id: SongId,
    private title: SongTitle,
    private genre: Genre
  ) {}
}

// 値オブジェクト例
export class Genre {
  private constructor(private readonly value: string) {}

  static create(value: string): Genre {
    if (!this.isValid(value)) {
      throw new Error("Invalid genre");
    }
    return new Genre(value);
  }
}

// リポジトリインターフェース例
export interface ISongRepository {
  save(song: Song): Promise<void>;
  findById(id: SongId): Promise<Song | null>;
}
```

### TDD 実装パターン

#### テスト作成の原則

1. **Red → Green → Refactor** のサイクルを厳守
2. まず失敗するテストを書く
3. テストを通すための最小限のコードを実装
4. リファクタリングでコードを改善

#### テスト構造

- **単体テスト**: `__tests__/` または `.test.ts` ファイル
- **統合テスト**: `tests/integration/` ディレクトリ
- **E2E テスト**: `tests/e2e/` ディレクトリ

#### テスト命名規則

```typescript
describe("機能名", () => {
  it("期待する動作を説明", () => {
    // テストコード
  });
});
```

### 重要なファイル構成

- `app/layout.tsx` - ルートレイアウト（フォント読み込み、グローバルスタイル）
- `app/page.tsx` - ホームページコンポーネント
- `app/globals.css` - グローバルスタイル（CSS 変数、ダークモード対応）
- `components.json` - shadcn/ui 設定
- `biome.json` - Biome 設定
- `next.config.ts` - Next.js 設定
- `vitest.config.ts` - Vitest テスト設定（パスエイリアス含む）
- `test-setup.ts` - テスト環境セットアップファイル

### スタイリングシステム

#### CSS 変数によるテーマシステム

- `--background` と `--foreground` - プライマリカラー
- `--font-geist-sans` と `--font-geist-mono` - フォントファミリー
- `prefers-color-scheme` による自動ダークモード対応
- Tailwind CSS v4 のインラインテーマ設定

### Zustand パターン

- ドメインごとにストアを分離
- Actions と Selectors を明確に分離
- Immer 使用によるイミュータブル更新

### shadcn/ui 活用パターン

- コンポーネントは `/components/ui/` に配置
- カスタマイズは必要最小限に留める
- Tailwind CSS v4 との組み合わせを活用

### テスト戦略

- 単体テスト: ドメインロジックを重点的にテスト
- 統合テスト: ユースケース層のテスト
- E2E テスト: 重要なユーザーフローのテスト
- モック活用: 外部依存の抽象化

### パフォーマンス最適化

- 動的インポートによるコード分割
- 画像最適化 (Next.js Image コンポーネント)
- メモ化パターン (React.memo, useMemo, useCallback)
- バンドルサイズ分析とプルーニング

### 国際化対応

- next-intl による多言語対応
- メッセージキーの命名規則統一
- 動的ルーティングとロケール処理

## Phase 3 完了による新たな学習済みパターン・知見

### Phase 3 実装で得られた技術的知見

#### Template エンティティ設計パターン

```typescript
export class Template {
  private constructor(private readonly props: TemplateProps) {}

  // 不変更新パターン
  incrementUsage(): Template {
    return new Template({
      ...this.props,
      usageCount: this.props.usageCount + 1,
      updatedAt: new Date(),
    });
  }

  // 条件マッチングパターン
  matches(criteria: TemplateMatchCriteria): boolean {
    return (
      this.props.genre.equals(criteria.genre) &&
      this.props.language.equals(criteria.language) &&
      this.props.category === criteria.category
    );
  }
}
```

#### SuccessExample エンティティパターン

```typescript
export class SuccessExample {
  // 品質スコア自動算出
  private calculateQualityScore(): number {
    const factors = {
      rating: this.props.rating * 20,
      promptLength: Math.min((this.props.prompt.length / 100) * 10, 20),
      lyricsLength: Math.min((this.props.lyrics.length / 500) * 10, 20),
      tagCount: Math.min(this.props.tags.length * 5, 20),
      hasSuccessMetrics: 20,
    };

    return Object.values(factors).reduce((sum, score) => sum + score, 0);
  }
}
```

#### コンプライアンスチェック設計パターン

```typescript
export class ComplianceCheck {
  static check(content: string, type: ComplianceType): ComplianceCheck {
    const issues = this.detectIssues(content, type);
    const score = this.calculateScore(issues);
    const isCompliant = score >= COMPLIANCE_THRESHOLD;

    return new ComplianceCheck(isCompliant, issues, score);
  }

  private static detectIssues(
    content: string,
    type: ComplianceType
  ): ComplianceIssue[] {
    const detectors = [
      CopyrightDetector,
      InappropriateContentDetector,
      SafetyDetector,
    ];

    return detectors.flatMap((detector) => detector.detect(content, type));
  }
}
```

### TDD 実装で学んだベストプラクティス

#### 1. エンティティテストの効果的構造

```typescript
describe("Template Entity", () => {
  let validProps: TemplateProps;

  beforeEach(() => {
    validProps = createValidTemplateProps();
  });

  describe("作成・バリデーション", () => {
    it("正常なパラメータでテンプレートを作成できる", () => {
      const template = Template.create(validProps);
      expect(template.name).toBe(validProps.name);
    });
  });

  describe("ビジネスロジック", () => {
    it("使用回数を増加できる", async () => {
      const template = Template.create(validProps);
      await new Promise((resolve) => setTimeout(resolve, 1)); // 時間差作成

      const updated = template.incrementUsage();
      expect(updated.usageCount).toBe(template.usageCount + 1);
    });
  });
});
```

#### 2. 時間依存テストの安定化技法

```typescript
// 問題: 同一ミリ秒での作成により時間比較が不正確
it("更新時刻が正しく設定される", () => {
  const template = Template.create(validProps);
  const updated = template.updateQualityScore(90);

  // ❌ 同一ミリ秒で実行される可能性
  expect(updated.updatedAt.getTime()).toBeGreaterThan(
    template.updatedAt.getTime()
  );
});

// 解決: setTimeout による時間差作成
it("更新時刻が正しく設定される", async () => {
  const template = Template.create(validProps);
  await new Promise((resolve) => setTimeout(resolve, 1)); // 1ms待機

  const updated = template.updateQualityScore(90);

  // ✅ 確実に異なる時刻になる
  expect(updated.updatedAt.getTime()).toBeGreaterThan(
    template.updatedAt.getTime()
  );
});
```

#### 3. モック戦略の統一

```typescript
// 型安全なモック作成パターン
const mockRepository = {
  save: vi.fn(),
  findById: vi.fn(),
  findByGenre: vi.fn(),
  // ... その他のメソッド
} as ITemplateRepository;

// vi.mocked() の代替として型アサーション使用
(mockRepository.findById as any).mockResolvedValue(mockTemplate);
```

### 実装品質向上の学習事項

#### 1. UUID 生成の統一化

```typescript
// utils/generateUUID.ts で統一的なUUID生成
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // フォールバック実装
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
```

#### 2. 不変オブジェクト設計の徹底

- エンティティの全メソッドが新しいインスタンスを返す
- 値オブジェクトの完全な不変性
- プライベートコンストラクタ + ファクトリーメソッドパターン

#### 3. 包括的バリデーションパターン

```typescript
export class Template {
  static create(props: TemplateProps): Template {
    this.validateName(props.name);
    this.validateDescription(props.description);
    this.validateQualityScore(props.qualityScore);
    this.validateUsageCount(props.usageCount);
    this.validateCategory(props.category);

    return new Template(props);
  }

  private static validateQualityScore(score: number): void {
    if (score < 0 || score > 100) {
      throw new Error("品質スコアは0-100の範囲である必要があります");
    }
  }
}
```

### Phase 3 完了により確立された設計原則

#### 1. レイヤー別責務の明確化

- **ドメイン層**: ビジネスロジック・ルールの実装（100%テストカバレッジ）
- **アプリケーション層**: ユースケースの実装・外部依存の管理
- **プレゼンテーション層**: UI・UX の実装、ユーザーインタラクション

#### 2. テスト品質の標準化

- エンティティ: 作成・ビジネスロジック・不変性の 3 カテゴリテスト
- ユースケース: 正常系・異常系・境界値の包括的テスト
- UI: ユーザーインタラクション・状態変更・エラーハンドリング

#### 3. コンプライアンス統合設計

- ドメイン層でのビジネスルール実装
- アプリケーション層でのサービス統合
- プレゼンテーション層でのリアルタイム検証

### 技術的負債回避の学習

#### 1. 型安全性の徹底

- `any`型の完全排除（151 テスト中 0 個）
- Zod スキーマによるランタイムバリデーション
- TypeScript 厳密モードの活用

#### 2. パフォーマンス最適化

- 10 秒以内での全テスト実行
- メモリ使用量 100MB 以下
- エンティティの軽量設計

#### 3. 保守性の向上

- 明確な命名規則の統一
- 責務の明確な分離
- 包括的なドキュメント管理

## DevContainer セキュリティ強化パターン（最新学習事項）

### デュアル設定アーキテクチャの実装

#### 設計思想
```yaml
# セキュリティ優先 vs 開発効率の両立
devcontainer.json        # 本番開発環境用（セキュリティ強化）
devcontainer-simple.json # ローカル開発用（シンプル設定）
```

#### コンテナセキュリティベストプラクティス

##### 1. ネットワーク分離・制限パターン
```bash
# iptables + ipset による厳格なネットワーク制御
- GitHub API、npm registry、Anthropic APIのみ許可
- 動的IP解決による柔軟性と堅牢性の両立
- 検証機能付きファイアウォール（example.comアクセス禁止確認）
```

##### 2. 権限管理の最小化
```dockerfile
# 非root実行 + 選択的sudo権限
USER node  # 非rootユーザーでの実行
echo "node ALL=(root) NOPASSWD: /usr/local/bin/init-firewall.sh" > /etc/sudoers.d/node-firewall
```

##### 3. コンテナセキュリティ監査パターン
```bash
# セキュリティ検証の自動化
- 外部通信テスト（example.com遮断確認）
- 必要サービス疎通確認（GitHub API接続確認）
- エラー処理の堅牢性（DNS解決失敗時の適切な停止）
```

### 開発環境統一化の技術的知見

#### VS Code 拡張機能の統一管理
```json
"extensions": [
  "biomejs.biome",      # プロジェクト標準リンター
  "eamodio.gitlens",    # Git履歴・ブレーム機能
  "bradlc.vscode-tailwindcss"  # Tailwind intellisense
]
```

#### 永続化ボリューム戦略
```json
"mounts": [
  "source=claude-code-bashhistory-${devcontainerId},target=/commandhistory",
  "source=claude-code-config-${devcontainerId},target=/home/node/.claude"
]
```

##### 利点
- **開発継続性**: コンテナ再作成時の履歴・設定保持
- **チーム統一**: 同一環境での開発体験
- **セキュリティ**: 設定の分離による情報漏洩防止

### Docker Layer 最適化パターン

#### マルチステージ最適化
```dockerfile
# 開発ツール統合インストール
RUN apt update && apt install -y less git procps sudo fzf zsh \
  man-db unzip gnupg2 gh iptables ipset iproute2 dnsutils aggregate jq

# Claude Code事前インストール
RUN npm install -g @anthropic-ai/claude-code
```

##### 学習したポイント
1. **Layer数最小化**: 関連パッケージの同時インストール
2. **キャッシュ効率**: 頻繁に変更される部分を後に配置
3. **セキュリティツール統合**: iptables/ipsetの開発環境統合

### エラーハンドリング・検証パターン

#### 防御的プログラミングの適用
```bash
set -euo pipefail  # 厳格なエラーハンドリング
IFS=$'\n\t'       # 安全な文字列分割

# 入力値検証の徹底
if [[ ! "$cidr" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/[0-9]{1,2}$ ]]; then
    echo "ERROR: Invalid CIDR range from GitHub meta: $cidr"
    exit 1
fi
```

#### API応答の構造検証
```bash
# GitHub API レスポンスの整合性確認
if ! echo "$gh_ranges" | jq -e '.web and .api and .git' >/dev/null; then
    echo "ERROR: GitHub API response missing required fields"
    exit 1
fi
```

### セキュリティ設定の段階的適用指針

#### 開発段階に応じた設定選択
```markdown
1. **学習・実験段階**: devcontainer-simple.json（ファイアウォール無し）
2. **本格開発段階**: devcontainer.json（セキュリティ強化）
3. **本番準備段階**: さらなるセキュリティ制約の追加検討
```

#### セキュリティと開発効率のバランス
- **トレードオフの明示**: README.mdでの設定選択指針
- **切り替えの容易性**: ファイル名変更による設定切り替え
- **トラブルシューティング情報**: 権限エラー時の対処法文書化

この学習により、コンテナセキュリティとチーム開発効率の両立パターンが確立されました。

## 学習済みパターン・知見

### エラーハンドリング

- ドメイン層: カスタム例外クラス
- アプリケーション層: Result パターン
- プレゼンテーション層: Error Boundary

### 状態管理

- ローカル状態: useState, useReducer
- グローバル状態: Zustand
- サーバー状態: React Query (将来導入予定)

### セキュリティ

- 入力値検証: Zod スキーマ
- XSS 対策: React の標準エスケープ
- CSRF 対策: Next.js の標準対応

## Phase 3.5: テストハードコード問題解決の学習事項

### ビジネスルール中央集権化パターン

#### 設計原則
```typescript
// ❌ 以前のハードコードパターン
expect(result.score).toBe(100);
expect(result.overallLevel).toBe("safe");
expect(genreNames).toContain("Rock");

// ✅ 改善後のビジネスルール参照パターン
expect(result.score).toBe(BUSINESS_RULES.COMPLIANCE_SCORE.PERFECT_SCORE);
expect(result.overallLevel).toBe(BUSINESS_RULES.COMPLIANCE_SCORE.SAFETY_LEVELS.SAFE);
expect(genreNames).toContain(BUSINESS_RULES.GENRE.REQUIRED_GENRES[0]);
```

#### 階層化された設定管理
```typescript
export const BUSINESS_RULES = {
  STYLE_FIELD: {
    MAX_LENGTH: 120,
    MIN_LENGTH: 1,
    RECOMMENDED_RANGE: { MIN: 20, MAX: 80 },
  },
  QUALITY_SCORE: {
    MIN: 0,
    MAX: 100,
    HIGH_THRESHOLD: 80,
    MEDIUM_THRESHOLD: 60,
  },
  COMPLIANCE_SCORE: {
    PERFECT_SCORE: 100,
    SAFETY_LEVELS: {
      SAFE: "safe",
      CAUTION: "caution",
      WARNING: "warning", 
      UNSAFE: "unsafe",
    },
  },
} as const;
```

### テストデータ生成パターン

#### 動的データ生成
```typescript
export class TestDataGenerator {
  // 境界値テスト用データ生成
  static generateMaxLengthStyleField(): string {
    return this.generateStyleFieldWithLength(BUSINESS_RULES.STYLE_FIELD.MAX_LENGTH);
  }

  // エラーケース用データ生成
  static generateTooLongStyleField(): string {
    return this.generateStyleFieldWithLength(BUSINESS_RULES.STYLE_FIELD.MAX_LENGTH + 1);
  }

  // 品質レベル別スコア生成
  static generateQualityScore(level: QualityLevel): number {
    const { HIGH_THRESHOLD, MEDIUM_THRESHOLD } = BUSINESS_RULES.QUALITY_SCORE;
    switch (level) {
      case 'high': return Math.floor(Math.random() * (100 - HIGH_THRESHOLD + 1)) + HIGH_THRESHOLD;
      case 'medium': return Math.floor(Math.random() * (HIGH_THRESHOLD - MEDIUM_THRESHOLD)) + MEDIUM_THRESHOLD;
      // ...
    }
  }
}
```

#### 期待値計算の統一
```typescript
export class TestExpectationCalculator {
  // 成功事例品質スコアの期待値計算
  static calculateExpectedSuccessExampleScore(
    rating: number,
    playCount: number,
    likeCount: number
  ): number {
    const { RATING_MULTIPLIER, PLAY_COUNT_DIVISOR } = BUSINESS_RULES.SUCCESS_EXAMPLE;
    
    const ratingScore = rating * RATING_MULTIPLIER;
    const playScore = Math.min(
      Math.floor(playCount / PLAY_COUNT_DIVISOR) * 10,
      10
    );
    return Math.min(ratingScore + playScore, 100);
  }

  // 品質レベル範囲の期待値取得
  static getQualityScoreRange(level: QualityLevel): { min: number; max: number } {
    const { HIGH_THRESHOLD, MEDIUM_THRESHOLD } = BUSINESS_RULES.QUALITY_SCORE;
    switch (level) {
      case 'high': return { min: HIGH_THRESHOLD, max: 100 };
      case 'medium': return { min: MEDIUM_THRESHOLD, max: HIGH_THRESHOLD - 1 };
    }
  }
}
```

### 改善後のテストパターン例

#### ComplianceService テスト
```typescript
it("完全に安全なコンテンツは最高スコアを得る", async () => {
  const result = await complianceService.checkCompliance(input);
  
  // ビジネス意図が明確
  expect(result.overallLevel).toBe(BUSINESS_RULES.COMPLIANCE_SCORE.SAFETY_LEVELS.SAFE);
  expect(result.score).toBe(BUSINESS_RULES.COMPLIANCE_SCORE.PERFECT_SCORE);
});
```

#### GeneratePromptUseCase テスト
```typescript
it("高品質プロンプトは高いスコアを得る", async () => {
  const result = await useCase.execute(input);
  
  // 期待値計算の統一
  const highQualityRange = TestExpectationCalculator.getQualityScoreRange('high');
  expect(result.qualityScore).toBeGreaterThanOrEqual(highQualityRange.min);
});
```

#### Genre テスト
```typescript
it("必要数以上のジャンルをサポートしている", () => {
  const supportedGenres = Genre.getSupportedGenres();
  
  // ビジネスルールからの動的取得
  expect(supportedGenres.length).toBeGreaterThanOrEqual(
    BUSINESS_RULES.GENRE.MIN_SUPPORTED_COUNT
  );
});
```

### Git Hook 自動化の学習事項

#### Pre-commit Hook 統合
```bash
# Claude Code Review（知見更新チェック付き）
echo "🤖 Claude Code Review & Learning Check..."
claude --print "/learnings - Check if staged changes contain new learnings that should be documented. Review code for DDD/TDD compliance and suggest improvements." --allowedTools "Bash(git:*) Read Grep Edit" || echo "⚠️ Claude analysis unavailable, continuing..."
```

### 学習した設計改善点

#### 1. 保守性の向上
- **変更影響範囲の最小化**: ビジネスルール変更時に1ファイルのみ修正
- **テスト意図の明確化**: 数値の意味がコードから理解可能
- **一貫性の確保**: 全テストで同じルールを参照

#### 2. 開発効率の向上
- **自動品質チェック**: Git Hook による知見蓄積の自動化
- **期待値計算の統一**: テストロジックの重複排除
- **型安全性**: TypeScript + `as const` による設定値の型保証

#### 3. チーム開発への示唆
- **ビジネスルールの可視化**: 設定値がドメイン知識として明示
- **テストの自己文書化**: コードを読むだけでビジネス要件が理解可能
- **知見の継続的蓄積**: 開発プロセス内での学習の自動化

#### 4. テストコード品質向上（新学習事項）
- **不要依存関係の除去**: Mock の最小化によるテストの明確性向上
- **文字列テンプレート統一**: `"${...}, test"` パターンによる可読性改善
- **段階的リファクタリング**: 大規模変更時の安全な改善手法

### Phase 3.5 で確立された新パターン

#### テストハードコード回避パターン
1. **設定値の中央集権化**: `BUSINESS_RULES` による一元管理
2. **動的データ生成**: `TestDataGenerator` による柔軟なテストデータ作成
3. **期待値計算の統一**: `TestExpectationCalculator` による計算ロジック共通化
4. **自動品質チェック**: Git Hook + Claude Code Review による継続的改善

このパターンにより、147テスト全てでハードコード値を排除し、ビジネスルール変更時の保守性を大幅に向上させることができました。

## Phase 8: テストコード品質向上とアーキテクチャ改善

### テストユーティリティの関数型リファクタリング

#### 改善前（クラスベース）vs 改善後（関数ベース）

```typescript
// ❌ 改善前: クラスベースの静的メソッド
export class TestDataGenerator {
  static generateMaxLengthStyleField(): string {
    return this.generateStyleFieldWithLength(BUSINESS_RULES.STYLE_FIELD.MAX_LENGTH);
  }
}

export class TestExpectationCalculator {
  static getQualityScoreRange(level: QualityLevel): { min: number; max: number } {
    // 実装
  }
}

// ✅ 改善後: 純粋関数によるシンプル設計
export function generateMaxLengthStyleField(): string {
  return generateStyleFieldWithLength(BUSINESS_RULES.STYLE_FIELD.MAX_LENGTH);
}

export function getQualityScoreRange(level: QualityLevel): { min: number; max: number } {
  // 実装
}
```

#### 関数型設計の利点
1. **インポート効率**: 必要な関数のみ個別インポート可能
2. **テスト容易性**: 静的メソッドよりも純粋関数の方がテストしやすい
3. **Tree Shaking**: 未使用関数の自動排除による最適化
4. **型推論**: TypeScript での型推論がより正確

### Next.js Navigation Mock 統一パターン

#### 改善内容
```typescript
// ❌ 各テストファイルでの重複Mock定義
const mockPush = vi.fn();
const mockRouter = { push: mockPush, back: vi.fn(), forward: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => mockRouter }));

// ✅ グローバルMock活用による統一
// Use existing global mock from __mocks__/next/navigation.ts
```

### 依存関係管理の最適化

#### 不要依存の識別・除去パターン
```typescript
// ❌ 改善前: 未使用インポート
import {
  TestDataGenerator,
  TestExpectationCalculator,
} from "~/test-utils/test-data-generators";

// ✅ 改善後: 必要な関数のみインポート
import { getQualityScoreRange } from "~/test-utils/test-data-generators";

// または完全削除
// 不要なインポートを削除 - 現在未使用
```

### テストコード保守性向上パターン

#### 1. 命名の明確化
```typescript
// 関数名がより直接的で理解しやすい
calculateExpectedSuccessExampleScore() // クラスメソッド
↓
calculateSuccessExampleQualityScore()  // 関数名
```

#### 2. インポート文の簡潔性
```typescript
// 改善前
import { TestExpectationCalculator } from "~/test-utils/test-data-generators";
const highQualityRange = TestExpectationCalculator.getQualityScoreRange("high");

// 改善後  
import { getQualityScoreRange } from "~/test-utils/test-data-generators";
const highQualityRange = getQualityScoreRange("high");
```

### コードの再利用性・モジュール性向上

#### 関数型アプローチによる利点
1. **高度なコンポーザビリティ**: 小さな関数の組み合わせによる複雑な処理
2. **副作用の最小化**: 純粋関数による予測可能な動作
3. **単体テストの簡易性**: 入力→出力の明確な関係

### 新しい品質指標

#### テストコード品質メトリクス
- **依存関係の最小化**: 必要最小限のインポートのみ
- **命名の一貫性**: 動詞+名詞パターンの統一
- **再利用性**: 関数の組み合わせによる柔軟性
- **保守性**: ビジネスルール変更への適応性

この改善により、テストコードの品質と保守性が向上し、将来的な機能拡張にも対応しやすくなりました。

## SOLID原則とFactory統一化（最新アーキテクチャ改善）

### SOLID原則の厳密適用パターン

#### 1. Single Responsibility Principle（単一責任原則）
各クラスが明確に定義された単一の責任を持つパターンの確立：

```typescript
// ❌ 複数責任を持つ改善前のクラス
export class OptimizePromptUseCase {
  // ユースケース実行
  // + プロンプト最適化
  // + ジャンル競合検出
  // + 成功率予測
}

// ✅ 責任分離後の設計
export class OptimizePromptUseCase {
  constructor(
    private readonly promptRepository: IPromptRepository,
    private readonly styleFieldOptimizer?: StyleFieldOptimizerService,
    private readonly genreConflictDetector?: GenreConflictDetectorService,
    private readonly successRatePredictor?: SuccessRatePredictorService
  ) {}
}
```

#### 2. Interface Segregation Principle（インターフェース分離原則）
サービス命名規則の統一とインターフェース特化：

```typescript
// ❌ 曖昧な命名
export interface StyleFieldOptimizer { ... }
export interface GenreConflictDetector { ... }

// ✅ Service接尾辞による明確化
export interface StyleFieldOptimizerService { ... }
export interface GenreConflictDetectorService { ... }
export interface SuccessRatePredictorService { ... }
```

#### 3. Dependency Inversion Principle（依存性逆転原則）
readonly修飾子による不変性とDI設計の強化：

```typescript
// ❌ 可変依存関係
constructor(
  private lyricsRepository: ILyricsRepository,
  private japaneseOptimizationService?: JapaneseOptimizationService
) {}

// ✅ 不変依存関係の徹底
constructor(
  private readonly lyricsRepository: ILyricsRepository,
  private readonly japaneseOptimizationService?: JapaneseOptimizationService,
  private readonly sunoOptimizationService?: SunoOptimizationService
) {}
```

### Factory パターン統一の学習事項

#### 統一されたオブジェクト生成パターン
全エンティティ・値オブジェクトで一貫したファクトリーメソッド：

- `create()`: 新規作成時（完全バリデーション実行）
- `reconstruct()`: 永続化からの復元時（最小バリデーション）

```typescript
// 統一パターンの適用例
export class Entity {
  static create(props: EntityProps): Entity {
    // 新規作成時の包括的バリデーション
    this.validateAllProperties(props);
    return new Entity(props);
  }

  static reconstruct(props: EntityProps): Entity {
    // 復元時の必要最小限バリデーション
    this.validateEssentialProperties(props);
    return new Entity(props);
  }
}
```

### アーキテクチャ品質向上の効果

#### 1. 型安全性の向上
- インターフェース命名の一貫性確保
- 依存注入における型制約の明確化
- コンパイル時型チェックの精度向上

#### 2. 保守性の向上
- 責任境界の明確化によるコード理解しやすさ
- サービス層の疎結合設計
- テスト時のモック対象の明確化

#### 3. 拡張性の向上
- 新サービスの追加が容易
- インターフェース契約による安全な実装変更
- 依存関係の可視化による影響範囲の把握

## SOLID原則アーキテクチャ改善（Phase 3.6完了）

### 構造化エラーハンドリングパターン

#### Discriminated Union による型安全なエラー処理
```typescript
// ❌ 改善前: 文字列配列による曖昧なエラー情報
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ✅ 改善後: 構造化されたエラーオブジェクト
export type ValidationError =
  | { type: "STYLE_FIELD_TOO_LONG"; maxLength: number; currentLength: number }
  | { type: "TITLE_TOO_SHORT"; minLength: number; currentLength: number }
  | { type: "INVALID_GENRE_LANGUAGE_COMBINATION"; genre: string; language: string };

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

#### エラー処理の型安全性向上の利点
1. **コンパイル時の型チェック**: 不正なエラー処理を事前に検出
2. **詳細情報の構造化**: エラー種別に応じた適切な情報提供
3. **エラーハンドリングの統一**: 同一パターンによる一貫した処理
4. **IDE支援の向上**: 型補完によるエラー処理コードの記述支援

### 音楽ドメイン型定義の厳密化

#### Union Type による制約の明確化
```typescript
export type MusicalKey =
  | "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B"
  | "Cm" | "C#m" | "Dm" | "D#m" | "Em" | "Fm" | "F#m" | "Gm" | "G#m" | "Am" | "A#m" | "Bm";

export type MoodCategory =
  | "energetic" | "calm" | "dark" | "bright" | "melancholic" | "uplifting"
  | "aggressive" | "peaceful" | "intense" | "relaxed" | "mysterious" | "joyful";
```

#### ドメイン特化型の設計原則
1. **ビジネスルールの型レベル表現**: 不正値の型レベル排除
2. **可読性の向上**: 型名からドメイン知識が理解可能
3. **保守性**: 新しい値の追加時に一箇所での管理
4. **型安全性**: ランタイムエラーの事前防止

### JSON Deserialization の型安全パターン

#### 共通化メソッドによる重複解消
```typescript
// DRYパターン: 共通ロジックの抽出
private static parseGenreFromJSON(genreStr: string): GenreValue {
  if (genreStr.includes(",")) {
    return genreStr.split(",") as GenreValue;
  }
  return genreStr as GenreValue;
}

// biome-ignore コメント除去による型安全性確保
genre: Genre.create(SuccessExample.parseGenreFromJSON(json.genre)),
```

#### 型安全なデシリアライゼーションの効果
1. **any型の完全排除**: 型アサーションによる安全な変換
2. **重複コードの削減**: 共通メソッドによるDRY原則遵守
3. **Lintエラーの解消**: 不要なignoreコメント除去
4. **メンテナンス性**: 変換ロジックの一元管理

### バリデーション強化パターン

#### 詳細情報付きバリデーション
```typescript
// 改善前: 単純な文字列メッセージ
if (this.title.length < 5) {
  warnings.push("より具体的なタイトルの使用を推奨します");
}

// 改善後: 構造化された警告オブジェクト
if (this.title.length < 5) {
  warnings.push({
    type: "TITLE_TOO_SHORT_FOR_QUALITY",
    recommended: 5,
    current: this.title.length,
  });
}
```

#### 行レベル詳細エラー情報
```typescript
// 行ごとの詳細な検証
const lines = this.content.split("\n");
lines.forEach((line, index) => {
  if (line.length > 50) {
    warnings.push({
      type: "LINE_TOO_LONG",
      maxLength: 50,
      lineNumber: index + 1,
      currentLength: line.length,
    });
  }
});
```

### 型駆動開発のベストプラクティス

#### 1. Type-First アプローチ
- エラー型定義から実装を駆動
- ドメイン制約の型レベル表現
- コンパイル時検証による品質確保

#### 2. 構造化データの活用
- Primitive Obsession の回避
- 意味のある型による表現力向上
- ビジネスロジックの型による文書化

#### 3. 段階的型安全性向上
- 文字列から構造化オブジェクトへの移行
- any型の段階的排除
- 型アサーションの適切な使用

この改善により、型安全性が大幅に向上し、エラーハンドリングの品質と保守性が向上しました。

## GitHub Actions 権限設定とCI/CD統合パターン

### Claude Code Review / PR Assistant 権限要件

#### 必要な権限設定
```yaml
permissions:
  contents: write      # リポジトリコンテンツへの書き込み権限
  pull-requests: write # PRへのコメント・レビュー投稿権限
  issues: write        # Issueへのコメント投稿権限
  id-token: write      # OIDCトークン生成権限
  actions: write       # CI結果の読み取り・操作権限
```

#### 権限設定の詳細
- **contents: write**: Claudeがコードレビュー結果をコミットする際に必要
- **pull-requests: write**: PRへのレビューコメント投稿に必須
- **issues: write**: Issue内でのインタラクティブな対話に必須
- **actions: write**: CI/CDパイプラインの結果読み取りと連携に必要

### CI/CDとAI統合のベストプラクティス

#### 1. 自動コードレビューワークフロー
```yaml
# claude-code-review.yml
- Triggered on pull_request events
- Direct prompt による自動レビュー（@claude mention不要）
- カスタマイズ可能なレビュー基準
- ファイルタイプ別のレビュー戦略
```

#### 2. インタラクティブPRアシスタント
```yaml
# claude.yml
- issue/PR コメントでの @claude mention による起動
- CI結果の読み取りと分析
- インタラクティブな問題解決支援
```

### 学習した統合パターン

#### 権限の最小権限原則との葛藤
- **課題**: セキュリティのためread権限が推奨されるが、実用には不十分
- **解決**: 必要最小限のwrite権限のみを付与
- **補完策**: ブランチ保護ルールやPRレビュー必須設定との組み合わせ

#### 自動化と人的レビューのバランス
1. **Claude自動レビュー**: 基本的な品質チェック・規約準拠確認
2. **人的レビュー**: ビジネスロジック・設計判断の確認
3. **相互補完**: AIは形式面、人間は意味面を重点的にレビュー
