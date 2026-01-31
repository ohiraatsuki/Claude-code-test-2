export interface NewsArticle {
  id?: string;
  title: string;
  url: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  publishedAt: Date;
  fetchedAt?: Date;
  source: string;
  category: string;
  language: string;
}

export interface ScrapedNews {
  title: string;
  url: string;
  imageUrl?: string;
  publishedAt: Date;
  source: string;
}

export interface NewsSearchParams {
  query?: string;
  category?: string;
  language?: string;
  limit?: number;
  offset?: number;
}

export interface NewsResponse {
  news: NewsArticle[];
  total: number;
  hasMore: boolean;
}
