import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { searchNews, getNewsFromCache } from "@/lib/scraper/news-cache";

export const newsSearchTool = createTool({
  id: "news-search",
  description: "Search for news articles by keyword or get the latest news",
  inputSchema: z.object({
    query: z.string().optional().describe("Search keyword (optional)"),
    language: z.enum(["ja", "en"]).optional().describe("Language filter: ja or en"),
    limit: z.number().optional().default(10).describe("Number of results to return"),
  }),
  execute: async (input) => {
    const { query, language, limit = 10 } = input;

    try {
      if (query) {
        // キーワード検索
        const results = await searchNews(query, limit);
        return {
          success: true,
          count: results.length,
          news: results.map((n) => ({
            id: n.id,
            title: n.title,
            source: n.source,
            publishedAt: n.publishedAt.toISOString(),
            url: n.url,
          })),
        };
      } else {
        // 最新ニュース取得
        const { news, total } = await getNewsFromCache({
          language,
          limit,
        });
        return {
          success: true,
          count: news.length,
          total,
          news: news.map((n) => ({
            id: n.id,
            title: n.title,
            source: n.source,
            publishedAt: n.publishedAt.toISOString(),
            url: n.url,
          })),
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        news: [],
      };
    }
  },
});
