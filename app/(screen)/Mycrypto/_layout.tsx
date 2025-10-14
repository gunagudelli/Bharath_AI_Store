// app/(auth)/_layout.tsx - Auth Group Layout (Protected Routes)
import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {


  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#E3F2FD' }, // Light blue from mockup
      }}
    >
      <Stack.Screen name="ViewHistoryBMVCoinsWallet" options={{ headerShown: true, title: 'Transaction History' }} />
    </Stack>
  );
}