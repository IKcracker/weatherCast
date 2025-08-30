import { View, FlatList } from 'react-native'
import * as Location from 'expo-location';
import React from 'react'
import { Text } from '@/components/ui/text'
import { SafeAreaView } from 'react-native-safe-area-context'
import { toast } from 'sonner-native';
import { getWeather } from '@/lib/weather';
import { getNews } from '@/lib/News';
import NewsCard from '@/components/newsCard';
import WeatherSummary from '@/components/WeatherSummary';
import { SkeletonLoading } from '@/components/DataLoading';
import { useAsync } from 'react-async-hook';

export default function Home() {
  const [location, setLocation] = React.useState<Location.LocationObject | null>(null);
  const [address, setAddress] = React.useState<Location.LocationGeocodedAddress[] | null>(null);
  const [weatherData, setWeatherData] = React.useState<any>(null);
  const [newsData, setNewsData] = React.useState<any>(null);
  const [newsLoading, setNewsLoading] = React.useState(false);
  const [newsError, setNewsError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync(location.coords);
      setAddress(address);
      setLocation(location);
    }
    getCurrentLocation();
  }, []);

  const weather = useAsync(
    React.useCallback(() => {
      if (location) {
        return getWeather(location.coords.latitude, location.coords.longitude);
      }
      return Promise.resolve(null);
    }, [location]),
    [location]
  );

  React.useEffect(() => {
    if (weather.status === 'success' && weather.result) {
      setWeatherData(weather.result);
    }
  }, [weather.status, weather.result]);

  const country: string | undefined = address?.[0]?.isoCountryCode || "us"; // fallback to "us"

  React.useEffect(() => {
    let isMounted = true;
    async function fetchNews() {
      if (!country) return;
      setNewsLoading(true);
      setNewsError(null);
      try {
        const result = await getNews({ country });
        console.log("newsData", JSON.stringify(result, null, 2));
        if (isMounted) setNewsData(result);
      } catch (e: any) {
        if (isMounted) setNewsError(e?.message || 'Error fetching news');
      } finally {
        if (isMounted) setNewsLoading(false);
      }
    }
    fetchNews();
    return () => { isMounted = false; };
  }, [country]);

 const articles = newsData?.results || [];



  return (
    <SafeAreaView edges={["top"]} className='p-4 flex-1'>
      
      {/* Weather section */}
      {address && weather.status === "loading" ? (
        <View>
          <SkeletonLoading/>
        </View>
      ) : weather.status === "error" ? (
        <View>
          <Text className='text-2xl font-bold'>Error fetching weather data</Text>
          <Text>{String(weather.error)}</Text>
        </View>
      ) : (weatherData && address) && (
        <WeatherSummary address={address} weatherData={weatherData} />
      )}

      {/* News section */}
      {newsLoading ? (
        <View className='mt-4'>
          <SkeletonLoading/>
          <SkeletonLoading/>
          <SkeletonLoading/>
        </View>
      ) : newsError ? (
        <View className='mt-4'>
          <Text className='text-2xl font-bold'>Error fetching news data</Text>
          <Text>{newsError}</Text>
        </View>
      ) : Array.isArray(articles) && articles.length > 0 && (
        <View className="flex-1 mt-6">
          <Text className="text-2xl font-bold mb-2">Top Headlines</Text>
          <FlatList
            data={articles}
            keyExtractor={(item, index) => item.link || item.title || String(index)}
            renderItem={({ item }) => <NewsCard item={item} />}
            showsVerticalScrollIndicator={false}
            refreshing={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

        </View>
      )}
    </SafeAreaView>
  )
}
