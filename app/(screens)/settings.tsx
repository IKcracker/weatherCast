import { useState, useEffect } from 'react';
import { View, Switch, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser, useClerk } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useColorScheme } from 'nativewind';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [uploading, setUploading] = useState(false);

  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(theme);
  }, [theme]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setUploading(true);
        const base64 = result.assets[0].base64;
        if (base64) {
          await user?.setProfileImage({
            file: `data:image/jpeg;base64,${base64}`,
          });
          await user?.reload();
        }
      }
    } catch (error) {
      console.error('Failed to update profile picture:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6 py-6 dark:bg-black">
      {/* Header */}
      <Text className="mb-8 text-center text-3xl font-bold text-black dark:text-white">
        Settings
      </Text>

      {/* Profile */}
      <View className="mb-8 items-center">
        <TouchableOpacity
          onPress={handlePickImage}
          className="items-center justify-center p-0"
          disabled={uploading}>
          <Image
            source={{ uri: user?.imageUrl || 'https://via.placeholder.com/100' }}
            className="h-28 w-28 rounded-full border-4 border-gray-200 dark:border-gray-700"
          />
        </TouchableOpacity>
        <Text className="mt-3 text-sm text-blue-500">
          {uploading ? 'Updating...' : 'Change Profile Picture'}
        </Text>

        <Text className="mt-4 text-xl font-semibold text-black dark:text-white">
          {user?.username || 'Hello'}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400">
          {user?.primaryEmailAddress?.emailAddress}
        </Text>
      </View>

      {/* Preferences */}
      <View className="space-y-6">
        {/* Theme Picker */}
        <View className="rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
          <Text className="mb-2 text-base font-semibold text-black dark:text-white">Theme</Text>
          <View className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <Picker
              selectedValue={theme}
              onValueChange={(value) => setTheme(value)}
              dropdownIconColor="#000">
              <Picker.Item label="System Default" value="system" />
              <Picker.Item label="Light" value="light" />
              <Picker.Item label="Dark" value="dark" />
            </Picker>
          </View>
        </View>

        {/* Notifications */}
        <View className="flex-row items-center justify-between rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
          <Text className="text-base font-semibold text-black dark:text-white">Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
      </View>

      {/* Sign Out */}
      <Button onPress={() => signOut()} className="mt-12 rounded-2xl bg-red-500 py-4">
        <Text className="text-center text-lg font-semibold text-white">Sign Out</Text>
      </Button>
    </SafeAreaView>
  );
}
