import { FlatList, View,  } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { ThemeToggle } from '@/components/Theme'
import { UserMenu } from '@/components/user-menu'
import NewsCard from '@/components/newsCard'
import * as Location from 'expo-location';
import { toast } from 'sonner-native'
import { useAsync } from 'react-async-hook'
import { getNews } from '@/lib/News'
import { SkeletonLoading } from '@/components/DataLoading'
import { Input } from '@/components/ui/input'
export default function News() {
const [newsData, setNewsData] = React.useState<any>(null);
const [address, setAddress] = React.useState<Location.LocationGeocodedAddress[] | null>(null);
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
      
      }
      getCurrentLocation();
    }, []);
  const country = React.useMemo(() => {
    if (address && address[0] && address[0].isoCountryCode) {
      return address[0].isoCountryCode;
    }
    return undefined;
  }, [address]);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchNews() {
      if (country) {
        const result = await getNews({ country });
        if (isMounted) setNewsData(result);
      }
    }
    fetchNews();
    return () => { isMounted = false; };
  }, [country]);
  console.log(newsData);
  return (
    <SafeAreaView edges={["top"]} className='p-4 flex-1'>
    <View className='flex flex-row justify-between items-center mb-4'>
      <ThemeToggle/>
      <Text className='text-lg font-bold'>weatherCast</Text>
      <UserMenu/>
    </View>

 
<View>
    <Input
      keyboardType="default"
      autoComplete="off"
      placeholder="Search news..."
      id='search'
    />

    </View>
    <View>
             {!newsData ? (
               <View className='mt-4'>
                 <SkeletonLoading/>
                 <SkeletonLoading/>
                 <SkeletonLoading/>
               </View>
             ) : (newsData && Array.isArray(newsData.results)) && (
               <View className='space-y-2 gap-2 mt-6 flex-1'>
                 <Text className='text-2xl font-bold mb-2'>Top Headlines</Text>
                <FlatList
                    data={newsData.articles || newsData.results || []}
                    keyExtractor={(_, index) => String(index)}
                    renderItem={({ item }) => <NewsCard item={item} />}
                    showsVerticalScrollIndicator={false}
                    refreshing={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    style={{ flex: 1 }}
                    />

               </View>
             )}
    </View>
    </SafeAreaView>

  )
}