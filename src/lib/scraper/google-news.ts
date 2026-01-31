import Parser from "rss-parser";
import type { ScrapedNews } from "@/types/news";

interface GoogleNewsScraperOptions {
  language?: "ja" | "en";
  category?: string;
}

export class GoogleNewsScraper {
  private language: string;
  private category: string;
  private parser: Parser;

  constructor(options: GoogleNewsScraperOptions = {}) {
    this.language = options.language || "ja";
    this.category = options.category || "technology";
    this.parser = new Parser({
      customFields: {
        item: ["source"],
      },
    });
  }

  private getRssUrl(): string {
    const langCode = this.language === "ja" ? "ja" : "en";
    const region = this.language === "ja" ? "JP" : "US";

    // テクノロジー関連の検索RSSフィード
    if (this.category === "technology") {
      const searchTerm = encodeURIComponent("テクノロジー OR AI OR tech OR スマートフォン");
      return `https://news.google.com/rss/search?q=${searchTerm}&hl=${langCode}&gl=${region}&ceid=${region}:${langCode}`;
    }

    // トップニュースのRSSフィード
    return `https://news.google.com/rss?hl=${langCode}&gl=${region}&ceid=${region}:${langCode}`;
  }

  async scrape(): Promise<ScrapedNews[]> {
    const url = this.getRssUrl();
    console.log(`Fetching Google News RSS: ${url}`);

    try {
      const feed = await this.parser.parseURL(url);
      const articles: ScrapedNews[] = [];

      for (const item of feed.items) {
        if (!item.title || !item.link) continue;

        // ソース名を抽出（タイトルの最後に " - ソース名" の形式で含まれる）
        let title = item.title;
        let source = "Google News";

        const sourceMatch = title.match(/\s-\s([^-]+)$/);
        if (sourceMatch) {
          source = sourceMatch[1].trim();
          title = title.replace(/\s-\s[^-]+$/, "").trim();
        }

        articles.push({
          title,
          url: item.link,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          source,
          imageUrl: undefined,
        });
      }

      console.log(`Fetched ${articles.length} articles from RSS`);
      return articles;
    } catch (error) {
      console.error("RSS fetch error:", error);
      throw error;
    }
  }
}

export async function scrapeGoogleNews(
  options?: GoogleNewsScraperOptions
): Promise<ScrapedNews[]> {
  const scraper = new GoogleNewsScraper(options);
  return scraper.scrape();
}
