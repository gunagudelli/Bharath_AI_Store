import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import axios from 'axios';
import BASE_URL from '../config';

interface Agent {
  id?: string;
  assistantId?: string;
  agentId?: string;
  name: string;
  description?: string;
  instructions?: string;
}

const SingleAgentMode: React.FC = () => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const userData = useSelector((state: any) => state.userData);
  
  useEffect(() => {
    if (userData?.accessToken) {
      fetchAgent();
    } else {
      setError('Authentication required');
      setLoading(false);
    }
  }, [userData]);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get agent ID from environment variables (ensure string conversion)
      const envAgentId = process.env.EXPO_PUBLIC_AGENT_ID;
      const constantsAgentId = Constants.expoConfig?.extra?.agentId;
      
      // Convert to string and filter out empty objects/values
      const targetAgentId = envAgentId || 
        (constantsAgentId && typeof constantsAgentId === 'string' ? constantsAgentId : null);
      
      console.log('🔍 Fetching agent:', {
        envAgentId,
        constantsAgentId,
        targetAgentId,
        hasToken: !!userData?.accessToken
      });

      if (!targetAgentId || targetAgentId === '{}') {
        throw new Error('Valid agent ID not found in configuration');
      }

      // Fetch all agents from API
      const response = await axios.get(`${BASE_URL}ai-service/agent/getAllAssistants?limit=100`, {
        headers: {
          Accept: "*/*",
          Authorization: userData.accessToken,
        },
        timeout: 10000,
      });

      const agents = response.data?.data || [];
      console.log('📊 Available agents:', agents.length);
      
      // Find the target agent
      const foundAgent = agents.find((a: any) => 
        a.id === targetAgentId || 
        a.assistantId === targetAgentId || 
        a.agentId === targetAgentId
      );

      if (foundAgent) {
        console.log('✅ Found agent:', foundAgent.name);
        setAgent({
          id: foundAgent.id,
          assistantId: foundAgent.assistantId,
          agentId: foundAgent.agentId,
          name: foundAgent.name,
          description: foundAgent.description || foundAgent.instructions,
        });
      } else {
        // Fallback to environment variable name if agent not found
        const envAgentName = process.env.EXPO_PUBLIC_AGENT_NAME || Constants.expoConfig?.extra?.agentName;
        const fallbackName = (typeof envAgentName === 'string' ? envAgentName : null) || 'AI Assistant';
        
        console.log('⚠️ Agent not found in API, using fallback:', fallbackName);
        setAgent({
          assistantId: targetAgentId,
          name: fallbackName,
          description: 'Your AI assistant',
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching agent:', error);
      
      // Fallback to environment variables
      const envAgentId = process.env.EXPO_PUBLIC_AGENT_ID || Constants.expoConfig?.extra?.agentId;
      const envAgentName = process.env.EXPO_PUBLIC_AGENT_NAME || Constants.expoConfig?.extra?.agentName;
      
      const fallbackId = typeof envAgentId === 'string' ? envAgentId : null;
      const fallbackName = typeof envAgentName === 'string' ? envAgentName : null;
      
      if (fallbackId && fallbackName) {
        console.log('🔄 Using environment fallback:', { fallbackId, fallbackName });
        setAgent({
          assistantId: fallbackId,
          name: fallbackName,
          description: 'Your AI assistant',
        });
      } else {
        setError('Failed to load agent configuration');
      }
    } finally {
      setLoading(false);
    }
  };

  const openAgentChat = () => {
    if (!agent) {
      Alert.alert('Error', 'Agent not loaded');
      return;
    }

    if (!userData?.accessToken) {
      Alert.alert('Authentication Required', 'Please log in to continue.');
      return;
    }
    
    const agentId = agent.assistantId || agent.id || agent.agentId;
    
    console.log('💬 Opening chat with:', {
      assistantId: agentId,
      agentName: agent.name,
      agentId: agentId
    });
    
    try {
      router.push({
        pathname: '/(screen)/userflow/GenOxyChatScreen',
        params: {
          assistantId: agentId,
          query: "",
          category: "Assistant",
          agentName: agent.name,
          agentId: agentId,
          title: agent.name,
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not open chat. Please try again.');
    }
  };

  const handleRetry = () => {
    fetchAgent();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.gradient}>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#3d2a71" />
            <Text style={styles.loadingText}>Loading agent...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error || !agent) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.gradient}>
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>⚠️ {error || 'Agent not found'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appTitle}>{agent.name}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.agentCard}>
            <View style={styles.agentIcon}>
              <Text style={styles.agentIconText}>AI</Text>
            </View>
            
            <Text style={styles.agentName}>{agent.name}</Text>
            <Text style={styles.agentDescription}>
              {agent.description || 'Your AI assistant'}
            </Text>
            
            <TouchableOpacity style={styles.chatButton} onPress={openAgentChat}>
              <Text style={styles.chatButtonText}>Start Conversation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#3d2a71',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3d2a71',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3d2a71',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  agentCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 280,
    maxWidth: 320,
  },
  agentIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3d2a71',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  agentIconText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  agentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  agentDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  chatButton: {
    backgroundColor: '#3d2a71',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SingleAgentMode;