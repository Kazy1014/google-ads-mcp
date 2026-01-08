# Google Ads MCP Server

Model Context Protocol (MCP) サーバーで、AI Assistant（Claude Desktop、Cursorなど）からGoogle Ads APIのキーワードプランナー機能にアクセスできます。特定のキーワードに関する全世界の検索ボリュームや興味関心を調査できます。

## 🎯 対応クライアント

- ✅ **Claude Desktop** - Anthropic公式デスクトップアプリ
- ✅ **Cursor** - AI統合エディタ
- ✅ その他MCPプロトコル対応クライアント

## 機能

### 利用可能なツール

1. **analyze_global_keyword_interest**
   - 指定したキーワードの全世界での検索ボリュームと競合度を分析
   - 月間平均検索数、競合レベル、トレンド情報を提供

2. **analyze_keywords_by_location**
   - 特定の地域でのキーワード分析
   - 地域別のマーケティング戦略に有用

3. **get_detailed_keyword_plan**
   - 関連キーワードを含む包括的なキーワードプラン
   - SEO戦略やコンテンツ計画に最適

## アーキテクチャ

このプロジェクトはメンテナンス性を重視したレイヤードアーキテクチャを採用しています：

```
src/
├── index.ts                    # エントリーポイント
├── types/                      # 型定義
│   └── index.ts
├── config/                     # 設定管理
│   └── ConfigLoader.ts
├── infrastructure/             # インフラストラクチャ層
│   └── GoogleAdsClient.ts      # Google Ads API クライアント
├── domain/                     # ドメイン層
│   └── KeywordPlannerService.ts # ビジネスロジック
├── application/                # アプリケーション層
│   └── KeywordPlannerUseCase.ts # ユースケース
└── presentation/               # プレゼンテーション層
    └── MCPServer.ts            # MCP サーバー実装
```

### レイヤーの役割

- **Presentation Layer**: MCPプロトコルの処理
- **Application Layer**: ユースケースの実装、ビジネスフローの制御
- **Domain Layer**: コアビジネスロジック
- **Infrastructure Layer**: 外部API連携

## 📦 インストール方法

### オプション1: npm/npx（最も簡単・推奨）

```bash
# npx で直接実行（インストール不要）
npx @kazuya.oda/google-ads-mcp

# またはグローバルインストール
npm install -g @kazuya.oda/google-ads-mcp
```

MCPクライアント設定例：

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "google-ads": {
      "command": "npx",
      "args": ["-y", "@kazuya.oda/google-ads-mcp"],
      "env": {
        "GOOGLE_ADS_CLIENT_ID": "your-client-id",
        ...
      }
    }
  }
}
```

**Cursor** (`mcp.json`):
```json
{
  "mcpServers": {
    "google-ads": {
      "command": "npx",
      "args": ["-y", "@kazuya.oda/google-ads-mcp"],
      "env": {
        "GOOGLE_ADS_CLIENT_ID": "your-client-id",
        ...
      }
    }
  }
}
```

詳細は `MCP_CONFIG_EXAMPLES.md` を参照。

### オプション2: Docker

```bash
docker pull kazy1014/google-ads-mcp:latest

# または Docker Compose
docker-compose up -d
```

詳細は `DOCKER_SETUP.md` を参照。

---

**開発者向け:** ソースからビルドする場合は、リポジトリをクローンして `npm install && npm run build` を実行してください。

## セットアップ（認証情報の取得）

### 1. Google Ads API認証情報の取得

Google Ads APIを使用するには以下が必要です：

#### a. Google Cloud Projectの設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. Google Ads APIを有効化
4. OAuth 2.0クライアントIDを作成（デスクトップアプリケーション）

#### b. Developer Tokenの取得

1. [Google Ads](https://ads.google.com/) にログイン
2. Tools & Settings → Setup → API Center
3. Developer tokenを申請（テスト用でもOK）

#### c. Refresh Tokenの取得

**簡単！ヘルパースクリプトを使用：**

```bash
npm run get-refresh-token
```

このスクリプトが対話的にRefresh Tokenの取得をサポートします。
詳細な手順は `setup-auth.md` を参照してください。

### 2. MCPクライアント設定

取得した認証情報をMCPクライアントの設定ファイルに追加します。

#### 設定ファイルの場所

**Claude Desktop:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Cursor:**
- macOS: `~/.cursor/mcp.json`
- Windows: `%USERPROFILE%\.cursor\mcp.json`
- Linux: `~/.cursor/mcp.json`

設定例は `MCP_CONFIG_EXAMPLES.md` を参照してください。

## 使用方法

設定完了後、AI Assistantに以下のように質問できます：

**例1: グローバル検索ボリューム分析**
```
「AI」というキーワードの全世界での検索ボリュームを調べてください
```

**例2: 地域別キーワード分析**
```
「機械学習」「深層学習」「AI」のキーワードについて、
日本での月間検索数と競合度を分析してください
```

**例3: 関連キーワード提案**
```
「クラウドコンピューティング」に関連するキーワードを提案してください
```

## 開発

### 開発モード（watchモード）

```bash
npm run dev
```

### 直接実行（開発時のテスト）

```bash
# 環境変数を読み込んで実行
export $(cat .env | xargs) && node dist/index.js
```

## トラブルシューティング

### "Missing required Google Ads configuration" エラー

環境変数が正しく設定されているか確認してください。MCPクライアント設定ファイルの`env`セクションをチェック。

### "Failed to connect to Google Ads API" エラー

- Developer Tokenが有効か確認
- Refresh Tokenが期限切れでないか確認
- Customer IDが正しい形式（10桁、ハイフンなし）か確認

### 権限エラー

Google Ads アカウントに適切な権限があることを確認してください（最低でも標準アクセス）。

## ライセンス

MIT

## 📚 ドキュメント

- `SETUP_GUIDE.md` - クイックスタートガイド
- `MCP_CONFIG_EXAMPLES.md` - MCPクライアント別設定例
- `WINDOWS_SETUP.md` - Windows専用セットアップ
- `NPM_PUBLISH.md` - npmパッケージ公開ガイド
- `DOCKER_SETUP.md` - Docker使用ガイド
- `USAGE_EXAMPLES.md` - 使用例集
- `SECURITY.md` - セキュリティガイド
- `setup-auth.md` - 認証情報取得の詳細

## 🤝 コントリビューション

プルリクエスト歓迎！以下の手順で：

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照

## 🔗 参考リンク

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs/start)
- [google-ads-api npm package](https://www.npmjs.com/package/google-ads-api)
- [npm Package](https://www.npmjs.com/package/@kazuya.oda/google-ads-mcp)
- [Docker Hub](https://hub.docker.com/r/kazy1014/google-ads-mcp)

