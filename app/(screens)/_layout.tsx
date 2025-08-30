import { Icon } from '@/components/ui/icon'
import { Tabs } from 'expo-router'
import { BookOpen, Cloud, Home, Settings } from 'lucide-react-native'
import React from 'react'

export default function screenLaout() {
  return (
    <Tabs>
        <Tabs.Screen name="home" options={{headerShown:false, tabBarLabel:"Home" ,tabBarLabelStyle:{fontSize:14} ,tabBarIcon:()=><Icon  size={24} as={Home}/>}}/>
        <Tabs.Screen name="weather" options={{headerShown:false, tabBarLabel:"Weather",tabBarLabelStyle:{fontSize:14} ,tabBarIcon:()=><Icon size={24} as={Cloud}/>}}/>
        <Tabs.Screen name="news" options={{headerShown:false, tabBarLabel:"News",tabBarLabelStyle:{fontSize:14}, tabBarIcon:()=><Icon size={24} as={BookOpen}/>}}/>
        <Tabs.Screen name="settings" options={{headerShown:false, tabBarLabel:"Settings",tabBarLabelStyle:{fontSize:14}, tabBarIcon:()=><Icon size={24} as={Settings}/>}}/>
    </Tabs>
  )
}
