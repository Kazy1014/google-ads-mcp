# npmパッケージ公開ガイド

このガイドでは、Google Ads MCPサーバーをnpmに公開して、誰でも簡単にインストールできるようにする手順を説明します。

## 📦 npmパッケージとして公開するメリット

### ユーザー側

```bash
# インストールが超簡単！
npx @yourusername/google-ads-mcp

# またはグローバルインストール
npm install -g @yourusername/google-ads-mcp

# Claude Desktop設定もシンプルに
{
  "mcpServers": {
    "google-ads": {
      "command": "npx",
      "args": ["-y", "@yourusername/google-ads-mcp"]
    }
  }
}
```

### 開発者側

- バージョン管理が容易
- アップデートの配信が簡単
- 依存関係の自動解決

## 🚀 公開手順

### 1. npmアカウントの作成

```bash
# npmアカウントがない場合
# https://www.npmjs.com/signup にアクセスして登録

# ログイン
npm login
```

### 2. package.jsonの更新

`package.json` の以下を変更：

```json
{
  "name": "@yourusername/google-ads-mcp",  // ← 自分のユーザー名に変更
  "version": "1.0.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/google-ads-mcp.git"  // ← 実際のURL
  }
}
```

### 3. テストビルド

```bash
# ビルドが正常に完了することを確認
npm run build

# パッケージの内容を確認
npm pack --dry-run
```

### 4. 公開前チェックリスト

```bash
☐ README.mdが充実している
☐ LICENSEファイルがある
☐ .gitignoreと.npmignoreが適切
☐ package.jsonのfilesフィールドが正しい
☐ バージョン番号が適切
☐ リポジトリURLが正しい
☐ 機密情報が含まれていない

# 確認コマンド
npm pack --dry-run
```

### 5. 公開

```bash
# 初回公開
npm publish --access public

# アップデート時（バージョンを上げてから）
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
npm publish
```

## 📝 公開後のClaude Desktop設定

### npxを使用（推奨）

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "npx",
      "args": ["-y", "@yourusername/google-ads-mcp"],
      "env": {
        "GOOGLE_ADS_CLIENT_ID": "your-client-id",
        "GOOGLE_ADS_CLIENT_SECRET": "your-secret",
        "GOOGLE_ADS_DEVELOPER_TOKEN": "your-token",
        "GOOGLE_ADS_REFRESH_TOKEN": "your-refresh-token",
        "GOOGLE_ADS_CUSTOMER_ID": "1234567890",
        "SKIP_CONNECTION_TEST": "true"
      }
    }
  }
}
```

### グローバルインストールを使用

```bash
# インストール
npm install -g @yourusername/google-ads-mcp
```

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "google-ads-mcp",
      "args": [],
      "env": {
        "GOOGLE_ADS_CLIENT_ID": "your-client-id",
        "GOOGLE_ADS_CLIENT_SECRET": "your-secret",
        "GOOGLE_ADS_DEVELOPER_TOKEN": "your-token",
        "GOOGLE_ADS_REFRESH_TOKEN": "your-refresh-token",
        "GOOGLE_ADS_CUSTOMER_ID": "1234567890",
        "SKIP_CONNECTION_TEST": "true"
      }
    }
  }
}
```

## 🔄 バージョンアップデート

### セマンティックバージョニング

- **MAJOR** (1.0.0 → 2.0.0): 破壊的変更
- **MINOR** (1.0.0 → 1.1.0): 新機能追加（後方互換性あり）
- **PATCH** (1.0.0 → 1.0.1): バグフィックス

```bash
# パッチバージョンアップ
npm version patch
git push && git push --tags
npm publish

# マイナーバージョンアップ
npm version minor
git push && git push --tags
npm publish
```

## 📊 パッケージ統計

公開後、以下のサイトで統計を確認できます：

- **npm**: https://www.npmjs.com/package/@yourusername/google-ads-mcp
- **npms.io**: https://npms.io/search?q=%40yourusername%2Fgoogle-ads-mcp

## 🔒 セキュリティ

### .npmignore の設定

`.npmignore` ファイルを作成（または `.gitignore` がデフォルトで使用される）：

```
# npmパッケージに含めないファイル
.env
.env.*
*.log
coverage/
.nyc_output/
.vscode/
.idea/
*.swp
src/
tsconfig.json
.git/
```

### 公開前の最終確認

```bash
# パッケージに何が含まれるか確認
npm pack
tar -xzf google-ads-mcp-1.0.0.tgz
ls -la package/

# 機密情報が含まれていないか確認
grep -r "GOCSPX-\|refresh_token\|687768806425" package/

# 確認後削除
rm -rf package/ google-ads-mcp-1.0.0.tgz
```

## 🎯 推奨: スコープ付きパッケージ

個人用または組織用には、スコープ付きパッケージを推奨：

```json
{
  "name": "@yourusername/google-ads-mcp"  // ✅ 推奨
  // または
  "name": "@yourorg/google-ads-mcp"
}
```

メリット：
- 名前の衝突を避けられる
- 所有者が明確
- プライベートパッケージにも対応

## 📢 プロモーション

公開後の宣伝方法：

1. **GitHub**: READMEにnpmバッジを追加
   ```markdown
   [![npm version](https://badge.fury.io/js/@yourusername%2Fgoogle-ads-mcp.svg)](https://www.npmjs.com/package/@yourusername/google-ads-mcp)
   ```

2. **ドキュメント**: インストール手順を更新

3. **SNS**: Twitter/X, LinkedIn, Redditなどで共有

## 🆘 トラブルシューティング

### "You do not have permission to publish"

```bash
# ログイン状態を確認
npm whoami

# 再ログイン
npm logout
npm login
```

### "Package name already exists"

パッケージ名を変更するか、スコープを追加：
```json
{
  "name": "@yourusername/google-ads-mcp"
}
```

### "Must be logged in to publish"

```bash
npm login
# ユーザー名、パスワード、メールアドレスを入力
```

## 🔗 参考リンク

- [npm Publishing Guide](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [package.json Reference](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)
- [Semantic Versioning](https://semver.org/)


