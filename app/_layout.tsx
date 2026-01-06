// Original App Layout - Fixed Single Agent Detection
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Constants from 'expo-constants';
import { store, persistor } from './Redux/store/index';
import SingleAgentMode from '../components/SingleAgentMode';

const SplashScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E3F2FD' }}>
    <Text style={{ fontSize: 18, color: '#3d2a71' }}>Loading...</Text>
  </View>
);

function AppContent() {
  // Simplified single-agent detection
  const isSingleAgent = !!(process.env.EXPO_PUBLIC_AGENT_ID || Constants.expoConfig?.extra?.agentId);
  
  if (isSingleAgent) {
    return <SingleAgentMode />;
  }
  
  // Normal multi-agent app flow (unchanged)
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