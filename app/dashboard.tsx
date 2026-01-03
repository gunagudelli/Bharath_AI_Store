// Single-Agent Dashboard Screen
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Dashboard() {
  const router = useRouter();
  
  // Agent config will be injected at build time
  const agentName = process.env.EXPO_PUBLIC_AGENT_NAME || 'AI Assistant';
  const agentTheme = process.env.EXPO_PUBLIC_AGENT_THEME || '#3d2a71';

  const handleAgentPress = () => {
    router.push('/agent');
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

        <View style={styles.agentContainer}>
          <TouchableOpacity 
            style={[styles.agentCard, { borderColor: agentTheme }]}
            onPress={handleAgentPress}
            activeOpacity={0.8}
          >
            <View style={[styles.agentIcon, { backgroundColor: agentTheme }]}>
              <Text style={styles.agentIconText}>AI</Text>
            </View>
            <Text style={styles.agentName}>{agentName}</Text>
            <Text style={styles.agentDescription}>Tap to start conversation</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 80,
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
  agentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderWidth: 2,
    minWidth: 250,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  agentDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});