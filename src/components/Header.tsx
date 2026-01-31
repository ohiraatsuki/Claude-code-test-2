"use client";

interface HeaderProps {
  language: "ja" | "en";
  onLanguageChange: (lang: "ja" | "en") => void;
}

export function Header({ language, onLanguageChange }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            AI News Chatbot
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onLanguageChange("ja")}
            className={`px-3 py-1 text-sm rounded ${
              language === "ja"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            日本語
          </button>
          <button
            onClick={() => onLanguageChange("en")}
            className={`px-3 py-1 text-sm rounded ${
              language === "en"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            English
          </button>
        </div>
      </div>
    </header>
  );
}
