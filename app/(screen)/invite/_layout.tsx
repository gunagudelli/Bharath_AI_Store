import { Stack } from "expo-router";// app/(auth)/_layout.tsx - Auth Group Layout (Protected Routes)
import React from 'react';

export default function AuthLayout() {


  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#E3F2FD' }, // Light blue from mockup
      }}
    >
      <Stack.Screen name="inviteAFriend" options={{ headerShown: true, title: 'Invite a Friend' }} />
        <Stack.Screen name="refferalHistory" options={{ headerShown: true, title: 'Referral History' }} />
    </Stack>
  );
}