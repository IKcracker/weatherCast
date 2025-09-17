import { View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { ThemeToggle } from '@/components/Theme';
import { UserMenu } from '@/components/user-menu';
import NewsCard from '@/components/newsCard';
import * as Location from 'expo-location';
import { toast } from 'sonner-native';
import { getNewsByCategory, getTrendingNews } from '@/services/newsService';
import { SkeletonLoading } from '@/components/DataLoading';
import Categories from '@/components/newsCategory';
import { allNewsCategories, newsCategory, NewsItem } from '@/types/newsTypes';
import Search from '@/components/search';
import { LegendList } from '@legendapp/list';
export default function News() {
  const [newsData, setNewsData] = React.useState<NewsItem[] | null>(null);
  const [address, setAddress] = React.useState<Location.LocationGeocodedAddress[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState<newsCategory>(newsCategory.general);
  const [query, setQuery] = React.useState<string>('');

  const country = React.useMemo(() => {
    if (address && address[0]?.isoCountryCode) {
      return address[0].isoCountryCode;
    }
    return undefined;
  }, [address]);

  // Fetch location once
  React.useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          toast.error('Permission to access location was denied');
          setLoading(false);
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        const addr = await Location.reverseGeocodeAsync(location.coords);
        setAddress(addr);
      } catch (error) {
        toast.error('Failed to get location');
        setLoading(false);
      }
    };
    getCurrentLocation();
  }, []);

  React.useEffect(() => {
    if (!country) return;
    let isMounted = true;

    const fetchNewsData = async () => {
      setLoading(true);
      try {
        if (category === newsCategory.general) {
          const result = await getTrendingNews();
          if (isMounted) setNewsData(result);
          setLoading(false);
          return;
        }
        const result = await getNewsByCategory(category, country);
        if (isMounted) setNewsData(result);
      } catch (error) {
        console.error(error);
        toast.error('Error fetching news');
        if (isMounted) setNewsData([]); // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
    return () => {
      isMounted = false;
    };
  }, [country, category]);

  // Memoized setCategory to avoid unnecessary re-renders
  const handleSetCategory = React.useCallback((cat: newsCategory) => {
    setCategory(cat);
  }, []);

  return (
    <SafeAreaView edges={['top']} className="flex-1 p-4">
      <View className="mb-4 flex flex-row items-center justify-between">
        <ThemeToggle />
        <Text className="text-lg font-bold">weatherCast</Text>
        <UserMenu />
      </View>
      <Search query={query} setQuery={setQuery} />
      <Categories categories={allNewsCategories} setCategory={handleSetCategory} />
      {loading && !newsData ? (
        <View className="mt-4">
          <SkeletonLoading />
          <SkeletonLoading />
          <SkeletonLoading />
        </View>
      ) : Array.isArray(newsData) && newsData.length > 0 ? (
        <View className="mt-6 flex-1">
          <Text className="mb-2 text-2xl font-bold">Latest {category.toUpperCase()} News</Text>
          <LegendList
            data={newsData}
            keyExtractor={(item, index) => {
              const safeSource = item.source_url ?? 'unknown-source';
              const safeTitle = item.title?.slice(0, 20) ?? 'untitled';
              return `${safeSource}-${safeTitle}-${index}`;
            }}
            renderItem={({ item }) => <NewsCard item={item} />}
            showsVerticalScrollIndicator={false}
            refreshing={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 10 }}
          />
        </View>
      ) : (
        <View className="mt-6 flex-1 items-center justify-center">
          <Text className="text-lg text-gray-500">No news found for {category} category.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
