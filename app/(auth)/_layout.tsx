import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/types';
import Constants from 'expo-constants';
import SingleAgentTemplate from '../../templates/SingleAgentTemplate';

export default function AuthLayout() {
  const userData = useSelector((state: RootState) => state.userData);
  const onboardingState = useSelector((state: RootState) => state.onboarding);
  const isAuthenticated = !!userData?.accessToken;
  const isOnboardingCompleted = onboardingState?.isCompleted;
  
  // 🔥 Check for single-agent mode at RUNTIME
  const agentId = Constants.expoConfig?.extra?.agentId;
  const agentName = Constants.expoConfig?.extra?.agentName;
  const isSingleAgent = !!(agentId && typeof agentId === 'string' && agentName && typeof agentName === 'string' && agentId !== 'null');
  
  console.log('🔍 Auth Layout - Single Agent Check:', { agentId, agentName, isSingleAgent, isAuthenticated });
  
  if (isAuthenticated) {
    // ✅ ENABLED: Single-agent mode redirects directly to chat
    if (isSingleAgent) {
      console.log('✅ Single-Agent Mode - Using SingleAgentTemplate');
      return <SingleAgentTemplate />;
    }
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
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="otp" />
    </Stack>
  );
}