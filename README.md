# AI News Chatbot

最新のテクノロジーニュースについて質問応答・要約ができるAIチャットボットアプリケーション。

## 機能

- **ニュース取得**: Google Newsからテクノロジーニュースを自動収集
- **AIチャット**: Claude APIを使用したインテリジェントな質問応答
- **要約機能**: ニュース記事の要約と説明
- **多言語対応**: 日本語・英語両対応

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **バックエンド**: Hono
- **データベース**: Prisma + SQLite (開発) / PostgreSQL (本番)
- **AIエージェント**: Mastra + Claude API
- **デプロイ**: Google Cloud Run

## セットアップ

### 前提条件

- Node.js 20+
- npm または yarn
- Anthropic API キー

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd ai-news-chatbot

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .env ファイルを編集してAPIキーを設定
```

### 環境変数

```env
# Database
DATABASE_URL="file:./dev.db"  # 開発環境 (SQLite)
# DATABASE_URL="postgresql://user:password@localhost:5432/news_chatbot"  # 本番環境

# Claude API
ANTHROPIC_API_KEY="your-api-key"

# App
NODE_ENV="development"
```

### データベースのセットアップ

```bash
# Prisma Clientを生成
npm run db:generate

# データベースを初期化
npm run db:push
```

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## API エンドポイント

### ヘルスチェック
```
GET /api/health
```

### ニュースAPI
```
GET /api/news              # ニュース一覧取得
GET /api/news/:id          # ニュース詳細取得
POST /api/news/fetch       # ニュースフェッチトリガー
```

### チャットAPI
```
POST /api/chat             # チャットメッセージ送信
POST /api/chat/stream      # ストリーミングチャット
```

### 設定API
```
GET /api/config            # システム設定取得
PUT /api/config            # システム設定更新
```

## デプロイ

### Docker

```bash
# ビルド
docker build -t news-chatbot .

# 実行
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e ANTHROPIC_API_KEY="your-api-key" \
  news-chatbot
```

### Docker Compose

```bash
# 起動
docker-compose up -d

# 停止
docker-compose down
```

### Google Cloud Run

1. Secret Manager で環境変数を設定
   - `ANTHROPIC_API_KEY`
   - `DATABASE_URL`

2. Cloud Build でデプロイ
```bash
gcloud builds submit --config cloudbuild.yaml
```

### バッチ実行 (Cloud Scheduler)

Cloud Scheduler でニュースフェッチを定期実行:

```bash
gcloud scheduler jobs create http news-fetch-job \
  --location=asia-northeast1 \
  --schedule="0 * * * *" \
  --uri="https://your-cloud-run-url/api/news/fetch" \
  --http-method=POST \
  --headers="Authorization=Bearer YOUR_BATCH_AUTH_TOKEN"
```

## プロジェクト構成

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Hono)
│   ├── page.tsx           # メインページ
│   └── layout.tsx         # レイアウト
├── components/            # Reactコンポーネント
│   ├── Chat/              # チャットUI
│   ├── NewsList/          # ニュース一覧
│   └── Header.tsx         # ヘッダー
├── lib/
│   ├── mastra/            # Mastraエージェント
│   ├── scraper/           # スクレイピング
│   └── prisma/            # Prismaクライアント
├── types/                 # 型定義
└── utils/                 # ユーティリティ
```

## ライセンス

MIT
