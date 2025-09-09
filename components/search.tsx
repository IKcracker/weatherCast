import { View, Text } from 'react-native';
import React from 'react';
import { Input } from './ui/input';

export default function Search({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (text: string) => void;
}) {
  return (
    <View>
      <Input
        keyboardType="default"
        autoComplete="off"
        placeholder="Search weather..."
        id="search"
        value={query}
        onChangeText={(text) => setQuery(text)}
      />
    </View>
  );
}
