// Auth Layout - Support Both Flows
import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/types';
import Constants from 'expo-constants';

export default function AuthLayout() {
  const userData = useSelector((state: RootState) => state.userData);
  const onboardingState = useSelector((state: RootState) => state.onboarding);
  const isAuthenticated = !!userData?.accessToken;
  const isOnboardingCompleted = onboardingState?.isCompleted;
  
  // Check if this is a single-agent APK build
  const isSingleAgentBuild = Constants.expoConfig?.extra?.isSingleAgent;

  if (isAuthenticated) {
    if (isSingleAgentBuild) {
      // Single-agent template: go to dashboard
      return <Redirect href="/dashboard" />;
    } else {
      // Normal app: go to tabs
      return <Redirect href="/(screen)/(tabs)" />;
    }
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