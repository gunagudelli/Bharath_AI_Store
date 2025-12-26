// app/(auth)/_layout.tsx - Auth Group Layout (Protected Routes)
import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/types'; // Adjust path to types
import Constants from 'expo-constants';
import SingleAgentMode from '../../components/SingleAgentMode';

export default function AuthLayout() {
  const userData = useSelector((state: RootState) => state.userData);
  const onboardingState = useSelector((state: RootState) => state.onboarding);
  const isAuthenticated = !!userData?.accessToken;
  const isOnboardingCompleted = onboardingState?.isCompleted;

  // 🔥 Check if this is a single-agent APK
  const isSingleAgent = Constants.expoConfig?.extra?.isSingleAgent;

  // 🔥 For agent-locked APKs, redirect to single agent after auth
  if (isAuthenticated && isSingleAgent) {
    console.log('Single-agent mode: Redirecting to agent');
    return <SingleAgentMode />;
  }
  
  if (isAuthenticated) {
    console.log('Auto-login: Redirecting to tabs');
    return <Redirect href="/(screen)/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#E3F2FD' }, // Light blue from mockup
      }}
      initialRouteName={isOnboardingCompleted ? "welcome" : "onboarding"} // Show onboarding only if not completed
    >
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="otp" />
    </Stack>
  );
}