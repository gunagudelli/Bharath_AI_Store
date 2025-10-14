import React from 'react';
import { Stack } from 'expo-router';

export default function ContactLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#E3F2FD' }, // Light blue from mockup
      }}
    >
      <Stack.Screen name="AccountActiveScreen" options={{ headerShown: true, title: 'Account Status' }} />
      <Stack.Screen name="AccountDeleteScreen" options={{ headerShown: true, title: 'Account Deletion' }} />
    </Stack>
  );
}
