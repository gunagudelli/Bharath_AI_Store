// app/_layout.tsx - Root Stack Layout with Redux Provider and Protected Routes
// Provider wraps PersistGate; root Stack nests auth/protected groups.
// Group layouts handle redirects based on auth state—no manual useEffect.
// On fresh install: Starts at (auth)/welcome.
// If token exists: Redirects to (screen)/(tabs).
// Matches your gradient theme; no headers.

import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Constants from 'expo-constants';
import { store, persistor } from './Redux/store/index'; // Adjust path to your store
import SingleAgentMode from '../components/SingleAgentMode';

// Simple splash during persist (customize with gradient/Lottie if wanted)
const SplashScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E3F2FD' }}>
    <Text style={{ fontSize: 18, color: '#3d2a71' }}>Loading...</Text>
  </View>
);

function AppContent() {
  const [isSingleAgent, setIsSingleAgent] = useState(false);
  
  useEffect(() => {
    // Check if this is a single-agent APK
    const singleAgentMode = Constants.expoConfig?.extra?.isSingleAgent;
    setIsSingleAgent(!!singleAgentMode);
  }, []);
  
  // If single-agent mode, show only that agent
  if (isSingleAgent) {
    return <SingleAgentMode />;
  }
  
  // Normal multi-agent app
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="(auth)" // Start at auth group
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