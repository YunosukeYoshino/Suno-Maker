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

### DDD エンティティテンプレート
```typescript
// src/domain/entities/[EntityName].ts
export class EntityName {
  private constructor(
    private readonly id: EntityId,
    private property: PropertyValueObject
  ) {}

  static create(
    id: EntityId,
    property: PropertyValueObject
  ): EntityName {
    return new EntityName(id, property);
  }

  static reconstruct(
    id: EntityId,
    property: PropertyValueObject
  ): EntityName {
    return new EntityName(id, property);
  }

  getId(): EntityId {
    return this.id;
  }

  getProperty(): PropertyValueObject {
    return this.property;
  }

  updateProperty(newProperty: PropertyValueObject): void {
    this.property = newProperty;
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

### ユースケーステンプレート
```typescript
// src/application/usecases/[ActionName]UseCase.ts
export class ActionNameUseCase {
  constructor(
    private readonly repository: IEntityRepository
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

### テストテンプレート
```typescript
// __tests__/[TestTarget].test.ts
import { describe, it, expect, beforeEach } from 'vitest';

describe('TestTarget', () => {
  beforeEach(() => {
    // セットアップ
  });

  describe('正常系', () => {
    it('期待される動作を説明', () => {
      // Arrange
      // Act
      // Assert
    });
  });

  describe('異常系', () => {
    it('エラーケースの説明', () => {
      // Arrange
      // Act & Assert
      expect(() => {
        // error triggering code
      }).toThrow('Expected error message');
    });
  });
});
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