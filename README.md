# google-keyword-planner

Google Ads APIのキーワード調査を、Codex・AGY・Claude DesktopなどのMCPクライアントから利用するOSSです。利用者自身のGoogle Cloudプロジェクト、OAuthクライアント、Google Adsアカウントを使用します。

## 2026年9月の認証方式に対応（2026-09-30更新）

- Google Ads API v25 / Node.js 22.9以上に対応しました。
- APIのアクセス権限はGoogle Cloudプロジェクト単位で管理します。Developer Tokenの新規取得は不要です。
- キーワードプランナーにはBasic以上のアクセスが必要です。ExplorerではPlanning機能が制限されます。
- Basic申請に必要なブランド確認は、利用者が自分のアプリ名・連絡先・所有ドメイン・公開ページで行います。このOSSの配布元のブランドや認可は共有できません。
- Refresh Token取得ヘルパーを、廃止済みOOB方式からloopbackコールバック＋PKCEへ変更しました。

[更新履歴](CHANGELOG.md)・[新方式の設定手順](CLOUD_AUTH_SETUP.md)・[公式の移行案内](https://developers.google.com/google-ads/api/docs/api-policy/developer-token)

MCPの公開識別名・設定キーは `google-keyword-planner` です。既存のnpmパッケージ名とリポジトリ名は互換性のため維持しています。

## はじめに

1. [CLOUD_AUTH_SETUP.md](CLOUD_AUTH_SETUP.md)：自分のプロジェクトを作り、Explorer・ブランド確認・Basic申請を進める。
2. [setup-auth.md](setup-auth.md)：自分のOAuthクライアントでRefresh Tokenを取得する。
3. [SETUP_GUIDE.md](SETUP_GUIDE.md)：ソースをビルドし、ローカルの環境ファイルへ設定する。
4. [MCP_CONFIG_EXAMPLES.md](MCP_CONFIG_EXAMPLES.md)：利用するクライアントのユーザー共通MCPとして登録する。

この更新はGitHubのソースに対するものです。既存のnpmパッケージやDocker Hubイメージへ自動的には反映されません。新方式は当面このソースからビルドして使用してください。

## ツール

| 名前 | 機能 |
| --- | --- |
| `analyze_global_keyword_interest` | 実装で指定した主要6か国・英語条件のキーワード指標 |
| `analyze_keywords_by_location` | 地域IDを指定した指標（既定言語は英語） |
| `get_detailed_keyword_plan` | キーワード指標と関連キーワード候補 |

`global`という名前ですが、全世界・全言語の合計を保証するものではありません。現在の実装の対象国は米国・英国・日本・ドイツ・フランス・カナダです。検索需要の推計値や広告競合度は、検索結果のSEO難易度とは異なります。

stdio MCPとして動作します。HTTPサーバーやブラウザ上の認証サービスは提供しません。広告を作成・変更するツールはありませんが、OAuthスコープ自体は読み取り専用ではありません。MCPクライアント経由で調査結果が外部AIサービスに送信される可能性があります。

## 開発

```bash
npm ci
npm test
npm run dev
```

Node.js 22.9以上を使用します。テストは偽の認証情報とローカルコールバックで実行し、Google Adsへの実リクエストを送りません。

## ブランチ運用

- `dev`：デフォルトブランチ。`feature/*`からPRを作成します。
- `main`：リリース用。`dev`からPRで反映します。
- 専用git worktreeはクローン本体配下の`.claude/.worktrees/<branch-name>`に作成します。
- マージはマージコミットを作成し、ブランチとworktreeを保持します。

```bash
git fetch origin
git worktree add -b feature/topic .claude/.worktrees/feature-topic origin/dev
```

## その他の資料

- [認証情報の保護](SECURITY.md)
- [Windows](WINDOWS_SETUP.md)
- [Docker](DOCKER_SETUP.md)
- [利用例](USAGE_EXAMPLES.md)
- [公式Google Ads API](https://developers.google.com/google-ads/api/docs/start)

MIT License。Googleの公式製品ではありません。
