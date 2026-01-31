import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { handle } from "hono/vercel";
import { streamText } from "hono/streaming";

import prisma from "@/lib/prisma/client";
import { getNewsFromCache, getNewsById } from "@/lib/scraper/news-cache";
import { runNewsBatch } from "@/lib/scraper/batch";
import { mastra } from "@/lib/mastra";
import type { ChatRequest } from "@/types/api";

// 型定義
type Variables = {
  requestId: string;
};

// Honoアプリ作成
const app = new Hono<{ Variables: Variables }>().basePath("/api");

// ミドルウェア
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// リクエストID付与
app.use("*", async (c, next) => {
  c.set("requestId", crypto.randomUUID());
  await next();
});

// エラーハンドリング
app.onError((err, c) => {
  console.error(`[${c.get("requestId")}] Error:`, err);
  return c.json(
    {
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    },
    500
  );
});

// ヘルスチェック
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// =====================
// ニュースAPI
// =====================

// ニュース一覧取得
app.get("/news", async (c) => {
  const limit = parseInt(c.req.query("limit") || "20");
  const offset = parseInt(c.req.query("offset") || "0");
  const language = c.req.query("language") as "ja" | "en" | undefined;
  const category = c.req.query("category");

  const { news, total } = await getNewsFromCache({
    limit,
    offset,
    language,
    category,
  });

  return c.json({
    data: news,
    total,
    hasMore: offset + news.length < total,
  });
});

// ニュース詳細取得
app.get("/news/:id", async (c) => {
  const id = c.req.param("id");
  const news = await getNewsById(id);

  if (!news) {
    return c.json({ error: "News not found" }, 404);
  }

  return c.json({ data: news });
});

// ニュースフェッチトリガー（バッチ実行）
app.post("/news/fetch", async (c) => {
  // 認証チェック（本番環境では適切な認証を実装）
  const authHeader = c.req.header("Authorization");
  const expectedToken = process.env.BATCH_AUTH_TOKEN;

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const result = await runNewsBatch();

  return c.json({
    success: result.success,
    scraped: result.scraped,
    saved: result.saved,
    deleted: result.deleted,
    errors: result.errors,
    timestamp: result.timestamp.toISOString(),
  });
});

// =====================
// チャットAPI
// =====================

app.post("/chat", async (c) => {
  const body = await c.req.json<ChatRequest>();
  const { message, history = [], language } = body;

  if (!message) {
    return c.json({ error: "Message is required" }, 400);
  }

  try {
    const agent = mastra.getAgent("newsAgent");

    // 会話履歴をコンテキストとして構築
    let userMessage = message;

    // 言語指示を追加
    if (language) {
      const langInstruction =
        language === "ja"
          ? "Please respond in Japanese."
          : "Please respond in English.";
      userMessage += `\n\n${langInstruction}`;
    }

    // 履歴がある場合はコンテキストとして追加
    if (history.length > 0) {
      const historyContext = history
        .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
        .join("\n\n");
      userMessage = `Previous conversation:\n${historyContext}\n\nCurrent question: ${userMessage}`;
    }

    const response = await agent.generate(userMessage);

    return c.json({
      message: response.text,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return c.json(
      {
        error: "Failed to generate response",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// ストリーミングチャットAPI
app.post("/chat/stream", async (c) => {
  const body = await c.req.json<ChatRequest>();
  const { message, history = [], language } = body;

  if (!message) {
    return c.json({ error: "Message is required" }, 400);
  }

  return streamText(c, async (stream) => {
    try {
      const agent = mastra.getAgent("newsAgent");

      // 会話履歴をコンテキストとして構築
      let userMessage = message;

      // 言語指示を追加
      if (language) {
        const langInstruction =
          language === "ja"
            ? "Please respond in Japanese."
            : "Please respond in English.";
        userMessage += `\n\n${langInstruction}`;
      }

      // 履歴がある場合はコンテキストとして追加
      if (history.length > 0) {
        const historyContext = history
          .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
          .join("\n\n");
        userMessage = `Previous conversation:\n${historyContext}\n\nCurrent question: ${userMessage}`;
      }

      const response = await agent.stream(userMessage);

      for await (const chunk of response.textStream) {
        await stream.write(chunk);
      }
    } catch (error) {
      console.error("Stream error:", error);
      await stream.write(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
});

// =====================
// 設定API
// =====================

// 設定取得
app.get("/config", async (c) => {
  const configs = await prisma.systemConfig.findMany();
  const configMap = Object.fromEntries(configs.map((c) => [c.key, c.value]));

  return c.json({ data: configMap });
});

// 設定更新
app.put("/config", async (c) => {
  const body = await c.req.json<Record<string, string>>();

  const updates = await Promise.all(
    Object.entries(body).map(([key, value]) =>
      prisma.systemConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );

  return c.json({
    success: true,
    updated: updates.length,
  });
});

// 設定削除
app.delete("/config/:key", async (c) => {
  const key = c.req.param("key");

  try {
    await prisma.systemConfig.delete({
      where: { key },
    });
    return c.json({ success: true });
  } catch {
    return c.json({ error: "Config not found" }, 404);
  }
});

// Next.js App Router用のハンドラー
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
