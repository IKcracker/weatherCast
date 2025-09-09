import { Image, View } from 'react-native';
import React from 'react';
import { Text } from './ui/text';
import { ResizeMode, Video } from 'expo-av';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Link } from 'expo-router';
import { NewsItem } from '@/types/newsTypes'; // <- put schema in a types folder

export default React.memo(function NewsCard({ item }: { item: NewsItem }) {
  console.log(item.content);
  return (
    <View className="mb-4 space-y-1 bg-gray-50 p-1 dark:bg-gray-950">
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

      <Text className="text-lg font-semibold">{item.title}</Text>

      {item.description && (
        <Text className="text-justify opacity-80">
          {item.description.length > 120
            ? item.description.slice(0, 120) + '...'
            : item.description}
        </Text>
      )}

      <View className="mt-1 flex flex-row items-center gap-2">
        <Avatar alt="Source Avatar">
          {item?.source_icon ? (
            <AvatarImage source={{ uri: item?.source_icon }} />
          ) : (
            <AvatarFallback>
              <Text>SC</Text>
            </AvatarFallback>
          )}
        </Avatar>

        {item?.source_url ? (
          <Link href={item?.source_url as any}>
            <Text className="font-medium text-red-500 underline">{item.source_id ?? 'Source'}</Text>
          </Link>
        ) : null}
      </View>
    </View>
  );
});
