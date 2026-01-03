// Test component to debug single-agent mode
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

const SingleAgentTest = () => {
  const extra = Constants.expoConfig?.extra;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Single Agent Debug</Text>
      
      <Text style={styles.label}>Environment Variables:</Text>
      <Text style={styles.value}>EXPO_PUBLIC_AGENT_ID: {process.env.EXPO_PUBLIC_AGENT_ID || 'NOT SET'}</Text>
      <Text style={styles.value}>EXPO_PUBLIC_AGENT_NAME: {process.env.EXPO_PUBLIC_AGENT_NAME || 'NOT SET'}</Text>
      
      <Text style={styles.label}>App Config Extra:</Text>
      <Text style={styles.value}>singleAgent: {String(extra?.singleAgent)}</Text>
      <Text style={styles.value}>agentId: {extra?.agentId || 'NOT SET'}</Text>
      <Text style={styles.value}>agentName: {extra?.agentName || 'NOT SET'}</Text>
      
      <Text style={styles.label}>Full Extra Object:</Text>
      <Text style={styles.code}>{JSON.stringify(extra, null, 2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  code: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginTop: 10,
  },
});

export default SingleAgentTest;