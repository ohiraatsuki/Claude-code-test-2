export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  language?: "ja" | "en";
}

export interface ChatResponse {
  message: string;
  toolCalls?: Array<{
    tool: string;
    input: Record<string, unknown>;
    output: unknown;
  }>;
}

export interface ApiError {
  error: string;
  message?: string;
  code?: string;
}

export interface PaginatedRequest {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}
