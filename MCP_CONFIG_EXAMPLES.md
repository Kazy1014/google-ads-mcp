# MCP設定例 - MCPクライアント別設定ガイド

このドキュメントでは、各MCPクライアント（Claude Desktop、Cursorなど）向けの設定例を紹介します。

## 📍 設定ファイルの場所

### Claude Desktop

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Cursor

- **macOS**: `~/.cursor/mcp.json`
- **Windows**: `%USERPROFILE%\.cursor\mcp.json`
- **Linux**: `~/.cursor/mcp.json`

---

## 🚀 方法1: npx（最推奨）

インストール不要で最新版を常に使用。最も簡単な方法です。

> **注意**: 設定内容はClaude DesktopとCursorで共通です。保存先のファイルパスだけが異なります（上記参照）。

**参考ファイル**: `claude-config-example.json` / `cursor-mcp-example.json`

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "npx",
      "args": [
        "-y",
        "@kazuya.oda/google-ads-mcp"
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
- ✅ Claude Desktop / Cursor共通設定

---

## 📦 方法2: npm グローバルインストール

一度インストールすれば、その後はコマンド名だけで実行可能。

**事前準備：**
```bash
npm install -g @kazuya.oda/google-ads-mcp
```

> **注意**: 設定内容はClaude DesktopとCursorで共通です。

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
- ✅ Claude Desktop / Cursor共通設定
- ⚠️ 更新は手動（`npm update -g @kazuya.oda/google-ads-mcp`）

---

## 🐳 方法3: Docker

完全な環境分離。本番環境や複数環境の管理に適しています。

**事前準備：**
```bash
docker pull kazuyaoda/google-ads-mcp:latest
```

> **注意**: 設定内容はClaude DesktopとCursorで共通です。

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
        "kazuyaoda/google-ads-mcp:latest"
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
- ✅ Claude Desktop / Cursor共通設定
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

### Claude Desktop

1. 上記の設定をコピー
2. 環境変数を実際の値に置き換え
3. `claude_desktop_config.json` に保存
4. Claude Desktopを完全に終了（Cmd/Ctrl + Q）
5. Claude Desktopを再起動

### Cursor

1. 上記の設定をコピー
2. 環境変数を実際の値に置き換え
3. Cursorで `Cmd/Ctrl + Shift + P` を押す
4. "MCP: Edit Configuration" を検索して選択
5. 設定を貼り付けて保存
6. Cursorを再起動

---

## ⚠️ トラブルシューティング

### npxが遅い

```json
{
  "command": "google-ads-mcp",  // グローバルインストール版を使用
  "args": []
}
```

事前に：`npm install -g @kazuya.oda/google-ads-mcp`

### 環境変数が認識されない

MCPクライアント設定ファイルの `env` セクションに正しく記載されているか確認してください。

### Cursorで設定が反映されない

1. Cursorを完全に終了
2. `~/.cursor/mcp.json` ファイルが正しく保存されているか確認
3. Cursorを再起動
4. 開発者ツールのコンソールでエラーを確認（`Help` → `Toggle Developer Tools`）

### Dockerが起動しない

```bash
# Docker Desktopが起動しているか確認
docker ps

# イメージをプル
docker pull kazuyaoda/google-ads-mcp:latest
```

---

## 🔗 関連ドキュメント

- `README.md` - プロジェクト概要
- `SETUP_GUIDE.md` - セットアップガイド
- `NPM_PUBLISH.md` - npm公開ガイド
- `DOCKER_SETUP.md` - Docker使用ガイド
- `DISTRIBUTION.md` - 配布方法まとめ

