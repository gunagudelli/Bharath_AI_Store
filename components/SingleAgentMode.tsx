// components/SingleAgentMode.tsx - Component for agent-specific APKs
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import BASE_URL from '../config';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import { getAgentConfig, logAgentConfig } from '../utils/agentMode';

interface AgentItem {
  id?: string;
  assistantId?: string;
  agentId?: string;
  name?: string;
  description?: string;
  instructions?: string;
  status?: string;
  price?: string;
  rating?: number;
  imageUrl?: string;
  image?: string;
  model?: string;
  assistant?: AgentItem;
}

const SingleAgentMode: React.FC = () => {
  const [agent, setAgent] = useState<AgentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const userData = useSelector((state: any) => state.userData);

  // Get agent info from app config
  const agentConfig = getAgentConfig();

  useEffect(() => {
    logAgentConfig();
    
    // FORCE TEST VALUES
    const FORCE_AGENT_ID = "asst_fkiCCNMDNbdimrK4EbRUhf87";
    const FORCE_AGENT_NAME = "Ankitha-ConnectCatalyst";
    
    console.log('🔒 FORCED Single Agent Mode:', FORCE_AGENT_NAME);
    
    // Skip API call, directly set test agent
    const testAgent = {
      id: FORCE_AGENT_ID,
      name: FORCE_AGENT_NAME,
      description: "Test agent for single-agent mode"
    };
    
    setAgent(testAgent);
    setLoading(false);
    
    // Auto-navigate after 2 seconds
    setTimeout(() => {
      navigateToAgent(testAgent);
    }, 2000);
  }, []);

  const fetchAgentDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch all agents and find the specific one
      const response = await axios.get(`${BASE_URL}ai-service/agent/getAllAssistants?limit=100`, {
        headers: {
          Accept: "*/*",
          Authorization: userData?.accessToken || "",
        },
      });

      const agents = response.data?.data || [];
      const targetAgent = agents.find((a: AgentItem) => 
        a.id === agentConfig.agentId || 
        a.assistantId === agentConfig.agentId || 
        a.agentId === agentConfig.agentId ||
        a.name === agentConfig.agentName
      );

      if (targetAgent) {
        setAgent(targetAgent);
        console.log(`✅ Found target agent: ${targetAgent.name}`);
        console.log('🚀 Auto-navigating to single agent chat...');
        // Auto-navigate to chat with this agent
        setTimeout(() => {
          navigateToAgent(targetAgent);
        }, 1500);
      } else {
        console.log(`❌ Agent not found: ${agentConfig.agentName}`);
        console.log('Available agents:', agents.map(a => ({ id: a.id, name: a.name })));
        Alert.alert(
          'Agent Not Found',
          `Could not find agent: ${agentConfig.agentName}`,
          [{ text: 'OK', onPress: () => router.replace('/(screen)/(tabs)') }]
        );
      }
      
    } catch (error) {
      console.error('Error fetching agent:', error);
      Alert.alert(
        'Error',
        'Could not load agent details',
        [{ text: 'OK', onPress: () => router.replace('/(screen)/(tabs)') }]
      );
    } finally {
      setLoading(false);
    }
  };

  const navigateToAgent = (agent: AgentItem) => {
    const assistant = agent.assistant || agent;
    const assistantId = assistant.id || assistant.assistantId;
    
    if (!assistantId) {
      Alert.alert('Error', 'Agent ID not found');
      return;
    }

    // Navigate directly to chat with this agent
    router.push({
      pathname: '/userflow/GenOxyChatScreen',
      params: {
        assistantId: assistantId,
        query: "",
        category: "Assistant",
        agentName: assistant.name || "Assistant",
        fd: null,
        agentId: assistant.agentId,
        title: assistant.name || "Chat with Agent",
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading {agentConfig.agentName}...</Text>
          <Text style={styles.loadingSubtext}>Preparing your AI assistant</Text>
        </View>
      </View>
    );
  }

  if (!agent) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Agent not found</Text>
          <Text style={styles.errorSubtext}>Could not load {agentConfig.agentName}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.agentContainer}>
        <Text style={styles.agentName}>{agent.name}</Text>
        <Text style={styles.agentDescription}>
          {agent.description || agent.instructions || 'Your AI Assistant'}
        </Text>
        <Text style={styles.redirectText}>Redirecting to chat...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  agentContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  agentName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  agentDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  redirectText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
});

export default SingleAgentMode;