# AI News Chatbot - プロジェクト仕様書

## プロジェクト概要

最新のテクノロジーニュースについて質問応答・要約ができるAIチャットボットアプリケーション。

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 14+ (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS（推奨）

### バックエンド
- **APIフレームワーク**: Hono
- **ORM**: Prisma
- **データベース**: PostgreSQL（推奨）

### AIエージェント
- **フレームワーク**: Mastra
- **LLM**: Claude API (Anthropic)

### インフラ
- **デプロイ先**: Google Cloud Run
- **コンテナ**: Docker

## 機能要件

### ニュース取得機能
- **取得元**: Google News (https://news.google.com/home?hl=ja&gl=JP&ceid=JP:ja)
- **取得方法**: Webスクレイピング
- **更新頻度**: 毎時バッチ実行（Cloud Scheduler等で制御）
- **対象ジャンル**: テクノロジー関連ニュース

### AIエージェント機能
- **要約機能**: 取得したニュースを要約して提供
- **質問応答**: ニュースに関するユーザーの質問に回答
- **Mastraによるエージェント実装**

### ユーザーインターフェース
- **チャットUI**: ユーザーとの対話インターフェース
- **ニュース一覧**: 取得したニュースの一覧表示
- **対応言語**: 日本語・英語両対応

## 非機能要件

### 認証
- 認証不要（匿名利用）

### データ保存
- **会話履歴**: 保存しない（セッション内のみ）
- **Prismaでの保存対象**: システム設定のみ

### スケーラビリティ
- Cloud Runによるオートスケーリング

## ディレクトリ構成（推奨）

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Hono)
│   │   ├── chat/          # チャットAPI
│   │   └── news/          # ニュースAPI
│   ├── page.tsx           # メインページ
│   └── layout.tsx
├── components/            # Reactコンポーネント
│   ├── Chat/              # チャットUI
│   └── NewsList/          # ニュース一覧
├── lib/
│   ├── mastra/            # Mastraエージェント設定
│   ├── scraper/           # スクレイピングロジック
│   ├── prisma/            # Prismaクライアント
│   └── claude/            # Claude API連携
├── types/                 # 型定義
└── utils/                 # ユーティリティ
prisma/
├── schema.prisma          # Prismaスキーマ
Dockerfile
docker-compose.yml
```

## Prismaスキーマ（基本構成）

```prisma
model SystemConfig {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model NewsCache {
  id          String   @id @default(cuid())
  title       String
  url         String   @unique
  summary     String?
  publishedAt DateTime
  fetchedAt   DateTime @default(now())
  source      String
}
```

## 環境変数

```env
# Claude API
ANTHROPIC_API_KEY=

# Database
DATABASE_URL=

# Google Cloud
GOOGLE_CLOUD_PROJECT=

# App
NODE_ENV=production
```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# Prismaマイグレーション
npx prisma migrate dev

# ビルド
npm run build

# Docker ビルド
docker build -t news-chatbot .

# Cloud Run デプロイ
gcloud run deploy news-chatbot --source .
```

## スクレイピング注意事項

- Google Newsの利用規約を確認すること
- robots.txtを遵守する
- 適切なリクエスト間隔を設定（レートリミット）
- User-Agentの適切な設定

## Mastraエージェント設計

```typescript
// 基本的なエージェント構成
const newsAgent = new Agent({
  name: "NewsAgent",
  instructions: `
    あなたはテクノロジーニュースの専門家です。
    - 最新のニュースを要約して提供します
    - ユーザーの質問に対してニュースに基づいて回答します
    - 日本語と英語の両方に対応します
  `,
  model: claude("claude-sonnet-4-20250514"),
  tools: [newsSearchTool, newsSummaryTool],
});
```

## 今後の拡張可能性

- [ ] 複数ニュースソースの追加
- [ ] RAG（ベクトル検索）の導入
- [ ] ユーザー認証の追加
- [ ] 会話履歴の保存機能
- [ ] プッシュ通知機能
