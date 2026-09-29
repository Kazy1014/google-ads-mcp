# Google Cloud認可とブランド確認

更新日：2026-09-30。利用者が自分のGoogle Cloudプロジェクト・ブランド・所有ドメインで設定する手順です。配布者のOAuth認証情報やドメインを利用する仕組みは提供しません。

## 1. 自分のGoogle Cloudプロジェクト

[Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成・選択し、Google Ads APIを有効にします。OAuthクライアントもこのプロジェクトで作成してください。API権限はこのプロジェクトに紐づきます。

[Google Ads API概要](https://console.cloud.google.com/google/ads-apis/overview)からアクセスレベルを確認します。

| レベル | 利用対象 | キーワードプランナー |
| --- | --- | --- |
| Test | Google Adsのテストアカウントのみ | 実際の検索需要を取得する用途には使えない |
| Explorer | テスト・本番アカウント | Planningサービスは制限対象 |
| Basic | テスト・本番アカウント、原則15,000操作/日 | 今回必要なレベル |
| Standard | より大きな利用規模 | この導入手順では申請不要 |

最初にExplorerを申請し、その後ブランド確認を完了してBasicを申請します。OAuthの「テストユーザー」はログイン許可の設定で、APIのTestアクセスとは別です。

[公式アクセスレベル](https://developers.google.com/google-ads/api/docs/api-policy/access-levels)

## 2. 自分のアプリと公開ページ

OSSのMCP識別名`google-keyword-planner`とOAuthのブランド名は別です。OAuthのApp nameには利用者自身のブランドを示す名前を使い、利用者の公開ページと一致させます。

Google Auth Platformでアプリ名、サポートメール、開発者連絡先を設定します。アプリ名は自分のブランドを識別できる名前にし、ホームページの表示名と揃えてください。Googleの公式アプリと誤認される名前を避けます。審査通過を保証する名前はありません。

自分で管理するドメインに以下を公開します。URLは例で、実際には自分のものへ置き換えます。

| 項目 | 例 |
| --- | --- |
| Application home page | `https://example.com/keyword-tool` |
| Application privacy policy link | `https://example.com/keyword-tool/privacy` |
| Authorized domains | `example.com` |
| Application terms of service link | 自分の利用規約がある場合、その公開URL |

ページはログイン不要で閲覧でき、アプリの用途・運営者・問い合わせ先を示す必要があります。ホームページからプライバシーポリシーへリンクします。ポリシーには取得データ、用途、保存先・保持期間、GoogleやMCPクライアント・AIサービスへの共有、削除とアクセス取消の手順を実際の運用に合わせて説明してください。配布元の説明文をそのまま自分の運用の保証として使わないでください。

[公式OAuth確認要件](https://support.google.com/cloud/answer/13464321)

## 3. 自分のドメインの所有権確認

Google Cloudプロジェクトのオーナーまたは編集者のGoogleアカウントで[Search Console](https://search.google.com/search-console)を開きます。

1. 「プロパティを追加」→「ドメイン」に自分のドメインを入力。
2. 提示されたTXTレコードを、そのドメインのDNS管理サービスへ追加。
3. Search Consoleで「確認」を押して成功を確認。確認用レコードは保持します。
4. Google Auth PlatformのAuthorized domainsに自分のドメインを登録。

サイトを公開しただけでは所有権確認は完了しません。「所有者として登録されていない」と表示されたら、確認に使ったアカウントとプロジェクト権限を見直します。24時間待つよう案内された場合は、その時間を待って再確認してください。

[公式所有権確認手順](https://support.google.com/webmasters/answer/9008080)

## 4. ブランド確認とBasic再申請

1. AudienceでUser typeをExternal、Publishing statusをIn productionに設定。
2. Brandingで必要な情報を保存し、Verify Brandingを実行。
3. エラーを解消し、確認完了後にPublish brandingを実行。
4. 「branding has been verified and is being shown to users」等の確認済み表示を確認。
5. Google Ads API概要へ戻り、BasicのApply for accessを実行。
6. Current access levelがBasicになるまで確認。

Basicがブランド未確認で拒否されても、ブランド確認後に再申請できます。申請結果・所要時間はGoogleの判断に依存します。ブランド確認はOAuthスコープの検証とは別です。多数の外部ユーザーに提供する場合は、スコープの審査やGoogle API利用ポリシーへの適合も確認してください。

[公式ブランド確認手順](https://developers.google.com/google-ads/api/docs/api-policy/brand-verification)

## 5. OAuthとアカウントID

[setup-auth.md](setup-auth.md)で自分のOAuthクライアントとRefresh Tokenを取得します。Google Adsの右上のプロフィールから「お客様ID」を確認し、ハイフンなしの10桁を設定してください。MCCを経由する場合、広告アカウントをCustomer ID、MCCをLogin Customer IDに使います。

Developer Tokenは2026年9月9日に廃止されました。新規にAPI Centerから申請しません。現在のNodeライブラリは旧ヘッダーを要求するため、本実装では未設定時に非機密の互換値を使用します。実際の許可はOAuthクライアントのCloudプロジェクトで判定されます。将来APIが旧ヘッダーを拒否する場合は、ライブラリの更新が必要です。

[公式移行案内](https://developers.google.com/google-ads/api/docs/api-policy/developer-token)
