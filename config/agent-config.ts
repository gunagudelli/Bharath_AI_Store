// config/agent-config.ts - Agent-Specific Configuration
export const AGENT_CONFIG = {
  // 🔥 Injected during build process
  id: process.env.EXPO_PUBLIC_AGENT_ID || null,
  name: process.env.EXPO_PUBLIC_AGENT_NAME || null,
  buildId: process.env.EXPO_PUBLIC_BUILD_ID || null,
  
  // 🔒 Agent Lock Mode
  isLocked: !!process.env.EXPO_PUBLIC_AGENT_ID,
  
  // 📱 App Branding
  getAppName: () => {
    const agentName = process.env.EXPO_PUBLIC_AGENT_NAME;
    if (agentName && agentName !== '${EXPO_PUBLIC_AGENT_NAME}') {
      return `${agentName} AI`;
    }
    return 'Bharath AI Store';
  },
  
  // 🎯 Direct Chat URL
  getChatUrl: () => {
    const agentId = process.env.EXPO_PUBLIC_AGENT_ID;
    if (agentId && agentId !== '${EXPO_PUBLIC_AGENT_ID}') {
      return `/userflow/GenOxyChatScreen?agentId=${agentId}`;
    }
    return null;
  },
  
  // 🔍 Debug function
  debug: () => {
    console.log('🔧 Agent Config:', {
      buildId: process.env.EXPO_PUBLIC_BUILD_ID || null,
      getAppName: AGENT_CONFIG.getAppName(),
      getChatUrl: AGENT_CONFIG.getChatUrl(),
      id: process.env.EXPO_PUBLIC_AGENT_ID || null,
      isLocked: !!process.env.EXPO_PUBLIC_AGENT_ID,
      name: process.env.EXPO_PUBLIC_AGENT_NAME || null
    });
  }
};

// 🔍 Debug Info
if (__DEV__) {
  AGENT_CONFIG.debug();
}