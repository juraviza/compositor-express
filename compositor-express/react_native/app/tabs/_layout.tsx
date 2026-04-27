import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { colors } from '../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.bgSecondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 6,
          height: Platform.OS === 'ios' ? 86 : 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Inicio',
        tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
      }} />
      <Tabs.Screen name="my-lyrics" options={{
        title: 'Letras',
        tabBarIcon: ({ color, size }) => <MaterialIcons name="library-music" size={size} color={color} />,
      }} />
      <Tabs.Screen name="videos" options={{
        title: 'Videos',
        tabBarIcon: ({ color, size }) => <MaterialIcons name="movie-creation" size={size} color={color} />,
      }} />
      <Tabs.Screen name="encyclopedia" options={{
        title: 'Enciclopedia',
        tabBarIcon: ({ color, size }) => <MaterialIcons name="menu-book" size={size} color={color} />,
      }} />
    </Tabs>
  );
}
