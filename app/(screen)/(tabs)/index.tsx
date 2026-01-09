import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BharathAgentstore from '../(toptabs)';
import RadhaAILab from '../(toptabs)/RadhaAILab';
import { router } from 'expo-router';
import Constants from 'expo-constants';

export default function TabsIndex() {
  const [activeTab, setActiveTab] = useState('store');

  // 🔥 CHECK FOR SINGLE-AGENT MODE AT RUNTIME
  useEffect(() => {
    const agentId = Constants.expoConfig?.extra?.agentId;
    const agentName = Constants.expoConfig?.extra?.agentName;
    
    console.log('🔍 Single-Agent Check:', { agentId, agentName });
    
    // If single-agent mode, redirect directly to chat
    if (agentId && typeof agentId === 'string' && agentName && typeof agentName === 'string' && agentId !== 'null') {
      console.log('✅ Single-Agent Mode Detected - Redirecting to chat');
      
      router.replace({
        pathname: '/(screen)/userflow/GenOxyChatScreen',
        params: {
          assistantId: agentId,
          agentId: agentId,
          agentName: agentName,
          query: '',
          category: 'Assistant',
          title: agentName,
        }
      });
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topTabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'store' && styles.activeTab]}
          onPress={() => setActiveTab('store')}
        >
          <Text style={[styles.tabText, activeTab === 'store' && styles.activeTabText]}>AI Store</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lab' && styles.activeTab]}
          onPress={() => setActiveTab('lab')}
        >
          <Text style={[styles.tabText, activeTab === 'lab' && styles.activeTabText]}>AI Lab</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {activeTab === 'store' ? <BharathAgentstore /> : <RadhaAILab />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topTabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#667eea' },
  tabText: { fontSize: 14, fontWeight: '900', color: '#9CA3AF' },
  activeTabText: { color: '#667eea', fontWeight: '700' },
  content: { flex: 1 }
});