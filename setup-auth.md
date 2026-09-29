# 自分のOAuth認証情報とRefresh Tokenの取得

Google Cloud認可・ブランド確認・Basic申請は[CLOUD_AUTH_SETUP.md](CLOUD_AUTH_SETUP.md)に従って、利用者自身で行ってください。認証情報をIssue・PR・チャット・スクリーンショットへ貼り付けないでください。

## 方法A：Desktop OAuth + ローカルヘルパー

1. 自分のGoogle CloudプロジェクトのGoogle Auth Platform → Clientsで「Desktop app」のOAuthクライアントを作成します。
2. 作成時にJSONをダウンロードし、リポジトリ外の非公開ディレクトリへ保存します。
3. Node.js 22以上でビルド済みソースから次を実行します。出力先の親ディレクトリは先に作成してください。

```bash
npm run get-refresh-token -- --credentials /private/path/desktop-oauth.json --output /private/path/.env
```

Windowsでは自分のパスへ置き換え、空白を含むパスを引用符で囲みます。

4. ターミナルに表示される認証URLを自分のブラウザで開き、対象のGoogle Adsアカウントに権限のあるGoogleアカウントで承認します。
5. ブラウザは127.0.0.1の一時ポートへ戻ります。承認コードは自動的に受け取り、トークンへ交換します。
6. Client ID・Client Secret・Refresh Tokenを指定した.envへ保存します。値やトークン応答は表示しません。既存のCustomer IDなどの設定は保持し、認証3項目を更新します。macOS/Linuxではファイルは所有者のみ読み書きできるモード600です。Windowsではファイルのアクセス権も確認してください。

state確認・PKCE・5分の待ち時間制限を使用します。外部インターフェースにはリッスンしません。ヘルパーは必ず自分のブラウザと同じローカルマシンで実行してください。リモートSSH環境ではコールバック先が異なるため方法Bを使用するか、適切なローカルOAuthフローを準備します。

旧`urn:ietf:wg:oauth:2.0:oob`方式や手動コピーする認証コードは使用しません。

[Google公式Desktop OAuth](https://developers.google.com/identity/protocols/oauth2/native-app)

## 方法B：Web OAuth + Google公式OAuth Playground

すでにWebクライアントがある場合や、ヘルパーを使わない場合はこちらを選びます。DesktopクライアントをPlaygroundに入力しないでください。

1. 自分のプロジェクトで「Web application」のOAuthクライアントを作成。
2. Authorized redirect URIsに`https://developers.google.com/oauthplayground`を追加。
3. 作成されたClient ID・Client Secretを自分の非公開ファイルへ保存。
4. [OAuth Playground](https://developers.google.com/oauthplayground/)の歯車でUse your own OAuth credentialsをオンにし、自分のクライアントID・Secretを入力。
5. OAuth flowはServer-side、Access typeはOffline、Force promptはConsent Screen。
6. Step 1の入力欄に`https://www.googleapis.com/auth/adwords`を入力し、Authorize APIsを押す。
7. Google Adsに権限のあるアカウントで承認し、Step 2のExchange authorization code for tokensを押す。
8. Refresh tokenを非公開の.envへ保存。Access tokenをRefresh tokenの欄に入れないでください。

Playgroundの既定クライアントをそのまま使用せず、自分のOAuth認証情報を使います。利用後のリダイレクトURI整理はGoogleの手順に従ってください。

[Google公式Playground操作手順](https://developers.google.com/search-ads/reporting/concepts/oauth-playground)（このページはSearch Ads 360用の説明も含みます。このOSSでは必ず上記のadwordsスコープを使用します。）

## トークンの寿命と再認証

- Access Tokenの期限切れはライブラリがRefresh Tokenを使って自動更新します。
- Refresh Tokenは通常定期的な手動更新は不要ですが、永続保証はありません。
- External / Testing中に発行したRefresh Tokenは原則7日で失効します。In productionへ変更した後に取り直し、ローカル.envを更新してください。
- 6か月の未使用、ユーザーのアクセス取消、期限付き同意、管理者ポリシー、トークン発行数上限などでも失効します。
- `invalid_grant`の場合は対象クライアント・アカウント・同意を確認して再取得し、MCPクライアントを再起動します。

[公式OAuth失効条件](https://developers.google.com/identity/protocols/oauth2#expiration)

## よくあるエラー

| 表示 | 確認すること |
| --- | --- |
| redirect_uri_mismatch | PlaygroundならWebクライアントのURI、ヘルパーならDesktop JSON |
| access_denied / blocked | 自分のOAuth同意画面、テストユーザー、Workspace管理者設定 |
| CLOUD_PROJECT_NOT_APPROVED_FOR_PRODUCTION | OAuthクライアントと同じCloudプロジェクトのAPIアクセスレベル |
| Planningの権限エラー | Basic以上になっているか |
| Customer not found / permission denied | 広告アカウントID、MCC ID、ログインしたユーザーの権限 |
