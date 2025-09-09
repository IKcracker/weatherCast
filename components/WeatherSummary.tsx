import { View } from 'react-native'
import React from 'react'
import { Text } from './ui/text'
import { UserMenu } from './user-menu'
import { Icon } from './ui/icon'
import { weatherIcons } from '@/types/weatherIconTypes' 
import { Thermometer, Wind } from 'lucide-react-native'

export default function WeatherSummary({ address , weatherData}: { address:any , weatherData:any}) {
  return (
     <View className='space-y-2  gap-2'>
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
  )
}