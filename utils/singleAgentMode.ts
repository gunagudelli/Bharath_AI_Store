import Constants from 'expo-constants';

// Single source of truth for single-agent detection
export const isSingleAgentMode = (): boolean => {
  return !!(
    process.env.EXPO_PUBLIC_AGENT_ID || 
    Constants.expoConfig?.extra?.selectedAgentId
  );
};

export const getSingleAgentConfig = () => {
  const agentId = process.env.EXPO_PUBLIC_AGENT_ID || Constants.expoConfig?.extra?.selectedAgentId;
  const agentName = process.env.EXPO_PUBLIC_AGENT_NAME || Constants.expoConfig?.extra?.selectedAgentName;
  
  return {
    agentId: typeof agentId === 'string' ? agentId : String(agentId || ''),
    agentName: typeof agentName === 'string' ? agentName : String(agentName || 'AI Assistant')
  };
};

// Filter agents to show only selected one in single-agent mode
export const filterAgentsForMode = (agents: any[], selectedAgentId?: string) => {
  if (!isSingleAgentMode()) return agents;
  
  const targetId = selectedAgentId || getSingleAgentConfig().agentId;
  return agents.filter(agent => 
    (agent.id || agent.assistantId || agent.agentId) === targetId
  );
};