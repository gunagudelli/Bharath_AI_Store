// Debug component to verify single-agent mode is working
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

const DebugInfo: React.FC = () => {
  const envAgentId = process.env.EXPO_PUBLIC_AGENT_ID;
  const constantsAgentId = Constants.expoConfig?.extra?.agentId;
  const manifestAgentId = Constants.manifest?.extra?.agentId;
  const isSingleAgentFlag = Constants.expoConfig?.extra?.isSingleAgent;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 DEBUG INFO</Text>
      <Text style={styles.item}>ENV_AGENT_ID: {envAgentId || 'null'}</Text>
      <Text style={styles.item}>CONSTANTS_AGENT_ID: {constantsAgentId || 'null'}</Text>
      <Text style={styles.item}>MANIFEST_AGENT_ID: {manifestAgentId || 'null'}</Text>
      <Text style={styles.item}>IS_SINGLE_AGENT: {String(isSingleAgentFlag)}</Text>
      <Text style={styles.item}>MODE: {envAgentId || constantsAgentId || manifestAgentId ? 'SINGLE' : 'MULTI'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 8,
    borderRadius: 4,
    zIndex: 1000,
  },
  title: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  item: {
    color: '#fff',
    fontSize: 8,
    marginBottom: 2,
  },
});

export default DebugInfo;