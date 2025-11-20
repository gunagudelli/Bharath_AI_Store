// AgentPreviewScreen.tsx - FIXED VERSION
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from "react-redux";
import BASE_URL from "../../../config";
import { RootState } from "../../Redux/store";

const { width } = Dimensions.get('window');

interface AgentData {
  agentName: string;
  description: string;
  roleSelect: string;
  goalSelect: string;
  purposeSelect: string;
  roleOther: string;
  goalOther: string;
  purposeOther: string;
  view: string;
}

const AgentPreviewScreen: React.FC = () => {
  const userData = useSelector((state: RootState) => state.userData);
  const reduxToken = userData?.accessToken || userData?.token;
  const reduxUserId = userData?.userId;

  const params = useLocalSearchParams();
  const [agentData, setAgentData] = useState<AgentData | null>(null);

  // Refs for scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  const instructionsCardRef = useRef<View>(null);
  const publishButtonRef = useRef<View>(null);

  useEffect(() => {
    try {
      if (params.agentData && typeof params.agentData === 'string') {
        const parsed = JSON.parse(params.agentData);
        setAgentData(parsed);
        console.log('Parsed agent data:', parsed);
      }
    } catch (error) {
      console.error('Failed to parse agentData:', error);
      Alert.alert('Error', 'Failed to load agent data');
    }
  }, [params.agentData]);

  const agentName = agentData?.agentName || '';
  const description = agentData?.description || '';
  const view = agentData?.view || 'Private';
  
  const roleResolved = agentData?.roleSelect === 'Other' 
    ? agentData?.roleOther 
    : agentData?.roleSelect || '';
  
  const goalResolved = agentData?.goalSelect === 'Other' 
    ? agentData?.goalOther 
    : agentData?.goalSelect || '';
  
  const purposeResolved = agentData?.purposeSelect === 'Other' 
    ? agentData?.purposeOther 
    : agentData?.purposeSelect || '';

  const [instructions, setInstructions] = useState<string>('');
  const [conStarter1, setConStarter1] = useState<string>('');
  const [conStarter2, setConStarter2] = useState<string>('');
  
  const [genLoading, setGenLoading] = useState<boolean>(false);
  const [startersLoading, setStartersLoading] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editDraft, setEditDraft] = useState<string>('');
  const [instrCollapsed, setInstrCollapsed] = useState<boolean>(true); // Start with collapsed/hidden

  // File upload state
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [assistanceId, setAssistanceId] = useState<string>('');

  const instructionsGeneratedRef = useRef<boolean>(false);
  const startersGeneratedRef = useRef<boolean>(false);

  // Scroll to instructions card
  const scrollToInstructions = () => {
    setTimeout(() => {
      instructionsCardRef.current?.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
        },
        () => console.log('Failed to measure layout')
      );
    }, 300);
  };

  // Scroll to publish button
  const scrollToPublishButton = () => {
    setTimeout(() => {
      publishButtonRef.current?.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
        },
        () => console.log('Failed to measure layout')
      );
    }, 500);
  };

  // Get auth token
  const getAuthToken = async (): Promise<string | null> => {
    if (reduxToken) {
      console.log('Using token from Redux');
      return reduxToken;
    }

    console.log('Redux token not found, checking AsyncStorage...');
    const keys = ['token', 'accessToken', 'authToken', 'jwt', 'jwtToken', 'bearerToken'];
    for (const key of keys) {
      try {
        const token = await AsyncStorage.getItem(key);
        if (token) {
          console.log(`Found token in AsyncStorage with key: ${key}`);
          return token;
        }
      } catch (error) {
        console.error(`Error reading ${key} from AsyncStorage:`, error);
      }
    }
    
    console.error('No token found in Redux or AsyncStorage');
    return null;
  };

  // Get user ID
  const getUserId = async (): Promise<string> => {
    if (reduxUserId) {
      return reduxUserId;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      return userId || '';
    } catch (error) {
      console.error('Error reading userId:', error);
      return '';
    }
  };

  // Clean instruction text
  const cleanInstructionText = (txt: string): string => {
    return (txt || '')
      .replace(/^\uFEFF/, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/^#{1,6}\s?/gm, '')
      .replace(/\*+/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\r\n?/g, '\n')
      .replace(/[ \t]*\n[ \t]*/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Parse conversation starters
  const parseStartersFromText = (raw: string): string[] => {
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*[-*•\d.)]+\s*/, '').trim())
      .filter(Boolean);
    const uniq: string[] = [];
    for (const l of lines) {
      if (uniq.length >= 8) break;
      if (!uniq.includes(l)) uniq.push(l);
    }
    return uniq.slice(0, 4);
  };

  // Generate instructions
  const generateInstructions = async (): Promise<void> => {
    if (!description.trim()) {
      Alert.alert('Error', 'Description is required to generate instructions');
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      Alert.alert('Error', 'You are not signed in. Please log in and try again.');
      return;
    }

    scrollToInstructions();
    
    setGenLoading(true);
    try {
      const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
      const params = new URLSearchParams({ description: description.trim() });
      const url = `${baseUrl}/ai-service/agent/classifyInstruct?${params}`;
      
      console.log('Fetching instructions from:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Instructions response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Generate instructions error:', response.status, errorText);
        throw new Error(`Failed: ${response.status} - ${errorText}`);
      }

      const text = await response.text();
      const cleaned = cleanInstructionText(text);
      const seed = cleaned || `Write precise, actionable instructions for an agent called "${agentName}".`;

      setInstructions(seed);
      setEditDraft(seed);
      instructionsGeneratedRef.current = true;
      console.log('Instructions generated successfully');
      
      scrollToPublishButton();
    } catch (error: any) {
      console.error('Generate instructions error:', error);
      Alert.alert('Error', error.message || 'Failed to generate instructions');
    } finally {
      setGenLoading(false);
    }
  };

  // Generate conversation starters
  const generateStarters = async (): Promise<void> => {
    if (!description.trim()) {
      Alert.alert('Error', 'Description is required to generate starters');
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      Alert.alert('Error', 'You are not signed in. Please log in and try again.');
      return;
    }

    setStartersLoading(true);
    try {
      const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
      const params = new URLSearchParams({ description: description.trim() });
      const url = `${baseUrl}/ai-service/agent/classifyStartConversation?${params}`;
      
      console.log('Fetching starters from:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Starters response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Generate starters error:', response.status, errorText);
        throw new Error(`Failed: ${response.status} - ${errorText}`);
      }

      const text = await response.text();
      const prompts = parseStartersFromText(text);

      if (!prompts.length) {
        console.warn('No starters returned from API');
        return;
      }

      setConStarter1(prompts[0] || '');
      setConStarter2(prompts[1] || '');
      startersGeneratedRef.current = true;
      console.log('Starters generated successfully');
    } catch (error: any) {
      console.error('Generate starters error:', error);
      Alert.alert('Error', error.message || 'Failed to fetch conversation starters.');
    } finally {
      setStartersLoading(false);
    }
  };

  // Pick files
  const pickFiles = async (): Promise<void> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log('File picker cancelled');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const validFiles = result.assets.filter(file => {
          const sizeInMB = file.size ? file.size / (1024 * 1024) : 0;
          if (sizeInMB > 5) {
            Alert.alert('File Too Large', `${file.name} exceeds 5MB limit`);
            return false;
          }
          return true;
        });

        setSelectedFiles(validFiles);
        console.log('Files selected:', validFiles.length);
      }
    } catch (error) {
      console.error('Error picking files:', error);
      Alert.alert('Error', 'Failed to pick files');
    }
  };

  // Upload files
  const uploadFiles = async (): Promise<void> => {
    if (selectedFiles.length === 0) {
      Alert.alert('Error', 'Please select at least one file');
      return;
    }

    const token = await getAuthToken();
    const userId = await getUserId();

    if (!token) {
      Alert.alert('Error', 'Authentication token not found');
      return;
    }

    if (!roleResolved) {
      Alert.alert('Error', 'Role information not found');
      return;
    }

    setUploading(true);
    try {
      const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

      for (const file of selectedFiles) {
        const formData = new FormData();
        
        // @ts-ignore
        formData.append('file', {
          uri: file.uri,
          type: file.mimeType || 'application/octet-stream',
          name: file.name,
        });

        const url = `${baseUrl}/ai-service/agent/${encodeURIComponent(assistanceId)}/addAgentFiles?addFileType=${encodeURIComponent(roleResolved)}&userId=${encodeURIComponent(userId)}`;

        console.log('Uploading file:', file.name, 'with role:', roleResolved);
        console.log('Upload URL:', url);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Upload failed for ${file.name}: ${response.status} - ${errorText}`);
        }

        console.log('File uploaded successfully:', file.name);
      }

      Alert.alert(
        'Success',
        'Files uploaded successfully! Your agent is queued for approval.',
        [
          {
            text: 'OK',
            onPress: () => {
              setUploadModalOpen(false);
              router.push({
                pathname: "/(screen)/AgentCreation/agentCreation",
              }); 
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Upload files error:', error);
      Alert.alert('Error', error.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  // Publish agent
  const publishAgent = async (): Promise<void> => {
    const token = await getAuthToken();
    const userId = await getUserId();

    if (!token) {
      Alert.alert('Error', 'You are not signed in. Please log in and try again.');
      return;
    }

    if (!instructions.trim()) {
      Alert.alert('Error', 'Please generate instructions before publishing.');
      return;
    }

    setPublishing(true);
    try {
      const body = {
        agentName: agentName.trim(),
        description: description.trim(),
        roleUser: agentData?.roleSelect === 'Other' ? 'Other' : agentData?.roleSelect,
        purpose: agentData?.purposeSelect === 'Other' ? 'Other' : agentData?.purposeSelect,
        goals: agentData?.goalSelect === 'Other' ? 'Other' : agentData?.goalSelect,
        optionalRole: agentData?.roleSelect === 'Other' ? agentData?.roleOther?.trim() : '',
        optionalPurpose: agentData?.purposeSelect === 'Other' ? agentData?.purposeOther?.trim() : '',
        optionalGoal: agentData?.goalSelect === 'Other' ? agentData?.goalOther?.trim() : '',
        instructions: instructions.slice(0, 7000),
        userId: userId,
        view: view,
        conStarter1: conStarter1.trim(),
        conStarter2: conStarter2.trim(),
        conStarter3: '',
        conStarter4: '',
      };

      console.log('Publishing agent with data:', { 
        ...body, 
        instructions: body.instructions.substring(0, 50) + '...' 
      });

      const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
      const url = `${baseUrl}/ai-service/agent/newAgentPublish`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      console.log('Publish response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Publish error:', response.status, errorText);
        throw new Error(`Publish failed: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Publish success:', responseData);

      const newAssistanceId = responseData.assistanceId || responseData.assistantId || responseData.id || '';
      
      if (newAssistanceId) {
        setAssistanceId(newAssistanceId);
        console.log('Assistant ID:', newAssistanceId);
        
        setSelectedFiles([]);
        setUploadModalOpen(true);
      } else {
        Alert.alert('Warning', 'Agent published but no Assistant ID returned');
        router.back();
      }
    } catch (error: any) {
      console.error('Publish agent error:', error);
      Alert.alert('Error', error.message || 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  // Auto-generate on mount
  useEffect(() => {
    if (!agentData) return;

    console.log('AgentPreviewScreen mounted');
    console.log('Redux token available:', !!reduxToken);
    console.log('Redux userId:', reduxUserId);
    
    const autoGenerate = async () => { 
      try {
        if (!conStarter1.trim() && !conStarter2.trim() && !startersGeneratedRef.current) {
          console.log('Auto-generating conversation starters...');
          await generateStarters();
          console.log('Conversation starters generation completed');
        }
        
        if (!instructions.trim() && !instructionsGeneratedRef.current) {
          console.log('Auto-generating instructions...');
          await generateInstructions();
          console.log('Instructions generation completed');
        }
      } catch (error) {
        console.error('Auto-generation error:', error);
      }
    };

    autoGenerate();
  }, [agentData]);

  const handlePublish = (): void => {
    Alert.alert(
      'Publish this Agent?',
      `Name: ${agentName}\nRole: ${roleResolved}\nGoal: ${goalResolved}\nPurpose: ${purposeResolved}\nVisibility: ${view}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Publish', onPress: publishAgent }
      ]
    );
  };

  const handleSaveEdit = (): void => {
    setInstructions(editDraft.trim());
    setEditModalOpen(false);
    Alert.alert('Success', 'Instructions updated successfully!');
  };

  const toggleInstructionsCollapse = (): void => {
    setInstrCollapsed(!instrCollapsed);
  };

  if (!agentData) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6D28D9" />
        <Text style={styles.loadingText}>Loading agent data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerEmoji}>👁️</Text>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Agent Preview</Text>
              <Text style={styles.headerSubtitle}>Review your agent before publishing</Text>
            </View>
          </View>
        </View>

        {/* Agent Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Agent Details</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{agentName}</Text>
          </View>

          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>👤 {roleResolved}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>🎯 {goalResolved}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{purposeResolved}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {view === 'Public' ? '🌐' : '🔒'} {view}
              </Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.infoLabel}>Description:</Text>
            <Text style={styles.descriptionText}>{description}</Text>
          </View>
          
        </View>

        {/* Conversation Starters Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Conversation Starters</Text>
            <TouchableOpacity
              style={styles.suggestButton}
              onPress={generateStarters}
              disabled={startersLoading}
            >
              {startersLoading ? (
                <ActivityIndicator size="small" color="#6D28D9" />
              ) : (
                <>
                  <Text style={styles.suggestIcon}>💡</Text>
                  <Text style={styles.suggestButtonText}>Regenerate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {startersLoading && (
            <View style={styles.generatingBanner}>
              <ActivityIndicator size="small" color="#6D28D9" />
              <Text style={styles.generatingText}>AI Generating conversation starters...</Text>
            </View>
          )}

          <View style={styles.starterItem}>
            <Text style={styles.starterLabel}>Starter 1</Text>
            <TextInput
              style={styles.starterInput}
              value={conStarter1}
              onChangeText={setConStarter1}
              placeholder="Enter first conversation starter..."
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={150}
            />
          </View>

          <View style={styles.starterItem}>
            <Text style={styles.starterLabel}>Starter 2</Text>
            <TextInput
              style={styles.starterInput}
              value={conStarter2}
              onChangeText={setConStarter2}
              placeholder="Enter second conversation starter..."
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={150}
            />
          </View>
        </View>

        {/* Instructions Card */}
        <View 
          ref={instructionsCardRef}
          style={styles.card}
          collapsable={false}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Instructions</Text>
            <View style={styles.instructionButtons}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={toggleInstructionsCollapse}
              >
                <Text style={styles.actionBtnText}>
                  {instrCollapsed ? '👁️ Show' : '🙈 Hide'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnEdit]}
                onPress={() => {
                  setEditDraft(instructions);
                  setEditModalOpen(true);
                }}
                disabled={!instructions.trim()}
              >
                <Text style={[styles.actionBtnText, styles.actionBtnEditText]}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.suggestButton, genLoading && styles.suggestButtonDisabled]}
                onPress={generateInstructions}
                disabled={genLoading}
              >
                {genLoading ? (
                  <ActivityIndicator size="small" color="#6D28D9" />
                ) : (
                  <>
                    <Text style={styles.suggestIcon}>💡</Text>
                    <Text style={styles.suggestButtonText}>Generate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {genLoading && (
            <View style={styles.generatingBanner}>
              <ActivityIndicator size="small" color="#6D28D9" />
              <Text style={styles.generatingText}>AI Generating instructions... Please wait</Text>
            </View>
          )}

          <View style={styles.instructionsBox}>
            {genLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6D28D9" />
                <Text style={styles.loadingText}>Creating detailed instructions...</Text>
                <Text style={styles.loadingSubtext}>This may take a few moments</Text>
              </View>
            ) : (
              <>
                {instrCollapsed ? (
                  <View>
                    <Text style={styles.instructionsText}>
                      {instructions.slice(0, 300) || 'Instructions will appear here after generation.'}
                      {instructions.length > 300 && '...'}
                    </Text>
                    {instructions.length > 300 && (
                      <TouchableOpacity 
                        style={styles.viewMoreButton}
                        onPress={() => setInstrCollapsed(false)}
                      >
                        <Text style={styles.viewMoreText}>View More →</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <ScrollView 
                    style={styles.instructionsScroll} 
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    <Text style={styles.instructionsText}>
                      {instructions || 'Instructions will appear here after generation.'}
                    </Text>
                  </ScrollView>
                )}
              </>
            )}
          </View>
        </View>

        {/* Publish Button */}
        <View 
          ref={publishButtonRef}
          style={styles.actions}
          collapsable={false}
        >
          <TouchableOpacity
            style={[styles.publishButton, (!instructions.trim() || publishing) && styles.buttonDisabled]}
            onPress={handlePublish}
            disabled={!instructions.trim() || publishing}
          >
            {publishing ? (
              <View style={styles.publishingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.publishButtonText}>Publishing...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.publishButtonText}>
                  {instructions.trim() ? '🚀 Publish Agent' : '⏳ Generating...'}
                </Text>
                {instructions.trim() && (
                  <Text style={styles.publishButtonSubtext}>Ready to publish your agent</Text>
                )}
              </>
            )}
          </TouchableOpacity>

          {!instructions.trim() && !genLoading && (
            <Text style={styles.waitingText}>
              ⏳ Waiting for instructions to be generated...
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Edit Instructions Modal - FIXED */}
      <Modal
        visible={editModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalOpen(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Instructions</Text>
              <TouchableOpacity onPress={() => setEditModalOpen(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>Max 7000 characters</Text>
            
            <ScrollView 
              style={styles.modalScrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              <TextInput
                style={styles.modalTextArea}
                value={editDraft}
                onChangeText={(text) => setEditDraft(text.slice(0, 7000))}
                multiline
                textAlignVertical="top"
                maxLength={7000}
                placeholder="Enter instructions..."
                placeholderTextColor="#94A3B8"
                autoFocus={false}
              />
            </ScrollView>
            
            <Text style={styles.charCounter}>{editDraft.length}/7000</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setEditModalOpen(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* File Upload Modal - FIXED */}
      {/* File Upload Modal - FIXED */}
      <Modal
        visible={uploadModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          Alert.alert('Upload Required', 'Please upload files to complete agent creation');
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.uploadModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Profile Documents</Text>
            </View>

            <ScrollView 
              style={styles.uploadScrollView} 
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              {/* Role Display */}
              <View style={styles.uploadSection}>
                <Text style={styles.uploadLabel}>Your Role Profile</Text>
                <View style={styles.roleDisplayBox}>
                  <Text style={styles.roleDisplayText}>👤 {roleResolved}</Text>
                </View>
                <Text style={styles.uploadHintSmall}>
                  This is the role you selected during agent creation
                </Text>
              </View>

              {/* File Selection */}
              <View style={styles.uploadSection}>
                <Text style={styles.uploadLabel}>Upload Supporting Documents *</Text>

                <Text style={styles.uploadInstruction}>
                  Please upload documents that verify your role as a <Text style={styles.boldText}>{roleResolved}</Text>.
                  {'\n\n'}Examples: ID card, employee badge, business registration, professional certificate, etc.
                </Text>

                <TouchableOpacity
                  style={styles.pickFilesButton}
                  onPress={pickFiles}
                >
                  <Text style={styles.pickFilesButtonText}>
                    {selectedFiles.length > 0 
                      ? `${selectedFiles.length} file(s) selected` 
                      : '📎 Select Files'}
                  </Text>
                </TouchableOpacity>

                {selectedFiles.length > 0 && (
                  <ScrollView 
                    style={styles.filesList}
                    nestedScrollEnabled={true}
                  >
                    {selectedFiles.map((file, index) => (
                      <View key={index} style={styles.fileItem}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          📄 {file.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                          }}
                        >
                          <Text style={styles.removeFileText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}

                <Text style={styles.uploadHint}>
                  📌 Allowed: PDF, JPG, PNG, DOC, DOCX (Max 5MB each)
                </Text>
              </View>
            </ScrollView>

            {/* Upload Button */}
            <View style={styles.uploadFooter}>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  (selectedFiles.length === 0 || uploading) && styles.buttonDisabled
                ]}
                onPress={uploadFiles}
                disabled={selectedFiles.length === 0 || uploading}
              >
                {uploading ? (
                  <View style={styles.uploadingRow}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.uploadButtonText}>Uploading...</Text>
                  </View>
                ) : (
                  <Text style={styles.uploadButtonText}>Upload Files & Complete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Header Card
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    marginBottom: 14,
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E7E6F3',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerEmoji: {
    fontSize: 32,
    marginTop: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },

  // Card Styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#020817',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E7E6F3',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#6D28D9',
    letterSpacing: 0.2,
    marginBottom: 12,
  },

  // Info Rows
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: "700",
    fontSize: 14,
    color: "#111827",
    marginRight: 6,
  },
  infoValue: {
    fontSize: 14,
    color: "#0F172A",
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7E6F3',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6D28D9',
  },

  // Description
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 21,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },

  // Generating Banner
  generatingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  generatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    flex: 1,
  },

  // Suggest Button
  suggestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E7E6F3',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  suggestButtonDisabled: {
    opacity: 0.6,
  },
  suggestIcon: {
    fontSize: 16,
  },
  suggestButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Conversation Starters
  starterItem: {
    marginBottom: 12,
  },
  starterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  starterInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E7E6F3',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 60,
    textAlignVertical: 'top',
  },

  // Instructions
  instructionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E6F3',
    backgroundColor: '#FFFFFF',
  },
  actionBtnEdit: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E6F3',
    borderWidth: 1.5,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  actionBtnEditText: {
    color: '#111827',
  },
  instructionsBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E7E6F3',
    borderRadius: 12,
    padding: 14,
    minHeight: 150,
    maxHeight: 400,
    marginTop: 8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  loadingSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  instructionsScroll: {
    maxHeight: 350,
  },
  instructionsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 21,
  },
  viewMoreButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E6F3',
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6D28D9',
  },

  // Actions
  actions: {
    marginTop: 10,
    marginBottom: 20,
  },
  publishButton: {
    backgroundColor: '#6D28D9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  publishButtonSubtext: {
    color: '#E9D5FF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  publishingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waitingText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#64748B',
    marginTop: 12,
    fontStyle: 'italic',
  },

  // Modal Styles - FIXED
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalClose: {
    fontSize: 24,
    color: '#64748B',
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  modalScrollContainer: {
    flex: 1,
    marginBottom: 12,
  },
  modalTextArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E7E6F3',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#111827',
    minHeight: 300,
    textAlignVertical: 'top',
  },
  charCounter: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'right',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  modalSaveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#6D28D9',
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Upload Modal - FIXED
  uploadModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  uploadScrollView: {
    flex: 1,
    marginBottom: 16,
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  roleDisplayBox: {
    backgroundColor: '#F3E8FF',
    borderWidth: 2,
    borderColor: '#6D28D9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  roleDisplayText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6D28D9',
  },
  uploadHintSmall: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  pickFilesButton: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6D28D9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#020817',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  pickFilesButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D28D9',
  },
  filesList: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E7E6F3',
    borderRadius: 12,
    padding: 10,
    maxHeight: 150,
    backgroundColor: '#F9FAFB',
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E7E6F3',
  },
  fileName: {
    fontSize: 13,
    color: '#111827',
    flex: 1,
    marginRight: 10,
    fontWeight: '500',
  },
  removeFileText: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '700',
  },
  uploadHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 16,
  },
  uploadFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E7E6F3',
  },
  uploadButton: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#6D28D9',
    alignItems: 'center',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  uploadInstruction: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 12,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '700',
    color: '#6D28D9',
  },
});

export default AgentPreviewScreen;