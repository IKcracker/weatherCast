// Raw API response mapping
export interface NewsApiArticle {
  article_id: string;
  title: string;
  link: string;
  keywords?: string[];
  creator?: string[];
  video_url?: string | null;
  description?: string | null;
  content?: string | null;
  pubDate: string;
  pubDateTZ?: string;
  image_url?: string | null;
  source_id?: string | null;
  source_url?: string | null;
  source_icon?: string | null;
  source_priority?: number;
  country?: string[];
  category?: string[];
  language?: string | null;
  ai_tag?: string | null;
  sentiment?: "positive" | "negative" | "neutral";
  sentiment_stats?: Record<string, any>; // e.g. counts of sentiment
  ai_region?: string | null;
  ai_org?: string | null;
  duplicate?: boolean;
  nextPage?: string | null;
}
export interface NewsApiResponse {
  status: string;
  totalResults: number;
  results: NewsApiArticle[];
}
// Utility to represent possible null or undefined
type Nullable<T> = T | null | undefined;

// Clean item for UI consumption
export interface NewsItem {
  title: string;
  description?: Nullable<string>;
  image_url?: Nullable<string>;
  video_url?: Nullable<string>;
  source_id?: Nullable<string>;
  source_icon?: Nullable<string>;
  source_url?: Nullable<string>;
  publishedAt?: Nullable<string>;
}
