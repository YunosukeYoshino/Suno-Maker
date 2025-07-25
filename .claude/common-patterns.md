# Common Patterns

## 頻用コマンドパターン

### 開発環境構築
```bash
# プロジェクト開始時の基本セットアップ
bun install                    # 依存関係のインストール
bun dev                       # 開発サーバー起動 (Turbopack使用、デフォルト: http://localhost:3000)
bun run check                 # コード品質チェック (lint + format)
bun run typecheck             # TypeScript型チェック
```

### 必須開発コマンド
**重要**: このプロジェクトでは必ず Bun を使用してください。npm や yarn は使用しないでください。

```bash
# 開発関連
bun dev                       # 開発サーバーの起動（Turbopack使用）
bun run build                 # 本番用アプリケーションのビルド
bun start                     # 本番サーバーの起動

# コード品質
bun run lint                  # Biome でのリンティング実行
bun run format                # Biome でのフォーマット実行
bun run check                 # Biome での全体チェック（lint + format）
bun run typecheck             # TypeScriptの型チェック実行

# テスト関連
bun test                      # テストの実行
bun test:watch               # テストのウォッチモード実行
bun test:ui                  # テストのUI表示モード

# shadcn/ui コンポーネント管理
bun x shadcn@latest add [component-name]  # コンポーネント追加
```

### 日常開発ワークフロー
```bash
# ブランチ作成から完了まで
git checkout -b feature/機能名  # 新機能ブランチ作成
bun test:watch                # テスト監視モード開始
bun run lint                  # リンティング実行
bun run format                # フォーマット実行
git add . && git commit -m "feat: 機能実装"
gh pr create                  # プルリクエスト作成
```

### テスト関連
```bash
bun test                      # 全テスト実行
bun test:watch               # テスト監視モード
bun test:ui                  # テストUI表示
bun test -- --coverage       # カバレッジ付きテスト実行
bun test -- --run           # 単発実行（監視無し）
```

### shadcn/ui コンポーネント
```bash
# コンポーネント追加
bun x shadcn@latest add button
bun x shadcn@latest add card
bun x shadcn@latest add dialog
bun x shadcn@latest add form

# インストール確認
ls -la components/ui/         # コンポーネント確認
```

### ビルド・デプロイ
```bash
bun run build                # 本番ビルド
bun start                    # 本番サーバー起動
bun run typecheck            # 型チェック（CI用）
```

## コードパターン・テンプレート

### DDD エンティティテンプレート（Phase 3 完成版）
```typescript
// src/domain/entities/[EntityName].ts
import { generateUUID } from "~/utils/generateUUID";

interface EntityNameProps {
  id: string;
  property: PropertyValueObject;
  createdAt: Date;
  updatedAt: Date;
}

export class EntityName {
  private constructor(private readonly props: EntityNameProps) {}

  static create(property: PropertyValueObject): EntityName {
    this.validateProperty(property);
    
    return new EntityName({
      id: generateUUID(),
      property,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  /**
   * 永続層からデータを復元（最低限のバリデーション付き）
   * @param props 永続化されたエンティティプロパティ
   */
  static reconstruct(props: EntityNameProps): EntityName {
    // 最低限の必須データ検証
    if (!props.id) {
      throw new Error("IDは必須です");
    }
    if (!props.property) {
      throw new Error("プロパティは必須です");
    }
    
    return new EntityName(props);
  }

  private static validateProperty(property: PropertyValueObject): void {
    if (!property) {
      throw new Error("プロパティは必須です");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get property(): PropertyValueObject {
    return this.props.property;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // 不変更新パターン
  updateProperty(newProperty: PropertyValueObject): EntityName {
    EntityName.validateProperty(newProperty);
    
    return new EntityName({
      ...this.props,
      property: newProperty,
      updatedAt: new Date()
    });
  }

  equals(other: EntityName): boolean {
    return this.props.id === other.props.id;
  }
}
```

### 値オブジェクトテンプレート
```typescript
// src/domain/valueObjects/[ValueObjectName].ts
export class ValueObjectName {
  private constructor(private readonly value: string) {}

  static create(value: string): ValueObjectName {
    if (!this.isValid(value)) {
      throw new Error(`Invalid ${ValueObjectName.name}: ${value}`);
    }
    return new ValueObjectName(value);
  }

  private static isValid(value: string): boolean {
    // バリデーションロジック
    return value.length > 0 && value.length <= 100;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ValueObjectName): boolean {
    return this.value === other.value;
  }
}
```

### リポジトリインターフェーステンプレート
```typescript
// src/domain/repositories/I[EntityName]Repository.ts
export interface IEntityRepository {
  save(entity: Entity): Promise<void>;
  findById(id: EntityId): Promise<Entity | null>;
  findAll(): Promise<Entity[]>;
  delete(id: EntityId): Promise<void>;
}
```

### ユースケーステンプレート（SOLID原則準拠）
```typescript
// src/application/usecases/[ActionName]UseCase.ts
export class ActionNameUseCase {
  constructor(
    private readonly repository: IEntityRepository,
    private readonly externalService?: ExternalService
  ) {}

  async execute(input: ActionNameInput): Promise<ActionNameOutput> {
    // 1. 入力値の検証
    // 2. ドメインオブジェクトの取得・生成
    // 3. ビジネスロジックの実行
    // 4. 永続化
    // 5. 結果の返却
  }
}

export interface ActionNameInput {
  // 入力パラメータ
}

export interface ActionNameOutput {
  // 出力結果
}

// サービスインターフェース統一命名規則
export interface ExternalService {
  processData(data: string): Promise<ProcessResult>;
}
```

### Zustand ストアテンプレート
```typescript
// src/infrastructure/stores/[domain]Store.ts
interface EntityState {
  entities: Entity[];
  loading: boolean;
  error: string | null;
}

interface EntityActions {
  loadEntities: () => Promise<void>;
  addEntity: (entity: Entity) => void;
  updateEntity: (id: EntityId, updates: Partial<Entity>) => void;
  removeEntity: (id: EntityId) => void;
}

export const useEntityStore = create<EntityState & EntityActions>((set, get) => ({
  entities: [],
  loading: false,
  error: null,

  loadEntities: async () => {
    set({ loading: true, error: null });
    try {
      // API呼び出しロジック
      set({ entities: result, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addEntity: (entity) => {
    set((state) => ({
      entities: [...state.entities, entity]
    }));
  },

  updateEntity: (id, updates) => {
    set((state) => ({
      entities: state.entities.map(entity => 
        entity.getId().equals(id) ? { ...entity, ...updates } : entity
      )
    }));
  },

  removeEntity: (id) => {
    set((state) => ({
      entities: state.entities.filter(entity => 
        !entity.getId().equals(id)
      )
    }));
  }
}));
```

### React コンポーネントテンプレート
```typescript
// src/presentation/components/[ComponentName].tsx
interface ComponentNameProps {
  // props definition
}

export function ComponentName({ ...props }: ComponentNameProps) {
  // hooks
  // state
  // handlers
  
  return (
    <div className="p-4">
      {/* JSX content */}
    </div>
  );
}
```

### テスト最適化パターン（新学習事項）
```typescript
// ❌ 過剰なモック
import { Mock } from "vitest";
const mockPush = vi.fn();
const mockRouter = { push: mockPush, back: vi.fn(), forward: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => mockRouter }));

// ✅ 必要最小限のモック
// 実際に使用するコンポーネントのみモック化

// ❌ 複雑な文字列結合
TestDataGenerator.generateStyleFieldWithLength(MAX_LENGTH - 10) + ", test"

// ✅ テンプレートリテラル
`${TestDataGenerator.generateStyleFieldWithLength(MAX_LENGTH - 10)}, test`
```

### テストテンプレート（Phase 3 完成版）
```typescript
// __tests__/[TestTarget].test.ts
import { describe, it, expect, beforeEach } from 'vitest';

describe('TestTarget', () => {
  let validProps: TestTargetProps;

  beforeEach(() => {
    validProps = createValidTestTargetProps();
  });

  describe('作成・バリデーション', () => {
    it('正常なパラメータで作成できる', () => {
      // Arrange & Act
      const testTarget = TestTarget.create(validProps);
      
      // Assert
      expect(testTarget.property).toBe(validProps.property);
      expect(testTarget.id).toBeDefined();
      expect(testTarget.createdAt).toBeInstanceOf(Date);
    });

    it('無効なパラメータでエラーをスローする', () => {
      // Arrange
      const invalidProps = { ...validProps, property: null };
      
      // Act & Assert
      expect(() => TestTarget.create(invalidProps)).toThrow('プロパティは必須です');
    });
  });

  describe('ビジネスロジック', () => {
    it('不変更新が正しく動作する', async () => {
      // Arrange
      const testTarget = TestTarget.create(validProps);
      await new Promise(resolve => setTimeout(resolve, 1)); // 時間差作成
      
      // Act
      const newProperty = createNewProperty();
      const updated = testTarget.updateProperty(newProperty);
      
      // Assert
      expect(updated).not.toBe(testTarget); // 新しいインスタンス
      expect(updated.property).toBe(newProperty);
      expect(updated.updatedAt.getTime()).toBeGreaterThan(testTarget.updatedAt.getTime());
    });
  });

  describe('等価性・不変性', () => {
    it('同じIDのインスタンスは等価と判定される', () => {
      // Arrange
      const props = createValidTestTargetProps();
      const testTarget1 = TestTarget.reconstruct(props);
      const testTarget2 = TestTarget.reconstruct(props);
      
      // Act & Assert
      expect(testTarget1.equals(testTarget2)).toBe(true);
    });

    it('更新時に元のインスタンスは変更されない', () => {
      // Arrange
      const original = TestTarget.create(validProps);
      const originalProperty = original.property;
      
      // Act
      const updated = original.updateProperty(createNewProperty());
      
      // Assert
      expect(original.property).toBe(originalProperty); // 元のインスタンスは不変
      expect(updated.property).not.toBe(originalProperty);
    });
  });

  describe('異常系', () => {
    it('nullプロパティでエラーをスローする', () => {
      expect(() => {
        TestTarget.create({ ...validProps, property: null });
      }).toThrow('プロパティは必須です');
    });
  });
});

// テストヘルパー関数
function createValidTestTargetProps(): TestTargetProps {
  return {
    property: createValidProperty(),
    // その他の必要なプロパティ
  };
}
```

## Git ワークフローパターン

### ブランチ戦略・ワークフロー
```bash
# 機能開発
git checkout -b feature/機能名
git commit -m "feat: 機能の説明"

# バグ修正
git checkout -b fix/問題の説明
git commit -m "fix: 修正内容"

# リファクタリング
git checkout -b refactor/対象範囲
git commit -m "refactor: リファクタリング内容"
```

#### ブランチ命名規則
- **必須**: 各機能開発は専用ブランチで行う
- ブランチ命名規則: `feature/機能名` または `fix/修正内容`
- 例: `feature/genre-value-object`, `fix/prompt-validation`
- 作業開始時に `git checkout -b feature/機能名` でブランチ作成
- 作業完了後は `gh pr create` でプルリクエスト作成

#### Git コミットルール
- **必須**: 各作業単位ごとに `gh` コマンドを使用してコミットを作成
- コミットメッセージは変更内容を明確に記述
- 関連するissueがある場合は参照を含める
- 例: `git commit -m "feat: Genre値オブジェクトとテストを実装 #123"`

#### 作業フロー
1. ブランチ作成 (`git checkout -b feature/機能名`)
2. 機能実装 → テスト作成 → ドキュメント更新 → コミット
3. 各段階で品質チェック（lint, format, test）を実行
4. プルリクエスト作成 (`gh pr create`)
5. レビュー・マージ後にブランチ削除

### コミットメッセージ規則
```
feat: 新機能追加
fix: バグ修正
refactor: リファクタリング
test: テスト追加・修正
docs: ドキュメント更新
style: フォーマット修正
chore: その他の変更
```

## Phase 3完了により確立された新パターン

### UUID生成統一パターン（暗号強度対応）
```typescript
// utils/generateUUID.ts
export function generateUUID(): string {
  // Node.js環境: crypto.randomUUID()を使用
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // ブラウザ環境: crypto.getRandomValues()を使用
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    
    // UUID v4フォーマットに変換
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant bits
    
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }

  // フォールバック（非推奨）
  const timestamp = Date.now().toString(16);
  const randomPart = Math.random().toString(16).substring(2);
  return `${timestamp.padStart(8, '0')}-${randomPart.substring(0, 4)}-4${randomPart.substring(4, 7)}-${((Math.random() * 4) | 8).toString(16)}${randomPart.substring(7, 10)}-${randomPart.substring(10, 22).padEnd(12, '0')}`;
}

// 全エンティティで統一使用
import { generateUUID } from "~/utils/generateUUID";
```

### 時間依存テスト安定化パターン
```typescript
// ❌ 不安定なテスト
it('更新時刻が変更される', () => {
  const entity = Entity.create(props);
  const updated = entity.update(newProps);
  expect(updated.updatedAt.getTime()).toBeGreaterThan(entity.updatedAt.getTime());
});

// ✅ 安定したテスト
it('更新時刻が変更される', async () => {
  const entity = Entity.create(props);
  await new Promise(resolve => setTimeout(resolve, 1)); // 1ms待機
  
  const updated = entity.update(newProps);
  expect(updated.updatedAt.getTime()).toBeGreaterThan(entity.updatedAt.getTime());
});
```

### コンプライアンスチェック統合パターン
```typescript
// ドメイン層での統合例
export class ComplianceCheck {
  static check(content: string, type: ComplianceType): ComplianceCheck {
    const issues = this.detectIssues(content, type);
    const score = this.calculateScore(issues);
    const isCompliant = score >= COMPLIANCE_THRESHOLD;
    
    return new ComplianceCheck(isCompliant, issues, score);
  }
  
  private static detectIssues(content: string, type: ComplianceType): ComplianceIssue[] {
    return [
      ...CopyrightDetector.detect(content, type),
      ...InappropriateContentDetector.detect(content, type),
      ...SafetyDetector.detect(content, type)
    ];
  }
}
```

### モック統一パターン
```typescript
// 型安全なモック作成（vi.mocked代替）
const mockRepository = {
  save: vi.fn(),
  findById: vi.fn(),
  findByGenre: vi.fn(),
  // ...その他のメソッド
} as ITemplateRepository;

// モック設定
(mockRepository.findById as any).mockResolvedValue(mockTemplate);
(mockRepository.save as any).mockResolvedValue(void 0);
```

### 包括的バリデーションパターン
```typescript
export class Entity {
  static create(props: EntityProps): Entity {
    this.validateName(props.name);
    this.validateDescription(props.description);
    this.validateScore(props.score);
    this.validateCategory(props.category);
    
    return new Entity(props);
  }
  
  private static validateScore(score: number): void {
    if (score < 0 || score > 100) {
      throw new Error('スコアは0-100の範囲である必要があります');
    }
  }
  
  private static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('名前は必須です');
    }
    if (name.length > 100) {
      throw new Error('名前は100文字以内である必要があります');
    }
  }
}
```

### 防御的プログラミングパターン
```typescript
// ❌ 危険なスプレッド構文（未定義時にエラー）
global.jest = {
  ...global.jest,
  Mocked: (fn: any) => fn,
};

// ✅ null合体演算子による防御的プログラミング
global.jest = {
  ...(global.jest ?? {}),
  Mocked: (fn: any) => fn,
};

// ❌ 意図しないフォールバックを持つ三項演算子
const timeRange = param === "week" ? "week" : param === "month" ? "month" : "day";

// ✅ 明示的な条件分岐
const timeRange =
  param === "week"
    ? "week"
    : param === "month"
      ? "month"
      : "month"; // "year"の場合も明示的に"month"
```

### テスト環境対応パターン
```typescript
// test-setup.ts での型安全な環境設定
declare global {
  var jest: {
    Mocked: <T extends (...args: unknown[]) => unknown>(
      fn: T
    ) => MockedFunction<T>;
  };
}

// 防御的なグローバル設定
global.jest = {
  ...(global.jest ?? {}), // 未定義対応
  Mocked: <T extends (...args: unknown[]) => unknown>(
    fn: T
  ): MockedFunction<T> => fn,
};
```

### Git・PR関連パターン（新学習事項）

#### git-commitコマンドパターン
```bash
# 0. 事前確認（必須ステップ）
git status

# 1. ブランチ作成（すでにブランチがある場合はスキップ）
# "feature/awesome-change" は任意のブランチ名に変更

# 2. 変更をステージングしてコミット
git add .

# 3. リモートに push（初回の場合は -u をつけて upstream 設定）

# 4. PR 作成（server-github MCPを使用）
- 必ず日本語で書いてください。
- Assignees: yourself
- Labels: "bug", "enhancement", "feature" など適切なもの

# 5. PR後200秒待ってください。

# 6. PRの内容を確認
- AIレビュワーがいるので、レヴュワーのコメントを取得し、改善するかどうか計画してください。
```

### プロジェクト完成時の品質基準
```bash
# Phase 3完了時の必須チェック
bun run check      # Biome品質チェック 100%通過
bun run typecheck  # TypeScript型チェック エラー0件  
bun test           # 151テスト全通過
bun run build      # ビルド成功

# 品質指標
# - `any`型使用数: 0個
# - テストカバレッジ: ドメイン層100%、アプリケーション層95%
# - ランタイムエラー: 0件
# - Biome品質チェック: 100%通過
```

## GitHub Actions CI/CD 自動化パターン

### Claude統合ワークフロー設定

#### 1. 自動コードレビューワークフロー（claude-code-review.yml）
```yaml
name: Claude Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  claude-review:
    runs-on: ubuntu-latest
    permissions:
      contents: write      # コード読み取り・修正提案用
      pull-requests: write # レビューコメント投稿用
      issues: write        # イシュートラッキング用
      id-token: write      # OIDC認証用
      actions: write       # CI結果分析用

    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-github-actions@v1
        with:
          direct_prompt: |
            Please review this pull request and provide feedback on:
            - Code quality and adherence to project standards
            - Potential bugs or issues
            - Performance considerations
            - Security concerns
            - Test coverage
            
            Be constructive and helpful in your feedback.
```

#### 2. インタラクティブPRアシスタント（claude.yml）
```yaml
name: Claude PR Assistant
on:
  issue_comment:
    types: [created]
  pull_request_comment:
    types: [created]

jobs:
  claude-assist:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
      actions: write # CI結果読み取り用

    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-github-actions@v1
        with:
          # @claude メンションで起動
          trigger_phrase: "@claude"
          
          # CI結果へのアクセス許可
          additional_permissions: |
            actions: write
```

### 権限設定のベストプラクティス

#### 必要最小限の権限付与
```yaml
# ❌ 過剰な権限
permissions: write-all

# ✅ 必要最小限の権限
permissions:
  contents: write      # 必要な場合のみ
  pull-requests: write # PR操作に必須
  issues: write        # Issue操作に必須
```

#### セキュリティ対策との組み合わせ
1. **ブランチ保護ルール**: mainブランチへの直接pushを禁止
2. **PRレビュー必須**: 最低1人の承認が必要
3. **ステータスチェック**: CI/CDパイプラインの成功を必須化
4. **署名コミット**: GPG署名付きコミットのみ許可

### 効果的な活用パターン

#### ファイルタイプ別レビュー戦略
```yaml
direct_prompt: |
  Review this PR focusing on:
  - For TypeScript files: Type safety, patterns, and best practices
  - For API endpoints: Security, input validation, and error handling
  - For React components: Performance, accessibility, and best practices
  - For tests: Coverage, edge cases, and test quality
```

#### 初回貢献者への特別対応
```yaml
direct_prompt: |
  ${{ github.event.pull_request.author_association == 'FIRST_TIME_CONTRIBUTOR' &&
  'Welcome! Please review this PR from a first-time contributor. Be encouraging and provide detailed explanations for any suggestions.' ||
  'Please provide a thorough code review focusing on our coding standards and best practices.' }}
```

### トラブルシューティング

#### 権限エラーの対処
```bash
# エラー: "Resource not accessible by integration"
# 解決: permissions設定の確認と修正

# エラー: "Must have write permission to create comment"
# 解決: pull-requests: write 権限の追加
```

#### Claudeレビューの最適化
- **use_sticky_comment: true**: 同一PRへの追加pushで既存コメントを更新
- **allowed_tools**: 特定のツール（テスト実行等）の許可
- **skip条件**: WIPやドラフトPRのスキップ設定

## DevContainer 運用パターン（新実装）

### 基本セットアップ
```bash
# VS Code でプロジェクトを開く
code .

# DevContainer で再開発
Ctrl+Shift+P → "Dev Containers: Reopen in Container"

# 初回構築時（自動実行される）
- Docker image のビルド
- 拡張機能の自動インストール
- ファイアウォール初期化（セキュリティ強化版のみ）
```

### セキュリティ設定の切り替え
```bash
# シンプル設定に切り替え（ローカル開発・学習用）
mv .devcontainer/devcontainer.json .devcontainer/devcontainer-secure.json
mv .devcontainer/devcontainer-simple.json .devcontainer/devcontainer.json

# セキュリティ強化設定に戻す（本格開発用）
mv .devcontainer/devcontainer.json .devcontainer/devcontainer-simple.json
mv .devcontainer/devcontainer-secure.json .devcontainer/devcontainer.json

# DevContainer の再構築
Ctrl+Shift+P → "Dev Containers: Rebuild Container"
```

### ネットワーク制限確認
```bash
# ファイアウォール状態確認
sudo iptables -L -n

# 許可ドメインリスト確認
sudo ipset list allowed-domains

# 外部通信テスト（遮断されるべき）
curl --connect-timeout 5 https://example.com  # 失敗するはず

# 必要サービス疎通確認（成功するべき）
curl --connect-timeout 5 https://api.github.com/zen      # GitHub API
curl --connect-timeout 5 https://registry.npmjs.org/     # npm registry
```

### 開発環境メンテナンス
```bash
# コンテナ内での基本確認
node --version    # Node.js バージョン
bun --version     # Bun バージョン
code --version    # VS Code Server バージョン

# 永続化ボリューム確認
ls -la /commandhistory/      # bash履歴
ls -la /home/node/.claude/   # Claude設定

# 拡張機能確認
code --list-extensions
```

### ファイアウォール許可ドメイン追加
```bash
# init-firewall.sh の編集
sudo vi /usr/local/bin/init-firewall.sh

# 新しいドメインを追加する場合
for domain in \
    "registry.npmjs.org" \
    "api.anthropic.com" \
    "your-new-domain.com"; do  # 新ドメイン追加
    # ... IP解決・追加ロジック
done

# ファイアウォール再初期化
sudo /usr/local/bin/init-firewall.sh
```

### トラブルシューティング

#### 権限エラー対処
```bash
# NET_ADMIN権限エラー
# 解決: Docker設定で --cap-add=NET_ADMIN を確認

# sudo権限エラー
# 解決: sudoers設定の確認
cat /etc/sudoers.d/node-firewall

# ファイアウォール無効化（緊急時）
sudo iptables -F  # 全ルール削除
sudo iptables -P INPUT ACCEPT    # デフォルト許可
sudo iptables -P OUTPUT ACCEPT   # デフォルト許可
```

#### パッケージインストール失敗
```bash
# npm/bun installでネットワークエラー
# 1. シンプル設定に切り替え
# 2. または、必要なドメインをファイアウォール許可リストに追加

# DNS解決エラー
# 解決: /etc/resolv.conf の確認
cat /etc/resolv.conf
```

#### パフォーマンス問題
```bash
# メモリ使用量確認
free -h
docker stats

# ディスク使用量確認
df -h
docker system df

# 不要なコンテナ・イメージの削除
docker system prune -f
```

### DevContainer設定カスタマイズパターン

#### 拡張機能の追加
```json
// .devcontainer/devcontainer.json
"customizations": {
  "vscode": {
    "extensions": [
      "biomejs.biome",           // 必須: プロジェクト標準
      "eamodio.gitlens",         // 必須: Git支援
      "bradlc.vscode-tailwindcss", // 必須: Tailwind
      "ms-vscode.vscode-typescript-next", // オプション: TypeScript支援
      "christian-kohler.path-intellisense"  // オプション: パス補完
    ]
  }
}
```

#### 環境変数の設定
```json
"remoteEnv": {
  "NODE_OPTIONS": "--max-old-space-size=4096",
  "CLAUDE_CONFIG_DIR": "/home/node/.claude",
  "PROJECT_ENV": "devcontainer"
}
```

#### Dockerfile のカスタマイズ
```dockerfile
# 追加パッケージのインストール
RUN apt update && apt install -y \
  your-additional-package \
  another-tool

# 追加のグローバルnpmパッケージ
RUN npm install -g \
  your-global-package
```

この実装により、セキュアで効率的な開発環境の標準化が実現されました。