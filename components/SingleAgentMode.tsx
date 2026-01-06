// components/SingleAgentMode.tsx - ACTUALLY WORKING VERSION
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';

interface Agent {
  id: string;
  name: string;
  description?: string;
  theme: string;
}

const SingleAgentMode: React.FC = () => {
  const userData = useSelector((state: any) => state.userData);
  const isAuthenticated = !!userData?.accessToken;
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
      return;
    }
    
    // CRITICAL: Get the ACTUAL agent data from your automation
    loadAgentFromAutomation();
  }, [isAuthenticated]);

  const loadAgentFromAutomation = () => {
    // Method 1: From expo config (set by your automation)
    const automationAgent = Constants.expoConfig?.extra?.automationAgent;
    
    // Method 2: From environment (backup)
    const agentName = process.env.EXPO_PUBLIC_AGENT_NAME;
    const agentId = process.env.EXPO_PUBLIC_AGENT_ID;
    
    console.log('🔍 Automation Agent:', automationAgent);
    console.log('🔍 Env Agent Name:', agentName);
    console.log('🔍 Env Agent ID:', agentId);
    
    if (automationAgent) {
      // Use automation-provided agent data
      setAgent({
        id: automationAgent.id,
        name: automationAgent.name,
        description: automationAgent.description || 'Your AI assistant',
        theme: automationAgent.theme || '#3d2a71'
      });
    } else if (agentName && agentId) {
      // Fallback to environment variables
      setAgent({
        id: agentId,
        name: agentName,
        description: 'Your AI assistant',
        theme: '#3d2a71'
      });
    } else {
      // Show error - automation failed
      Alert.alert(
        'Configuration Error',
        'Agent not properly configured in this APK. Please contact support.',
        [{ text: 'OK', onPress: () => router.push('/(screen)/(tabs)') }]
      );
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!agent) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Agent Configuration Missing</Text>
            <Text style={styles.errorSubtext}>This APK was not properly configured</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const handleStartChat = () => {
    console.log('🚀 Starting chat with agent:', agent.id, agent.name);
    console.log('🔑 User token:', userData?.accessToken ? 'Present' : 'Missing');
    
    // Use the EXACT same navigation as your normal app
    router.push({
      pathname: '/(screen)/userflow/GenOxyChatScreen',
      params: {
        assistantId: agent.id,
        query: "",
        category: "Assistant",
        agentName: agent.name,
        fd: null,
        agentId: agent.id, // Some screens might need this
        title: agent.name,
      }
    });
  };

  const handleBackToDashboard = () => {
    router.push('/(screen)/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appTitle}>{agent.name}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.agentCard}>
            <View style={[styles.agentIcon, { backgroundColor: agent.theme }]}>
              <Text style={styles.agentIconText}>AI</Text>
            </View>
            <Text style={styles.agentName}>{agent.name}</Text>
            <Text style={styles.agentDescription}>{agent.description}</Text>
            
            <TouchableOpacity 
              style={[styles.chatButton, { backgroundColor: agent.theme }]}
              onPress={handleStartChat}
              activeOpacity={0.8}
            >
              <Text style={styles.chatButtonText}>Start Conversation</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dashboardButton}
              onPress={handleBackToDashboard}
              activeOpacity={0.8}
            >
              <Text style={styles.dashboardButtonText}>View All Agents</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
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
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 15,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dashboardButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3d2a71',
  },
  dashboardButtonText: {
    color: '#3d2a71',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SingleAgentMode;