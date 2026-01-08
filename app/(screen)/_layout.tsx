// app/(screen)/_layout.tsx - Protected Group Layout
import React, { useEffect } from 'react';
import { Stack, Redirect, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/types'; // Adjust path to types
import Constants from 'expo-constants';
import SingleAgentTemplate from '../../templates/SingleAgentTemplate';
import { enforceNavigationRestrictions } from '../../utils/singleAgentMode';

const getSingleAgentConfig = () => {
  const constantsAgentId = Constants.expoConfig?.extra?.agentId;
  const manifestAgentId = Constants.manifest?.extra?.agentId;
  
  const agentId = constantsAgentId || manifestAgentId;
  
  const validAgentId = typeof agentId === 'string' && agentId.trim() !== '' && agentId !== '{}' ? agentId : null;
  
  return validAgentId;
};

export default function ScreenLayout() {
  const userData = useSelector((state: RootState) => state.userData);
  const isAuthenticated = !!userData?.accessToken;
  const { title } = useLocalSearchParams();

  const singleAgentId = getSingleAgentConfig();
  const isSingleAgent = !!singleAgentId;
  
  useEffect(() => {
    if (isSingleAgent) {
      enforceNavigationRestrictions();
    }
  }, [isSingleAgent]);
  
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (isSingleAgent) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="single-agent" 
          component={() => <SingleAgentTemplate />}
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
      </Stack>
    );
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