import { Image, View } from 'react-native';
import React from 'react';
import { Text } from './ui/text';
import { ResizeMode, Video } from 'expo-av';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Link } from 'expo-router';
import { NewsItem } from '@/types/newsTypes'; // <- put schema in a types folder

export default function NewsCard({ item }: { item: NewsItem }) {
  console.log('NewsCard item:', item);
  return (
    <View className="space-y-1 bg-slate-50 dark:bg-gray-950 mb-4 rounded-lg ">
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
          style={{ width: '100%', height: 240}}
          resizeMode="cover"
        />
      ) : null}

      <Text className="text-lg font-semibold">{item.title}</Text>

      {item.description && (
        <Text className="opacity-80 text-justify">
          {item.description.length > 120
            ? item.description.slice(0, 120) + '...'
            : item.description}
        </Text>
      )}

      <View className="flex gap-2 mt-1 items-center flex-row">
        <Avatar alt="Source Avatar">
            {item?.source_icon ? (
            <AvatarImage source={{ uri: item?.source_icon}} />
            ) : (
            <AvatarFallback>
              <Text>SC</Text>
            </AvatarFallback>
            )}
        </Avatar>

        {item?.source_url ? (
          <Link href={item?.source_url as any}>
            <Text className="font-medium underline text-red-500">
              {item.source_id ?? 'Source'}
            </Text>
          </Link>
        ) : null}
      </View>
    </View>
  );
}
