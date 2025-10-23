# 配布方法まとめ

Google Ads MCPサーバーを誰でも簡単に使えるようにする3つの方法を説明します。

## 📦 配布方法の比較

| 方法 | 簡単さ | セットアップ | 更新 | ユースケース |
|------|--------|-------------|------|-------------|
| **npm/npx** | ⭐⭐⭐⭐⭐ | `npx` 1コマンド | 自動 | 一般ユーザー向け（推奨） |
| **Docker** | ⭐⭐⭐⭐ | Docker必要 | `docker pull` | 環境分離・本番環境 |

---

## 🚀 方法1: npm/npx（最推奨）

### メリット

- ✅ **最も簡単** - `npx` 1コマンドで実行
- ✅ **自動更新** - 常に最新版を使用
- ✅ **依存関係自動解決** - Node.jsだけでOK
- ✅ **クロスプラットフォーム** - Windows/macOS/Linux対応

### ユーザー側の使用方法

```bash
# インストール不要で即使用
npx @kazuya.oda/google-ads-mcp

# またはグローバルインストール
npm install -g @kazuya.oda/google-ads-mcp
google-ads-mcp
```

### Claude Desktop設定

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "npx",
      "args": ["-y", "@kazuya.oda/google-ads-mcp"],
      "env": {
        "GOOGLE_ADS_CLIENT_ID": "...",
        "GOOGLE_ADS_CLIENT_SECRET": "...",
        "GOOGLE_ADS_DEVELOPER_TOKEN": "...",
        "GOOGLE_ADS_REFRESH_TOKEN": "...",
        "GOOGLE_ADS_CUSTOMER_ID": "..."
      }
    }
  }
}
```

### 公開手順（開発者向け）

詳細は `NPM_PUBLISH.md` を参照。

```bash
# 1. npmにログイン
npm login

# 2. package.jsonを更新
# name: "@kazuya.oda/google-ads-mcp"
# repository: "https://github.com/Kazy1014/google-ads-mcp"

# 3. ビルド
npm run build

# 4. 公開
npm publish --access public
```

### 更新方法

```bash
# バージョンアップ
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# 公開
npm publish
```

ユーザーは自動的に最新版を取得（npx使用時）

---

## 🐳 方法2: Docker

### メリット

- ✅ **完全な環境分離** - システム環境に依存しない
- ✅ **一貫性** - どこでも同じ動作
- ✅ **デプロイ容易** - 本番環境への展開が簡単
- ✅ **スケーラブル** - 複数インスタンスを簡単に起動

### ユーザー側の使用方法

```bash
# イメージをプル
docker pull kazuyaoda/google-ads-mcp:latest

# 実行
docker run -i --rm \
  -e GOOGLE_ADS_CLIENT_ID="..." \
  -e GOOGLE_ADS_CLIENT_SECRET="..." \
  kazuyaoda/google-ads-mcp:latest

# または Docker Compose
docker-compose up -d
```

### Claude Desktop設定

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "GOOGLE_ADS_CLIENT_ID=...",
        "-e", "GOOGLE_ADS_CLIENT_SECRET=...",
        "kazuyaoda/google-ads-mcp:latest"
      ]
    }
  }
}
```

### 公開手順（開発者向け）

詳細は `DOCKER_SETUP.md` を参照。

```bash
# 1. Docker Hubにログイン
docker login

# 2. イメージをビルド
docker build -t kazuyaoda/google-ads-mcp:latest .
docker build -t kazuyaoda/google-ads-mcp:1.0.0 .

# 3. プッシュ
docker push kazuyaoda/google-ads-mcp:latest
docker push kazuyaoda/google-ads-mcp:1.0.0
```

### 更新方法

```bash
# 新バージョンのビルド
docker build -t kazuyaoda/google-ads-mcp:1.0.1 .
docker tag kazuyaoda/google-ads-mcp:1.0.1 kazuyaoda/google-ads-mcp:latest

# プッシュ
docker push kazuyaoda/google-ads-mcp:1.0.1
docker push kazuyaoda/google-ads-mcp:latest
```

---

## 🎯 推奨配布戦略

### 一般ユーザー向け

1. **npm/npx** を第一推奨（最も簡単、自動更新）
2. **Docker** はオプションとして提供（環境分離、本番環境向け）

### ドキュメント構成

```
README.md
├── インストール方法（npm/Docker）
├── 基本的なセットアップ
└── 各詳細ドキュメントへのリンク

CLAUDE_CONFIG_EXAMPLES.md
└── 配布方法別の設定例（npx/npm/Docker）

NPM_PUBLISH.md
└── npm公開の詳細手順（開発者向け）

DOCKER_SETUP.md
└── Docker使用の詳細（ユーザー＆開発者向け）

SETUP_GUIDE.md
└── 認証情報の取得方法（全ユーザー共通）
```

---

## 📊 リリースチェックリスト

### npm公開前

```bash
☐ package.jsonのnameを更新
☐ package.jsonのrepositoryを更新
☐ READMEにインストール手順を記載
☐ LICENSEファイルがある
☐ ビルドが成功する（npm run build）
☐ .npmignoreが適切
☐ npm pack --dry-runで内容確認
☐ バージョン番号が適切
☐ CHANGELOGを更新
```

### Docker公開前

```bash
☐ Dockerfileが最適化されている
☐ .dockerignoreが適切
☐ マルチステージビルドを使用
☐ 非rootユーザーで実行
☐ イメージサイズが適切（<200MB推奨）
☐ docker buildが成功する
☐ docker runでテスト完了
☐ タグ付けが適切（latest + バージョン）
```

### GitHub公開前

```bash
☐ .gitignoreが適切
☐ 機密情報が含まれていない
☐ READMEが充実している
☐ LICENSEファイルがある
☐ バッジを追加（npm, Docker Hub等）
☐ Contributing guidelinesがある
☐ Issueテンプレートを作成（オプション）
```

---

## 🎨 バッジの追加（README用）

### npm

```markdown
[![npm version](https://badge.fury.io/js/@kazuya.oda%2Fgoogle-ads-mcp.svg)](https://www.npmjs.com/package/@kazuya.oda/google-ads-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@kazuya.oda/google-ads-mcp.svg)](https://www.npmjs.com/package/@kazuya.oda/google-ads-mcp)
```

### Docker

```markdown
[![Docker Pulls](https://img.shields.io/docker/pulls/kazuyaoda/google-ads-mcp.svg)](https://hub.docker.com/r/kazuyaoda/google-ads-mcp)
[![Docker Image Size](https://img.shields.io/docker/image-size/kazuyaoda/google-ads-mcp/latest)](https://hub.docker.com/r/kazuyaoda/google-ads-mcp)
```

### GitHub

```markdown
[![GitHub stars](https://img.shields.io/github/stars/Kazy1014/google-ads-mcp.svg)](https://github.com/Kazy1014/google-ads-mcp/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Kazy1014/google-ads-mcp.svg)](https://github.com/Kazy1014/google-ads-mcp/issues)
[![License](https://img.shields.io/github/license/Kazy1014/google-ads-mcp.svg)](https://github.com/Kazy1014/google-ads-mcp/blob/main/LICENSE)
```

---

## 📢 プロモーション

### 公開したら

1. **GitHub**: リリースノートを作成
2. **npm**: パッケージページを確認
3. **Docker Hub**: イメージページを確認
4. **SNS**: Twitter/X, Reddit, LinkedInで共有
5. **コミュニティ**: MCP関連のDiscordやForumで紹介

### 継続的な改善

- ユーザーフィードバックの収集
- Issueへの対応
- 定期的なアップデート
- ドキュメントの改善

---

## 🔗 参考リンク

- [npm Publishing](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [Docker Hub](https://hub.docker.com/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

