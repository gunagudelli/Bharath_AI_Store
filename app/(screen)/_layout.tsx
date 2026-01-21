// app/(screen)/_layout.tsx - Protected Group Layout
import React, { useEffect } from 'react';
import { Stack, Redirect, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/types'; // Adjust path to types
import Constants from 'expo-constants';
import SingleAgentTemplate from '../../templates/SingleAgentTemplate';
import { enforceNavigationRestrictions } from '../../utils/singleAgentMode';

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
  
  // 🔒 ENFORCE: Activate navigation restrictions for single-agent mode
  useEffect(() => {
    if (isSingleAgent) {
      enforceNavigationRestrictions();
    }
  }, [isSingleAgent]);
  
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

  // ✅ ENABLED: Single-agent mode shows SingleAgentTemplate
  if (isSingleAgent) {
    console.log('✅ Rendering SingleAgentTemplate for single-agent APK');
    return <SingleAgentTemplate />;
  }

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