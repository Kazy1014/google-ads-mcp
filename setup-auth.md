# Google Ads API認証セットアップガイド

このガイドでは、Google Ads APIを使用するための認証情報を取得する手順を説明します。

## 前提条件

- Google Adsアカウント（[ads.google.com](https://ads.google.com)で作成）
- Google Cloudアカウント（[console.cloud.google.com](https://console.cloud.google.com)で作成）

## ステップ1: Google Cloud Projectの作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
   - プロジェクト名：例「google-ads-mcp」
   - 組織：任意

## ステップ2: Google Ads APIの有効化

1. Google Cloud Consoleで作成したプロジェクトを選択
2. 「APIとサービス」→「ライブラリ」に移動
3. 「Google Ads API」を検索して有効化

## ステップ3: OAuth 2.0クライアントIDの作成

### 3-1. OAuth同意画面の設定（初回のみ）

1. 「APIとサービス」→「**OAuth同意画面**」に移動
2. 以下の設定を行います：

**① User Type（ユーザータイプ）**
- **外部（External）** を選択
- 「作成」をクリック

**② アプリ情報**
- アプリ名：例「Google Ads MCP」
- ユーザーサポートメール：自分のGmailアドレス
- デベロッパーの連絡先情報：自分のGmailアドレス
- 「保存して次へ」

**③ スコープ**
- デフォルトのまま
- 「保存して次へ」

**④ テストユーザー（重要！）**
- 「**+ ADD USERS**」をクリック
- **Google Adsで使用するGmailアドレスを追加**
  - 例：`kazy.daily.life@gmail.com`
- 「保存して次へ」

**⑤ 概要**
- 内容を確認して「ダッシュボードに戻る」

### 3-2. OAuth クライアント IDの作成

1. 「APIとサービス」→「**認証情報**」に移動
2. 「**認証情報を作成**」→「**OAuth クライアント ID**」を選択
3. OAuth クライアント IDの作成
   - アプリケーションの種類：**デスクトップアプリ**
   - 名前：例「Google Ads MCP Client」
   - 「作成」をクリック
4. **Client IDとClient Secretが表示されるのでメモ**
   - または、JSONをダウンロードして保管

## ステップ4: Developer Tokenの取得

### 方法1: 通常のGoogle Adsアカウントから

1. [Google Ads](https://ads.google.com/)にログイン（**管理者権限が必要**）
2. 画面右上の**レンチアイコン（🔧）**をクリック
3. 「**ツールと設定**」メニューが表示されます
4. 「**設定**」セクションの中から「**APIセンター**」を選択
5. 「Developer Token」セクションで申請
   - **テスト環境用**：即座に発行（月間15,000リクエスト制限）
   - **本番環境用**：審査が必要（数日〜数週間かかる場合あり）
6. **Developer Tokenをメモ**

### 「APIセンター」が表示されない場合

以下のいずれかが原因の可能性があります：

#### ケース1: 管理者権限がない

**解決方法：**
- アカウントの所有者または管理者に連絡して、管理者権限を付与してもらう
- または、管理者にDeveloper Tokenの取得を依頼する

#### ケース2: MCCアカウントが必要

Google Ads APIを使用する場合、MCC（マイクライアントセンター）アカウントの使用が推奨されます。

**MCCアカウントの作成：**
1. [Google Ads MCCアカウント作成ページ](https://ads.google.com/home/tools/manager-accounts/)にアクセス
2. 「今すぐ始める」をクリック
3. 必要な情報を入力してMCCアカウントを作成
4. MCCアカウントにログインして、上記の手順を再度試す

#### ケース3: 新しいインターフェース

Google Adsのインターフェースが更新されている場合：

1. 画面右上の**プロフィールアイコン**をクリック
2. 「**設定**」を選択
3. 左サイドバーから「**設定**」を探し、その中の「**APIセンター**」を選択

または：

1. 直接URLにアクセス：`https://ads.google.com/aw/apicenter`
2. このURLからAPIセンターに直接アクセスできる場合があります

### テスト環境用トークンで開始

最初はテスト環境用のDeveloper Tokenで開発を始めることをお勧めします：
- 即座に発行される
- 開発・テストには十分な機能
- 月間15,000リクエストまで利用可能
- 本番環境が必要になったら後から申請可能

## ステップ5: Refresh Tokenの取得

Refresh Tokenを取得するには、OAuth2フローを完了する必要があります。

### おすすめ: プロジェクト内のヘルパースクリプトを使用

このプロジェクトには、Refresh Token取得用のヘルパースクリプトが含まれています：

```bash
# プロジェクトディレクトリで実行
npm install
npm run get-refresh-token
```

スクリプトが以下を案内します：
1. Client IDとClient Secretの入力
2. ブラウザで開くURLの表示
3. 認証コードの入力
4. Refresh Tokenの取得

このスクリプトを使うのが最も簡単です！

### 代替方法: 手動でOAuth2フローを実行

1. 以下のURLにアクセス（CLIENT_IDを置き換え）：

```
https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=https://www.googleapis.com/auth/adwords
```

2. Googleアカウントでログインして承認
3. 表示される認証コードをコピー
4. 以下のcurlコマンドを実行（CLIENT_ID、CLIENT_SECRET、CODEを置き換え）：

```bash
curl -X POST https://oauth2.googleapis.com/token \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=YOUR_CODE" \
  -d "redirect_uri=urn:ietf:wg:oauth:2.0:oob" \
  -d "grant_type=authorization_code"
```

5. レスポンスに含まれる`refresh_token`をメモ

## ステップ6: Customer IDの取得

1. [Google Ads](https://ads.google.com/)にログイン
2. 右上に表示される10桁の番号（XXX-XXX-XXXX形式）がCustomer ID
3. **ハイフンを除いた10桁の数字をメモ**（例：1234567890）

## ステップ7: 環境変数の設定

### 開発環境の場合

プロジェクトのルートディレクトリに`.env`ファイルを作成：

```bash
GOOGLE_ADS_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=your-client-secret
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token
GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token
GOOGLE_ADS_CUSTOMER_ID=1234567890
GOOGLE_ADS_LOGIN_CUSTOMER_ID=9876543210
```

### MCPクライアントで使用する場合

MCPクライアント（Claude Desktop、Cursorなど）の設定ファイルに直接記述します。
詳細は `MCP_CONFIG_EXAMPLES.md` を参照してください。

#### 設定ファイルの場所

**Claude Desktop:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Cursor:**
- macOS: `~/.cursor/mcp.json`
- Windows: `%USERPROFILE%\.cursor\mcp.json`

## トラブルシューティング

### ❌ "Access blocked: [アプリ名] has not completed the Google verification process"

**原因：** OAuth同意画面でテストユーザーが設定されていない

**解決方法：**

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択
3. 「**APIとサービス**」→「**OAuth同意画面**」に移動
4. 画面下部の「**テストユーザー**」セクションを探す
5. 「**+ ADD USERS**」をクリック
6. Google Adsで使用する**Gmailアドレスを追加**
   - 例：`your-email@gmail.com`
7. 「保存」をクリック
8. 数分待ってから、再度認証URLにアクセス

**重要：** テストユーザーに追加したメールアドレスと、Google Adsにログインしているメールアドレスが同じである必要があります。

### ❌ "Invalid grant" エラー

- Refresh Tokenが期限切れの可能性があります。ステップ5を再実行してください。
- Client IDとClient Secretが正しいか確認してください。
- 認証コードは1回しか使用できません。新しいコードを取得してください。

### ❌ "Developer token is not approved" エラー

- Developer Tokenがまだ承認されていません。テストトークンを使用するか、承認を待ってください。
- テストトークンの場合、アカウントがテストアカウントとして登録されているか確認してください。

### ❌ "Customer not found" エラー

- Customer IDが正しいか確認してください（10桁、ハイフンなし）。
- 使用するアカウントにアクセス権限があるか確認してください。

### ⚠️ "This app isn't verified" 警告

OAuth同意画面で「このアプリは確認されていません」という警告が表示される場合：

1. 「詳細」または「Advanced」をクリック
2. 「[アプリ名]に移動（安全ではないページ）」をクリック
3. これは自分で作成したアプリなので、安全です

## 次のステップ

認証情報の取得が完了したら：

1. `MCP_CONFIG_EXAMPLES.md` を参照してMCPクライアント設定を行う
2. MCPクライアント（Claude Desktop / Cursor）を再起動
3. AI Assistantでキーワード分析を試す

## 参考リンク

- [Google Ads API Getting Started](https://developers.google.com/google-ads/api/docs/start)
- [OAuth2 Authentication](https://developers.google.com/google-ads/api/docs/oauth/overview)
- [Developer Token Application](https://developers.google.com/google-ads/api/docs/get-started/dev-token)
- [Model Context Protocol](https://modelcontextprotocol.io/)

