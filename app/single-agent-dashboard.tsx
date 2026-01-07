import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import axios from 'axios';
import BASE_URL from '../config';

interface AgentData {
  id: string;
  assistantId: string;
  agentId: string;
  name: string;
  description: string;
}

const SingleAgentDashboard = () => {
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const userData = useSelector((state: any) => state.userData);

  // Get agent config from environment
  const getAgentConfig = () => {
    const agentId = process.env.EXPO_PUBLIC_AGENT_ID || Constants.expoConfig?.extra?.selectedAgentId;
    const agentName = process.env.EXPO_PUBLIC_AGENT_NAME || Constants.expoConfig?.extra?.selectedAgentName;
    
    return {
      agentId: String(agentId || ''),
      agentName: String(agentName || 'AI Assistant')
    };
  };

  // Fetch agent data
  useEffect(() => {
    const fetchAgent = async () => {
      const config = getAgentConfig();
      
      if (!config.agentId) {
        // Fallback: Use provided name if no API data
        setAgent({
          id: 'fallback',
          assistantId: 'fallback',
          agentId: 'fallback',
          name: config.agentName,
          description: 'Your personal AI assistant'
        });
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}ai-service/agent/getAllAssistants?limit=100`, {
          headers: {
            Authorization: userData?.accessToken || '',
          },
          timeout: 5000
        });

        const agents = response.data?.data || [];
        const targetAgent = agents.find((a: any) => 
          (a.id || a.assistantId || a.agentId) === config.agentId
        );

        if (targetAgent) {
          setAgent({
            id: targetAgent.id || targetAgent.assistantId || config.agentId,
            assistantId: targetAgent.assistantId || targetAgent.id || config.agentId,
            agentId: targetAgent.agentId || config.agentId,
            name: targetAgent.name || config.agentName,
            description: targetAgent.description || targetAgent.instructions || 'Your personal AI assistant'
          });
        } else {
          // Fallback if agent not found in API
          setAgent({
            id: config.agentId,
            assistantId: config.agentId,
            agentId: config.agentId,
            name: config.agentName,
            description: 'Your personal AI assistant'
          });
        }
      } catch (error) {
        console.error('Failed to fetch agent:', error);
        // Fallback on API error
        const config = getAgentConfig();
        setAgent({
          id: config.agentId,
          assistantId: config.agentId,
          agentId: config.agentId,
          name: config.agentName,
          description: 'Your personal AI assistant'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, []);

  const openChat = () => {
    if (!agent) return;
    
    router.push({
      pathname: '/userflow/GenOxyChatScreen',
      params: {
        assistantId: agent.assistantId,
        agentId: agent.agentId,
        agentName: agent.name,
        query: '',
        category: 'Assistant',
        title: agent.name,
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading your assistant...</Text>
      </View>
    );
  }

  if (!agent) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Assistant not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your AI Assistant</Text>
      
      <TouchableOpacity style={styles.agentCard} onPress={openChat}>
        <LinearGradient
          colors={['#8B5CF6', '#A78BFA']}
          style={styles.agentImage}
        >
          <Text style={styles.agentInitial}>
            {agent.name.charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>
        
        <Text style={styles.agentName}>{agent.name}</Text>
        <Text style={styles.agentDescription}>{agent.description}</Text>
        
        <View style={styles.chatButton}>
          <Text style={styles.chatButtonText}>Start Chat →</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#1E293B',
  },
  agentCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  agentImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  agentInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  agentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
    textAlign: 'center',
  },
  agentDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  chatButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
});

export default SingleAgentDashboard;