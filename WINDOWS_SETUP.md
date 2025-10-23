# Windows セットアップガイド

このガイドでは、Windows環境でGoogle Ads MCPサーバーをセットアップする手順を説明します。

## 📋 前提条件

- Windows 10 / 11
- Node.js 18以上 ([ダウンロード](https://nodejs.org/))
- Claude Desktop for Windows
- Google Adsアカウント

## 🚀 クイックスタート

### 1. プロジェクトのダウンロードと依存関係のインストール

```powershell
# PowerShellを管理者として開く
cd C:\Users\YourUsername\Documents
git clone https://github.com/Kazy1014/google-ads-mcp.git
cd google-ads-mcp

# または、ZIPをダウンロードして解凍

# 依存関係のインストール
npm install

# ビルド
npm run build
```

### 2. 認証情報の取得

基本的な手順は`SETUP_GUIDE.md`を参照してください。Windows固有の違いはありません。

### 3. Refresh Tokenの取得

```powershell
npm run get-refresh-token
```

画面の指示に従って、Refresh Tokenを取得します。

### 4. Claude Desktop設定

#### 設定ファイルの場所

```
%APPDATA%\Claude\claude_desktop_config.json
```

実際のパス例：
```
C:\Users\YourUsername\AppData\Roaming\Claude\claude_desktop_config.json
```

#### 設定ファイルを開く

**方法1: エクスプローラーから**
```
1. Windowsキー + R
2. 「%APPDATA%\Claude」と入力してEnter
3. claude_desktop_config.json を右クリック → プログラムから開く → メモ帳
```

**方法2: コマンドプロンプトから**
```cmd
notepad %APPDATA%\Claude\claude_desktop_config.json
```

**方法3: PowerShellから**
```powershell
notepad $env:APPDATA\Claude\claude_desktop_config.json
```

#### 設定内容

**重要: Windowsではバックスラッシュをエスケープする必要があります**

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "node",
      "args": [
        "C:\\Users\\YourUsername\\Documents\\google-ads-mcp\\dist\\index.js"
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

**パスの注意点：**
- バックスラッシュ `\` は `\\` とエスケープ
- または、スラッシュ `/` を使用可能（推奨）

**スラッシュ使用例（推奨）：**
```json
"args": [
  "C:/Users/YourUsername/Documents/google-ads-mcp/dist/index.js"
]
```

### 5. Claude Desktopの再起動

設定を保存したら、Claude Desktopを完全に終了して再起動します：

```
1. タスクバーのClaude Desktopアイコンを右クリック
2. 「終了」を選択
3. Claude Desktopを再度起動
```

## 🔧 トラブルシューティング

### エラー: "Cannot find module"

**原因:** パスが正しくない

**解決方法:**
```powershell
# 正しいパスを確認
cd C:\Users\YourUsername\Documents\google-ads-mcp
pwd
# 出力されたパスをClaude設定にコピー
```

### エラー: "npm: コマンドが見つかりません"

**原因:** Node.jsがインストールされていない、またはPATHが通っていない

**解決方法:**
```powershell
# Node.jsのインストール確認
node --version
npm --version

# インストールされていない場合
# https://nodejs.org/ からインストール
```

### PowerShell実行ポリシーエラー

```powershell
# エラー: このシステムではスクリプトの実行が無効になっているため...

# 解決方法（管理者として実行）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### ログファイルの確認

```powershell
# ログファイルの場所
Get-Content $env:APPDATA\..\Local\Claude\logs\mcp-server-google-ads.log -Tail 50
```

## 📁 Windowsでのファイル構造

```
C:\Users\YourUsername\Documents\google-ads-mcp\
├── src\                      # TypeScriptソースコード
├── dist\                     # ビルド済みファイル
│   └── index.js             # メインエントリーポイント
├── scripts\
│   └── get-refresh-token.ts
├── package.json
├── tsconfig.json
└── README.md

設定ファイル:
C:\Users\YourUsername\AppData\Roaming\Claude\claude_desktop_config.json

ログファイル:
C:\Users\YourUsername\AppData\Local\Claude\logs\mcp-server-google-ads.log
```

## 🎯 便利なWindowsコマンド

### プロジェクトディレクトリをエクスプローラーで開く

```powershell
cd C:\Users\YourUsername\Documents\google-ads-mcp
explorer .
```

### 設定ファイルをメモ帳で開く

```powershell
notepad %APPDATA%\Claude\claude_desktop_config.json
```

### ログをリアルタイムで確認

```powershell
Get-Content $env:APPDATA\..\Local\Claude\logs\mcp-server-google-ads.log -Wait
```

### 環境変数の確認（デバッグ用）

```powershell
$env:GOOGLE_ADS_CLIENT_ID
$env:GOOGLE_ADS_CUSTOMER_ID
```

## 🔒 Windowsでのセキュリティ

### ファイルのアクセス権限設定

```powershell
# 設定ファイルを自分だけアクセス可能に
$acl = Get-Acl "$env:APPDATA\Claude\claude_desktop_config.json"
$acl.SetAccessRuleProtection($true, $false)
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    $env:USERNAME, "FullControl", "Allow"
)
$acl.AddAccessRule($rule)
Set-Acl "$env:APPDATA\Claude\claude_desktop_config.json" $acl
```

## 💡 Windows固有のヒント

### 1. パスの区切り文字

Windowsでは `\` がパス区切り文字ですが、JSON内では：
- `\\` とエスケープする
- または `/` を使用（推奨）

### 2. 環境変数

WindowsとmacOS/Linuxで環境変数の扱いは同じです：
```javascript
process.env.GOOGLE_ADS_CLIENT_ID  // すべてのOSで動作
```

### 3. Node.jsのパス

Node.jsの `path` モジュールを使用しているため、パス処理は自動的にOS対応されます。

### 4. Git Bash使用時

Git Bashを使用する場合、Unixスタイルのパスも使用可能：
```bash
cd /c/Users/YourUsername/Documents/google-ads-mcp
```

## 📝 WSL (Windows Subsystem for Linux) での使用

WSLを使用する場合は、macOS/Linuxと同じ手順で動作します：

```bash
# WSL内で
cd /mnt/c/Users/YourUsername/Documents/google-ads-mcp
npm install
npm run build

# Claude Desktop設定は Windows側のパスを使用
# /mnt/c/... ではなく C:\... を指定
```

## ✅ 動作確認

1. PowerShellを開く
2. プロジェクトディレクトリに移動
3. テスト実行：

```powershell
node dist/index.js
# エラーが出なければOK（Ctrl+Cで終了）
```

4. Claude Desktopでテスト：
```
「AI」というキーワードの検索ボリュームを調べてください
```

## 🆘 サポート

問題が解決しない場合：
1. `SETUP_GUIDE.md` の一般的なトラブルシューティングを確認
2. ログファイルを確認
3. GitHubのIssuesで質問

## 🔗 関連リンク

- [Node.js for Windows](https://nodejs.org/)
- [Claude Desktop](https://claude.ai/desktop)
- [Google Ads API Documentation](https://developers.google.com/google-ads/api)

