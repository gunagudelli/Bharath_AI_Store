import Constants from 'expo-constants';
import { router } from 'expo-router';

// 🔥 ROBUST single-agent detection
export const isSingleAgentMode = (): boolean => {
  const constantsAgentId = Constants.expoConfig?.extra?.agentId;
  const manifestAgentId = Constants.manifest?.extra?.agentId;
  
  const agentId = constantsAgentId || manifestAgentId;
  
  const isValid = typeof agentId === 'string' && agentId.trim() !== '' && agentId !== '{}';
  
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
      return;
    }
    
    return originalPush(href);
  };
};

export const getSingleAgentConfig = () => {
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

export const filterAgentsForMode = (agents: any[], selectedAgentId?: string) => {
  if (!isSingleAgentMode()) return agents;
  
  const targetId = selectedAgentId || getSingleAgentConfig().agentId;
  
  const filtered = agents.filter(agent => {
    const agentData = agent.assistant || agent;
    
    return (
      String(agentData.id || '') === String(targetId) ||
      String(agentData.assistantId || '') === String(targetId) ||
      String(agentData.agentId || '') === String(targetId)
    );
  });
  
  return filtered;
};