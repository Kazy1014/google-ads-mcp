# ローカル導入

先に[CLOUD_AUTH_SETUP.md](CLOUD_AUTH_SETUP.md)と[setup-auth.md](setup-auth.md)で、自分のプロジェクトのAPI権限・OAuth認証情報を取得します。Node.js 22.9以上が必要です。

## ビルド

```bash
git clone https://github.com/GoogleAdsMcpOrg/google-ads-mcp.git
cd google-ads-mcp
git fetch origin
git worktree add -b setup/local .claude/.worktrees/setup-local origin/dev
cd .claude/.worktrees/setup-local
npm ci
npm run build
```

最新のGitHubソースを使用します。npm公開版やDocker Hubの既存イメージへ反映されたことを意味しません。MCPを使い続ける場合、登録するビルド先を保持してください。

## 自分の設定ファイル

`.env.example`をリポジトリ外の非公開ディレクトリの`.env`へコピーして、自分の値へ置き換えます。

```dotenv
GOOGLE_ADS_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=your-client-secret
GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token
GOOGLE_ADS_CUSTOMER_ID=1234567890
# MCCを経由する場合のみ
GOOGLE_ADS_LOGIN_CUSTOMER_ID=9876543210
```

数字は架空の例です。自分のCustomer IDへ置き換えてください。macOS/Linuxでは`chmod 600 /private/path/.env`を実行し、Windowsではアクセス権を制限します。

```bash
node --env-file=/private/path/.env /absolute/path/to/google-ads-mcp/dist/index.js
```

stdioの入力待ちになるのは正常です。通常は[MCP_CONFIG_EXAMPLES.md](MCP_CONFIG_EXAMPLES.md)の手順でクライアントから起動します。`.env`を作業ディレクトリへ置いた場合は`npm start`でも読み込みます。

接続テストだけを省く場合は`SKIP_CONNECTION_TEST=true`を設定できますが、これはAPI権限や認証を回避しません。実データ取得には有効な設定が必要です。

## 確認

```bash
npm test
```

自動テストはGoogleへ通信しません。MCPクライアントを起動して3ツールが見えることを確認後、少数のキーワードで実データ取得を試してください。既定の言語は英語です。
