import axios from "axios";

export const getNews = async ({ country }: { country: string }) => {
  const api = `https://newsdata.io/api/1/latest?apikey=${process.env.EXPO_PUBLIC_NEWS_API_KEY}&country=${country}&language=en`;

  try {
    const res = await axios.get(api);
    return res.data; // contains "results"
  } catch (err: any) {
   
    throw new Error(err?.response?.data?.message || "Failed to fetch news");
  }
};
