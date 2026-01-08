import Constants from 'expo-constants';
import { router } from 'expo-router';

// 🔥 ROBUST single-agent detection
export const isSingleAgentMode = (): boolean => {
  // 🔥 SAFE: Use Constants instead of process.env in components
  const constantsAgentId = Constants.expoConfig?.extra?.agentId;
  const manifestAgentId = Constants.manifest?.extra?.agentId;
  
  const agentId = constantsAgentId || manifestAgentId;
  
  // Ensure it's a valid string, not an object or empty
  const isValid = typeof agentId === 'string' && agentId.trim() !== '' && agentId !== '{}';
  
  console.log('🔍 isSingleAgentMode check:', {
    constantsAgentId,
    manifestAgentId,
    finalAgentId: agentId,
    isValid,
    result: isValid
  });
  
  return isValid;
};

// 🔒 NAVIGATION GUARD: Prevent navigation away from single-agent mode
export const enforceNavigationRestrictions = () => {
  if (!isSingleAgentMode()) return;
  
  // Block navigation to multi-agent screens
  const blockedPaths = [
    '/(screen)/(tabs)',
    '/(screen)/(toptabs)',
    '/AgentCreation',
    '/userflow/MyAgent'
  ];
  
  // Override router.push to block restricted paths
  const originalPush = router.push;
  router.push = (href: any) => {
    const path = typeof href === 'string' ? href : href.pathname;
    
    if (blockedPaths.some(blocked => path?.includes(blocked))) {
      console.log('🚫 BLOCKED: Navigation to', path, 'in single-agent mode');
      return;
    }
    
    return originalPush(href);
  };
};

export const getSingleAgentConfig = () => {
  // 🔥 SAFE: Use Constants instead of process.env in components
  const constantsAgentId = Constants.expoConfig?.extra?.agentId;
  const manifestAgentId = Constants.manifest?.extra?.agentId;
  
  const constantsAgentName = Constants.expoConfig?.extra?.agentName;
  const manifestAgentName = Constants.manifest?.extra?.agentName;
  
  const agentId = constantsAgentId || manifestAgentId;
  const agentName = constantsAgentName || manifestAgentName;
  
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