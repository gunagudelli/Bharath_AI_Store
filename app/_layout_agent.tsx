// Modified App Layout for Agent-Locked APKs
import React, { useEffect } from 'react';
import { Stack, Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/types';
import { AGENT_CONFIG } from '../config/agent-config';
import { getAgentConfig } from '../utils/agentMode';

export default function RootLayout() {
  const userData = useSelector((state: RootState) => state.userData);
  const onboardingState = useSelector((state: RootState) => state.onboarding);
  const isAuthenticated = !!userData?.accessToken;
  const isOnboardingCompleted = onboardingState?.isCompleted;
  
  const agentConfig = getAgentConfig();

  useEffect(() => {
    console.log('📱 App Layout - Agent Config Check:', agentConfig);
    AGENT_CONFIG.debug();
  }, []);

  // 🔥 AGENT LOCK MODE - Skip agent selection, go directly to chat
  if (agentConfig.isSingleAgent && agentConfig.agentId && isAuthenticated) {
    console.log('🔒 Agent Lock Mode Active - Redirecting to SingleAgentMode');
    return <Redirect href="/SingleAgentMode" />;
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
      <Stack.Screen name="SingleAgentMode" options={{ headerShown: false }} />
    </Stack>
  );
}