// app/_layout.tsx - Root Stack Layout with Redux Provider (Fixed Timing)
// Provider wraps AuthWrapper (Stack + guard)—ensures useSelector runs in context.
// PersistGate for loading (splash during token restore); initial to welcome.
// Auth guard: Redirects to tabs if token valid (from AsyncStorage/Redux).
// Matches your gradient theme; no headers.

import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { Provider } from 'react-redux'; // Redux Provider for context
import { PersistGate } from 'redux-persist/integration/react'; // For loading during restore
import { store, persistor } from './Redux/store/index'; // Adjust path to your store
import { useSelector } from 'react-redux'; // useEffect for guard
import { RootState } from './Redux/types'; // Adjust path to types

// Simple splash during persist (customize with gradient/Lottie if wanted)
const SplashScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E3F2FD' }}>
    <Text style={{ fontSize: 18, color: '#3d2a71' }}>Loading...</Text>
  </View>
);

// ✅ Child wrapper: Contains Stack + auth guard (useSelector in context)
const AuthWrapper: React.FC = () => {
  const router = useRouter();
  const userData = useSelector((state: RootState) => state.userData); // ✅ Now in Provider context
  const isAuthenticated = !!userData?.accessToken; // Check token

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Auto-login: Redirecting to tabs');
      router.replace('/(screen)/(tabs)');
    }
  }, [isAuthenticated, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Clean auth UI
        contentStyle: { backgroundColor: '#E3F2FD' }, // Light blue from mockup
      }}
      initialRouteName="(auth)/welcome" // Fallback to welcome if no token
    >
      {/* Auth screens */}
      <Stack.Screen name="(auth)/welcome" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" />
      <Stack.Screen name="(auth)/otp" />

      {/* Post-auth tabs */}
      <Stack.Screen name="(screen)/(tabs)" options={{ headerShown: false }} />

      {/* Other routes */}
      <Stack.Screen name="(screen)/GenOxyChatScreen" options={{ headerShown: true, title: 'Chat' }} />
      <Stack.Screen name="(screen)/AgentDetailScreen" options={{ headerShown: true, title: 'Agent Details' }} />

      {/* agent creation and update */}
      <Stack.Screen name="(screen)/AgentCreation/agentCreation" options={{ headerShown: true, title: 'Create Agent' }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <Provider store={store}> {/* ✅ Provider at root—wraps everything */}
      <PersistGate loading={<SplashScreen />} persistor={persistor}> {/* ✅ Loading during token restore */}
        <AuthWrapper /> {/* ✅ Child with guard—useSelector works here */}
      </PersistGate>
    </Provider>
  );
}