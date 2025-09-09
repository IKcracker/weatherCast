import { FlatList, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { ThemeToggle } from '@/components/Theme'
import { UserMenu } from '@/components/user-menu'
import NewsCard from '@/components/newsCard'
import * as Location from 'expo-location';
import { toast } from 'sonner-native'
import { getNewsByCountry } from '@/services/newsService' 
import { SkeletonLoading } from '@/components/DataLoading'

export default function News() {
  const [newsData, setNewsData] = React.useState<any>(null);
  const [address, setAddress] = React.useState<Location.LocationGeocodedAddress[] | null>(null);
  const [loading, setLoading] = React.useState(true);

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
        
        setLoading(false);
      }
    };

    getCurrentLocation();
  }, []);

  // Fetch news whenever country is set
  React.useEffect(() => {
    if (!country) return;

    let isMounted = true;

    const fetchNewsData = async () => {
      setLoading(true);
      try {
        const result = await getNewsByCountry(country);
        if (isMounted) setNewsData(result);
      } catch (error) {
        toast.error('Error fetching news');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
    return () => { isMounted = false; };
  }, [country]);

  return (
    <SafeAreaView edges={["top"]} className="p-4 flex-1">
      <View className="flex flex-row justify-between items-center mb-4">
        <ThemeToggle />
        <Text className="text-lg font-bold">weatherCast</Text>
        <UserMenu />
      </View>

      {loading && !newsData ? (
        <View className="mt-4">
          <SkeletonLoading/>
          <SkeletonLoading/>
          <SkeletonLoading/>
        </View>
      ) : (
        Array.isArray(newsData) && newsData.length > 0 && (
          <View className="flex-1 mt-6">
            <Text className="text-2xl font-bold mb-2">Latest News</Text>
            <FlatList
              data={newsData}
              keyExtractor={(item, index) => {
              
                const safeSource = item.source_url ?? "unknown-source";
                const safeTitle = item.title?.slice(0, 20) ?? "untitled";
                return `${safeSource}-${safeTitle}-${index}`;
              }}
              renderItem={({ item }) => <NewsCard item={item} />}
              showsVerticalScrollIndicator={false}
              refreshing={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 10 }}
            />

          </View>
        )
      )}
    </SafeAreaView>
  );
}
