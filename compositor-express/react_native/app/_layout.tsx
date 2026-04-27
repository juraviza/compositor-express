import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { StoreProvider } from '../src/store';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <StoreProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.bgPrimary } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="tabs" />
              <Stack.Screen name="generator/index" />
              <Stack.Screen name="result" />
              <Stack.Screen name="analysis" />
              <Stack.Screen name="editor" />
              <Stack.Screen name="lyric/[id]" />
              <Stack.Screen name="video/create" />
              <Stack.Screen name="video/[id]" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </StoreProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
