import { FlatList, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/Theme';
import { UserMenu } from '@/components/user-menu';
import { Icon } from '@/components/ui/icon';
import {
  ArrowBigUp,
  ArrowDown,
  ArrowDownWideNarrow,
  ArrowUp,
  Droplet,
  LocateIcon,
  Wind,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  CloudLightning,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { toast } from 'sonner-native';
import { useAsync } from 'react-async-hook';
import { getForecast, getWeather } from '@/lib/weather';
import { SkeletonLoading } from '@/components/DataLoading';

import type { LucideIcon } from 'lucide-react-native';

const WeatherIcons: Record<string, LucideIcon> = {
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
  const [location, setLocation] = React.useState<Location.LocationObject | null>(null);

  React.useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Permission to access location was denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      const addr = await Location.reverseGeocodeAsync(loc.coords);
      setAddress(addr);
    }
    getCurrentLocation();
  }, []);

  const weather = useAsync(
    React.useCallback(
      () =>
        location
          ? getWeather(location.coords.latitude, location.coords.longitude)
          : Promise.resolve(null),
      [location]
    ),
    [location]
  );

  const forecast = useAsync(
    React.useCallback(
      () =>
        location
          ? getForecast(location.coords.latitude, location.coords.longitude)
          : Promise.resolve(null),
      [location]
    ),
    [location]
  );

  const date = new Date();
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  const country = React.useMemo(() => {
    if (address && address[0] && address[0].isoCountryCode) return address[0].isoCountryCode;
    return undefined;
  }, [address]);

  const isLoading = weather.status === 'loading' || forecast.status === 'loading';

  return (
    <SafeAreaView edges={['top']} className="flex-1 p-4">
      <View className="mb-4 flex flex-row items-center justify-between">
        <ThemeToggle />
        <Text className="text-lg font-bold">weatherCast</Text>
        <UserMenu />
      </View>

      <View className="mb-4 mt-4 flex flex-row items-center justify-between">
        {isLoading ? (
          <SkeletonLoading />
        ) : (
          <View>
            <View className="flex flex-row items-center gap-2">
              <Icon as={LocateIcon} size={24} />
              {address && address[0] && <Text className="font-bold">{address[0].country}</Text>}
            </View>
            <Text>
              Today, {month} {day} {year}
            </Text>
          </View>
        )}
      </View>

      {/* Current Temperature */}
      {isLoading ? (
        <SkeletonLoading />
      ) : (
        weather.result && (
          <View>
            <Text className="text-8xl font-semibold">
              {(weather.result.main.temp - 273.15).toFixed(0)} °C
            </Text>
            <View className="mt-2 flex flex-row items-center gap-3">
              <Icon as={Wind} size={24} />
              <Text className="font-semibold">
                {(weather.result.wind.speed * 3.6).toFixed(0)} km/h
              </Text>
              <Icon as={Droplet} size={24} />
              <Text className="font-semibold">{weather.result.main.humidity}%</Text>
              <Icon as={ArrowDownWideNarrow} size={24} />
              <Text className="font-semibold">{weather.result.main.pressure}Pa</Text>
            </View>
          </View>
        )
      )}

      {/* 3-Day Forecast */}
      {isLoading ? (
        <View className="mt-4 space-y-2">
          <SkeletonLoading />
          <SkeletonLoading />
          <SkeletonLoading />
        </View>
      ) : (
        <FlatList
          data={(() => {
            if (!forecast.result?.list) return [];
            const now = new Date();
            const days: { [key: string]: any } = {};
            for (const item of forecast.result.list) {
              const dateObj = new Date(item.dt * 1000);
              const dayKey = dateObj.toISOString().slice(0, 10);
              if (!days[dayKey] && dateObj > now) days[dayKey] = item;
            }
            return Object.values(days).slice(0, 3);
          })()}
          keyExtractor={(_, index) => String(index)}
          renderItem={({ item }) => {
            const dateObj = new Date(item.dt * 1000);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            const dateString = dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <View className="my-2 flex flex-row items-center justify-between rounded-lg bg-slate-200 p-4 dark:bg-gray-800">
                <View>
                  <Text className="font-semibold">{dateString}</Text>
                  <Text>{dayName}</Text>
                  <Text className="font-semibold capitalize">{item.weather[0].description}</Text>
                </View>
                <View className="mt-2 flex flex-row items-center gap-4">
                  <Text className="text-2xl font-semibold">
                    {(item.main.temp - 273.15).toFixed(0)} °C
                  </Text>
                  <Icon as={WeatherIcons[item.weather[0].icon]} size={24} />
                </View>
              </View>
            );
          }}
          contentContainerStyle={{ paddingVertical: 20 }}
        />
      )}
    </SafeAreaView>
  );
}
