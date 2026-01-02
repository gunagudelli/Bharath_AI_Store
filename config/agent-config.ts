// config/agent-config.ts - Agent-Specific Configuration
import Constants from 'expo-constants';

// Get values from both process.env and expo config
const getAgentId = () => {
  return process.env.EXPO_PUBLIC_AGENT_ID || 
         Constants.expoConfig?.extra?.agentId || 
         null;
};

const getAgentName = () => {
  return process.env.EXPO_PUBLIC_AGENT_NAME || 
         Constants.expoConfig?.extra?.agentName || 
         null;
};

const getBuildId = () => {
  return process.env.EXPO_PUBLIC_BUILD_ID || 
         Constants.expoConfig?.extra?.buildId || 
         null;
};

export const AGENT_CONFIG = {
  // 🔥 Injected during build process
  id: getAgentId(),
  name: getAgentName(),
  buildId: getBuildId(),
  
  // 🔒 Agent Lock Mode
  isLocked: !!getAgentId(),
  
  // 📱 App Branding
  getAppName: () => {
    const agentName = getAgentName();
    if (agentName && agentName !== '${EXPO_PUBLIC_AGENT_NAME}') {
      return `${agentName} AI`;
    }
    return 'Bharath AI Store';
  },
  
  // 🎯 Direct Chat URL
  getChatUrl: () => {
    const agentId = getAgentId();
    if (agentId && agentId !== '${EXPO_PUBLIC_AGENT_ID}') {
      return `/userflow/GenOxyChatScreen?agentId=${agentId}`;
    }
    return null;
  },
  
  // 🔍 Debug function
  debug: () => {
    console.log('🔧 Agent Config:', {
      buildId: getBuildId(),
      getAppName: AGENT_CONFIG.getAppName(),
      getChatUrl: AGENT_CONFIG.getChatUrl(),
      id: getAgentId(),
      isLocked: !!getAgentId(),
      name: getAgentName(),
      expoConfig: Constants.expoConfig?.extra
    });
  }
};

// 🔍 Debug Info
if (__DEV__) {
  AGENT_CONFIG.debug();
}