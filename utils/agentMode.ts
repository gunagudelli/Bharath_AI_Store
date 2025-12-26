// utils/agentMode.ts - Utility functions for single-agent mode
import Constants from 'expo-constants';

export interface AgentConfig {
  agentId: string | null;
  agentName: string | null;
  buildId: string | null;
  isSingleAgent: boolean;
}

export const getAgentConfig = (): AgentConfig => {
  const extra = Constants.expoConfig?.extra;
  
  return {
    agentId: extra?.agentId || null,
    agentName: extra?.agentName || null,
    buildId: extra?.buildId || null,
    isSingleAgent: !!extra?.isSingleAgent
  };
};

export const isSingleAgentMode = (): boolean => {
  return getAgentConfig().isSingleAgent;
};

export const getSingleAgentId = (): string | null => {
  return getAgentConfig().agentId;
};

export const getSingleAgentName = (): string | null => {
  return getAgentConfig().agentName;
};

// Log agent configuration for debugging
export const logAgentConfig = () => {
  const config = getAgentConfig();
  console.log('🔧 Agent Configuration:', config);
  
  if (config.isSingleAgent) {
    console.log(`📱 Single-Agent Mode: ${config.agentName} (${config.agentId})`);
  } else {
    console.log('🏪 Multi-Agent Store Mode');
  }
};