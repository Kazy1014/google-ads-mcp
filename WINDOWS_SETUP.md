# Windowsでの導入

Node.js 22.9以上をインストールし、`node --version`で確認します。[Google Cloud認可](CLOUD_AUTH_SETUP.md)・[OAuth取得](setup-auth.md)・[ビルド](SETUP_GUIDE.md)は共通です。

Desktopヘルパーの例:

```powershell
npm run get-refresh-token -- --credentials "C:\private\desktop-oauth.json" --output "C:\private\google-ads.env"
```

非公開ファイルの親ディレクトリを作成し、Windowsのファイルアクセス権を自分だけに制限してください。ヘルパーのUnixモード指定だけでWindows ACLの制限は保証しません。

MCP起動設定は[Windows用JSON](claude-config-example-windows.json)と[MCP設定](MCP_CONFIG_EXAMPLES.md)を参照し、ファイルパスを自分のものへ置き換えます。秘密値はコマンドへ直接渡さず、Nodeの`--env-file`で読み込みます。
