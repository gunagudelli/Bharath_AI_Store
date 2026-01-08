import Constants from 'expo-constants';
import { router } from 'expo-router';

// 🔥 RUNTIME agent detection (reads from process.env)
export const isSingleAgentMode = (): boolean => {
  // ✅ Read directly from process.env at RUNTIME
  const agentId = process.env.EXPO_PUBLIC_AGENT_ID;
  const agentName = process.env.EXPO_PUBLIC_AGENT_NAME;
  
  const isValid = typeof agentId === 'string' && agentId.trim() !== '' && agentId !== '{}' &&
                  typeof agentName === 'string' && agentName.trim() !== '';
  
  console.log('🔍 isSingleAgentMode (RUNTIME check):', {
    agentId,
    agentName,
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
  // ✅ Read directly from process.env at RUNTIME
  const agentId = process.env.EXPO_PUBLIC_AGENT_ID;
  const agentName = process.env.EXPO_PUBLIC_AGENT_NAME;
  
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