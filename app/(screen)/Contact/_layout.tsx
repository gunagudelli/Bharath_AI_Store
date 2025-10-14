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
      <Stack.Screen name="contactus" options={{ headerShown: true, title: 'Contact Us' }} />
      <Stack.Screen name="ticketHistory" options={{ headerShown: true, title: 'Ticket History' }} />
    </Stack>
  );
}