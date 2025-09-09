import { db } from '@/config/firebaseConfig';
import axios from 'axios';
import {
  collection,
  getDocs,
  setDoc,
  doc,
  QueryDocumentSnapshot,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import { NewsApiArticle, NewsApiResponse, NewsItem } from '@/types/newsTypes';

const NEWS_COLLECTION = 'news';
const API_BASE = 'https://newsdata.io/api/1';
const API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;

const normalizeArticle = (a: NewsApiArticle): NewsItem => ({
  title: a.title,
  description: a.description ?? null,
  image_url: a.image_url ?? null,
  video_url: a.video_url ?? null,
  source_id: a.source_id ?? null,
  source_icon: a.source_icon ?? null,
  content: a.content ?? null,
  source_url: a.source_url ?? a.link,
  publishedAt: a.pubDate,
});

/**
 * Helper: fetch news from API with error handling
 */
const fetchNewsFromApi = async (
  endpoint: string,
  params: Record<string, string>
): Promise<NewsItem[]> => {
  if (!API_KEY) throw new Error('Missing News API key');
  try {
    const res = await axios.get<NewsApiResponse>(`${API_BASE}/${endpoint}`, {
      params: {
        apikey: API_KEY,
        language: 'en',
        ...params,
      },
    });
    if (!res.data.results) return [];
    return res.data.results.map(normalizeArticle);
  } catch (error) {
    throw new Error('Failed to fetch news from API');
  }
};

/**
 * Save articles + metadata into Firestore
 */
const saveArticlesToCache = async (key: string, articles: NewsItem[]): Promise<void> => {
  const now = Date.now();
  const todayDate = new Date().toDateString();

  await Promise.all(
    articles.map((article, index) =>
      setDoc(doc(db, `${NEWS_COLLECTION}-${key}`, `article-${index}`), article)
    )
  );

  await setDoc(doc(db, `${NEWS_COLLECTION}-${key}`, 'meta'), {
    lastUpdated: now,
    lastUpdatedDate: todayDate,
  });
};

/**
 * Load cached articles if still valid
 */
const loadFromCache = async (
  key: string,
  ttlMs: number = 4 * 60 * 60 * 1000 // default 4h
): Promise<NewsItem[] | null> => {
  const snapshot = await getDocs(collection(db, `${NEWS_COLLECTION}-${key}`));
  const cachedArticles: NewsItem[] = [];
  let lastUpdated: number | null = null;
  let lastUpdatedDate: string | null = null;

  snapshot.forEach((docSnap: QueryDocumentSnapshot) => {
    if (docSnap.id === 'meta') {
      const data = docSnap.data() as {
        lastUpdated: number;
        lastUpdatedDate: string;
      };
      lastUpdated = data.lastUpdated;
      lastUpdatedDate = data.lastUpdatedDate;
    } else {
      cachedArticles.push(docSnap.data() as NewsItem);
    }
  });

  const now = Date.now();
  const todayDate = new Date().toDateString();

  if (
    lastUpdated &&
    lastUpdatedDate === todayDate &&
    now - lastUpdated < ttlMs &&
    cachedArticles.length > 0
  ) {
    return cachedArticles;
  }
  return null;
};

/**
 * Get news by country (cached)
 */
export const getNewsByCountry = async (country: string): Promise<NewsItem[]> => {
  const cacheKey = `country-${country}`;
  const cached = await loadFromCache(cacheKey);
  if (cached) return cached;

  const articles = await fetchNewsFromApi('latest', { country });
  await saveArticlesToCache(cacheKey, articles);
  return articles;
};

/**
 * Search news by keyword (cached per query)
 */
export const searchNews = async (query: string): Promise<NewsItem[]> => {
  if (!query.trim()) return [];
  const cacheKey = `search-${query.toLowerCase()}`;
  const cached = await loadFromCache(cacheKey);
  if (cached) return cached;

  const articles = await fetchNewsFromApi('news', { q: query });
  await saveArticlesToCache(cacheKey, articles);
  return articles;
};

/**
 * Get news by category (cached, optionally per country)
 */
export const getNewsByCategory = async (
  category: string,
  country?: string
): Promise<NewsItem[]> => {
  const key = country ? `category-${category}-country-${country}` : `category-${category}`;
  const cached = await loadFromCache(key);
  if (cached) return cached;

  const params: Record<string, string> = { category };
  if (country) params.country = country;

  const articles = await fetchNewsFromApi('latest', params);
  await saveArticlesToCache(key, articles);
  return articles;
};

/**
 * Get a single article by id (from cache only)
 */
export const getArticleById = async (cacheKey: string, id: string): Promise<NewsItem | null> => {
  const ref = doc(db, `${NEWS_COLLECTION}-${cacheKey}`, id);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as NewsItem) : null;
};

/**
 * Fetch ALL news with pagination from API
 */
const fetchAllNewsFromApi = async (): Promise<NewsItem[]> => {
  if (!API_KEY) throw new Error('Missing News API key');

  let page: string | null = null;
  let allArticles: NewsItem[] = [];

  do {
    const res: any = await axios.get<NewsApiResponse>(`${API_BASE}/latest`, {
      params: {
        apikey: API_KEY,
        language: 'en',
        page,
      },
    });

    if (!res.data.results || res.data.results.length === 0) break;

    const articles = res.data.results.map(normalizeArticle);
    allArticles = [...allArticles, ...articles];

    page = res.data.nextPage ?? null;
  } while (page);

  return allArticles;
};

/**
 * Clear old news and replace with fresh data
 */
const replaceNewsCache = async (articles: NewsItem[]): Promise<void> => {
  const collRef = collection(db, NEWS_COLLECTION);

  // delete old docs
  const oldDocs = await getDocs(collRef);
  await Promise.all(oldDocs.docs.map((d) => deleteDoc(d.ref)));

  // add fresh docs
  await Promise.all(
    articles.map((article, index) => setDoc(doc(db, NEWS_COLLECTION, `article-${index}`), article))
  );

  await setDoc(doc(db, NEWS_COLLECTION, 'meta'), {
    lastUpdated: Date.now(),
    lastUpdatedDate: new Date().toDateString(),
  });
};

export const getTrendingNews = async (limit: number = 20): Promise<NewsItem[]> => {
  const snapshot = await getDocs(collection(db, NEWS_COLLECTION));
  const allArticles = snapshot.docs.filter((d) => d.id !== 'meta').map((d) => d.data() as NewsItem);

  // Sort by publishedAt (descending)
  const sorted = allArticles.sort(
    (a, b) =>
      new Date(b.publishedAt as number | string).getTime() -
      new Date(a.publishedAt as number | string).getTime()
  );

  return sorted.slice(0, limit);
};

const deduplicateArticles = (articles: NewsItem[]): NewsItem[] => {
  const seen = new Set<string>();
  return articles.filter((article) => {
    const key = article.title?.trim().toLowerCase() ?? '';
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Master updater: refresh all news every 4 hours
 */
export const refreshAllNews = async (): Promise<NewsItem[]> => {
  const metaSnap = await getDocs(collection(db, NEWS_COLLECTION));
  let lastUpdated: number | null = null;
  let lastUpdatedDate: string | null = null;

  metaSnap.forEach((docSnap: QueryDocumentSnapshot) => {
    if (docSnap.id === 'meta') {
      const data = docSnap.data() as { lastUpdated: number; lastUpdatedDate: string };
      lastUpdated = data.lastUpdated;
      lastUpdatedDate = data.lastUpdatedDate;
    }
  });

  const now = Date.now();
  const todayDate = new Date().toDateString();
  const fourHours = 4 * 60 * 60 * 1000;

  if (lastUpdated && lastUpdatedDate === todayDate && now - lastUpdated < fourHours) {
    // Already updated within 4 hours
    const snapshot = await getDocs(collection(db, NEWS_COLLECTION));
    const articles = snapshot.docs.filter((d) => d.id !== 'meta').map((d) => d.data() as NewsItem);

    return deduplicateArticles(articles);
  }

  // Fetch fresh data
  const articles = await fetchAllNewsFromApi();
  const uniqueArticles = deduplicateArticles(articles);
  await replaceNewsCache(uniqueArticles);

  return uniqueArticles;
};
