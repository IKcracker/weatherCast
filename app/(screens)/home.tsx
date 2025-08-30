import { View, FlatList, Image } from 'react-native'
import { Video, ResizeMode } from 'expo-av';
import * as Location from 'expo-location';
import React from 'react'
import { Text } from '@/components/ui/text'
import { SafeAreaView } from 'react-native-safe-area-context'
import { toast } from 'sonner-native';
import { getWeather } from '@/lib/weather';
import { useAsync } from 'react-async-hook';
import { UserMenu } from '@/components/user-menu';
import { ThemeToggle } from '@/components/Theme';
import { Icon } from '@/components/ui/icon';
import { weatherIcons } from '@/constants/weatherIcons';
import { Thermometer, Wind } from 'lucide-react-native';
import { measure } from 'react-native-reanimated';
import { getNews } from '@/lib/News';
import { Link } from 'expo-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Home() {
  const [location, setLocation] = React.useState<Location.LocationObject | null>(null);
  const [address, setAddress] = React.useState<Location.LocationGeocodedAddress[] | null>(null);
  const [errorMsg, setErrorMsg] = React.useState(null);
  const [weatherData, setWeatherData] = React.useState<any>(null);
  const [newsData, setNewsData] = React.useState<any>(null);

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

  const country: string | undefined = address && address[0].isoCountryCode ? address[0].isoCountryCode : undefined;
  const news = useAsync(
    React.useCallback(() => {
      if (country) {
        return getNews({ country });
      }
      return Promise.resolve(null);
    }, [country]),
    [country]
  );

  React.useEffect(() => {
    if (news.status === 'success' && news.result) {
      setNewsData(news.result);
    }
  }, [news.status, news.result]);

  return (
    <SafeAreaView className='p-4 flex-1'>
      
        {address && weather.status === "loading" ? (
          <View>
            <Text className='text-md font-bold'>Fetching Weather for {address[0].name}...</Text>
          </View>
        ) : weather.status === "error" ? (
          <View>
            <Text className='text-2xl font-bold'>Error fetching weather data</Text>
            <Text>{String(weather.error)}</Text>
          </View>
        ) : (weatherData && address) && (
          <View className='space-y-2 gap-2'>
            <View className='flex-row justify-between items-center'>
              <View className='flex flex-row items-baseline'>
                <Text className='text-4xl font-semibold'>{(weatherData.main.feels_like - 273.15).toFixed(0)} °C,</Text>
                <Text className='text-lg'>{address[0].name}</Text>
              </View>
              <UserMenu />
            </View>
            <View className='flex-row items-center space-x-2 gap-2'>
              <Icon as={weatherIcons[weatherData.weather[0].icon as keyof typeof weatherIcons]} size={24} />
              <Text className='text-lg'>{weatherData.weather[0].description}</Text>
            </View>
            <View className='flex-row items-center space-x-2 gap-2'>
              <Icon as={Thermometer} size={24} />
              <Text>Real feel:</Text>
              <Text className='font-semibold'>{(weatherData.main.temp - 273.15).toFixed(0)} °C</Text>
            </View>
            <View className='flex-row items-center space-x-2 gap-2'>
              <Icon as={Wind} size={24} />
              <Text>Wind speed:</Text>
              <Text className='font-semibold'>{(weatherData.wind.speed * 3.6).toFixed(0)} km/h</Text>
            </View>
            <View className='flex-row items-center space-x-2 gap-2'>
              <Text>Humidity</Text>
              <Text>{weatherData.main.humidity}%</Text>
            </View>
          </View>
        )}
      {news.status === "loading" ? (
        <View className='mt-4'>
          <Text className='text-md font-bold'>Fetching News...</Text>
        </View>
      ) : news.status === "error" ? (
        <View className='mt-4'>
          <Text className='text-2xl font-bold'>Error fetching news data</Text>
          <Text>{String(news.error)}</Text>
        </View>
      ) : (newsData && Array.isArray(newsData.results)) && (
        <View className='space-y-2 gap-2 mt-6 flex-1'>
          <Text className='text-2xl font-bold mb-2'>Top Headlines</Text>
          <FlatList
            data={newsData.results}
            keyExtractor={(item, index) => item.link || item.title || String(index)}
            renderItem={({ item }) => (
              <View className='space-y-1 bg-slate-50 dark:bg-gray-950 mb-4'>
                {item.video_url ? (
                  <Video
                    source={{ uri: item.video_url }}
                    style={{ width: '100%', height: 180, borderRadius: 8, marginBottom: 8 }}
                    useNativeControls
                    resizeMode={ResizeMode.COVER}
                    isLooping
                  />
                ) : item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={{ width: '100%', height: 180, borderRadius: 8, marginBottom: 8 }}
                    resizeMode="cover"
                  />
                ) : null}
                <Text className='text-lg font-bold'>{item.title}</Text>
                {item.description && (
                  <Text className='opacity-80 text-justify'>
                    {item.description.length > 120
                      ? item.description.slice(0, 120) + '...'
                      : item.description}
                  </Text>
                )}
                <View className='flex gap-2 mt-2 items-center flex-row'>
                  <Avatar alt="Zach Nugent's Avatar">
                  <AvatarImage source={{ uri: item.source_icon }} />
                  <AvatarFallback>
                    <Text>SC</Text>
                  </AvatarFallback>
                </Avatar>
                  {item.source_url ? (
                    <Link href={item.source_url}><Text className='font-medium underline text-red-500'>{item.source_id}</Text></Link>
                  ) : null}
              </View>
              </View>
             
            )}
            showsVerticalScrollIndicator={false}
            refreshing={false}
          />
        </View>
      )}
    </SafeAreaView>
  )
}