"use client";

import { useState, useEffect, useCallback } from "react";
import { NewsArticle } from "@/types/news";
import { NewsCard } from "./NewsCard";

interface NewsListContainerProps {
  language?: "ja" | "en";
}

export function NewsListContainer({ language = "ja" }: NewsListContainerProps) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const fetchNews = useCallback(async (newOffset: number = 0) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: newOffset.toString(),
        ...(language && { language }),
      });

      const response = await fetch(`/api/news?${params}`);
      if (!response.ok) throw new Error("Failed to fetch news");

      const data = await response.json();

      if (newOffset === 0) {
        setNews(data.data);
      } else {
        setNews((prev) => [...prev, ...data.data]);
      }
      setHasMore(data.hasMore);
      setOffset(newOffset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchNews(0);
  }, [fetchNews]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchNews(offset + limit);
    }
  };

  const refresh = () => {
    fetchNews(0);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {language === "ja" ? "最新ニュース" : "Latest News"}
        </h2>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          {language === "ja" ? "更新" : "Refresh"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {error && (
          <div className="text-red-500 text-sm text-center py-4">{error}</div>
        )}

        {!isLoading && news.length === 0 && !error && (
          <div className="text-gray-500 text-sm text-center py-4">
            {language === "ja"
              ? "ニュースがありません"
              : "No news available"}
          </div>
        )}

        {news.map((article) => (
          <NewsCard key={article.id} article={article} language={language} />
        ))}

        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}

        {hasMore && !isLoading && (
          <button
            onClick={loadMore}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-700"
          >
            {language === "ja" ? "もっと見る" : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}
