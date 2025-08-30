import { FlatList, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/Theme'
import { UserMenu } from '@/components/user-menu'
import { Icon } from '@/components/ui/icon'
import { ArrowBigUp, ArrowDown, ArrowDownWideNarrow, ArrowUp, Droplet, LocateIcon, Power, Wind, Sun, Cloud, CloudRain, CloudSnow, CloudDrizzle, CloudLightning } from 'lucide-react-native'
import * as Location from 'expo-location';
import { toast } from 'sonner-native'
import { useAsync } from 'react-async-hook'
import { getForecast, getWeather } from '@/lib/weather'

// Map weather icon codes to icon components
const WeatherIcons: Record<string, React.ElementType> = {
  '01d': Sun,
  '01n': Sun,
  '02d': Cloud,
  '02n': Cloud,
  '03d': Cloud,
  '03n': Cloud,
  '04d': Cloud,
  '04n': Cloud,
  '09d': CloudRain,
  '09n': CloudRain,
  '10d': CloudDrizzle,
  '10n': CloudDrizzle,
  '11d': CloudLightning,
  '11n': CloudLightning,
  '13d': CloudSnow,
  '13n': CloudSnow,
  '50d': Cloud,
  '50n': Cloud,
};

export default function Weather() {
    const [address, setAddress] = React.useState<Location.LocationGeocodedAddress[] | null>(null);
    const [weatherData, setWeatherData] = React.useState<any>(null);
    const [forecastData, setForecastData] = React.useState<any>(null);
    const [location, setLocation] = React.useState<Location.LocationObject | null>(null);

        React.useEffect(() => {
          async function getCurrentLocation() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              toast.error('Permission to access location was denied');
              return;
            }
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            const address = await Location.reverseGeocodeAsync(loc.coords);
            setAddress(address);
          
          }
          getCurrentLocation();
        }, []);
      const date = new Date();
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();

          const weather = useAsync(
            React.useCallback(() => {
              if (location) {
                return getWeather(location.coords.latitude, location.coords.longitude);
              }
              return Promise.resolve(null);
            }, [location]),
            [location]
          );

        const forecast = useAsync(
            React.useCallback(() => {
              if (location) {
                return getForecast(location.coords.latitude, location.coords.longitude);
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

        React.useEffect(() => {
          if (forecast.status === 'success' && forecast.result) {
            setForecastData(forecast.result);
          }
        }, [forecast.status, forecast.result]);
    
        console.log("forecastData", JSON.stringify(forecastData, null, 2));
      const country = React.useMemo(() => {
        if (address && address[0] && address[0].isoCountryCode) {
          return address[0].isoCountryCode;
        }
        return undefined;
      }, [address]);

      
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
      placeholder="Search weather..."
      id='search'
    />
    </View>
    <View className='flex flex-row justify-between items-center mt-4 mb-4'>
    <View>
        <View className='flex flex-row items-center gap-2 space-x-2 mt-4'>
            <Icon as={LocateIcon} size={24} />
            {address && address[0] && <Text className='font-bold'>{address[0].country}</Text>}
        </View>
        <View>
            <Text>Today, {month} {day} {year}</Text>
        </View>
        
    </View>
    <View className='flex flex-row gap-2 items-center '>
        <View className='flex rounded-full bg-slate-400 p-1 blur-md dark:bg-slate-600 flex-row items-center gap-2 space-x-2 '>
            <Icon as={ArrowUp} size={24} />
            <Text>{(weatherData?.main.temp_max - 273.15).toFixed(0)} °C</Text>
        </View>
        <View className='flex rounded-full bg-slate-400 p-1 dark:bg-slate-600 flex-row items-center gap-2 space-x-2'>
            <Icon as={ArrowDown} size={24} />
            <Text>{(weatherData?.main.temp_min - 273.15).toFixed(0)} °C</Text>
        </View>
    </View>
    </View>

    <View>
        <Text className='text-8xl font-semibold'>{(weatherData?.main.temp - 273.15).toFixed(0)} °C</Text>
        <View className='flex flex-row items-center gap-3 space-x-2 mt-2'>
<View className='flex flex-row items-center gap-2 space-x-2 mt-2'>
            <Icon as={Wind} size={24} />
             <Text className='font-semibold'>{(weatherData?.wind.speed * 3.6).toFixed(0)} km/h</Text>
        </View>
         <View className='flex flex-row items-center gap-2 space-x-2 mt-2'>
            <Icon as={Droplet} size={24} />
             <Text className='font-semibold'>{weatherData?.main.humidity}%</Text>
        </View>
         <View className='flex flex-row items-center gap-2 space-x-2 mt-2'>
            <Icon as={ArrowDownWideNarrow} size={24} />
             <Text className='font-semibold'>{weatherData?.main.pressure}Pa</Text>
        </View>
        </View>
        
    </View>

  {/* Only show the coming 3 days forecast */}
  <FlatList
    data={(() => {
      if (!forecastData?.list) return [];
      // OpenWeatherMap 5-day forecast returns data every 3 hours
      // We'll group by day and pick the first entry for each day
      const now = new Date();
      const days: { [key: string]: any } = {};
      for (const item of forecastData.list) {
        const dateObj = new Date(item.dt * 1000);
        const dayKey = dateObj.toISOString().slice(0, 10); // YYYY-MM-DD
        if (!days[dayKey] && dateObj > now) {
          days[dayKey] = item;
        }
      }
      return Object.values(days).slice(0, 3);
    })()}
    showsVerticalScrollIndicator={false}
    keyExtractor={(_, index) => String(index)}
    renderItem={({ item }) => {
      const dateObj = new Date(item.dt * 1000);
      const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
      const dateString = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      return (
        <View className="bg-slate-200 dark:bg-gray-800 p-4 flex flex-row justify-between rounded-lg my-2 items-center">
          <View>
            <Text className="font-semibold">{dateString}</Text>
            <Text>{dayName}</Text>
            <Text className="font-semibold capitalize">
              {item.weather[0].description}
            </Text>
          </View>
          <View className="flex flex-row items-center gap-4 mt-2">
            <Text className="font-semibold text-2xl">
              {(item.main.temp - 273.15).toFixed(0)} °C
            </Text>
            <Icon as={WeatherIcons[item.weather[0].icon]} size={24} />
          </View>
        </View>
      );
    }}
    contentContainerStyle={{ paddingVertical: 20 }}
  />

    
    </SafeAreaView>
  )
}