// app/_layout.tsx - Root Stack Layout with Redux Provider and Protected Routes
// Provider wraps PersistGate; root Stack nests auth/protected groups.
// Group layouts handle redirects based on auth state—no manual useEffect.
// On fresh install: Starts at (auth)/welcome.
// If token exists: Redirects to (screen)/(tabs).
// Matches your gradient theme; no headers.

import React from 'react';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './Redux/store/index'; // Adjust path to your store

// Simple splash during persist (customize with gradient/Lottie if wanted)
const SplashScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E3F2FD' }}>
    <Text style={{ fontSize: 18, color: '#3d2a71' }}>Loading...</Text>
  </View>
);

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<SplashScreen />} persistor={persistor}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="(auth)" // Start at auth group
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(screen)" options={{ headerShown: false }} />
        </Stack>
      </PersistGate>
    </Provider>
  );
}