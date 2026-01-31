import prisma from "@/lib/prisma/client";
import type { ScrapedNews, NewsArticle } from "@/types/news";

export async function saveNewsToCache(
  articles: ScrapedNews[],
  category: string = "technology",
  language: string = "ja"
): Promise<number> {
  let savedCount = 0;

  for (const article of articles) {
    try {
      await prisma.newsCache.upsert({
        where: { url: article.url },
        update: {
          title: article.title,
          imageUrl: article.imageUrl,
          publishedAt: article.publishedAt,
          source: article.source,
          fetchedAt: new Date(),
        },
        create: {
          title: article.title,
          url: article.url,
          imageUrl: article.imageUrl,
          publishedAt: article.publishedAt,
          source: article.source,
          category,
          language,
        },
      });
      savedCount++;
    } catch (error) {
      console.error(`Error saving article: ${article.url}`, error);
    }
  }

  return savedCount;
}

export async function getNewsFromCache(params: {
  category?: string;
  language?: string;
  limit?: number;
  offset?: number;
}): Promise<{ news: NewsArticle[]; total: number }> {
  const { category, language, limit = 20, offset = 0 } = params;

  const where = {
    ...(category && { category }),
    ...(language && { language }),
  };

  const [news, total] = await Promise.all([
    prisma.newsCache.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.newsCache.count({ where }),
  ]);

  return {
    news: news.map((n) => ({
      id: n.id,
      title: n.title,
      url: n.url,
      summary: n.summary || undefined,
      content: n.content || undefined,
      imageUrl: n.imageUrl || undefined,
      publishedAt: n.publishedAt,
      fetchedAt: n.fetchedAt,
      source: n.source,
      category: n.category,
      language: n.language,
    })),
    total,
  };
}

export async function getNewsById(id: string): Promise<NewsArticle | null> {
  const news = await prisma.newsCache.findUnique({
    where: { id },
  });

  if (!news) return null;

  return {
    id: news.id,
    title: news.title,
    url: news.url,
    summary: news.summary || undefined,
    content: news.content || undefined,
    imageUrl: news.imageUrl || undefined,
    publishedAt: news.publishedAt,
    fetchedAt: news.fetchedAt,
    source: news.source,
    category: news.category,
    language: news.language,
  };
}

export async function searchNews(query: string, limit: number = 10): Promise<NewsArticle[]> {
  const news = await prisma.newsCache.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { summary: { contains: query } },
        { content: { contains: query } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return news.map((n) => ({
    id: n.id,
    title: n.title,
    url: n.url,
    summary: n.summary || undefined,
    content: n.content || undefined,
    imageUrl: n.imageUrl || undefined,
    publishedAt: n.publishedAt,
    fetchedAt: n.fetchedAt,
    source: n.source,
    category: n.category,
    language: n.language,
  }));
}

export async function deleteOldCache(daysOld: number = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.newsCache.deleteMany({
    where: {
      fetchedAt: { lt: cutoffDate },
    },
  });

  return result.count;
}
