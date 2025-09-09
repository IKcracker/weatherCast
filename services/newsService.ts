import { db } from "@/config/firebaseConfig";
import axios from "axios";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { NewsApiArticle, NewsApiResponse, NewsItem } from "@/types/newsTypes";

const NEWS_COLLECTION = "news";
const API_BASE = "https://newsdata.io/api/1";
const API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;

const normalizeArticle = (a: NewsApiArticle): NewsItem => ({
  title: a.title,
  description: a.description ?? null,
  image_url: a.image_url ?? null,
  video_url: a.video_url ?? null,
  source_id: a.source_id ?? null,
  source_icon: a.source_icon ?? null,
  source_url: a.source_url ?? a.link,
  publishedAt: a.pubDate,
});

/**
 * Helper: fetch news from API
 */
const fetchNewsFromApi = async (
  endpoint: string,
  params: Record<string, string>
): Promise<NewsItem[]> => {
  const res = await axios.get<NewsApiResponse>(`${API_BASE}/${endpoint}`, {
    params: {
      apikey: API_KEY,
      language: "en",
      ...params,
    },
  });

  return res.data.results.map(normalizeArticle);
};

/**
 * Cached fetch by country
 */
export const getNewsByCountry = async (country: string): Promise<NewsItem[]> => {
  const snapshot = await getDocs(collection(db, NEWS_COLLECTION));
  const cachedArticles: NewsItem[] = [];
  let lastUpdated: number | null = null;
  let lastUpdatedDate: string | null = null;

  snapshot.forEach((docSnap: QueryDocumentSnapshot) => {
    if (docSnap.id === "meta") {
      const data = docSnap.data() as { lastUpdated: number; lastUpdatedDate: string };
      lastUpdated = data.lastUpdated;
      lastUpdatedDate = data.lastUpdatedDate;
    } else {
      cachedArticles.push(docSnap.data() as NewsItem);
    }
  });

  const now = Date.now();
  const todayDate = new Date().toDateString();
  const fourHours = 4 * 60 * 60 * 1000;

  if (
    lastUpdated &&
    lastUpdatedDate === todayDate &&
    now - lastUpdated < fourHours &&
    cachedArticles.length > 0
  ) {
    return cachedArticles;
  }

  const articles = await fetchNewsFromApi("latest", { country });

  await Promise.all(
    articles.map((article, index) =>
      setDoc(doc(db, NEWS_COLLECTION, `article-${index}`), article)
    )
  );

  await setDoc(doc(db, NEWS_COLLECTION, "meta"), {
    lastUpdated: now,
    lastUpdatedDate: todayDate,
  });

  return articles;
};

/**
 * Search news by keyword
 */
export const searchNews = async (query: string): Promise<NewsItem[]> => {
  if (!query.trim()) return [];
  return fetchNewsFromApi("news", { q: query });
};

/**
 * Get news by category (optionally filtered by country)
 */
export const getNewsByCategory = async (
  category: string,
  country?: string
): Promise<NewsItem[]> => {
  const params: Record<string, string> = { category };
  if (country) params.country = country;
  return fetchNewsFromApi("latest", params);
};
