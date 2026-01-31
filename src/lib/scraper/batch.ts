import { scrapeGoogleNews } from "./google-news";
import { saveNewsToCache, deleteOldCache } from "./news-cache";

interface BatchResult {
  success: boolean;
  scraped: number;
  saved: number;
  deleted: number;
  errors: string[];
  timestamp: Date;
}

export async function runNewsBatch(): Promise<BatchResult> {
  const result: BatchResult = {
    success: false,
    scraped: 0,
    saved: 0,
    deleted: 0,
    errors: [],
    timestamp: new Date(),
  };

  try {
    // 日本語ニュースをスクレイピング
    console.log("Fetching Japanese news...");
    const jaNews = await scrapeGoogleNews({ language: "ja", category: "technology" });
    result.scraped += jaNews.length;

    const jaSaved = await saveNewsToCache(jaNews, "technology", "ja");
    result.saved += jaSaved;

    // 英語ニュースをスクレイピング
    console.log("Fetching English news...");
    const enNews = await scrapeGoogleNews({ language: "en", category: "technology" });
    result.scraped += enNews.length;

    const enSaved = await saveNewsToCache(enNews, "technology", "en");
    result.saved += enSaved;

    // 古いキャッシュを削除
    console.log("Cleaning old cache...");
    result.deleted = await deleteOldCache(7);

    result.success = true;
    console.log(`Batch completed: scraped=${result.scraped}, saved=${result.saved}, deleted=${result.deleted}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    result.errors.push(message);
    console.error("Batch error:", message);
  }

  return result;
}

export async function runSingleLanguageBatch(
  language: "ja" | "en"
): Promise<BatchResult> {
  const result: BatchResult = {
    success: false,
    scraped: 0,
    saved: 0,
    deleted: 0,
    errors: [],
    timestamp: new Date(),
  };

  try {
    console.log(`Fetching ${language} news...`);
    const news = await scrapeGoogleNews({ language, category: "technology" });
    result.scraped = news.length;

    result.saved = await saveNewsToCache(news, "technology", language);
    result.success = true;

    console.log(`Batch completed: scraped=${result.scraped}, saved=${result.saved}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    result.errors.push(message);
    console.error("Batch error:", message);
  }

  return result;
}
