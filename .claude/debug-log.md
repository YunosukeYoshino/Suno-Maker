# Debug Log

## 重要なデバッグ記録

### 最新のデバッグセッション

#### Session: 2024-XX-XX - Genre Selection System Implementation
**Problem**: ジャンル選択システムの実装
**Status**: 進行中
**Branch**: `feature/genre-selection-system`

**Current State**:
- DDD アーキテクチャベースでジャンル機能を実装中
- 値オブジェクト、エンティティ、ユースケースの段階的実装

**Key Findings**:
- Biome の設定が正常に動作していることを確認
- TypeScript の厳密モードが適切に機能
- テスト環境 (Vitest) が正常稼働

## 過去の重要なデバッグケース

### Case 1: Biome Migration Issues
**Date**: 2024年初期
**Problem**: ESLint から Biome への移行時の設定競合
**Solution**: 
- ESLint 関連ファイルを完全削除
- biome.json の設定を段階的に適用
- 既存コードの一括フォーマット実行

**Lessons Learned**:
- 移行時は古い設定ファイルの完全削除が必要
- Biome の自動修正機能は段階的に適用すべき

### Case 2: shadcn/ui Component Path Issues
**Date**: 2024年初期
**Problem**: コンポーネントが `src/components/ui/` に配置され、インポートエラー発生
**Solution**:
- components.json の `ui.path` を `/components/ui` に変更
- 既存コンポーネントを正しいパスに移動
- import パスを `@/components/ui/` に統一

**Lessons Learned**:
- shadcn/ui の配置パスは初期設定が重要
- TypeScript のパスエイリアス設定と整合性を保つ

### Case 3: Next.js App Router Routing Issues
**Date**: 2024年中期
**Problem**: App Router の動的ルーティングが期待通りに動作しない
**Solution**:
- ファイル命名規則を App Router 仕様に合わせて修正
- `page.tsx` ファイルの配置を適正化
- middleware.ts の設定を見直し

**Lessons Learned**:
- App Router はファイルシステムベースルーティングの規則が厳密
- 動的ルートは `[param]` フォルダ構造で実装

## デバッグ手法・ツール

### 一般的なデバッグアプローチ
1. **段階的問題切り分け**
   - 最小再現ケースの作成
   - ログ出力による状態確認
   - ブレークポイントによるステップ実行

2. **型エラー対応**
   - `bun run typecheck` による型チェック
   - TypeScript Language Server のエラー詳細確認
   - 段階的な型定義の追加

3. **テスト失敗時の対応**
   - `bun test:watch` による連続テスト実行
   - テストケースの単体実行
   - モックオブジェクトの状態確認

### 使用ツール・コマンド
```bash
# 型チェック
bun run typecheck

# リンティング（問題特定）
bun run lint

# テスト（詳細出力）
bun test -- --reporter=verbose

# ビルドエラー確認
bun run build

# 開発サーバーログ確認
bun dev
```

### よくある問題パターン

#### 1. Import Path Errors
**症状**: モジュールが見つからないエラー
**対策**:
- tsconfig.json のパスエイリアス確認
- 実際のファイル配置確認
- 相対パス vs 絶対パスの使い分け

#### 2. Type Definition Issues
**症状**: TypeScript エラーが解決しない
**対策**:
- 型定義ファイル (.d.ts) の確認
- 第三者ライブラリの型サポート状況確認
- any 型の一時的使用（後でリファクタリング）

#### 3. Test Environment Issues
**症状**: テストが実行環境で失敗
**対策**:
- test-setup.ts の設定確認
- vitest.config.ts のパス設定確認
- モック設定の見直し

#### 4. Build/Deploy Issues
**症状**: 本番ビルドでエラー発生
**対策**:
- 開発環境との差異確認
- 環境変数の設定確認
- 静的解析エラーの修正

## 継続監視項目

### パフォーマンス監視
- バンドルサイズの変化
- ビルド時間の変化
- テスト実行時間の変化

### 品質監視
- TypeScript エラー数
- テストカバレッジ率
- Biome による警告数

### 依存関係監視
- パッケージの脆弱性
- 依存関係の更新状況
- 非互換性の問題

## トラブルシューティング履歴

### 解決済み問題
✅ Biome 設定の競合問題  
✅ shadcn/ui パス設定問題  
✅ App Router ルーティング問題  
✅ TypeScript 厳密モード対応  
✅ テスト環境セットアップ  

### 継続対応中
🔄 パフォーマンス最適化  
🔄 E2E テスト環境構築  
🔄 CI/CD パイプライン改善  

### 今後対応予定
📋 セキュリティ監査実施  
📋 アクセシビリティ対応  
📋 国際化完全対応