import Constants from 'expo-constants';

// 🔥 ROBUST single-agent detection
export const isSingleAgentMode = (): boolean => {
  const envAgentId = process.env.EXPO_PUBLIC_AGENT_ID;
  const constantsAgentId = Constants.expoConfig?.extra?.agentId;
  const manifestAgentId = Constants.manifest?.extra?.agentId;
  
  const agentId = envAgentId || constantsAgentId || manifestAgentId;
  
  // Ensure it's a valid string, not an object or empty
  const isValid = typeof agentId === 'string' && agentId.trim() !== '' && agentId !== '{}';
  
  console.log('🔍 isSingleAgentMode check:', {
    envAgentId,
    constantsAgentId,
    manifestAgentId,
    finalAgentId: agentId,
    isValid,
    result: isValid
  });
  
  return isValid;
};

export const getSingleAgentConfig = () => {
  const envAgentId = process.env.EXPO_PUBLIC_AGENT_ID;
  const constantsAgentId = Constants.expoConfig?.extra?.agentId;
  const manifestAgentId = Constants.manifest?.extra?.agentId;
  
  const envAgentName = process.env.EXPO_PUBLIC_AGENT_NAME;
  const constantsAgentName = Constants.expoConfig?.extra?.agentName;
  const manifestAgentName = Constants.manifest?.extra?.agentName;
  
  const agentId = envAgentId || constantsAgentId || manifestAgentId;
  const agentName = envAgentName || constantsAgentName || manifestAgentName;
  
  return {
    agentId: typeof agentId === 'string' && agentId.trim() !== '' && agentId !== '{}' ? agentId : '',
    agentName: typeof agentName === 'string' && agentName.trim() !== '' ? agentName : 'AI Assistant'
  };
};

// 🔥 CRITICAL FIX: Filter agents to show only selected one in single-agent mode
export const filterAgentsForMode = (agents: any[], selectedAgentId?: string) => {
  if (!isSingleAgentMode()) return agents;
  
  const targetId = selectedAgentId || getSingleAgentConfig().agentId;
  
  console.log('🎯 Filtering agents for single-agent mode:', {
    totalAgents: agents.length,
    targetId,
    agentSample: agents[0] ? {
      id: agents[0].id,
      assistantId: agents[0].assistantId, 
      agentId: agents[0].agentId,
      name: agents[0].name
    } : null
  });
  
  // 🔥 CRITICAL FIX: Match against ALL possible ID fields with safe string comparison
  const filtered = agents.filter(agent => {
    const agentData = agent.assistant || agent;
    
    const matches = (
      String(agentData.id || '') === String(targetId) ||
      String(agentData.assistantId || '') === String(targetId) ||
      String(agentData.agentId || '') === String(targetId)
    );
    
    if (matches) {
      console.log('✅ Found matching agent:', {
        name: agentData.name,
        id: agentData.id,
        assistantId: agentData.assistantId,
        agentId: agentData.agentId,
        targetId
      });
    }
    
    return matches;
  });
  
  console.log('🔍 Filter result:', {
    originalCount: agents.length,
    filteredCount: filtered.length,
    targetId
  });
  
  return filtered;
};