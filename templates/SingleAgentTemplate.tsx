// Single Agent Template - Clean UI for APK builds
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import axios from 'axios';
import BASE_URL from '../config';
import DebugInfo from '../components/DebugInfo';

interface Agent {
  id?: string;
  assistantId?: string;
  agentId?: string;
  name: string;
  description?: string;
  instructions?: string;
}

const SingleAgentTemplate: React.FC = () => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const userData = useSelector((state: any) => state.userData);
  
  useEffect(() => {
    if (userData?.accessToken) {
      fetchTargetAgent();
    } else {
      setError('Authentication required');
      setLoading(false);
    }
  }, [userData]);

  const fetchTargetAgent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 🔥 SAFE: Use Constants instead of process.env in components
      const targetAgentId = Constants.expoConfig?.extra?.agentId || 
                           Constants.manifest?.extra?.agentId;
      
      const targetAgentName = Constants.expoConfig?.extra?.agentName || 
                             Constants.manifest?.extra?.agentName;
      
      console.log('🎯 Target agent config:', {
        targetAgentId,
        targetAgentName,
        hasToken: !!userData?.accessToken
      });

      if (!targetAgentId || targetAgentId === '{}') {
        throw new Error('Agent ID not found in APK configuration');
      }

      // 🔥 CRITICAL FIX: Skip API if we have both ID and name (APK best practice)
      if (targetAgentId && targetAgentName) {
        console.log('✅ Using environment config directly (no API dependency)');
        setAgent({
          assistantId: targetAgentId,
          name: targetAgentName,
          description: 'Your AI assistant',
        });
        return; // ⛔ Skip API completely
      }

      // 🔥 CRITICAL FIX: Proper Bearer token authorization
      const response = await axios.get(`${BASE_URL}ai-service/agent/getAllAssistants?limit=100`, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${userData.accessToken}`, // 🔥 FIXED: Added Bearer prefix
        },
        timeout: 10000,
      });

      const agents = response.data?.data || [];
      console.log('📊 Total agents fetched:', agents.length);
      
      // 🔥 CRITICAL FIX: Safe string comparison for ID matching
      const foundAgent = agents.find((a: any) => 
        String(a.id) === String(targetAgentId) ||
        String(a.assistantId) === String(targetAgentId) ||
        String(a.agentId) === String(targetAgentId)
      );

      if (foundAgent) {
        console.log('✅ Target agent found:', foundAgent.name);
        setAgent({
          id: foundAgent.id,
          assistantId: foundAgent.assistantId,
          agentId: foundAgent.agentId,
          name: foundAgent.name,
          description: foundAgent.description || foundAgent.instructions,
        });
      } else {
        // Fallback to environment variable name
        console.log('⚠️ Agent not found in API, using fallback');
        setAgent({
          assistantId: targetAgentId,
          name: targetAgentName || 'AI Assistant',
          description: 'Your AI assistant',
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching agent:', error?.message);
      
      // Fallback to environment variables
      const fallbackId = Constants.expoConfig?.extra?.agentId || Constants.manifest?.extra?.agentId;
      const fallbackName = Constants.expoConfig?.extra?.agentName || Constants.manifest?.extra?.agentName;
      
      if (fallbackId && fallbackName) {
        console.log('🔄 Using environment fallback');
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

  const openChat = () => {
    if (!agent) {
      Alert.alert('Error', 'Agent not loaded');
      return;
    }

    if (!userData?.accessToken) {
      Alert.alert('Authentication Required', 'Please log in to continue.');
      return;
    }
    
    const agentId = agent.assistantId || agent.id || agent.agentId;
    
    console.log('💬 Opening chat with explicit params:', {
      assistantId: agentId,
      agentName: agent.name,
      agentId: agentId,
      userId: userData.userId
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
          isSingleAgent: 'true',
          userId: userData.userId
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not open chat. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.gradient}>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#3d2a71" />
            <Text style={styles.loadingText}>Loading your AI assistant...</Text>
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
            <TouchableOpacity style={styles.retryButton} onPress={fetchTargetAgent}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <DebugInfo />
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

export default SingleAgentTemplate;