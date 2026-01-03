// Single-Agent Details Screen
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Agent() {
  const router = useRouter();
  
  // Agent config will be injected at build time
  const agentName = process.env.EXPO_PUBLIC_AGENT_NAME || 'AI Assistant';
  const agentTheme = process.env.EXPO_PUBLIC_AGENT_THEME || '#3d2a71';

  const handleChatPress = () => {
    router.push('/chat');
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#E3F2FD', '#BBDEFB']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3d2a71" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agent Details</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.agentProfile}>
            <View style={[styles.agentAvatar, { backgroundColor: agentTheme }]}>
              <Text style={styles.avatarText}>AI</Text>
            </View>
            <Text style={styles.agentName}>{agentName}</Text>
            <Text style={styles.agentStatus}>● Online</Text>
          </View>

          <View style={styles.agentInfo}>
            <Text style={styles.infoTitle}>About this Agent</Text>
            <Text style={styles.infoText}>
              I'm your dedicated AI assistant, ready to help you with any questions or tasks you may have.
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.chatButton, { backgroundColor: agentTheme }]}
            onPress={handleChatPress}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble" size={24} color="white" />
            <Text style={styles.chatButtonText}>Start Conversation</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3d2a71',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  agentProfile: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  agentAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  agentName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  agentStatus: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  agentInfo: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 10,
  },
});