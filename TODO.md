# AI News Chatbot - 実装計画 TODO

## Phase 1: プロジェクト初期設定

### 1.1 プロジェクト作成
- [x] Next.js 14+ プロジェクトを App Router で作成
- [x] TypeScript 設定の確認・調整
- [x] ESLint / Prettier 設定
- [x] Tailwind CSS のセットアップ

### 1.2 基本パッケージのインストール
- [x] Hono (`hono`, `@hono/node-server`)
- [x] Prisma (`prisma`, `@prisma/client`)
- [x] Mastra (`@mastra/core`)
- [x] Anthropic SDK (`@anthropic-ai/sdk`)
- [x] スクレイピング用ライブラリ (`cheerio`, `axios` または `playwright`)

### 1.3 ディレクトリ構成の作成
- [x] `src/app/api/` - API ルート
- [x] `src/components/` - React コンポーネント
- [x] `src/lib/` - ライブラリ・ユーティリティ
- [x] `src/types/` - 型定義
- [x] `prisma/` - Prisma スキーマ

---

## Phase 2: データベース・バックエンド基盤

### 2.1 Prisma セットアップ
- [x] `prisma/schema.prisma` の作成
- [x] SystemConfig モデルの定義
- [x] NewsCache モデルの定義
- [x] Prisma Client の生成 (`npx prisma generate`)
- [x] 初期マイグレーションの実行

### 2.2 Hono API 基盤
- [x] `src/app/api/[[...route]]/route.ts` で Hono アプリ作成
- [x] CORS 設定
- [x] エラーハンドリングミドルウェア
- [x] ヘルスチェックエンドポイント (`/api/health`)

### 2.3 Prisma クライアントユーティリティ
- [x] `src/lib/prisma/client.ts` - シングルトン Prisma クライアント

---

## Phase 3: ニューススクレイピング機能

### 3.1 スクレイパー実装
- [x] `src/lib/scraper/google-news.ts` - Google News スクレイパー
- [x] ニュース記事の型定義 (`src/types/news.ts`)
- [x] HTML パース処理（cheerio または playwright）
- [x] エラーハンドリング・リトライ処理

### 3.2 ニュースキャッシュ機能
- [x] 取得したニュースを NewsCache テーブルに保存
- [x] 重複チェック（URL ベース）
- [x] 古いキャッシュの削除処理

### 3.3 バッチ実行設定
- [x] `src/lib/scraper/batch.ts` - バッチ実行ロジック
- [ ] API エンドポイント `/api/news/fetch` （手動トリガー用）
- [ ] Cloud Scheduler 用の設定ドキュメント

---

## Phase 4: Mastra AI エージェント

### 4.1 Mastra 初期設定
- [x] `src/lib/mastra/index.ts` - Mastra インスタンス設定
- [x] Claude API との連携設定
- [x] 環境変数の設定 (`ANTHROPIC_API_KEY`)

### 4.2 ツールの実装
- [x] `src/lib/mastra/tools/news-search.ts` - ニュース検索ツール
- [x] `src/lib/mastra/tools/news-summary.ts` - ニュース要約ツール

### 4.3 エージェントの実装
- [x] `src/lib/mastra/agents/news-agent.ts` - メインエージェント
- [x] システムプロンプトの設計（日英両対応）
- [x] ツールの統合

---

## Phase 5: API エンドポイント

### 5.1 チャット API
- [x] `POST /api/chat` - チャットメッセージ送信
- [x] ストリーミングレスポンス対応
- [x] リクエスト/レスポンスの型定義

### 5.2 ニュース API
- [x] `GET /api/news` - ニュース一覧取得
- [x] `GET /api/news/:id` - ニュース詳細取得
- [x] `POST /api/news/fetch` - 手動フェッチトリガー

### 5.3 設定 API
- [x] `GET /api/config` - システム設定取得
- [x] `PUT /api/config` - システム設定更新

---

## Phase 6: フロントエンド UI

### 6.1 レイアウト・共通コンポーネント
- [x] `src/app/layout.tsx` - ルートレイアウト
- [x] ヘッダーコンポーネント
- [x] 言語切り替え機能（日/英）

### 6.2 チャット UI
- [x] `src/components/Chat/ChatContainer.tsx` - チャットコンテナ
- [x] `src/components/Chat/MessageList.tsx` - メッセージ一覧
- [x] `src/components/Chat/MessageInput.tsx` - 入力フォーム
- [x] `src/components/Chat/Message.tsx` - 個別メッセージ
- [x] ストリーミング表示対応
- [x] ローディング状態の表示

### 6.3 ニュース一覧 UI
- [x] `src/components/NewsList/NewsListContainer.tsx` - ニュース一覧コンテナ
- [x] `src/components/NewsList/NewsCard.tsx` - ニュースカード
- [x] ページネーションまたは無限スクロール

### 6.4 メインページ
- [x] `src/app/page.tsx` - メインページ統合
- [x] レスポンシブデザイン対応
- [x] チャットとニュース一覧のレイアウト

---

## Phase 7: Docker・デプロイ設定

### 7.1 Docker 設定
- [x] `Dockerfile` の作成（マルチステージビルド）
- [x] `.dockerignore` の作成
- [x] `docker-compose.yml`（ローカル開発用）
- [ ] ローカルでの動作確認

### 7.2 Cloud Run デプロイ
- [x] `cloudbuild.yaml` または手動デプロイ手順
- [x] 環境変数の設定（Secret Manager 推奨）
- [ ] Cloud SQL または他のマネージド DB 設定
- [ ] Cloud Scheduler でのバッチ実行設定

### 7.3 CI/CD（オプション）
- [ ] GitHub Actions ワークフロー
- [ ] 自動テスト実行
- [ ] 自動デプロイ

---

## Phase 8: テスト・ドキュメント

### 8.1 テスト
- [ ] ユニットテスト（スクレイパー、ユーティリティ）
- [ ] API 統合テスト
- [ ] E2E テスト（オプション）

### 8.2 ドキュメント
- [x] README.md の作成
- [x] API ドキュメント
- [x] 環境構築手順
- [x] デプロイ手順

---

## 補足: 環境変数チェックリスト

```env
# 必須
ANTHROPIC_API_KEY=          # Claude API キー
DATABASE_URL=               # PostgreSQL 接続文字列

# オプション
NODE_ENV=production
GOOGLE_CLOUD_PROJECT=       # GCP プロジェクト ID
```

---

## 推奨実装順序

1. **Phase 1** → プロジェクト基盤
2. **Phase 2** → データベース・API 基盤
3. **Phase 3** → スクレイピング（コア機能）
4. **Phase 4** → AI エージェント（コア機能）
5. **Phase 5** → API 完成
6. **Phase 6** → フロントエンド
7. **Phase 7** → デプロイ
8. **Phase 8** → テスト・ドキュメント

---

## 進捗管理

| Phase | 状態 | 完了日 |
|-------|------|--------|
| Phase 1 | 完了 | 2026-01-30 |
| Phase 2 | 完了 | 2026-01-30 |
| Phase 3 | 完了 | 2026-01-30 |
| Phase 4 | 完了 | 2026-01-30 |
| Phase 5 | 完了 | 2026-01-30 |
| Phase 6 | 完了 | 2026-01-30 |
| Phase 7 | 完了 | 2026-01-30 |
| Phase 8 | 完了 | 2026-01-30 |
