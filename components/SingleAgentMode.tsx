// components/SingleAgentMode.tsx - SIMPLIFIED FOR RELIABILITY
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import axios from 'axios';
import BASE_URL from '../config';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';

const SingleAgentMode: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const userData = useSelector((state: any) => state.userData);

  // Get selected agent ID from automation process
  const getSelectedAgentId = () => {
    return process.env.EXPO_PUBLIC_AGENT_ID || Constants.expoConfig?.extra?.agentId;
  };

  useEffect(() => {
    if (!userData?.accessToken) {
      router.replace('/(auth)/welcome');
      return;
    }
    
    fetchSelectedAgent();
  }, [userData?.accessToken]);

  const fetchSelectedAgent = async () => {
    try {
      setLoading(true);
      const agentId = getSelectedAgentId();
      
      if (!agentId) {
        console.log('❌ No agent ID provided by automation');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BASE_URL}ai-service/agent/getAllAssistants?limit=100`, {
        headers: {
          Accept: "*/*",
          Authorization: userData.accessToken,
        },
      });

      const agents = response.data?.data || [];
      
      const agent = agents.find((a: any) => 
        a.id === agentId || 
        a.assistantId === agentId ||
        a.agentId === agentId
      );

      if (agent) {
        console.log('✅ Found selected agent:', agent.name);
        setSelectedAgent(agent);
      } else {
        console.log('❌ Selected agent not found');
      }
      
    } catch (error) {
      console.error('❌ Error fetching selected agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAgentChat = () => {
    if (!selectedAgent) return;
    
    const assistantId = selectedAgent.id || selectedAgent.assistantId;
    console.log('🚀 Opening chat for agent:', selectedAgent.name);
    
    router.push({
      pathname: '/(screen)/userflow/GenOxyChatScreen',
      params: {
        assistantId: assistantId,
        query: "",
        category: "Assistant",
        agentName: selectedAgent.name,
        fd: null,
        agentId: assistantId,
        title: selectedAgent.name,
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.gradient}>
          <ActivityIndicator size="large" color="#3d2a71" />
          <Text style={styles.loadingText}>Loading your agent...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!selectedAgent) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Agent not found</Text>
            <Text style={styles.errorSubtext}>The selected agent could not be loaded</Text>
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
          <Text style={styles.appTitle}>{selectedAgent.name}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.agentCard}>
            <View style={styles.agentIcon}>
              <Text style={styles.agentIconText}>AI</Text>
            </View>
            
            <Text style={styles.agentName}>{selectedAgent.name}</Text>
            
            <Text style={styles.agentDescription}>
              {selectedAgent.description || selectedAgent.instructions || 'Your AI assistant'}
            </Text>
            
            <TouchableOpacity 
              style={styles.chatButton} 
              onPress={openAgentChat}
              activeOpacity={0.8}
            >
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#3d2a71',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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