// components/APKBuildStatus.tsx - Detailed APK Build Status Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { APK_BASE_URL } from '../config';

interface BuildDetails {
  buildId: string;
  agentId: string;
  agentName: string;
  userId: string;
  status: 'building' | 'completed' | 'failed';
  startTime: string;
  completedTime?: string;
  apkUrl?: string;
  error?: string;
  progress?: number;
  logs?: string[];
}

interface APKBuildStatusProps {
  visible: boolean;
  buildId: string;
  agentName: string;
  onClose: () => void;
}

const APKBuildStatus: React.FC<APKBuildStatusProps> = ({
  visible,
  buildId,
  agentName,
  onClose,
}) => {
  const [buildDetails, setBuildDetails] = useState<BuildDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (visible && buildId) {
      fetchBuildStatus();
      const interval = polling ? setInterval(fetchBuildStatus, 15000) : null; // Poll every 15 seconds
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [visible, buildId, polling]);

  const fetchBuildStatus = async () => {
    try {
      console.log(`🔍 Fetching build status for: ${buildId}`);
      const response = await axios.get(`${APK_BASE_URL}build-status/${buildId}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        const build = response.data.build;
        setBuildDetails(build);
        
        // Stop polling if build is completed or failed
        if (build.status === 'completed' || build.status === 'failed') {
          setPolling(false);
          
          // Show success notification
          if (build.status === 'completed' && build.apkUrl) {
            console.log('✅ APK Build Completed Successfully!');
          }
        }
      } else {
        console.error('Build status fetch failed:', response.data);
      }
    } catch (error) {
      console.error('Error fetching build status:', error.message);
      // Don't stop polling on network errors, just log them
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
        console.log('⚠️ Backend not reachable, will retry...');
      } else {
        setPolling(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'building': return '#F59E0B';
      case 'completed': return '#10B981';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'building': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const getProgressPercentage = () => {
    if (!buildDetails) return 0;
    
    switch (buildDetails.status) {
      case 'building': return buildDetails.progress || 50;
      case 'completed': return 100;
      case 'failed': return 0;
      default: return 0;
    }
  };

  const handleDownload = () => {
    if (buildDetails?.apkUrl) {
      Linking.openURL(buildDetails.apkUrl).catch(() => {
        Alert.alert('Error', 'Could not open download link');
      });
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

  const getBuildDuration = () => {
    if (!buildDetails?.startTime) return 'Unknown';
    
    const start = new Date(buildDetails.startTime);
    const end = buildDetails.completedTime ? new Date(buildDetails.completedTime) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>APK Build Status</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.agentName}>{agentName}</Text>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Loading build details...</Text>
            </View>
          ) : buildDetails ? (
            <>
              {/* Status Card */}
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Text style={styles.statusIcon}>
                    {getStatusIcon(buildDetails.status)}
                  </Text>
                  <View style={styles.statusInfo}>
                    <Text style={styles.statusTitle}>
                      {buildDetails.status.charAt(0).toUpperCase() + buildDetails.status.slice(1)}
                    </Text>
                    <Text style={styles.buildId}>Build ID: {buildDetails.buildId}</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${getProgressPercentage()}%`,
                          backgroundColor: getStatusColor(buildDetails.status)
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {getProgressPercentage()}% Complete
                  </Text>
                </View>
              </View>

              {/* Build Details */}
              <View style={styles.detailsCard}>
                <Text style={styles.cardTitle}>Build Details</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Agent ID:</Text>
                  <Text style={styles.detailValue}>{buildDetails.agentId}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Started:</Text>
                  <Text style={styles.detailValue}>{formatTime(buildDetails.startTime)}</Text>
                </View>
                
                {buildDetails.completedTime && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Completed:</Text>
                    <Text style={styles.detailValue}>{formatTime(buildDetails.completedTime)}</Text>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Duration:</Text>
                  <Text style={styles.detailValue}>{getBuildDuration()}</Text>
                </View>
              </View>

              {/* Success Section */}
              {buildDetails.status === 'completed' && buildDetails.apkUrl && (
                <View style={styles.successCard}>
                  <Text style={styles.successTitle}>🎉 APK Ready!</Text>
                  <Text style={styles.successMessage}>
                    Your {agentName} APK has been built successfully and is ready for download.
                  </Text>
                  
                  <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.downloadButtonGradient}
                    >
                      <Text style={styles.downloadButtonText}>📥 Download APK</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <Text style={styles.downloadNote}>
                    💡 Enable "Install from Unknown Sources" to install the APK
                  </Text>
                </View>
              )}

              {/* Error Section */}
              {buildDetails.status === 'failed' && (
                <View style={styles.errorCard}>
                  <Text style={styles.errorTitle}>❌ Build Failed</Text>
                  <Text style={styles.errorMessage}>
                    The APK build for {agentName} has failed. Please try again or contact support.
                  </Text>
                  
                  {buildDetails.error && (
                    <View style={styles.errorDetails}>
                      <Text style={styles.errorDetailsTitle}>Error Details:</Text>
                      <Text style={styles.errorDetailsText}>{buildDetails.error}</Text>
                    </View>
                  )}
                  
                  <TouchableOpacity style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>🔄 Try Again</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Building Section */}
              {buildDetails.status === 'building' && (
                <View style={styles.buildingCard}>
                  <Text style={styles.buildingTitle}>🔨 Building APK...</Text>
                  <Text style={styles.buildingMessage}>
                    Your {agentName} APK is being built. This usually takes 2-5 minutes.
                  </Text>
                  
                  <View style={styles.buildingSteps}>
                    <Text style={styles.stepsTitle}>Build Steps:</Text>
                    <Text style={styles.step}>✅ 1. Configuring agent settings</Text>
                    <Text style={styles.step}>✅ 2. Setting up build environment</Text>
                    <Text style={styles.step}>🔄 3. Compiling APK...</Text>
                    <Text style={styles.stepPending}>⏳ 4. Uploading to server</Text>
                  </View>
                </View>
              )}

              {/* Build Logs */}
              {buildDetails.logs && buildDetails.logs.length > 0 && (
                <View style={styles.logsCard}>
                  <Text style={styles.cardTitle}>Build Logs</Text>
                  <ScrollView style={styles.logsContainer} nestedScrollEnabled>
                    {buildDetails.logs.map((log, index) => (
                      <Text key={index} style={styles.logLine}>
                        {log}
                      </Text>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Could not load build details</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  agentName: {
    fontSize: 16,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  buildId: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
  successCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
    marginBottom: 16,
  },
  downloadButton: {
    marginBottom: 12,
  },
  downloadButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadNote: {
    fontSize: 12,
    color: '#059669',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 20,
    marginBottom: 16,
  },
  errorDetails: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorDetailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 4,
  },
  errorDetailsText: {
    fontSize: 12,
    color: '#DC2626',
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buildingCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  buildingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  buildingMessage: {
    fontSize: 14,
    color: '#D97706',
    lineHeight: 20,
    marginBottom: 16,
  },
  buildingSteps: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
  },
  stepsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  step: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 4,
  },
  stepPending: {
    fontSize: 12,
    color: '#D97706',
    marginBottom: 4,
  },
  logsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logsContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  logLine: {
    fontSize: 10,
    color: '#E5E7EB',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
});

export default APKBuildStatus;