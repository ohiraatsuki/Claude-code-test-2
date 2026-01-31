import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getNewsById } from "@/lib/scraper/news-cache";

export const newsSummaryTool = createTool({
  id: "news-summary",
  description: "Get detailed information about a specific news article by ID",
  inputSchema: z.object({
    newsId: z.string().describe("The ID of the news article to retrieve"),
  }),
  execute: async (input) => {
    const { newsId } = input;

    try {
      const news = await getNewsById(newsId);

      if (!news) {
        return {
          success: false,
          error: "News article not found",
        };
      }

      return {
        success: true,
        news: {
          id: news.id,
          title: news.title,
          source: news.source,
          publishedAt: news.publishedAt.toISOString(),
          url: news.url,
          summary: news.summary,
          content: news.content,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
