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
    return process.env.EXPO_PUBLIC_AGENT_NAME 
      ? `${process.env.EXPO_PUBLIC_AGENT_NAME} AI`
      : 'Bharath AI Store';
  },
  
  // 🎯 Direct Chat URL
  getChatUrl: () => {
    return process.env.EXPO_PUBLIC_AGENT_ID 
      ? `/userflow/GenOxyChatScreen?agentId=${process.env.EXPO_PUBLIC_AGENT_ID}`
      : null;
  },
  
  // 🔍 Debug function
  debug: () => {
    console.log('🔧 AGENT_CONFIG Debug:', {
      id: process.env.EXPO_PUBLIC_AGENT_ID,
      name: process.env.EXPO_PUBLIC_AGENT_NAME,
      buildId: process.env.EXPO_PUBLIC_BUILD_ID,
      isLocked: !!process.env.EXPO_PUBLIC_AGENT_ID
    });
  }
};

// 🔍 Debug Info
if (__DEV__) {
  AGENT_CONFIG.debug();
}