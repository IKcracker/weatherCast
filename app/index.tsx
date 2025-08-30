import { ThemeToggle } from '@/components/Theme';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { UserMenu } from '@/components/user-menu';
import { useUser } from '@clerk/clerk-expo';
import { Link, router, Stack } from 'expo-router';
import { MoonStarIcon, XIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const LOGO = {
  dark: require('@/assets/images/dark-logo.png'),
  light: require('@/assets/images/light-logo.png'),
};


const LOGO_STYLE: ImageStyle = {
  height: 36,
  width: 40,
};

const SCREEN_OPTIONS = {
  header: () => (
    <View className="top-safe absolute left-0 right-0 flex-row justify-between px-4 py-2 web:mx-2">
      <ThemeToggle/>
      <UserMenu />
    </View>
  ),
};

export default function Screen() {
  const { colorScheme } = useColorScheme();
  const { user } = useUser();

  return (
<SafeAreaView className='px-4 flex-1 py-12  justify-center i gap-6'>

  
  <View className='items-center justify-center flex-1  space-y-2'>
    <Image source={LOGO[colorScheme ?? 'light']} style={{width:200 , height:200}} resizeMode="contain" />
    <Text className='text-2xl mt-6 md:text-5xl text-center'>Stay Updated With</Text>
    <Text className='text-4xl text-center font-bold'>Weather & News</Text>
  </View>
  <Button onPress={()=>router.replace("/(auth)/sign-in")} size="lg" className='mx-4 rounded-full' ><Text>Get Started</Text></Button>
</SafeAreaView>
  );
}




