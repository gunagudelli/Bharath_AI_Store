import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import axios from 'axios';
import BASE_URL from '../config';

const SingleAgentDashboard: React.FC = () => {
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userData = useSelector((state: any) => state.userData);
  
  useEffect(() => {
    initializeAgent();
  }, []);

  const initializeAgent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get agent configuration from multiple sources
      const envAgentId = process.env.EXPO_PUBLIC_AGENT_ID;
      const envAgentName = process.env.EXPO_PUBLIC_AGENT_NAME;
      const constantsAgentId = Constants.expoConfig?.extra?.agentId;
      const constantsAgentName = Constants.expoConfig?.extra?.agentName;
      
      console.log('🔧 APK Agent Config:', {
        envAgentId,
        envAgentName,
        constantsAgentId,
        constantsAgentName,
        hasUserToken: !!userData?.accessToken
      });
      
      // Priority: Environment variables first, then Constants
      const targetAgentId = envAgentId || (typeof constantsAgentId === 'string' ? constantsAgentId : null);
      const targetAgentName = envAgentName || (typeof constantsAgentName === 'string' ? constantsAgentName : null);
      
      if (!targetAgentId) {
        throw new Error('Agent ID not found in APK configuration');
      }
      
      // Try API first, but don't fail if it doesn't work
      let apiAgent = null;
      if (userData?.accessToken) {
        try {
          console.log('🔍 Attempting API fetch for agent:', targetAgentId);
          const response = await axios.get(`${BASE_URL}ai-service/agent/getAllAssistants?limit=100`, {
            headers: {
              Accept: "*/*",
              Authorization: userData.accessToken,
            },
            timeout: 5000, // Short timeout for APK
          });
          
          const agents = response.data?.data || [];
          apiAgent = agents.find((a: any) => 
            a.id === targetAgentId || 
            a.assistantId === targetAgentId || 
            a.agentId === targetAgentId
          );
          
          if (apiAgent) {
            console.log('✅ Found agent in API:', apiAgent.name);
          }
        } catch (apiError) {
          console.log('⚠️ API failed, using fallback configuration');
        }
      }
      
      // Set agent data - API first, then fallback to environment
      const finalAgent = {
        id: apiAgent?.id || targetAgentId,
        assistantId: apiAgent?.assistantId || targetAgentId,
        agentId: apiAgent?.agentId || targetAgentId,
        name: apiAgent?.name || targetAgentName || 'AI Assistant',
        description: apiAgent?.description || apiAgent?.instructions || 'Your dedicated AI assistant',
      };
      
      console.log('🎯 Final agent configuration:', finalAgent);
      setAgent(finalAgent);
      
    } catch (error: any) {
      console.error('❌ Agent initialization failed:', error);
      setError(error.message || 'Failed to load assistant');
    } finally {
      setLoading(false);
    }
  };

  const openChat = () => {
    if (!agent) {
      Alert.alert('Error', 'Assistant not available');
      return;
    }
    
    const assistantId = agent.assistantId || agent.id || agent.agentId;
    
    console.log('💬 Opening chat with:', {
      assistantId,
      agentName: agent.name,
      agentId: assistantId
    });
    
    try {
      router.push({
        pathname: '/(screen)/userflow/GenOxyChatScreen',
        params: {
          assistantId: String(assistantId),
          agentId: String(assistantId),
          agentName: String(agent.name),
          query: "",
          category: "Assistant",
          title: String(agent.name),
        }
      });
    } catch (navError) {
      console.error('Navigation error:', navError);
      Alert.alert('Error', 'Could not open chat');
    }
  };

  // Loading state
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

  // Error state
  if (error || !agent) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.gradient}>
          <View style={styles.centerContent}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error || 'Assistant not available'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={initializeAgent}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Success state - Show ONLY the selected agent
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
              {agent.description}
            </Text>
            
            <TouchableOpacity style={styles.chatButton} onPress={openChat}>
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
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
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