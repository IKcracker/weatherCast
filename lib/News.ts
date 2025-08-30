import axios from "axios";

export const getNews = async(country:{country:string})=>{
const api =`https://newsdata.io/api/1/latest?apikey=${process.env.EXPO_PUBLIC_NEWS_API_KEY}&country=${country.country}&language=en`;
const res = await axios.get(api);
const news = res.data;
console.log(news);
return news;
}
