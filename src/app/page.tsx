"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { ChatContainer } from "@/components/Chat";
import { NewsListContainer } from "@/components/NewsList";

export default function Home() {
  const [language, setLanguage] = useState<"ja" | "en">("ja");

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden">
      <Header language={language} onLanguageChange={setLanguage} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* チャットエリア */}
          <div className="h-full overflow-hidden">
            <ChatContainer language={language} />
          </div>

          {/* ニュース一覧エリア */}
          <div className="h-full overflow-hidden">
            <NewsListContainer language={language} />
          </div>
        </div>
      </main>
    </div>
  );
}
