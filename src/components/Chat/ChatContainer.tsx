"use client";

import { useState, useCallback, DragEvent } from "react";
import { ChatMessage } from "@/types/api";
import { NewsArticle } from "@/types/news";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

interface ChatContainerProps {
  language?: "ja" | "en";
}

export function ChatContainer({ language = "ja" }: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = { role: "user", content };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            history: messages,
            language,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const data = await response.json();
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.message,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: ChatMessage = {
          role: "assistant",
          content:
            language === "ja"
              ? "エラーが発生しました。もう一度お試しください。"
              : "An error occurred. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, language]
  );

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const jsonData = e.dataTransfer.getData("application/json");
      if (jsonData) {
        const article: NewsArticle = JSON.parse(jsonData);
        const summarizeRequest =
          language === "ja"
            ? `この記事を要約してください（newsId: ${article.id}）：「${article.title}」（${article.source}）`
            : `Please summarize this article (newsId: ${article.id}): "${article.title}" (${article.source})`;
        sendMessage(summarizeRequest);
      }
    } catch (error) {
      console.error("Failed to parse dropped article:", error);
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden transition-all ${
        isDragOver ? "ring-2 ring-blue-500 ring-inset bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {language === "ja" ? "AIチャット" : "AI Chat"}
        </h2>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <MessageList messages={messages} isLoading={isLoading} />
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 pointer-events-none">
            <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-lg shadow-lg border-2 border-dashed border-blue-500">
              <p className="text-blue-600 dark:text-blue-400 font-medium">
                {language === "ja"
                  ? "ここにドロップして記事を要約"
                  : "Drop here to summarize article"}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex-shrink-0">
        <MessageInput
          onSend={sendMessage}
          disabled={isLoading}
          placeholder={
            language === "ja"
              ? "ニュースについて質問..."
              : "Ask about news..."
          }
        />
      </div>
    </div>
  );
}
