// components/SingleAgentMode.tsx - Simple working version
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';

const SingleAgentMode: React.FC = () => {
  const userData = useSelector((state: any) => state.userData);
  const isAuthenticated = !!userData?.accessToken;
  
  // Get agent config from build-time injection
  const agentName = Constants.expoConfig?.extra?.agentName || 
                   process.env.EXPO_PUBLIC_AGENT_NAME || 
                   'AI Assistant';
  const agentTheme = Constants.expoConfig?.extra?.agentTheme || 
                    process.env.EXPO_PUBLIC_AGENT_THEME || 
                    '#3d2a71';
  const agentId = Constants.expoConfig?.extra?.agentId || 
                 process.env.EXPO_PUBLIC_AGENT_ID;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const handleStartChat = () => {
    if (!agentId) {
      alert('Agent not configured properly');
      return;
    }

    router.push({
      pathname: '/(screen)/userflow/GenOxyChatScreen',
      params: {
        assistantId: agentId,
        agentName: agentName,
        category: "Assistant",
        title: `Chat with ${agentName}`,
        query: "",
      }
    });
  };

  const handleBackToDashboard = () => {
    router.push('/(screen)/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#E3F2FD', '#BBDEFB']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appTitle}>{agentName}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.agentCard}>
            <View style={[styles.agentIcon, { backgroundColor: agentTheme }]}>
              <Text style={styles.agentIconText}>AI</Text>
            </View>
            <Text style={styles.agentName}>{agentName}</Text>
            <Text style={styles.agentDescription}>
              Your dedicated AI assistant, ready to help with any questions.
            </Text>
            
            <TouchableOpacity 
              style={[styles.chatButton, { backgroundColor: agentTheme }]}
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
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
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