import { Image, View } from 'react-native'
import React from 'react'
import { Text } from './ui/text'
import { ResizeMode, Video } from 'expo-av'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'expo-router'

export default function NewsCard({item}: {item:any}) {
  return (
                <View className='space-y-1 bg-slate-50 dark:bg-gray-950 mb-4'>
                {item.video_url ? (
                  <Video
                    source={{ uri: item.video_url }}
                    style={{ width: '100%', height: 240 }}
                    useNativeControls
                    resizeMode={ResizeMode.COVER}
                    isLooping
                  />
                ) : item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={{ width: '100%', height: 240 }}
                    resizeMode="cover"
                  />
                ) : null}
                <Text className='text-lg font-semibold'>{item.title}</Text>
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
  )
}