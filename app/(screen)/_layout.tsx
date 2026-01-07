// app/(screen)/_layout.tsx - Protected Group Layout
import React from 'react';
import { Stack, Redirect, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/types'; // Adjust path to types
import Constants from 'expo-constants';
import SingleAgentTemplate from '../../templates/SingleAgentTemplate';

// 🔥 Reliable single-agent detection
const getSingleAgentConfig = () => {
  // 🔥 SAFE: Use Constants instead of process.env in components
  const constantsAgentId = Constants.expoConfig?.extra?.agentId;
  const manifestAgentId = Constants.manifest?.extra?.agentId;
  
  const agentId = constantsAgentId || manifestAgentId;
  
  // Ensure it's a valid string, not an object
  const validAgentId = typeof agentId === 'string' && agentId.trim() !== '' && agentId !== '{}' ? agentId : null;
  
  console.log('🔍 Single Agent Detection:', {
    constantsAgentId,
    manifestAgentId,
    finalAgentId: validAgentId,
    isSingleAgent: !!validAgentId
  });
  
  return validAgentId;
};

export default function ScreenLayout() {
  const userData = useSelector((state: RootState) => state.userData);
  const isAuthenticated = !!userData?.accessToken;
  const { title } = useLocalSearchParams();

  // 🔥 Check if this is a single-agent APK
  const singleAgentId = getSingleAgentConfig();
  const isSingleAgent = !!singleAgentId;
  
  console.log('🎯 Layout Decision:', {
    isAuthenticated,
    isSingleAgent,
    singleAgentId,
    willShowSingleAgent: isAuthenticated && isSingleAgent
  });
  
  if (!isAuthenticated) {
    console.log('❌ Unauthorized: Redirecting to welcome');
    return <Redirect href="/(auth)/welcome" />;
  }

  // 🔥 CRITICAL: If single-agent mode, show ONLY that agent (no tabs, no multi-agent UI)
  if (isSingleAgent) {
    console.log('🎯 Single Agent Mode Activated for:', singleAgentId);
    console.log('🚫 Bypassing tabs/multi-agent layout');
    console.log('✅ Rendering SingleAgentTemplate component only');
    return <SingleAgentTemplate />;
  }
  
  console.log('🔄 Multi-agent mode - showing tabs layout');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#E3F2FD' },
      }}
      initialRouteName="(tabs)" // Default to tabs if authenticated
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="AgentCreation/AIRole" options={{ headerShown: true, title: 'Agent Roles' }} />
      <Stack.Screen name="AgentCreation/agentCreation" options={{ headerShown: true, title: 'Create Agent' }} />
    </Stack>
  );
}