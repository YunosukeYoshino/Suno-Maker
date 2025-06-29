# 0. 事前確認
# 変更対象のファイルがあるか確認（必須ステップ）
git status

# 1. ブランチ作成（すでにブランチがある場合はスキップ）
# "feature/awesome-change" は任意のブランチ名に変更

# 2. 変更をステージングしてコミット
git add .
huskyで整形されるファイルがある場合は再びgit add .を実行してください。

# 3. リモートに push（初回の場合は -u をつけて upstream 設定）

# 4. PR 作成（server-github MCPを使用）
- 必ず日本語で書いてください。
- Assignees: yourself
- Labels: "bug", "enhancement", "feature" など適切なもの

# 5. PR後200秒待ってください。

# 6. PRの内容を確認
- AIレビュワーがいるので、レヴュワーのコメントを取得し、改善するかどうか計画してください。
