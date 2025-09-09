import { TouchableOpacity, View } from 'react-native';
import React from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { Text } from './ui/text';
import { newsCategory } from '@/types/newsTypes';

export default React.memo(function Categories({
  categories,
  setCategory,
}: {
  categories: newsCategory[];
  setCategory: (category: newsCategory) => void;
}) {
  return (
    <View>
      <FlatList
        data={categories}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() => setCategory(item)}
              className="mr-2 rounded-full border border-gray-100 px-3 py-1 text-lg text-white dark:border-gray-900">
              <Text>{item}</Text>
            </TouchableOpacity>
          );
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item + index}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </View>
  );
});
