# Docker セットアップガイド

このガイドでは、Docker を使用して Google Ads MCP サーバーをコンテナ化して実行する方法を説明します。

## 🐳 Docker を使用するメリット

- ✅ 環境の完全な分離
- ✅ 依存関係の自動管理
- ✅ 異なるマシン間での一貫した動作
- ✅ 簡単なデプロイとスケーリング

## 📋 前提条件

- Docker Desktop (macOS/Windows) または Docker Engine (Linux)
- Docker Compose (通常 Docker Desktop に含まれる)

### Docker のインストール

- **macOS/Windows**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: [Docker Engine](https://docs.docker.com/engine/install/)

## 🚀 クイックスタート

### 方法1: Docker Compose（推奨）

```bash
# 1. 環境変数を設定
cp .env.example .env
# .env ファイルを編集して認証情報を設定

# 2. ビルドと起動
docker-compose up -d

# 3. ログを確認
docker-compose logs -f
```

### 方法2: Docker 単体

```bash
# 1. イメージをビルド
docker build -t google-ads-mcp:latest .

# 2. コンテナを起動
docker run -it --rm \
  -e GOOGLE_ADS_CLIENT_ID="your-client-id" \
  -e GOOGLE_ADS_CLIENT_SECRET="your-secret" \
  -e GOOGLE_ADS_DEVELOPER_TOKEN="your-token" \
  -e GOOGLE_ADS_REFRESH_TOKEN="your-refresh-token" \
  -e GOOGLE_ADS_CUSTOMER_ID="1234567890" \
  -e SKIP_CONNECTION_TEST="true" \
  google-ads-mcp:latest
```

## 🔧 Claude Desktop との連携

### Docker コンテナ経由で使用

**注意**: Claude Desktop は stdio を使用して MCP サーバーと通信するため、Docker を使用する場合は追加の設定が必要です。

#### オプション1: Docker を通常プロセスとして起動

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "GOOGLE_ADS_CLIENT_ID=your-client-id",
        "-e", "GOOGLE_ADS_CLIENT_SECRET=your-secret",
        "-e", "GOOGLE_ADS_DEVELOPER_TOKEN=your-token",
        "-e", "GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token",
        "-e", "GOOGLE_ADS_CUSTOMER_ID=1234567890",
        "-e", "SKIP_CONNECTION_TEST=true",
        "google-ads-mcp:latest"
      ]
    }
  }
}
```

#### オプション2: 環境変数ファイルを使用

```bash
# .env ファイルを作成
cat > /path/to/google-ads-mcp/.env << EOF
GOOGLE_ADS_CLIENT_ID=your-client-id
GOOGLE_ADS_CLIENT_SECRET=your-secret
GOOGLE_ADS_DEVELOPER_TOKEN=your-token
GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token
GOOGLE_ADS_CUSTOMER_ID=1234567890
SKIP_CONNECTION_TEST=true
EOF
```

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--env-file", "/path/to/google-ads-mcp/.env",
        "google-ads-mcp:latest"
      ]
    }
  }
}
```

## 📦 Docker イメージのビルド

### マルチステージビルド

プロジェクトの `Dockerfile` はマルチステージビルドを使用して最適化されています：

```dockerfile
# ビルドステージ: TypeScript のコンパイル
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src/ ./src/
RUN npm run build

# 本番ステージ: 本番用依存関係のみ
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
```

### カスタムビルド

```bash
# 開発用イメージ
docker build -t google-ads-mcp:dev .

# タグ付きイメージ
docker build -t google-ads-mcp:1.0.0 .

# プラットフォーム指定（M1/M2 Mac など）
docker build --platform linux/amd64 -t google-ads-mcp:latest .
```

## 🔍 デバッグとトラブルシューティング

### コンテナ内でシェルを起動

```bash
# コンテナ内に入る
docker run -it --rm google-ads-mcp:latest sh

# 起動中のコンテナに接続
docker exec -it google-ads-mcp sh
```

### ログの確認

```bash
# Docker Compose
docker-compose logs -f google-ads-mcp

# Docker 単体
docker logs -f google-ads-mcp
```

### 環境変数の確認

```bash
docker run -it --rm google-ads-mcp:latest sh -c 'env | grep GOOGLE_ADS'
```

## 🌐 Docker Hub への公開

### イメージを公開

```bash
# 1. Docker Hub にログイン
docker login

# 2. イメージにタグ付け
docker tag google-ads-mcp:latest kazuyaoda/google-ads-mcp:latest
docker tag google-ads-mcp:latest kazuyaoda/google-ads-mcp:1.0.0

# 3. プッシュ
docker push kazuyaoda/google-ads-mcp:latest
docker push kazuyaoda/google-ads-mcp:1.0.0
```

### 公開イメージの使用

```bash
# イメージをプル
docker pull kazuyaoda/google-ads-mcp:latest

# 実行
docker run -it --rm \
  -e GOOGLE_ADS_CLIENT_ID="..." \
  kazuyaoda/google-ads-mcp:latest
```

## 📊 パフォーマンス最適化

### イメージサイズの確認

```bash
docker images google-ads-mcp
# REPOSITORY          TAG       IMAGE ID       SIZE
# google-ads-mcp      latest    abc123...      ~150MB
```

### レイヤーキャッシュの活用

```bash
# .dockerignore を適切に設定
# 変更頻度の低いファイルを先にコピー
# 依存関係のインストールを早い段階で実行
```

## 🔒 セキュリティ

### 非 root ユーザーで実行

Dockerfile では自動的に非 root ユーザーを作成：

```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

### シークレットの管理

```bash
# Docker シークレットを使用（Swarm mode）
echo "your-secret" | docker secret create google_ads_secret -

# または環境変数ファイルを保護
chmod 600 .env
```

## 🚀 本番環境でのデプロイ

### Docker Compose（本番用）

```yaml
version: '3.8'
services:
  google-ads-mcp:
    image: kazuyaoda/google-ads-mcp:1.0.0
    restart: always
    env_file:
      - .env.production
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Kubernetes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: google-ads-mcp
spec:
  containers:
  - name: google-ads-mcp
    image: kazuyaoda/google-ads-mcp:1.0.0
    env:
    - name: GOOGLE_ADS_CLIENT_ID
      valueFrom:
        secretKeyRef:
          name: google-ads-secrets
          key: client-id
    # ... 他の環境変数
```

## 💡 ヒント

### 1. マルチプラットフォームビルド

```bash
# AMD64 と ARM64 の両方をサポート
docker buildx build --platform linux/amd64,linux/arm64 \
  -t kazuyaoda/google-ads-mcp:latest \
  --push .
```

### 2. ビルドキャッシュの活用

```bash
# BuildKit を有効化（高速化）
export DOCKER_BUILDKIT=1
docker build -t google-ads-mcp:latest .
```

### 3. 開発用ボリュームマウント

```bash
# ソースコードをマウントして開発
docker run -it --rm \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/dist:/app/dist \
  google-ads-mcp:dev
```

## 📝 よくある質問

### Q: なぜ Docker が必要？

A: 必須ではありませんが、環境の一貫性と管理の簡素化に役立ちます。

### Q: Claude Desktop で Docker は推奨？

A: 通常は `npx` や直接実行の方がシンプルです。Docker は環境分離が必要な場合に使用。

### Q: イメージサイズを小さくするには？

A: Alpine Linux ベースイメージ、マルチステージビルド、`.dockerignore` の適切な設定を使用。

## 🔗 参考リンク

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)


