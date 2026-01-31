"use client";

import { DragEvent } from "react";
import { NewsArticle } from "@/types/news";

interface NewsCardProps {
  article: NewsArticle;
  language?: "ja" | "en";
}

export function NewsCard({ article, language = "ja" }: NewsCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === "ja" ? "ja-JP" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDragStart = (e: DragEvent<HTMLAnchorElement>) => {
    e.dataTransfer.setData("application/json", JSON.stringify(article));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      draggable
      onDragStart={handleDragStart}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-grab active:cursor-grabbing"
    >
      <div className="flex gap-4">
        {article.imageUrl && (
          <div className="flex-shrink-0">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-24 h-24 object-cover rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
            {article.title}
          </h3>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
            <span>{article.source}</span>
            <span>•</span>
            <time>{formatDate(article.publishedAt)}</time>
          </div>
          {article.summary && (
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
              {article.summary}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
