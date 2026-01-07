import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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

const SingleAgentDashboard: React.FC = () => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const userData = useSelector((state: any) => state.userData);
  
  useEffect(() => {
    loadSelectedAgent();
  }, []);

  const loadSelectedAgent = async () => {
    try {
      setLoading(true);
      
      // Get agent configuration from environment variables
      const agentId = process.env.EXPO_PUBLIC_AGENT_ID;
      const agentName = process.env.EXPO_PUBLIC_AGENT_NAME;
      
      console.log('🎯 Single Agent Dashboard - Loading:', { agentId, agentName });
      
      if (!agentId) {
        throw new Error('Agent ID not configured');
      }

      // Try to fetch agent details from API
      try {
        const response = await axios.get(`${BASE_URL}ai-service/agent/getAllAssistants?limit=100`, {
          headers: {
            Accept: "*/*",
            Authorization: userData.accessToken,
          },
        });

        const agents = response.data?.data || [];
        const foundAgent = agents.find((a: any) => 
          a.id === agentId || a.assistantId === agentId || a.agentId === agentId
        );

        if (foundAgent) {
          console.log('✅ Found agent in API:', foundAgent.name);
          setAgent({
            id: foundAgent.id,
            assistantId: foundAgent.assistantId,
            agentId: foundAgent.agentId,
            name: foundAgent.name,
            description: foundAgent.description || foundAgent.instructions,
          });
        } else {
          throw new Error('Agent not found in API');
        }
      } catch (apiError) {
        console.log('⚠️ API failed, using environment variables');
        // Fallback to environment variables
        setAgent({
          assistantId: agentId,
          name: agentName || 'AI Assistant',
          description: 'Your dedicated AI assistant',
        });
      }
    } catch (error) {
      console.error('❌ Error loading agent:', error);
      Alert.alert('Error', 'Failed to load agent configuration');
    } finally {
      setLoading(false);
    }
  };

  const openChat = () => {
    if (!agent) return;
    
    const assistantId = agent.assistantId || agent.id || agent.agentId;
    
    console.log('💬 Opening chat:', {
      assistantId,
      agentName: agent.name,
      agentId: assistantId
    });
    
    router.push({
      pathname: '/(screen)/userflow/GenOxyChatScreen',
      params: {
        assistantId: assistantId,
        agentId: assistantId,
        agentName: agent.name,
        query: "",
        category: "Assistant",
        title: agent.name,
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.gradient}>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#3d2a71" />
            <Text style={styles.loadingText}>Loading your assistant...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!agent) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.gradient}>
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>⚠️ Assistant not available</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadSelectedAgent}>
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appTitle}>{agent.name}</Text>
          <Text style={styles.subtitle}>Your dedicated AI assistant</Text>
        </View>

        {/* Agent Card */}
        <View style={styles.content}>
          <View style={styles.agentCard}>
            <View style={styles.agentIcon}>
              <Text style={styles.agentIconText}>AI</Text>
            </View>
            
            <Text style={styles.agentName}>{agent.name}</Text>
            <Text style={styles.agentDescription}>
              {agent.description || 'Ready to assist you with your queries'}
            </Text>
            
            <TouchableOpacity style={styles.chatButton} onPress={openChat}>
              <Text style={styles.chatButtonText}>Start Conversation</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by AI Technology</Text>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3d2a71',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
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
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 300,
    maxWidth: 350,
  },
  agentIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3d2a71',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  agentIconText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  agentName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  agentDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  chatButton: {
    backgroundColor: '#3d2a71',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#3d2a71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default SingleAgentDashboard;