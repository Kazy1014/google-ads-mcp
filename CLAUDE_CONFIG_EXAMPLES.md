# Claude Desktop 設定例

配布方法に応じたClaude Desktop設定ファイル（`claude_desktop_config.json`）の例です。

## 📍 設定ファイルの場所

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

---

## 🚀 方法1: npx（最推奨）

インストール不要で最新版を常に使用。最も簡単な方法です。

**ファイル**: `claude-config-example.json`

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "npx",
      "args": [
        "-y",
        "@yourusername/google-ads-mcp"
      ],
      "env": {
        "GOOGLE_ADS_CLIENT_ID": "your-client-id.apps.googleusercontent.com",
        "GOOGLE_ADS_CLIENT_SECRET": "your-client-secret",
        "GOOGLE_ADS_DEVELOPER_TOKEN": "your-developer-token",
        "GOOGLE_ADS_REFRESH_TOKEN": "your-refresh-token",
        "GOOGLE_ADS_CUSTOMER_ID": "1234567890",
        "GOOGLE_ADS_LOGIN_CUSTOMER_ID": "9876543210",
        "SKIP_CONNECTION_TEST": "true"
      }
    }
  }
}
```

**特徴：**
- ✅ インストール不要
- ✅ 自動的に最新版を使用
- ✅ クロスプラットフォーム
- ✅ 最も推奨

---

## 📦 方法2: npm グローバルインストール

一度インストールすれば、その後はコマンド名だけで実行可能。

**事前準備：**
```bash
npm install -g @yourusername/google-ads-mcp
```

**ファイル**: `claude-config-example-npm-global.json`

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "google-ads-mcp",
      "args": [],
      "env": {
        "GOOGLE_ADS_CLIENT_ID": "your-client-id.apps.googleusercontent.com",
        "GOOGLE_ADS_CLIENT_SECRET": "your-client-secret",
        "GOOGLE_ADS_DEVELOPER_TOKEN": "your-developer-token",
        "GOOGLE_ADS_REFRESH_TOKEN": "your-refresh-token",
        "GOOGLE_ADS_CUSTOMER_ID": "1234567890",
        "GOOGLE_ADS_LOGIN_CUSTOMER_ID": "9876543210",
        "SKIP_CONNECTION_TEST": "true"
      }
    }
  }
}
```

**特徴：**
- ✅ 起動が高速
- ✅ オフラインでも動作
- ⚠️ 更新は手動（`npm update -g @yourusername/google-ads-mcp`）

---

## 🐳 方法3: Docker

完全な環境分離。本番環境や複数環境の管理に適しています。

**事前準備：**
```bash
docker pull yourusername/google-ads-mcp:latest
```

**ファイル**: `claude-config-example-docker.json`

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GOOGLE_ADS_CLIENT_ID",
        "-e",
        "GOOGLE_ADS_CLIENT_SECRET",
        "-e",
        "GOOGLE_ADS_DEVELOPER_TOKEN",
        "-e",
        "GOOGLE_ADS_REFRESH_TOKEN",
        "-e",
        "GOOGLE_ADS_CUSTOMER_ID",
        "-e",
        "GOOGLE_ADS_LOGIN_CUSTOMER_ID",
        "-e",
        "SKIP_CONNECTION_TEST",
        "yourusername/google-ads-mcp:latest"
      ],
      "env": {
        "GOOGLE_ADS_CLIENT_ID": "your-client-id.apps.googleusercontent.com",
        "GOOGLE_ADS_CLIENT_SECRET": "your-client-secret",
        "GOOGLE_ADS_DEVELOPER_TOKEN": "your-developer-token",
        "GOOGLE_ADS_REFRESH_TOKEN": "your-refresh-token",
        "GOOGLE_ADS_CUSTOMER_ID": "1234567890",
        "GOOGLE_ADS_LOGIN_CUSTOMER_ID": "9876543210",
        "SKIP_CONNECTION_TEST": "true"
      }
    }
  }
}
```

**特徴：**
- ✅ 完全な環境分離
- ✅ 一貫した動作保証
- ⚠️ Docker Desktopが必要
- ⚠️ 初回起動がやや遅い

---

## 🎯 推奨設定の選び方

| 用途 | 推奨方法 | 理由 |
|------|---------|------|
| **一般ユーザー** | npx | 最も簡単、自動更新 |
| **オフライン使用** | グローバルインストール | ネットワーク不要 |
| **本番環境・環境分離** | Docker | 環境分離、一貫性 |

---

## 🔧 環境変数の取得方法

すべての方法で以下の環境変数が必要です：

1. **GOOGLE_ADS_CLIENT_ID** / **GOOGLE_ADS_CLIENT_SECRET**
   - Google Cloud Consoleで取得
   - OAuth 2.0 クライアントIDを作成

2. **GOOGLE_ADS_DEVELOPER_TOKEN**
   - Google Ads API Centerで取得
   - テスト用トークンで即時使用可能

3. **GOOGLE_ADS_REFRESH_TOKEN**
   - プロジェクト内のヘルパーで取得：
     ```bash
     npm run get-refresh-token
     ```

4. **GOOGLE_ADS_CUSTOMER_ID**
   - Google Ads画面右上の10桁の番号

5. **GOOGLE_ADS_LOGIN_CUSTOMER_ID**（MCCアカウント使用時のみ）
   - MCCアカウントのID

詳細は `SETUP_GUIDE.md` を参照してください。

---

## 📝 設定ファイルの適用方法

1. 上記の設定をコピー
2. 環境変数を実際の値に置き換え
3. Claude Desktop設定ファイルに保存
4. Claude Desktopを完全に終了
5. Claude Desktopを再起動

---

## ⚠️ トラブルシューティング

### npxが遅い

```json
{
  "command": "google-ads-mcp",  // グローバルインストール版を使用
  "args": []
}
```

事前に：`npm install -g @yourusername/google-ads-mcp`

### 環境変数が認識されない

Claude Desktop設定ファイルの `env` セクションに正しく記載されているか確認してください。

### Dockerが起動しない

```bash
# Docker Desktopが起動しているか確認
docker ps

# イメージをプル
docker pull yourusername/google-ads-mcp:latest
```

---

## 🔗 関連ドキュメント

- `README.md` - プロジェクト概要
- `SETUP_GUIDE.md` - セットアップガイド
- `NPM_PUBLISH.md` - npm公開ガイド
- `DOCKER_SETUP.md` - Docker使用ガイド
- `DISTRIBUTION.md` - 配布方法まとめ

