import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function ContactLayout() {
    const { title } = useLocalSearchParams();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: '#E3F2FD' }, // Light blue from mockup
      }}
    >
     <Stack.Screen name="profileEdit" options={{ headerShown: true, title: 'Edit Profile' }} />
     <Stack.Screen name="GenOxyChatScreen" options={{ headerShown: true, title: (Array.isArray(title) ? title[0] : title) || 'Chat with Agent' }} />
      
    </Stack>
  );
}