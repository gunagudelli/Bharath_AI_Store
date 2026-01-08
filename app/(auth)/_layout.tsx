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
  
  // Check for single-agent mode (APK automation)
  const envAgentId = process.env.EXPO_PUBLIC_AGENT_ID;
  const constantsAgentId = Constants.expoConfig?.extra?.agentId;
  
  // Ensure we get a valid string, not an object
  const agentId = envAgentId || 
    (constantsAgentId && typeof constantsAgentId === 'string' ? constantsAgentId : null);
  
  if (isAuthenticated) {
    if (agentId) {
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