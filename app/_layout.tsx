// Single-Agent Template Root Layout
import React from 'react';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './Redux/store/index';

const SplashScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E3F2FD' }}>
    <Text style={{ fontSize: 18, color: '#3d2a71' }}>Loading...</Text>
  </View>
);

function AppContent() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="(auth)"
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
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