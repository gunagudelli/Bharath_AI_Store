// components/BuildTestPanel.tsx - Test panel for simulating build states
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { APK_BASE_URL } from '../config';

interface BuildTestPanelProps {
  visible: boolean;
  onClose: () => void;
}

const BuildTestPanel: React.FC<BuildTestPanelProps> = ({ visible, onClose }) => {
  const [testing, setTesting] = useState(false);

  if (!visible) return null;

  const simulateBuildSuccess = async () => {
    try {
      setTesting(true);
      
      // First create a build
      const buildResponse = await axios.post(`${APK_BASE_URL}generate-apk`, {
        agentId: 'test-agent-success',
        agentName: 'Test Success Agent',
        userId: 'test-user'
      });
      
      if (buildResponse.data.success) {
        const buildId = buildResponse.data.buildId;
        
        // Wait 3 seconds then simulate success
        setTimeout(async () => {
          await axios.post(`${APK_BASE_URL}simulate-build-complete/${buildId}`, {
            status: 'completed',
            apkUrl: 'https://expo.dev/artifacts/test-success.apk'
          });
          
          Alert.alert('✅ Success Simulated', `Build ${buildId} marked as completed`);
        }, 3000);
        
        Alert.alert('🧪 Test Started', `Build ${buildId} will complete in 3 seconds`);
      }
    } catch (error: any) {
      Alert.alert('❌ Test Failed', error.message);
    } finally {
      setTesting(false);
    }
  };

  const simulateBuildFailure = async () => {
    try {
      setTesting(true);
      
      // First create a build
      const buildResponse = await axios.post(`${APK_BASE_URL}generate-apk`, {
        agentId: 'test-agent-failure',
        agentName: 'Test Failure Agent',
        userId: 'test-user'
      });
      
      if (buildResponse.data.success) {
        const buildId = buildResponse.data.buildId;
        
        // Wait 3 seconds then simulate failure
        setTimeout(async () => {
          await axios.post(`${APK_BASE_URL}simulate-build-complete/${buildId}`, {
            status: 'failed',
            error: 'Simulated build failure for testing'
          });
          
          Alert.alert('❌ Failure Simulated', `Build ${buildId} marked as failed`);
        }, 3000);
        
        Alert.alert('🧪 Test Started', `Build ${buildId} will fail in 3 seconds`);
      }
    } catch (error: any) {
      Alert.alert('❌ Test Failed', error.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <Text style={styles.title}>🧪 Build Test Panel</Text>
        <Text style={styles.subtitle}>Test build success/failure notifications</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.successButton]} 
          onPress={simulateBuildSuccess}
          disabled={testing}
        >
          <Text style={styles.buttonText}>✅ Simulate Success</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.failureButton]} 
          onPress={simulateBuildFailure}
          disabled={testing}
        >
          <Text style={styles.buttonText}>❌ Simulate Failure</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.closeButton]} 
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 280,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  failureButton: {
    backgroundColor: '#EF4444',
  },
  closeButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BuildTestPanel;