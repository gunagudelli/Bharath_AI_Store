// app/(screen)/_layout.tsx - Protected Group Layout
import React from 'react';
import { Stack, Redirect, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/types'; // Adjust path to types
import Constants from 'expo-constants';
import SingleAgentMode from '../../components/SingleAgentMode';

export default function ScreenLayout() {
  const userData = useSelector((state: RootState) => state.userData);
  const isAuthenticated = !!userData?.accessToken;
  const { title } = useLocalSearchParams();

  // 🔥 Check if this is a single-agent APK
  const isSingleAgent = Constants.expoConfig?.extra?.isSingleAgent;
  
  if (!isAuthenticated) {
    console.log('Unauthorized: Redirecting to welcome');
    return <Redirect href="/(auth)/welcome" />;
  }

  // If single-agent mode, show only that agent
  if (isSingleAgent) {
    return <SingleAgentMode />;
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