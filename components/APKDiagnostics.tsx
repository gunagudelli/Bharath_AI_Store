import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APKDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<any>({});

  useEffect(() => {
    const runDiagnostics = async () => {
      const data = {
        // Environment Variables
        envAgentId: process.env.EXPO_PUBLIC_AGENT_ID,
        envAgentName: process.env.EXPO_PUBLIC_AGENT_NAME,
        
        // Constants
        constantsAgentId: Constants.expoConfig?.extra?.selectedAgentId,
        constantsAgentName: Constants.expoConfig?.extra?.selectedAgentName,
        
        // Build Info
        buildTime: new Date().toISOString(),
        appVersion: Constants.expoConfig?.version,
        buildNumber: Constants.expoConfig?.android?.versionCode,
        
        // Storage Check
        storageTest: await AsyncStorage.getItem('test-key') || 'not-set',
        
        // Network Test
        networkAvailable: true, // Will test below
      };
      
      // Test network
      try {
        const response = await fetch('https://httpbin.org/json', { timeout: 5000 });
        data.networkTest = response.ok ? 'SUCCESS' : 'FAILED';
      } catch (error) {
        data.networkTest = `FAILED: ${error.message}`;
      }
      
      setDiagnostics(data);
      console.log('🔍 APK Diagnostics:', data);
    };

    runDiagnostics();
  }, []);

  const copyToClipboard = () => {
    const text = JSON.stringify(diagnostics, null, 2);
    Alert.alert('Diagnostics', text);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 APK Diagnostics</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Environment Variables</Text>
        <Text style={styles.item}>EXPO_PUBLIC_AGENT_ID: {diagnostics.envAgentId || 'NOT SET'}</Text>
        <Text style={styles.item}>EXPO_PUBLIC_AGENT_NAME: {diagnostics.envAgentName || 'NOT SET'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Constants</Text>
        <Text style={styles.item}>selectedAgentId: {diagnostics.constantsAgentId || 'NOT SET'}</Text>
        <Text style={styles.item}>selectedAgentName: {diagnostics.constantsAgentName || 'NOT SET'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Build Info</Text>
        <Text style={styles.item}>Build Time: {diagnostics.buildTime}</Text>
        <Text style={styles.item}>App Version: {diagnostics.appVersion}</Text>
        <Text style={styles.item}>Build Number: {diagnostics.buildNumber}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Tests</Text>
        <Text style={styles.item}>Storage: {diagnostics.storageTest}</Text>
        <Text style={styles.item}>Network: {diagnostics.networkTest}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={copyToClipboard}>
        <Text style={styles.buttonText}>Copy Diagnostics</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  item: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default APKDiagnostics;