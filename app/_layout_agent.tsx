// Modified App Layout for Agent-Locked APKs
import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/types';
import { AGENT_CONFIG } from '../config/agent-config';

export default function RootLayout() {
  const userData = useSelector((state: RootState) => state.userData);
  const onboardingState = useSelector((state: RootState) => state.onboarding);
  const isAuthenticated = !!userData?.accessToken;
  const isOnboardingCompleted = onboardingState?.isCompleted;

  // 🔥 AGENT LOCK MODE - Skip agent selection, go directly to chat
  if (AGENT_CONFIG.isLocked && isAuthenticated) {
    console.log('🔒 Agent Lock Mode - Redirecting to:', AGENT_CONFIG.name);
    return <Redirect href={AGENT_CONFIG.getChatUrl()} />;
  }

  // Normal flow for multi-agent app
  if (isAuthenticated) {
    console.log('Auto-login: Redirecting to tabs');
    return <Redirect href="/(screen)/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#E3F2FD' },
      }}
      initialRouteName={isOnboardingCompleted ? "welcome" : "onboarding"}
    >
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="otp" />
    </Stack>
  );
}