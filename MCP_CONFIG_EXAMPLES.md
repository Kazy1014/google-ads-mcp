# ユーザー共通MCP設定

先に[導入](SETUP_GUIDE.md)を完了します。共通のビルド先と非公開.envの絶対パスを登録すると、作業中のプロジェクトに依存せず起動できます。以下のパスは自分の環境へ置き換えてください。認証情報の値をCLIの引数や公開設定例へ直接書かないでください。

## Codex

ユーザー共通の設定に登録します。プロジェクト内の`.codex/config.toml`へ書く必要はありません。

```bash
codex mcp add google-keyword-planner -- node --env-file=/private/path/.env /absolute/path/to/google-ads-mcp/dist/index.js
codex mcp get google-keyword-planner
```

必要ならユーザーの`config.toml`で`startup_timeout_sec = 30`、`tool_timeout_sec = 120`を設定します。Orcaなどが別の`CODEX_HOME`を使用する場合、そのCLIが実際に読み込むアカウント共通設定へ登録されます。値を既定のホームへ無理に上書きせず、実際の設定場所を確認してください。

[Codex公式MCP設定](https://developers.openai.com/codex/mcp)

## AGY

```bash
agy mcp add google-keyword-planner node --env-file=/private/path/.env /absolute/path/to/google-ads-mcp/dist/index.js
agy mcp list
```

利用しているAGYの`agy mcp add --help`で対応オプションを確認してください。既存セッションは再起動します。

## Claude Desktop / Cursor

```json
{
  "mcpServers": {
    "google-keyword-planner": {
      "command": "/absolute/path/to/node",
      "args": [
        "--env-file=/private/path/.env",
        "/absolute/path/to/google-ads-mcp/dist/index.js"
      ]
    }
  }
}
```

- Claude Desktop macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Claude Desktop Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Cursor: ユーザー共通の`~/.cursor/mcp.json`

既存のサーバー設定を保持して項目を追加します。GUIアプリでPATHが異なる場合は、Node.jsの絶対パスを指定してください。ファイル保存後、新しいセッションまたはアプリの再起動でツールを読み込みます。

Windowsでは`C:\private\google-ads.env`や`C:\tools\google-ads-mcp\dist\index.js`のようにJSON中のバックスラッシュを二重にします。[Windows用JSON例](claude-config-example-windows.json)

## ローカル登録の範囲

この設定はそのマシンのユーザー共通設定です。他のマシン・クラウド実行環境へ認証情報や設定が自動共有されるものではありません。MCPクライアントの許可設定に従ってツールを実行し、出力が外部AIサービスへ渡る場合は、そのサービスのデータ管理設定も確認してください。
