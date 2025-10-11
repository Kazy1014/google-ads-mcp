# Google Ads MCP セットアップガイド（簡易版）

このガイドでは、Google Ads MCPサーバーを最短で動作させる手順を説明します。

## 🚀 クイックスタート

### 1. 必要な認証情報

以下の5つの情報が必要です：

| 項目 | 説明 | 取得場所 |
|------|------|----------|
| **Client ID** | OAuth2クライアントID | Google Cloud Console |
| **Client Secret** | OAuth2クライアントシークレット | Google Cloud Console |
| **Developer Token** | Google Ads API開発者トークン | Google Ads API Center |
| **Refresh Token** | OAuth2リフレッシュトークン | `npm run get-refresh-token` |
| **Customer ID** | 使用するアカウントのID | Google Ads画面右上 |
| **Login Customer ID** (MCC使用時) | MCCアカウントのID | Google Ads画面右上 |

### 2. Google Cloud Console設定

#### a. プロジェクト作成とAPI有効化

```bash
1. https://console.cloud.google.com/ にアクセス
2. 新しいプロジェクトを作成
3. 「APIとサービス」→「ライブラリ」
4. 「Google Ads API」を検索して有効化
```

#### b. OAuth同意画面の設定

```bash
1. 「APIとサービス」→「OAuth同意画面」
2. User Type: 外部を選択
3. アプリ情報を入力
4. **重要**: テストユーザーに自分のGmailアドレスを追加
5. 保存
```

#### c. OAuth認証情報の作成

```bash
1. 「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「OAuth クライアント ID」
3. アプリケーションの種類: デスクトップアプリ
4. Client IDとClient Secretをメモ
```

### 3. Google Ads設定

#### a. Developer Tokenの取得

```bash
1. https://ads.google.com/ にログイン（管理者権限必要）
2. 右上のレンチアイコン→「ツールと設定」
3. 「設定」→「APIセンター」
4. Developer Tokenを申請（テスト用で即時発行）
```

**APIセンターが見つからない場合：**
- 直接URLにアクセス: `https://ads.google.com/aw/apicenter`
- または、MCCアカウントを作成してから再度試す

#### b. Customer IDの確認

```bash
Google Adsで右上に表示される番号（XXX-XXX-XXXX）
ハイフンを除いた10桁をメモ
```

#### c. MCCアカウント使用時の注意

クライアントアカウントを使用する場合：
```
MCCアカウント (親) → Customer ID: 1234567890 ← LOGIN_CUSTOMER_ID
  └── クライアントアカウント (子) → Customer ID: 9876543210 ← CUSTOMER_ID
```

### 4. Refresh Tokenの取得

プロジェクトディレクトリで：

```bash
npm install
npm run get-refresh-token
```

画面の指示に従って：
1. Client IDを入力
2. Client Secretを入力
3. 表示されるURLをブラウザで開く
4. Googleアカウントでログインして承認
5. 認証コードをコピーして貼り付け
6. 表示されるRefresh Tokenをメモ

### 5. Claude Desktop設定

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
（実際のパス例: `C:\Users\YourUsername\AppData\Roaming\Claude\claude_desktop_config.json`）

**Windows ユーザーへ:** 詳細な手順は `WINDOWS_SETUP.md` を参照してください。

**macOS / Linux:**
```json
{
  "mcpServers": {
    "google-ads": {
      "command": "node",
      "args": [
        "/Users/YOUR_USERNAME/Development/MCP/google-ads-mcp/dist/index.js"
      ],
      "env": {
        "GOOGLE_ADS_CLIENT_ID": "your-client-id.apps.googleusercontent.com",
        "GOOGLE_ADS_CLIENT_SECRET": "GOCSPX-xxxxx",
        "GOOGLE_ADS_DEVELOPER_TOKEN": "your-developer-token",
        "GOOGLE_ADS_REFRESH_TOKEN": "1//0xxxxx",
        "GOOGLE_ADS_CUSTOMER_ID": "1234567890",
        "GOOGLE_ADS_LOGIN_CUSTOMER_ID": "9876543210",
        "SKIP_CONNECTION_TEST": "true"
      }
    }
  }
}
```

**重要な設定:**
- `GOOGLE_ADS_CUSTOMER_ID`: 使用するアカウントのID（10桁、ハイフンなし）
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID`: MCCアカウントのID（MCCアカウント使用時のみ必要）
- `SKIP_CONNECTION_TEST`: `"true"` を推奨（アカウント接続テストをスキップ）

### 6. Claude Desktopを再起動

設定を保存したら、Claude Desktopを完全に終了（Cmd/Ctrl + Q）して再起動

## ✅ 動作確認

Claudeに以下のように質問：

```
「AI」というキーワードの全世界での検索ボリュームを調べてください
```

成功すると、月間検索数、競合度、トレンドなどの情報が表示されます。

## 🔧 トラブルシューティング

### エラー: "Access blocked"
→ OAuth同意画面のテストユーザーに自分のメールアドレスを追加

### エラー: "USER_PERMISSION_DENIED"
→ `GOOGLE_ADS_LOGIN_CUSTOMER_ID` にMCCアカウントのIDを設定

### エラー: "Developer token is only approved for test accounts"
→ テストアカウントを使用するか、本番承認を申請

### エラー: "Customer account can't be accessed"
→ アカウントが有効化されているか確認

## 📚 詳細ガイド

より詳しい情報は以下を参照：
- `setup-auth.md` - 認証情報取得の詳細ガイド
- `USAGE_EXAMPLES.md` - 使用例集
- `README.md` - プロジェクト全体のドキュメント

## 💡 ヒント

### テストアカウントの使用

開発・テスト段階では、テストアカウントの使用を推奨：
- 無料で使用可能
- 即座に利用開始
- キーワードプランナーは完全に機能
- 月間15,000リクエストまで

### Location IDリファレンス

よく使う地域のID：
- 日本: `2392`
- アメリカ: `2840`
- イギリス: `2826`
- ドイツ: `2276`
- フランス: `2250`
- カナダ: `2036`

全リストは[Google Ads API ドキュメント](https://developers.google.com/google-ads/api/data/geotargets)を参照

