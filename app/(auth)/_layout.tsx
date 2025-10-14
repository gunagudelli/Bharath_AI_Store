// app/(auth)/_layout.tsx - Auth Group Layout (Protected Routes)
import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/types'; // Adjust path to types

export default function AuthLayout() {
  const userData = useSelector((state: RootState) => state.userData);
  const isAuthenticated = !!userData?.accessToken;

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
      initialRouteName="welcome" // Start at welcome if not authenticated
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="otp" />
    </Stack>
  );
}