// Main App Layout - Keep Original Multi-Agent Flow
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Constants from 'expo-constants';
import { store, persistor } from './Redux/store/index';

const SplashScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E3F2FD' }}>
    <Text style={{ fontSize: 18, color: '#3d2a71' }}>Loading...</Text>
  </View>
);

function AppContent() {
  // Check if this is a single-agent APK build
  const isSingleAgentBuild = Constants.expoConfig?.extra?.isSingleAgent;
  
  if (isSingleAgentBuild) {
    // Single-agent template flow
    return (
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName="(auth)"
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="agent" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
      </Stack>
    );
  }
  
  // Normal multi-agent app flow
  return (
    <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName="(auth)"
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(screen)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<SplashScreen />} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}