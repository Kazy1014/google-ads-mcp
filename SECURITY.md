# セキュリティガイド

## ⚠️ 公開してはいけない情報

以下の情報は**絶対に公開しないでください**：

### 🔴 極めて重要（即座に悪用可能）

1. **GOOGLE_ADS_CLIENT_SECRET**
   - OAuth2クライアントシークレット
   - 漏洩した場合、攻撃者があなたのアプリケーションになりすまし可能

2. **GOOGLE_ADS_REFRESH_TOKEN**
   - OAuth2リフレッシュトークン
   - 漏洩した場合、攻撃者があなたのGoogle Adsアカウントに無期限アクセス可能
   - **最も危険な情報**

3. **GOOGLE_ADS_DEVELOPER_TOKEN**
   - Google Ads API開発者トークン
   - 漏洩した場合、あなたのAPIクォータが悪用される可能性

### 🟡 重要（組み合わせで悪用可能）

4. **GOOGLE_ADS_CLIENT_ID**
   - 単体では危険性は低いが、他の情報と組み合わせると悪用可能

5. **GOOGLE_ADS_CUSTOMER_ID / LOGIN_CUSTOMER_ID**
   - アカウントIDは公開情報に近いが、できれば非公開推奨

## 📁 保護されているファイル（.gitignoreで除外済み）

以下のファイルは`.gitignore`で保護されています：

```
✅ .env                    # 環境変数ファイル
✅ .env.local              # ローカル環境変数
✅ *.log                   # ログファイル
✅ dist/                   # ビルド済みファイル（実行時にトークンを含む可能性）
```

## ⚠️ 注意が必要なファイル

### Claude Desktop設定ファイル

**場所：**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**問題：**
このファイルには**平文で全ての認証情報が保存**されています。

**対策：**
```bash
# ファイルのパーミッションを確認
ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json

# 自分だけが読み書きできるように設定（推奨）
chmod 600 ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### ログファイル

**場所：**
- `~/Library/Logs/Claude/mcp-server-google-ads.log`

**問題：**
エラー時にトークンの一部が含まれる可能性があります。

**対策：**
```bash
# ログファイルを定期的に削除
rm ~/Library/Logs/Claude/mcp-server-google-ads.log

# またはパーミッション制限
chmod 600 ~/Library/Logs/Claude/mcp-server-google-ads.log
```

## 🔒 セキュリティベストプラクティス

### 1. 環境変数の管理

```bash
# ✅ 良い例：.envファイルを使用（.gitignoreで除外されている）
GOOGLE_ADS_CLIENT_SECRET=your-secret

# ❌ 悪い例：ソースコードに直接記述
const secret = "your-secret"; // 絶対にダメ！
```

### 2. トークンのローテーション

定期的にトークンを更新してください：

```bash
# Refresh Tokenの再取得
npm run get-refresh-token
```

### 3. 最小権限の原則

- **テストアカウント**を使用する
- 本番アカウントには最小限の権限のみ付与
- MCCアカウントで子アカウントへのアクセスを制限

### 4. Git管理

```bash
# Gitリポジトリを初期化する前に
git init

# .gitignoreが正しく機能しているか確認
git status

# 以下が表示されないことを確認：
# - .env
# - Claude設定ファイルのバックアップ
# - ログファイル
```

## 🚨 万が一、認証情報が漏洩した場合

### 即座に実行すべきこと

#### 1. Refresh Tokenの無効化

```bash
1. Google Cloud Console にアクセス
2. 該当するプロジェクトを選択
3. 「APIとサービス」→「認証情報」
4. OAuth 2.0 クライアントIDを削除または再作成
5. 新しいRefresh Tokenを取得
```

#### 2. Client Secretのリセット

```bash
1. Google Cloud Console の「認証情報」
2. OAuth 2.0 クライアントIDを編集
3. 「クライアントシークレットをリセット」
4. 新しいClient Secretを取得
```

#### 3. Developer Tokenの無効化

```bash
1. https://ads.google.com/aw/apicenter にアクセス
2. 既存のDeveloper Tokenを無効化
3. 新しいトークンを発行
```

#### 4. 不審なアクティビティの確認

```bash
1. Google Adsの管理画面で変更履歴を確認
2. Google Cloud Consoleの監査ログを確認
3. 不審なアクセスがあれば、Googleサポートに連絡
```

## 📋 公開前チェックリスト

GitHubなどに公開する前に以下を確認：

```bash
☐ .gitignoreが適切に設定されている
☐ .envファイルが除外されている
☐ 設定ファイルのバックアップが除外されている
☐ ログファイルが除外されている
☐ ソースコード内に認証情報が含まれていない
☐ READMEのサンプルがダミー値になっている
☐ package-lock.jsonに問題がない（通常は問題なし）

# 確認コマンド
grep -r "GOCSPX-\|refresh_token\|developer.*token" src/ *.md --exclude-dir=node_modules
```

## 🔐 推奨：環境変数の暗号化

より高度なセキュリティが必要な場合：

### 1. git-cryptを使用

```bash
# git-cryptをインストール
brew install git-crypt

# GPGキーで暗号化
git-crypt init
git-crypt add-gpg-user YOUR_GPG_KEY_ID

# .envファイルを暗号化対象に追加
echo ".env filter=git-crypt diff=git-crypt" >> .gitattributes
```

### 2. 1Passwordやキーチェーンの使用

macOSキーチェーンに保存：
```bash
# トークンを保存
security add-generic-password -a "google-ads-mcp" -s "refresh_token" -w "YOUR_TOKEN"

# トークンを取得
security find-generic-password -a "google-ads-mcp" -s "refresh_token" -w
```

## 📞 サポート

セキュリティに関する質問や懸念がある場合：
- Google Cloud Security: https://cloud.google.com/security
- Google Ads API Support: https://developers.google.com/google-ads/api/support

## ⚖️ 免責事項

このプロジェクトはMITライセンスの下で提供されています。認証情報の管理はユーザーの責任で行ってください。作者は認証情報の漏洩によって生じた損害について一切の責任を負いません。

