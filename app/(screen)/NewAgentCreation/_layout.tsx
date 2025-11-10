import React from 'react';
import { Stack } from 'expo-router';

export default function ScreenLayout() {
    return (
      <Stack
        screenOptions={{
          headerShown: true,
          contentStyle: { backgroundColor: '#E3F2FD' }, // Light blue from mockup
        }}
      >
        <Stack.Screen name="AgentCreationScreen" options={{ title: 'Create Agent' }} />
        <Stack.Screen name="AgentPreviewScreen" options={{  title: 'Preview' }} />
      </Stack>
    );
}