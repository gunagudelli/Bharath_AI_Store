// app/(screen)/_layout.tsx - Protected Group Layout
import React from 'react';
import { Stack, Redirect, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/types'; // Adjust path to types

export default function ScreenLayout() {
  const userData = useSelector((state: RootState) => state.userData);
  const isAuthenticated = !!userData?.accessToken;
  const { title } = useLocalSearchParams();

  if (!isAuthenticated) {
    console.log('Unauthorized: Redirecting to welcome');
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#E3F2FD' },
      }}
      initialRouteName="(tabs)" // Default to tabs if authenticated
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="AgentCreation/AIRole" options={{ headerShown: true, title: 'Agent Roles' }} />
      <Stack.Screen name="AgentCreation/agentCreation" options={{ headerShown: true, title: 'Create Agent' }} />
    </Stack>
  );
}