# Dockerで実行する

Google Cloud認可・ブランド確認・OAuth取得は[CLOUD_AUTH_SETUP.md](CLOUD_AUTH_SETUP.md)と[setup-auth.md](setup-auth.md)で利用者自身が行います。Desktop OAuthヘルパーはホストで実行し、コンテナには取得済み設定を渡します。

この更新はGitHubソースのものです。既存のDocker Hubイメージの更新は保証しないため、ソースからビルドしてください。

```bash
docker build -t google-ads-mcp:local .
docker run --rm -i --env-file /private/path/.env google-ads-mcp:local
```

Dockerはstdioで通信するため、MCPクライアントが`docker run --rm -i`を子プロセスとして起動します。ポート公開と`-t`は不要です。

```json
{
  "mcpServers": {
    "google-keyword-planner": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "--env-file", "/private/path/.env", "google-ads-mcp:local"]
    }
  }
}
```

Dockerのenvファイルには`KEY=value`形式を使い、値を引用符で囲まないでください。Node用ヘルパーは値を引用符付きで保存するため、Docker用には自分の非公開ファイルで引用符を除いた形式を用意します。内容を公開ログへ出力しないでください。

`docker compose run --rm -T google-ads-mcp`も使用できます。Composeの.envはCompose側の変数展開用です。Dockerのコンテナ環境やログにアクセスできるユーザーは認証情報を読める可能性があるため、実行環境のアクセス権を管理してください。
